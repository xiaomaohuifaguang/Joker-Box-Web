<!-- src/components/process-designer/components/condition-editors/RuleGroup.vue -->
<template>
  <div class="rule-group" :class="[node.nodeType === 'AND' ? 'and-group' : 'or-group']">
    <div class="group-header">
      <span class="group-badge">{{ node.nodeType }}</span>
      <span class="group-desc">{{ node.nodeType === 'AND' ? '以下全部满足' : '以下任一满足' }}</span>
      <el-button v-if="!isRoot" link type="danger" size="small" :disabled="readonly" :icon="Delete"
        @click="$emit('delete')" />
    </div>

    <div class="group-body">
      <template v-for="(child, index) in sortedChildren" :key="index">
        <ConditionRow v-if="child.nodeType === 'CONDITION'" :node="child" :fields="fields" :readonly="readonly"
          @update="(v) => updateChild(index, v)" @delete="removeChild(index)" />
        <RuleGroup v-else :node="child" :depth="depth + 1" :is-root="false" :fields="fields" :readonly="readonly"
          @update="(v) => updateChild(index, v)" @delete="removeChild(index)" />
      </template>
    </div>

    <div v-if="!readonly" class="group-actions">
      <el-button size="small" @click="addCondition">+ 添加条件</el-button>
      <el-button size="small" @click="addGroup('AND')">+ 添加 AND 组</el-button>
      <el-button size="small" @click="addGroup('OR')">+ 添加 OR 组</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import type { RuleTreeNode, NodeType } from '../../types/gateway-condition'
import ConditionRow from './ConditionRow.vue'

const props = defineProps<{
  node: RuleTreeNode
  depth: number
  isRoot: boolean
  fields?: { fieldId: string; title: string; groupName?: string }[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', value: RuleTreeNode): void
  (e: 'delete'): void
}>()

const sortedChildren = computed(() => {
  return [...(props.node.children ?? [])].sort((a, b) => a.sort - b.sort)
})

function updateChild(index: number, updated: RuleTreeNode) {
  const children = [...(props.node.children ?? [])]
  children[index] = updated
  emit('update', { ...props.node, children })
}

function removeChild(index: number) {
  const children = [...(props.node.children ?? [])]
  children.splice(index, 1)
  emit('update', { ...props.node, children })
}

function addCondition() {
  const children = [...(props.node.children ?? [])]
  children.push({
    nodeType: 'CONDITION',
    sort: children.length,
    category: 'FORM_FIELD',
    fieldKey: '',
    operator: 'EQ',
    value: '',
  })
  emit('update', { ...props.node, children })
}

function addGroup(type: NodeType) {
  const children = [...(props.node.children ?? [])]
  children.push({
    nodeType: type,
    sort: children.length,
    children: [],
  })
  emit('update', { ...props.node, children })
}
</script>

<style scoped>
.rule-group {
  border: 2px solid;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}

.and-group {
  border-color: #f0a030;
  background: rgba(240, 160, 48, 0.06);
}

.or-group {
  border-color: #4a9eff;
  background: rgba(74, 158, 255, 0.06);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.group-badge {
  padding: 3px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.and-group .group-badge {
  background: #f0a030;
  color: #000;
}

.or-group .group-badge {
  background: #4a9eff;
  color: #fff;
}

.group-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.group-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}
</style>
