<script setup lang="ts">
import { computed } from 'vue'
import { ElTable, ElTableColumn, ElInput, ElButton, ElIcon } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import type { FormField, FormTableColumn } from '../types'

interface Props {
  field: FormField
  modelValue?: any[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any[]): void
}>()

const rows = computed({
  get: () => Array.isArray(props.modelValue) ? props.modelValue : [],
  set: (val) => emit('update:modelValue', val),
})

const columns = computed<FormTableColumn[]>(() => {
  return props.field.columns ?? []
})

const canAddRow = computed(() => {
  if (props.disabled) return false
  const maxRows = props.field.maxLength
  if (maxRows == null) return true
  return rows.value.length < maxRows
})

function getCellValue(rowIndex: number, colKey: string): string {
  const row = rows.value[rowIndex]
  if (!row || typeof row !== 'object') return ''
  return row[colKey] ?? ''
}

function setCellValue(rowIndex: number, colKey: string, value: string): void {
  const newRows = [...rows.value]
  if (!newRows[rowIndex]) {
    newRows[rowIndex] = {}
  }
  newRows[rowIndex] = { ...newRows[rowIndex], [colKey]: value }
  emit('update:modelValue', newRows)
}

function addRow(): void {
  if (!canAddRow.value) return
  const newRow: Record<string, string> = {}
  columns.value.forEach((col) => {
    newRow[col.key] = ''
  })
  emit('update:modelValue', [...rows.value, newRow])
}

function removeRow(rowIndex: number): void {
  const newRows = [...rows.value]
  newRows.splice(rowIndex, 1)
  emit('update:modelValue', newRows)
}
</script>

<template>
  <div class="table-renderer">
    <ElTable
      :data="rows"
      border
      max-height="500"
      size="small"
      class="table-renderer__table"
    >
      <ElTableColumn
        v-for="col in columns"
        :key="col.key"
        :prop="col.key"
        :label="col.title"
        min-width="120"
        show-overflow-tooltip
      >
        <template #default="{ $index }">
          <ElInput
            :model-value="getCellValue($index, col.key)"
            :disabled="disabled"
            size="small"
            placeholder="请输入"
            @update:model-value="setCellValue($index, col.key, $event)"
          />
        </template>
      </ElTableColumn>

      <ElTableColumn
        v-if="!disabled"
        label="操作"
        width="80"
        fixed="right"
        align="center"
      >
        <template #default="{ $index }">
          <ElButton
            type="danger"
            link
            size="small"
            :icon="Delete"
            @click="removeRow($index)"
          />
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 空状态提示 -->
    <div v-if="!disabled && rows.length === 0 && columns.length > 0" class="table-renderer__empty">
      <ElIcon :size="24"><Plus /></ElIcon>
      <span>暂无数据，点击下方按钮添加行</span>
    </div>

    <!-- 添加行按钮区 -->
    <div v-if="!disabled" class="table-renderer__footer">
      <ElButton
        type="primary"
        size="small"
        :icon="Plus"
        :disabled="!canAddRow"
        @click="addRow"
      >
        添加行
      </ElButton>
      <span class="table-renderer__count-hint">
        共 {{ rows.length }} 行
        <span v-if="field.maxLength">/ 最多 {{ field.maxLength }} 行</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.table-renderer {
  width: 100%;
}

.table-renderer__table :deep(.el-table__cell) {
  padding: 4px 8px;
}

.table-renderer__table :deep(.el-input__wrapper) {
  box-shadow: none;
  padding: 0 4px;
}

.table-renderer__table :deep(.el-input__inner) {
  text-align: left;
}

.table-renderer__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--df-space-sm);
  padding: var(--df-space-md);
  background: var(--df-bg-hover);
  border: 1px dashed var(--df-border);
  border-radius: var(--df-radius-sm);
  color: var(--df-text-secondary);
  font-size: 13px;
  margin-top: var(--df-space-sm);
}

.table-renderer__footer {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
  margin-top: var(--df-space-sm);
  padding: var(--df-space-xs) 0;
}

.table-renderer__count-hint {
  font-size: 12px;
  color: var(--df-text-tertiary);
}
</style>
