<script setup lang="ts">
import type { FormField, FormLinkageNode } from '../types'
import ConditionNode from './ConditionNode.vue'

interface Props {
  nodes: FormLinkageNode[]
  fields: FormField[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:nodes', nodes: FormLinkageNode[]): void
}>()

function updateNodes(nodes: FormLinkageNode[]) {
  emit('update:nodes', nodes)
}

function addNode(type: 'CONDITION' | 'AND' | 'OR') {
  const list = [...props.nodes]
  if (type === 'CONDITION') {
    list.push({
      nodeType: 'CONDITION',
      triggerFieldId: props.fields[0]?.fieldId,
      triggerCondition: 'EQ',
    })
  } else {
    list.push({
      nodeType: type,
      children: [],
    })
  }
  updateNodes(list)
}

function removeNode(index: number) {
  const list = [...props.nodes]
  list.splice(index, 1)
  updateNodes(list)
}

function updateNode(index: number, node: FormLinkageNode) {
  const list = [...props.nodes]
  list[index] = node
  updateNodes(list)
}
</script>

<template>
  <div class="condition-builder">
    <div v-if="nodes.length === 0" class="condition-builder__empty">
      <el-icon :size="32" class="condition-builder__empty-icon">
        <Connection />
      </el-icon>
      <p class="condition-builder__empty-text">暂无条件，请添加</p>
    </div>

    <div v-else class="condition-builder__list">
      <ConditionNode v-for="(node, idx) in nodes" :key="idx" :node="node" :fields="fields" :depth="0"
        @update:node="updateNode(idx, $event)" @delete-node="removeNode(idx)" />
    </div>

    <div class="condition-builder__actions">
      <el-button type="primary" size="small" @click="addNode('CONDITION')">
        <el-icon>
          <Plus />
        </el-icon>
        添加条件
      </el-button>
      <el-button size="small" @click="addNode('AND')">
        <el-icon>
          <FolderOpened />
        </el-icon>
        添加分组(且)
      </el-button>
      <el-button size="small" @click="addNode('OR')">
        <el-icon>
          <Folder />
        </el-icon>
        添加分组(或)
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.condition-builder {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-md);
}

.condition-builder__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--df-space-xl);
  gap: var(--df-space-sm);
  color: var(--df-text-tertiary);
  background: var(--df-bg-page);
  border-radius: var(--df-radius-md);
  border: 1px dashed var(--df-border);
}

.condition-builder__empty-icon {
  color: var(--df-border);
}

.condition-builder__empty-text {
  font-size: 13px;
}

.condition-builder__list {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-sm);
}

.condition-builder__actions {
  display: flex;
  gap: var(--df-space-sm);
  padding-top: var(--df-space-sm);
}
</style>
