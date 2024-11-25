<script setup>
    import { ref, computed } from 'vue';
    import CruResource from '@shell/components/CruResource.vue';
    import SelectIconGrid from '@shell/components/SelectIconGrid.vue';
    import { PROVIDER_TYPES } from '../../types/capi.ts';
    import { SUB_TYPE } from '@shell/config/query-params';
    import { useRouter, useRoute } from 'vue-router';
    import { useStore } from 'vuex';
    import ProviderConfig from './ProviderConfig.vue';
    import { set } from '@shell/utils/object';

    const emit = defineEmits(['set-subtype']);
    const props = defineProps({
        value: {
            type:    Object,
            default: null,
        },
    });
    
    const router = useRouter();
    const location = useRoute();
    const store = useStore();

    const subType = ref(location?.query[SUB_TYPE] || null);

    function selectType(type) {
      subType.value = type;
      emit('set-subtype', store.getters['i18n/withFallback'](`cluster.provider."${ type }"`, null, type));
    };

    if ( props.value?.spec?.name) {
      selectType(props.value.spec.name);
    }
    
    const subTypes = computed(() => {
        const out = [];
        const getters = store.getters;

        PROVIDER_TYPES?.forEach((provider) => {
            const id = provider.id;
            const disabled = provider.disabled;
            const label = getters['i18n/withFallback'](`cluster.provider."${ id }"`, null, id);
            const description = getters['i18n/withFallback'](`cluster.providerDescription."${ id }"`, null, '');
            let icon;

            try {
            icon = require(`~shell/assets/images/providers/${ id }.svg`);
            } catch (e) {
            try {
                icon = require(`../../assets/images/providers/${ id }.svg`);
            } catch (e) {
                icon = require('~shell/assets/images/generic-driver.svg');
            }
            }

            const providerType = {
            id,
            label,
            description,
            icon,
            disabled
            };

            out.push(providerType);
        });

        return out;
    });

    function clickedType(obj) {
      const id = obj.id;

      router.applyQuery({ [SUB_TYPE]: id });
      selectType(id);
    };

</script>
<script>
  import { defineComponent } from "vue"; 
  import CreateEditView from '@shell/mixins/create-edit-view';
  export default defineComponent({
    mixins: [CreateEditView],
  });
</script>

<template>
    <CruResource               
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
    @cancel="done"
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
      :value="value"
      :mode="mode"
      :provider="subType"
      @update:value="set(value, $event.k, $event.val)"
    />
    <template
      v-if="subType"
      #form-footer
    >
      <div><!-- Hide the outer footer --></div>
    </template>
  </CruResource>
</template>