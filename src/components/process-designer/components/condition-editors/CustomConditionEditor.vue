<!-- src/components/process-designer/components/condition-editors/CustomConditionEditor.vue -->
<template>
  <div class="custom-condition-editor">
    <RuleGroup :node="rootNode" :depth="0" :is-root="true" :fields="fields" :readonly="readonly"
      @update="onRootUpdate" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RuleTreeNode } from '../../types/gateway-condition'
import RuleGroup from './RuleGroup.vue'

const props = defineProps<{
  modelValue?: RuleTreeNode[]
  fields?: { fieldId: string; title: string; groupName?: string }[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: RuleTreeNode[]): void
}>()

const defaultNode = (): RuleTreeNode => ({
  nodeType: 'AND',
  sort: 0,
  children: [],
})

const rootNode = computed(() => {
  const tree = props.modelValue
  if (!tree || tree.length === 0) return defaultNode()
  // 兼容旧数据：如果第一个元素没有 children，包装成 AND 组
  return tree[0]
})

function onRootUpdate(updated: RuleTreeNode) {
  emit('update:modelValue', [updated])
}
</script>
