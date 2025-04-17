<template>
  <div class="panel-tab__content">
    <component :is="customConfigComponent" v-bind="$props" />
  </div>
</template>

<script lang="ts" setup>
import { shallowRef, watch } from 'vue'
import { CustomConfigMap } from './data'

defineOptions({ name: 'ElementCustomConfig' })

const props = defineProps({
  id: String,
  type: String,
  businessObject: {
    type: Object,
    default: () => { }
  }
})

const bpmnInstances = () => (window as any)?.bpmnInstances
const customConfigComponent = shallowRef<any>(null) // 使用 shallowRef 替代 ref

watch(
  () => props.businessObject,
  () => {
    if (props.type && props.businessObject) {
      let val = props.type
      if (props.businessObject.eventDefinitions) {
        val += props.businessObject.eventDefinitions[0]?.$type.split(':')[1] || ''
      }
      customConfigComponent.value = CustomConfigMap[val]?.component


      console.log('customConfigComponent', customConfigComponent.value)
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped></style>