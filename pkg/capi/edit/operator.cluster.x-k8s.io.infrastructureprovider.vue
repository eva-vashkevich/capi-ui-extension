<script>
import CreateEditView from '@shell/mixins/create-edit-view';
import Loading from '@shell/components/Loading';
import CruResource from '@shell/components/CruResource';
import SelectIconGrid from '@shell/components/SelectIconGrid';
import { CHART, FROM_CLUSTER, SUB_TYPE } from '@shell/config/query-params';
import { mapGetters } from 'vuex';
import { allHash } from '@shell/utils/promise';

import { CAPI, PROVIDER_TYPES } from '../types/capi';
import ProviderConfig from './ProviderConfig';
// import { sortBy } from '@shell/utils/sort';
// import { set } from '@shell/utils/object';
// import { mapPref, PROVISIONER, _RKE1, _RKE2 } from '@shell/store/prefs';
// import { CATALOG } from '@shell/config/labels-annotations';
// import { CAPI, MANAGEMENT, DEFAULT_WORKSPACE } from '@shell/config/types';
// import { mapFeature, RKE2 as RKE2_FEATURE } from '@shell/store/features';
// import { allHash } from '@shell/utils/promise';
// import { BLANK_CLUSTER } from '@shell/store/store-types.js';
// import { ELEMENTAL_PRODUCT_NAME, ELEMENTAL_CLUSTER_PROVIDER } from '../../config/elemental-types';

// uSed to proxy stylesheets for custom drivers that provide custom UI (RKE1)
// const PROXY_ENDPOINT = '/meta/proxy';
// import { types } from './types';
// const PROVIDER_TYPES = [{
//   id: 'docker', label: 'Docker', description: '', icon: 'images/providers/dockerhub.svg', disabled: false, link: '/g/clusters/add/launch/amazoneksv2', tag: ''
// }];

export default {
  name: 'CreateProviderNEWWW',

  components: {
    CruResource,
    Loading,
    SelectIconGrid,
    ProviderConfig
  },

  mixins: [CreateEditView],

  props: {

    value: {
      type:    Object,
      default: null,
    },

    /**
     * Inherited global identifier prefix for tests
     * Define a term based on the parent component to avoid conflicts on multiple components
     */
    componentTestid: {
      type:    String,
      default: 'capi-provider-create'
    }
  },

  async fetch() {
  //   const hash = { providers: this.$store.dispatch('management/findAll', { type: CAPI.PROVIDER }) };
  //   const res = await allHash(hash);

  //   console.log(res);
  },

  data() {
    return {
      subType: null,
      chart:   null,
    };
  },

  computed: {
    ...mapGetters({ allCharts: 'catalog/charts' }),
    ...mapGetters('type-map', ['activeProducts']),

    templateOptions() {
      return [];
    },

    subTypes() {
      return PROVIDER_TYPES;
    },
    showAsForm() {
      return true;
    }
  },

  methods: {

    loadStylesheet(url, id) {
      if ( !id ) {
        console.error('loadStylesheet called without an id'); // eslint-disable-line no-console

        return;
      }

      // Check if the stylesheet has already been loaded
      if ( $(`#${id}`).length > 0 ) { // eslint-disable-line
        return;
      }

      const link = document.createElement('link');

      link.onerror = () => {
        link.remove();
      };
      link.rel = 'stylesheet';
      link.src = url;
      link.href = url;
      link.id = id;
      document.getElementsByTagName('HEAD')[0].appendChild(link);
    },

    cancel() {
      this.$router.push({
        name:   'c-cluster-manager-capi',
        params: {},
      });
    },

    clickedType(obj) {
      const id = obj.id;

      // this.$router.applyQuery({ [SUB_TYPE]: id });
      this.$router.applyQuery({ [SUB_TYPE]: id });
      this.selectType(id);
    },

    selectType(type, fetch = true) {
      console.log(type);
      this.subType = type;
      this.$emit('set-subtype', this.$store.getters['i18n/withFallback'](`cluster.provider."${ type }"`, null, type));
      
      // if ( fetch ) {
      //   this.$fetch();
      // }
    //   const parts = type.split(':', 2);

      //   if ( parts[0] === 'chart' ) {
      //     this.subType = 'chart';
      //     this.$emit('set-subtype', this.$store.getters['i18n/withFallback'](`cluster.provider.chart`));
      //   } else {
      //     this.subType = type;
      //     this.$emit('set-subtype', this.$store.getters['i18n/withFallback'](`cluster.provider."${ type }"`, null, type));
      //   }

    //   if ( fetch ) {
    //     this.$fetch();
    //   }
    },
  },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <CruResource
    v-else
    :mode="mode"
    :validation-passed="true"
    :selected-subtype="subType"
    :resource="value"
    :errors="errors"
    :subtypes="subTypes"
    :cancel-event="true"
    :prevent-enter-submit="true"
    class="create-cluster"
    @finish="save"
    @cancel="cancel"
    @select-type="selectType"
    @error="e=>errors = e"
  >
    <template #subtypes>
      <div
        class="mb-20"
        style="width: 100%;"
      >
        <SelectIconGrid
          :rows="subTypes"
          key-field="id"
          name-field="label"
          side-label-field="tag"
          @clicked="clickedType"
        />
      </div>
    </template>
    <ProviderConfig
      v-if="subType"
      v-model="value"
      :initial-value="initialValue"
      :live-value="liveValue"
      :mode="mode"
      :provider="subType"
    />

    <template
      v-if="subType"
      #form-footer
    >
      <div><!-- Hide the outer footer --></div>
    </template>
  </CruResource>
</template>

<style lang='scss'>
  .grouped-type {
    position: relative;
  }

  .rke-switch {
    margin-top: -10px;
    position: absolute;
    right: 0;
  }
</style>
