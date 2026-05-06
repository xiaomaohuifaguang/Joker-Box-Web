<template>
    <!-- REGEX 条件：始终是字符串输入 -->
    <el-input
        v-if="condition === 'REGEX'"
        :model-value="modelValue"
        @update:model-value="emitVal"
        placeholder="正则表达式"
        clearable />

    <!-- IN / NOT_IN：多值 -->
    <template v-else-if="isMultiCondition">
        <el-select
            v-if="hasOptions"
            :model-value="multiValue"
            @update:model-value="onMultiSelect"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="选择一个或多个值"
            style="width: 100%">
            <el-option v-for="op in field?.options || []" :key="String(op.value)"
                :label="op.label" :value="String(op.value)" />
        </el-select>
        <el-input
            v-else
            :model-value="modelValue"
            @update:model-value="emitVal"
            placeholder="多个值用英文逗号分隔"
            clearable />
    </template>

    <!-- 选项类字段（SELECT/RADIO/MULTISELECT/CHECKBOX）：单选下拉 -->
    <el-select
        v-else-if="hasOptions"
        :model-value="modelValue"
        @update:model-value="emitVal"
        placeholder="选择值"
        clearable
        style="width: 100%">
        <el-option v-for="op in field?.options || []" :key="String(op.value)"
            :label="op.label" :value="String(op.value)" />
    </el-select>

    <!-- 开关：true / false -->
    <el-select
        v-else-if="field?.type === 'SWITCH'"
        :model-value="modelValue"
        @update:model-value="emitVal"
        placeholder="选择"
        style="width: 100%">
        <el-option label="是 (true)" value="true" />
        <el-option label="否 (false)" value="false" />
    </el-select>

    <!-- 数字 / 滑块 / 评分 -->
    <el-input-number
        v-else-if="isNumberLike"
        :model-value="numberValue"
        @update:model-value="onNumberChange"
        :min="field?.min"
        :max="field?.max"
        controls-position="right"
        style="width: 100%" />

    <!-- 日期 -->
    <el-date-picker
        v-else-if="field?.type === 'DATE'"
        :model-value="modelValue"
        @update:model-value="emitVal"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="选择日期"
        style="width: 100%" />

    <!-- 日期时间 -->
    <el-date-picker
        v-else-if="field?.type === 'DATETIME'"
        :model-value="modelValue"
        @update:model-value="emitVal"
        type="datetime"
        value-format="YYYY-MM-DD HH:mm:ss"
        placeholder="选择日期时间"
        style="width: 100%" />

    <!-- 时间 -->
    <el-time-picker
        v-else-if="field?.type === 'TIME'"
        :model-value="modelValue"
        @update:model-value="emitVal"
        value-format="HH:mm:ss"
        placeholder="选择时间"
        style="width: 100%" />

    <!-- 颜色 -->
    <el-color-picker
        v-else-if="field?.type === 'COLOR'"
        :model-value="modelValue"
        @update:model-value="emitVal" />

    <!-- 兜底：纯文本 -->
    <el-input
        v-else
        :model-value="modelValue"
        @update:model-value="emitVal"
        :placeholder="field ? `请输入${field.title}的比较值` : '值'"
        clearable />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormField, LinkageCondition } from './types'

const props = defineProps<{
    modelValue: string
    field?: FormField
    condition: LinkageCondition
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', v: string): void
}>()

const emitVal = (v: any) => {
    emit('update:modelValue', v == null ? '' : String(v))
}

const isMultiCondition = computed(
    () => props.condition === 'IN' || props.condition === 'NOT_IN',
)

const hasOptions = computed(() => {
    if (!props.field) return false
    return ['SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX'].includes(props.field.type)
})

const isNumberLike = computed(() => {
    if (!props.field) return false
    return ['NUMBER', 'SLIDER', 'RATE'].includes(props.field.type)
})

// 多值视图：把 string 拆成 string[]
const multiValue = computed<string[]>(() => {
    if (!props.modelValue) return []
    return String(props.modelValue)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
})

const onMultiSelect = (arr: string[]) => {
    emit('update:modelValue', (arr || []).join(','))
}

// 数字视图
const numberValue = computed<number | undefined>(() => {
    if (props.modelValue === '' || props.modelValue == null) return undefined
    const n = Number(props.modelValue)
    return Number.isFinite(n) ? n : undefined
})

const onNumberChange = (v: number | undefined | null) => {
    emit('update:modelValue', v == null ? '' : String(v))
}
</script>
