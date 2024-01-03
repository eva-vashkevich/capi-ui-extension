<script>
import { mapGetters } from 'vuex';
import CreateEditView from '@shell/mixins/create-edit-view';
import { CONFIG_MAP, SCHEMA, NAMESPACE, SECRET } from '@shell/config/types';
import CruResource, { CONTEXT_HOOK_EDIT_YAML } from '@shell/components/CruResource';
import Loading from '@shell/components/Loading';
import { RadioGroup } from '@components/Form/Radio';
import SelectCredential from '@shell/edit/provisioning.cattle.io.cluster/SelectCredential';
import FormValidation from '@shell/mixins/form-validation';
import { randomStr } from '@shell/utils/string';
import {
  clone, diff, set, get, isEmpty
} from '@shell/utils/object';
import { LabeledInput } from '@components/Form/LabeledInput';
import NameNsDescription from '@shell/components/form/NameNsDescription';
import Generic from '@shell/edit/secret/generic';
import { HIDE_SENSITIVE } from '@shell/store/prefs';
import Labels from '@shell/components/form/Labels';

import { stringify, exceptionToErrorsArray } from '@shell/utils/error';
import { Provider, CAPINamespace, DEFAULT_SECRETS, PROVIDERS } from '../types/capi';

// const ENCODED_TRUE = base64Encode('true');
const DOCKER_NAMESPACE = 'capd-system';

const defaultNamespaceConfig = {
  apiVersion: 'v1',
  kind:       'Namespace',
  metadata:   { name: '' }

};

export default {
  components: {
    CruResource,
    Loading,
    NameNsDescription,
    Generic,
    Labels,
    RadioGroup,
    SelectCredential
  },
  mixins: [CreateEditView, FormValidation],
  props:      {
    mode: {
      type:     String,
      required: true,
    },
    value: {
      type:     Object,
      required: true,
    },
    provider: {
      type:     String,
      required: true,
    }
  },
  async fetch() {},
  data() {
    const providerDetails = PROVIDERS[this.provider];
    const defaultSecretConfig = DEFAULT_SECRETS[this.provider];

    const namespace = providerDetails ? providerDetails.namespace : '';

    set(this.value?.metadata, 'namespace', namespace);

    if (!this.value?.metadata?.name) {
      const name = providerDetails ? providerDetails.name : '';

      set(this.value?.metadata, 'name', name);
    }


    return {
      loadedOnce:                      false, // Maybe won't be needed
      credentialId:       '',
      namespaceConfig:    { ...defaultNamespaceConfig },
      secret:             { ...defaultSecretConfig },
      allNamespaces:         [],
      shouldCreateSecret:    true,
      needCredential:     providerDetails.credentialsRequired
    };
  },
  computed: {
    ...mapGetters(['namespaces']),
    hideSensitiveData() {
      return this.$store.getters['prefs/get'](HIDE_SENSITIVE);
    },
    modeOptions() {
      return [{
        label: this.t('capi.provider.secret.reuse'),
        value: false,
      }, {
        label: this.t('capi.provider.secret.create'),
        value: true,
      }];
    },
  },
  watch:    {
    // shouldCreateSecret(neu) {
    //   if (neu) {
    //     const defaultSecretConfig = DEFAULT_SECRETS[this.provider];

    //     this.secret = { ...defaultSecretConfig };
    //   } else {
    //     this.secret = {}
    //   }
    // }
  },
  methods:  {
    generateYaml() {
      // const resource = this.value;

      // console.log(resource);
      // const inStore = this.$store.getters['currentStore'](resource);
      // const schemas = this.$store.getters[`${ inStore }/all`](SCHEMA);
      // const clonedResource = clone(resource);

      // this.applyChartValues(clonedResource.spec.rkeConfig);

      // const out = createYaml(schemas, resource.type, clonedResource);

      return {};
    },
    generateName(name) {
      return name ? `${ name }-${ randomStr(5).toLowerCase() }` : undefined;
    },
    async createNamespace() {
      const inStore = this.$store.getters['currentStore'](this.resource);
      let namespaceAlreadyExists = false;

      try {
        // This is in a try-catch block because the call to fetch
        // a namespace throws an error if the namespace is not found.
        namespaceAlreadyExists = !!(await this.$store.dispatch(`${ inStore }/find`, { type: NAMESPACE, id: DOCKER_NAMESPACE }));
      } catch {}

      if ( !namespaceAlreadyExists) {
        try {
          const newNamespace = await this.$store.dispatch(`${ inStore }/createNamespace`, { name: this.value.metadata.namespace }, { root: true });

          newNamespace.applyDefaults();
          await newNamespace.save();
        } catch (e) {
          // this.errors = exceptionToErrorsArray(e);
          this.$emit('error', exceptionToErrorsArray(e));
          throw new Error(`Could not create the new namespace. ${ e.message }`);
        }
      }
    },
    async createSecret() {
      const secret = await this.$store.dispatch('management/create', this.secret);

      return secret.save({ url: '/v1/secrets', method: 'POST' });
    },

    async saveOverride(btnCb) {
      this.$set(this, 'busy', true);
      const errors = [];
      let spec = {};

      try {
        await this.createNamespace();

        if (this.shouldCreateSecret) {
          const secretObj = await this.createSecret();

          spec = {
            secretName:      secretObj.metadata.name,
            secretNamespace: secretObj.metadata.namespace
          };
        } else {
          spec = {
            secretName:      'capi-env-variables',
            secretNamespace: 'capi-system'
          };
        }
        set(this.value, 'spec', spec);
        await this.value.save();
      } catch (e) {
        errors.push(e);
      }

      const okay = (errors || []).length === 0;

      this.errors = errors;
      this.$set(this, 'busy', false);

      btnCb(okay);

      if (okay) {
        // If saved okay, go to the done route
        return this.done();
      }
    },

    cancel() {
      this.$router.push({
        name:   'c-cluster-manager-capi',
        params: {},
      });
    },
    done() {
      this.$router.push({
        name:   'c-cluster-manager-capi',
        params: {},
      });
    },
  }
};
</script>

<template>
  <Loading v-if="$fetchState.pending && !loadedOnce" />
  <CruResource
    v-else
    :mode="mode"
    :validation-passed="true"
    :resource="value"
    :errors="errors"
    :cancel-event="true"
    :done-route="doneRoute"
    :apply-hooks="applyHooks"
    :generate-yaml="generateYaml"
    class="provider"
    component-testid="capi-provider-create"
    @done="done"
    @finish="saveOverride"
    @cancel="cancel"
    @error="fvUnreportedValidationErrors"
  >
    <NameNsDescription
      v-if="!isView"
      v-model="value"
      :mode="mode"
      :namespaced="true"
      :namespace-options="allNamespaces"
      name-label="capi.provider.name.label"
      name-placeholder="capi.provider.name.placeholder"
      description-label="cluster.description.label"
      description-placeholder="cluster.description.placeholder"
      :rules="{name:fvGetAndReportPathRules('metadata.name')}"
    />
        <SelectCredential
      v-if="needCredential"
      v-model="credentialId"
      :mode="mode"
      :provider="provider"
      :cancel="cancelCredential"
      :showing-form="showForm"
      class="mt-20"
    />
    <div v-if="needCredential" class="spacer" />
    <h2>
      <t k="capi.provider.secret.title" />
    </h2>
    <RadioGroup
      v-model="shouldCreateSecret"
      name="shouldCreateSecret"
      :mode="mode"
      :options="modeOptions"
    />
    <div v-if="shouldCreateSecret">
      <div class="spacer" />
      <h3>
        <t k="secret.data" />
      </h3>
      <Generic
        :value="secret"
        :mode="mode"
        :hide-sensitive-data="hideSensitiveData"
      />
      <div class="spacer" />
      <h3>
        <t k="capi.provider.secret.labels" />
      </h3>
      <Labels
        v-model="secret"
        :mode="mode"
      />
    </div>
  </CruResource>
</template>
