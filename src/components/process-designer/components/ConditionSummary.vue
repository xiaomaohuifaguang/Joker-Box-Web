<!-- src/components/process-designer/components/ConditionSummary.vue -->
<template>
  <span class="condition-summary">{{ summaryText }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RuleTreeNode } from '../types/gateway-condition'

const props = defineProps<{
  ruleTree?: RuleTreeNode
}>()

const summaryText = computed(() => {
  if (!props.ruleTree) return '未配置条件'
  return buildNodeText(props.ruleTree)
})

function buildNodeText(node: RuleTreeNode): string {
  if (node.nodeType === 'CONDITION') {
    const opLabel = operatorLabel(node.operator)
    return `${categoryLabel(node.category)} ${node.fieldKey} ${opLabel} ${node.value ?? ''}`
  }

  if (!node.children || node.children.length === 0) {
    return node.nodeType === 'AND' ? '[AND]' : '[OR]'
  }

  const joiner = node.nodeType === 'AND' ? ' AND ' : ' OR '
  const childrenText = node.children
    .sort((a, b) => a.sort - b.sort)
    .map(buildNodeText)
    .join(joiner)

  if (node.children.length === 1) return childrenText
  return `(${childrenText})`
}

function categoryLabel(category?: string): string {
  const map: Record<string, string> = {
    FORM_FIELD: '表单字段',
    HANDLER_DEPT: '当前部门',
    HANDLER_ROLE: '当前角色',
    PREV_HANDLER_DEPT: '上一级部门',
    PREV_HANDLER_ROLE: '上一级角色',
  }
  return map[category ?? ''] || category || ''
}

function operatorLabel(op?: string): string {
  const map: Record<string, string> = {
    EQ: '==', NE: '!=', GT: '>', LT: '<', GE: '>=', LE: '<=',
    IN: 'IN', NOT_IN: 'NOT IN', EMPTY: '为空', NOT_EMPTY: '不为空', REGEX: '匹配',
  }
  return map[op ?? ''] || op || ''
}
</script>

<style scoped>
.condition-summary {
  color: var(--el-text-color-regular);
  font-size: 13px;
  word-break: break-all;
}
</style>
