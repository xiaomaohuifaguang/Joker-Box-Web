<template>
    <div class="table-renderer">
        <el-table :data="rows" border style="width: 100%" :max-height="500">
            <el-table-column type="index" label="#" width="50" />
            <el-table-column v-for="col in columns" :key="col.key" :label="col.title" :prop="col.key"
                min-width="140">
                <template #default="{ row }">
                    <el-input v-model="row[col.key]" :disabled="disabled" placeholder="请输入" @input="onUpdate" />
                </template>
            </el-table-column>
            <el-table-column v-if="!disabled" label="操作" width="70" fixed="right">
                <template #default="{ $index }">
                    <el-button type="danger" :icon="Delete" circle @click="removeRow($index)" />
                </template>
            </el-table-column>
        </el-table>
        <div v-if="!disabled" class="table-footer">
            <el-button type="primary" plain @click="addRow" :disabled="isMaxReached">
                <el-icon>
                    <Plus />
                </el-icon>
                添加行
            </el-button>
            <span v-if="field.min || field.max" class="row-hint">
                {{ field.min ? `最少 ${field.min} 行` : '' }}
                {{ field.max ? `最多 ${field.max} 行` : '' }}
                {{ `当前 ${rows.length} 行` }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { FormField, FormTableColumn } from './types'

const props = defineProps<{
    field: FormField
    modelValue: any
    disabled?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void
}>()

const columns = computed<FormTableColumn[]>(() => props.field.columns || [])

const rows = computed<Record<string, string>[]>(() => {
    if (Array.isArray(props.modelValue)) return props.modelValue
    return []
})

const isMaxReached = computed(() => {
    if (props.field.max == null) return false
    return rows.value.length >= props.field.max
})

const createEmptyRow = (): Record<string, string> => {
    const row: Record<string, string> = {}
    columns.value.forEach(col => {
        row[col.key] = ''
    })
    return row
}

const addRow = () => {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    current.push(createEmptyRow())
    emit('update:modelValue', current)
}

const removeRow = (index: number) => {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    current.splice(index, 1)
    emit('update:modelValue', current)
}

const onUpdate = () => {
    emit('update:modelValue', [...rows.value])
}
</script>

<style scoped>
.table-renderer {
    width: 100%;
}

.table-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
}

.row-hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
}
</style>
