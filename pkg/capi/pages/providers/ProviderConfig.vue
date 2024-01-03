<script>
import CreateEditView from '@shell/mixins/create-edit-view';
import CruResource, { CONTEXT_HOOK_EDIT_YAML } from '@shell/components/CruResource';
import SelectCredential from '@shell/edit/provisioning.cattle.io.cluster/SelectCredential';
import Loading from '@shell/components/Loading';
import FormValidation from '@shell/mixins/form-validation';

export default {
  components: {
    CruResource,
    SelectCredential,
    Loading,
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
    return {
      loadedOnce:                      false,
      credentialId: '',
    }
  },
  computed: {},
  watch:    {},
  methods:  {
    generateYaml() {
      const resource = this.value;
      console.log(resource)
      // const inStore = this.$store.getters['currentStore'](resource);
      // const schemas = this.$store.getters[`${ inStore }/all`](SCHEMA);
      // const clonedResource = clone(resource);

      // this.applyChartValues(clonedResource.spec.rkeConfig);

      // const out = createYaml(schemas, resource.type, clonedResource);

      return {};
    },
    saveOverride(btnCb) {
      return this._doSaveOverride((done) => {
        this.$set(this, 'busy', false);

        return btnCb(done);
      });
    },
    _doSaveOverride(btnCb) {
    },
    cancel() {
      this.$router.push({
        name:   'c-cluster-manager-capi',
        params: {},
      });
    },
        cancelCredential() {
      if ( this.$refs.cruresource ) {
        this.$refs.cruresource.emitOrRoute();
      }
    },
  }
};
</script>

<template>
  <Loading v-if="$fetchState.pending && !loadedOnce" />
  <CruResource
    v-else
    ref="cruresource"
    :mode="mode"
    :validation-passed="true"
    :resource="value"
    :errors="errors"
    :cancel-event="true"
    :done-route="doneRoute"
    :apply-hooks="applyHooks"
    :generate-yaml="generateYaml"
    class="provider"
    component-testid="docker-provider-create"
    @done="done"
    @finish="saveOverride"
    @cancel="cancel"
    @error="fvUnreportedValidationErrors"
  >
    <SelectCredential
      v-model="credentialId"
      :mode="mode"
      :provider="provider"
      :cancel="cancelCredential"
      :showing-form="true"
      class="mt-20"
    />
  </CruResource>
</template>
