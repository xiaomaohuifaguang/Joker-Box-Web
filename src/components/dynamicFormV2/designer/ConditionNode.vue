<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import type { FormField, FormLinkageNode, LinkageCondition } from '../types'
import { LINKAGE_CONDITION_OPTIONS, getValidConditionsByFieldType } from '../types'
import { LINKAGE_CONDITION_LABELS, FIELD_TYPE_COLORS } from '../constants'
import ValueInput from './ValueInput.vue'

interface Props {
  node: FormLinkageNode
  fields: FormField[]
  depth?: number
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
})

const emit = defineEmits<{
  (e: 'update:node', node: FormLinkageNode): void
  (e: 'deleteNode'): void
}>()

const isGroupNode = computed(() => props.node.nodeType === 'AND' || props.node.nodeType === 'OR')
const isConditionNode = computed(() => props.node.nodeType === 'CONDITION')

const triggerField = computed(() => {
  if (!props.node.triggerFieldId) return undefined
  return props.fields.find(f => f.fieldId === props.node.triggerFieldId)
})

const triggerFieldColor = computed(() => {
  if (!triggerField.value) return '#94a3b8'
  return FIELD_TYPE_COLORS[triggerField.value.type] ?? '#94a3b8'
})

const conditionOptions = computed(() => {
  if (!triggerField.value) return LINKAGE_CONDITION_OPTIONS
  const validConditions = getValidConditionsByFieldType(triggerField.value.type)
  return LINKAGE_CONDITION_OPTIONS.filter(opt => validConditions.includes(opt.value))
})

const nodeLabel = computed(() => {
  if (props.node.nodeType === 'AND') return '且'
  if (props.node.nodeType === 'OR') return '或'
  return '条件'
})

const isGroupExpanded = ref(true)

function updateNode(patch: Partial<FormLinkageNode>) {
  emit('update:node', { ...props.node, ...patch })
}

function updateTriggerFieldId(fieldId: string) {
  const field = props.fields.find(f => f.fieldId === fieldId)
  const validConditions = field ? getValidConditionsByFieldType(field.type) : []
  const newCondition: LinkageCondition = validConditions.length > 0 ? validConditions[0] : 'EQ'
  emit('update:node', {
    ...props.node,
    triggerFieldId: fieldId,
    triggerCondition: newCondition,
    triggerValue: undefined,
  })
}

function updateChildren(children: FormLinkageNode[]) {
  emit('update:node', { ...props.node, children })
}

function addChild(type: 'CONDITION' | 'AND' | 'OR') {
  const children = [...(props.node.children ?? [])]
  if (type === 'CONDITION') {
    children.push({
      nodeType: 'CONDITION',
      triggerFieldId: props.fields[0]?.fieldId,
      triggerCondition: 'EQ',
    })
  } else {
    children.push({
      nodeType: type,
      children: [],
    })
  }
  updateChildren(children)
}

function removeChild(index: number) {
  const children = [...(props.node.children ?? [])]
  children.splice(index, 1)
  updateChildren(children)
}

function updateChild(index: number, child: FormLinkageNode) {
  const children = [...(props.node.children ?? [])]
  children[index] = child
  updateChildren(children)
}
</script>

<template>
  <div class="condition-node"
    :style="depth > 0 ? { marginLeft: `${Math.min(depth, 1) * 16}px`, borderLeft: depth >= 2 ? '2px solid var(--df-border-light)' : 'none', paddingLeft: depth >= 2 ? '14px' : '0' } : {}">
    <!-- AND/OR 节点 -->
    <template v-if="isGroupNode">
      <div class="condition-node__group">
        <div class="condition-node__group-header">
          <div class="condition-node__group-badge"
            :class="`condition-node__group-badge--${node.nodeType.toLowerCase()}`">
            {{ nodeLabel }}
          </div>
          <div class="condition-node__group-actions">
            <el-button type="primary" link size="small" @click="isGroupExpanded = !isGroupExpanded">
              <el-icon>
                <ArrowDown v-if="isGroupExpanded" />
                <ArrowRight v-else />
              </el-icon>
              {{ isGroupExpanded ? '收起' : '展开' }}
            </el-button>
            <el-button type="danger" link size="small" @click="$emit('deleteNode')">
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </div>
        </div>

        <el-collapse-transition>
          <div v-show="isGroupExpanded" class="condition-node__children">
            <ConditionNode v-for="(child, idx) in (node.children ?? [])" :key="idx" :node="child" :fields="fields"
              :depth="depth + 1" @update:node="updateChild(idx, $event)" @delete-node="removeChild(idx)" />
          </div>
        </el-collapse-transition>

        <div v-show="isGroupExpanded" class="condition-node__actions">
          <el-button type="primary" link size="small" @click="addChild('CONDITION')">
            <el-icon>
              <Plus />
            </el-icon>
            添加条件
          </el-button>
          <el-button type="primary" link size="small" @click="addChild('AND')">
            <el-icon>
              <Plus />
            </el-icon>
            添加且分组
          </el-button>
          <el-button type="primary" link size="small" @click="addChild('OR')">
            <el-icon>
              <Plus />
            </el-icon>
            添加或分组
          </el-button>
        </div>
      </div>
    </template>

    <!-- CONDITION 节点 -->
    <template v-else>
      <div class="condition-node__condition">
        <div class="condition-node__field-tag">
          <span class="condition-node__field-dot" :style="{ backgroundColor: triggerFieldColor }" />
          <span class="condition-node__field-name">
            {{ triggerField?.title ?? '选择字段' }}
          </span>
        </div>

        <el-tag size="small" :type="node.triggerCondition === 'EQ' || node.triggerCondition === 'NE' ? 'info' :
          ['GT', 'LT', 'GE', 'LE'].includes(node.triggerCondition) ? 'warning' :
            ['CONTAINS', 'NOT_CONTAINS'].includes(node.triggerCondition) ? 'success' :
              'default'">
          {{ LINKAGE_CONDITION_LABELS[node.triggerCondition] ?? node.triggerCondition }}
        </el-tag>

        <ValueInput :model-value="node.triggerValue" :field="triggerField" :condition="node.triggerCondition"
          class="condition-node__value-input" @update:model-value="updateNode({ triggerValue: $event })" />

        <el-button type="danger" link size="small" class="condition-node__delete-btn" @click="$emit('deleteNode')">
          <el-icon>
            <Delete />
          </el-icon>
        </el-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.condition-node {
  display: flex;
  flex-direction: column;
}

/* ── 分组卡片 ── */
.condition-node__group {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-sm);
  padding: var(--df-space-md);
  border: 1px solid var(--df-border);
  border-radius: var(--df-radius-md);
  background: var(--df-bg-card);
}

.condition-node__group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.condition-node__group-badge {
  padding: 4px 12px;
  border-radius: var(--df-radius-sm);
  font-size: 13px;
  font-weight: 600;
}

.condition-node__group-badge--and {
  background: #dbeafe;
  color: #2563eb;
}

.condition-node__group-badge--or {
  background: #ffedd5;
  color: #ea580c;
}

.condition-node__group-actions {
  display: flex;
  gap: var(--df-space-xs);
}

.condition-node__children {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-sm);
  padding: var(--df-space-sm) 0;
}

.condition-node__actions {
  display: flex;
  gap: var(--df-space-md);
  padding-top: var(--df-space-xs);
}

/* ── 条件叶子卡片 ── */
.condition-node__condition {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
  padding: 12px 16px;
  background: var(--df-bg-card);
  border: 1px solid var(--df-border-light);
  border-radius: var(--df-radius-md);
  transition: border-color var(--df-transition-fast);
}

.condition-node__condition:hover {
  border-color: var(--df-border);
}

.condition-node__field-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.condition-node__field-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.condition-node__field-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--df-text-primary);
  white-space: nowrap;
}

.condition-node__value-input {
  flex: 1;
  min-width: 120px;
}

.condition-node__delete-btn {
  flex-shrink: 0;
}
</style>
