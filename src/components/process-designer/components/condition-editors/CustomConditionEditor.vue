<!-- src/components/process-designer/components/condition-editors/CustomConditionEditor.vue -->
<template>
  <div class="custom-condition-editor">
    <RuleGroup
      :node="localTree"
      :depth="0"
      :is-root="true"
      :form-fields="formFields"
      :readonly="readonly"
      @update="onRootUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RuleTreeNode } from '../../types/gateway-condition'
import RuleGroup from './RuleGroup.vue'

const props = defineProps<{
  modelValue?: RuleTreeNode
  formFields?: { fieldId: string; title: string }[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: RuleTreeNode): void
}>()

const defaultTree = (): RuleTreeNode => ({
  nodeType: 'AND',
  sort: 0,
  children: [],
})

const localTree = computed({
  get: () => props.modelValue ?? defaultTree(),
  set: (v) => emit('update:modelValue', v),
})

function onRootUpdate(updated: RuleTreeNode) {
  emit('update:modelValue', updated)
}
</script>
