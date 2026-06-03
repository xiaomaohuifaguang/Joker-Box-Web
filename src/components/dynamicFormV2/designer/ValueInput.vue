<script setup lang="ts">
import { computed } from 'vue'
import type { FormField, LinkageCondition, FormFieldOption } from '../types'
import { parseSwitchValue } from '../types'

interface Props {
  modelValue?: any
  field?: FormField
  condition?: LinkageCondition
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const isEmptyCondition = computed(() => props.condition === 'EMPTY' || props.condition === 'NOT_EMPTY')

const isOptionField = computed(() => {
  if (!props.field) return false
  const optionTypes = ['SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'CASCADER', 'MULTICASCADER']
  return optionTypes.includes(props.field.type)
})

const isSwitchField = computed(() => props.field?.type === 'SWITCH')

const isNumberField = computed(() => props.field?.type === 'NUMBER' || props.field?.type === 'SLIDER' || props.field?.type === 'RATE')

const isDateField = computed(() => {
  if (!props.field) return false
  return ['DATE', 'DATETIME', 'TIME', 'DATERANGE'].includes(props.field.type)
})

const isMultipleSelect = computed(() => props.condition === 'IN' || props.condition === 'NOT_IN')

const resolvedOptions = computed<FormFieldOption[]>(() => props.field?.options ?? [])

const datePickerType = computed(() => {
  switch (props.field?.type) {
    case 'DATETIME': return 'datetime'
    case 'TIME': return 'time'
    case 'DATERANGE': return 'daterange'
    default: return 'date'
  }
})

const dateValueFormat = computed(() => {
  switch (props.field?.type) {
    case 'DATETIME': return 'YYYY-MM-DD HH:mm:ss'
    case 'TIME': return 'HH:mm:ss'
    default: return 'YYYY-MM-DD'
  }
})

const switchValue = computed({
  get: () => parseSwitchValue(props.modelValue),
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="value-input">
    <!-- EMPTY / NOT_EMPTY: 显示占位符 -->
    <span v-if="isEmptyCondition" class="value-input__placeholder">—</span>

    <!-- 选项类字段 -->
    <el-select
      v-else-if="isOptionField"
      :model-value="modelValue"
      :multiple="isMultipleSelect"
      :collapse-tags="isMultipleSelect"
      clearable
      size="small"
      style="width: 100%"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <el-option
        v-for="opt in resolvedOptions"
        :key="String(opt.value)"
        :label="opt.label"
        :value="opt.value"
      />
    </el-select>

    <!-- SWITCH -->
    <el-switch
      v-else-if="isSwitchField"
      v-model="switchValue"
      :active-value="true"
      :inactive-value="false"
      size="small"
    />

    <!-- 数字 -->
    <el-input-number
      v-else-if="isNumberField"
      :model-value="modelValue"
      size="small"
      style="width: 100%"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- 日期 -->
    <el-date-picker
      v-else-if="isDateField"
      :model-value="modelValue"
      :type="datePickerType"
      :value-format="dateValueFormat"
      size="small"
      style="width: 100%"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- 默认文本输入 -->
    <el-input
      v-else
      :model-value="modelValue"
      size="small"
      clearable
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped>
.value-input {
  width: 100%;
}

.value-input__placeholder {
  display: inline-block;
  padding: 0 var(--df-space-sm);
  font-size: 13px;
  color: var(--df-text-tertiary);
  line-height: 24px;
}
</style>
