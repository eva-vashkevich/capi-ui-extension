<script>
import { mapGetters } from 'vuex';
import { _EDIT } from '@shell/config/query-params';
import ArrayList from '@shell/components/form/ArrayList.vue';
import LabeledInput from '@components/Form/LabeledInput/LabeledInput.vue';

export default {
  name: 'NetworkSelection',

  components: {
    LabeledInput,
    ArrayList
  },
  props:      {
    value: {
      type:     Object,
      required: true,
    },
    mode: {
      type:     String,
      required: true,
    },
    rules: {
      default: () => ({
        serviceDomain:     [],
        apiServerPort:     [],
        pods:              [],
        services:          []
      }),
      type: Object,
    },
  },
  computed: {
    ...mapGetters({ t: 'i18n/t' }),
    clusterIsAlreadyCreated() {
      return this.mode === _EDIT;
    },
  }
};
</script>
<template>
  <div>
    <div class="row row-networking">
      <div
        class="col col-host span-4 mb-20"
      >
        <LabeledInput
          v-model:value="value.serviceDomain"
          :mode="mode"
          :disabled="clusterIsAlreadyCreated"
          :label="t('capi.cluster.networking.serviceDomain')"
          :rules="rules.serviceDomain"
        />
      </div>
      <div
        class="col col-port span-2 mb-20"
      >
        <LabeledInput
          :value="value.apiServerPort"
          type="number"
          :mode="mode"
          :disabled="clusterIsAlreadyCreated"
          :label="t('capi.cluster.networking.apiServerPort')"
          :rules="rules.apiServerPort"
          required
          @update:value="(val) => value.apiServerPort = parseInt(val)"
        />
      </div>
    </div>
    <div class="row row-networking">
      <div class="col col-networking span-5 mb-20">
        <ArrayList
          v-model:value="value.pods.cidrBlocks"
          :protip="false"
          :mode="mode"
          :title="t('capi.cluster.networking.pods')"
          :value-placeholder="t('capi.cluster.networking.cidrplaceholder')"
          :rules="rules.pods"
        />
      </div>
      <div class="col col-networking span-5 mb-20">
        <ArrayList
          v-model:value="value.services.cidrBlocks"
          :protip="false"
          :mode="mode"
          :title="t('capi.cluster.networking.services')"
          :value-placeholder="t('capi.cluster.networking.cidrplaceholder')"
          :rules="rules.services"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>

@media screen and (min-width: 1000px) {
    .row-networking {
        width: 100%
    }
}

@media screen and (max-width: 1000px) {
    .row-networking {
        flex-direction: column;
        width: 100%
    }
    .col-port{
        width: 50%
    }
    .col-host {
        width: 100%
    }
    .col-networking {
        width: 100%
    }
  }
</style>
