<script setup lang="ts">
import {
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElRadioGroup,
  ElRadio,
  ElCheckboxGroup,
  ElCheckbox,
  ElDatePicker,
  ElTimePicker,
  ElSwitch,
  ElSlider,
  ElRate,
  ElColorPicker,
  ElCascader,
  ElIcon,
  ElButton,
} from 'element-plus'
import { computed } from 'vue'
import { Loading, RefreshRight } from '@element-plus/icons-vue'
import type { FormField, FormFieldOption } from '../types'
import { parseSwitchValue } from '../types'
import UploadRenderer from './UploadRenderer.vue'
import TableRenderer from './TableRenderer.vue'

interface Props {
  field: FormField
  modelValue?: any
  disabled?: boolean
  runtimeOptions?: FormFieldOption[]
  optionLoading?: boolean
  optionError?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  disabled: false,
  runtimeOptions: undefined,
  optionLoading: false,
  optionError: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'retryOptions'): void
}>()

function filterVisible(list: FormFieldOption[]): FormFieldOption[] {
  return list
    .filter(o => o.visible !== false)
    .map(o => ({
      ...o,
      children: o.children ? filterVisible(o.children) : undefined,
    }))
}

const resolvedOptions = computed(() => {
  const raw = props.runtimeOptions ?? props.field.options ?? []
  return filterVisible(raw)
})

const normalizedValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    // CHECKBOX / MULTICASCADER：渲染层截断超过 max 的选项
    if (['CHECKBOX', 'MULTICASCADER'].includes(props.field.type) && Array.isArray(val)) {
      const max = props.field.max
      if (max !== undefined && max > 0 && val.length > max) {
        val = val.slice(0, max)
      }
    }
    emit('update:modelValue', val)
  },
})

const switchValue = computed({
  get: () => parseSwitchValue(props.modelValue),
  set: (val) => emit('update:modelValue', val),
})

const textareaAutosize = computed(() => ({
  minRows: props.field.min ?? 2,
  maxRows: props.field.max ?? 6,
}))

const cascaderProps = computed(() => ({
  checkStrictly: props.field.props?.checkStrictly ?? true,
  ...props.field.props,
}))
</script>

<template>
  <div class="field-renderer">
    <!-- INPUT -->
    <ElInput
      v-if="field.type === 'INPUT'"
      v-model="normalizedValue"
      :disabled="disabled"
      :placeholder="field.placeholder ?? '请输入'"
      :minlength="field.minLength"
      :maxlength="field.maxLength"
      clearable
      show-word-limit
    />

    <!-- NUMBER -->
    <ElInputNumber
      v-else-if="field.type === 'NUMBER'"
      v-model="normalizedValue"
      :disabled="disabled"
      :placeholder="field.placeholder ?? '请输入数字'"
      :min="field.min"
      :max="field.max"
      controls-position="right"
      style="width: 100%"
    />

    <!-- TEXTAREA -->
    <ElInput
      v-else-if="field.type === 'TEXTAREA'"
      v-model="normalizedValue"
      type="textarea"
      :disabled="disabled"
      :placeholder="field.placeholder ?? '请输入'"
      :autosize="textareaAutosize"
      :minlength="field.minLength"
      :maxlength="field.maxLength"
      show-word-limit
    />

    <!-- SELECT -->
    <ElSelect
      v-else-if="field.type === 'SELECT'"
      v-model="normalizedValue"
      :disabled="disabled"
      :placeholder="field.placeholder ?? '请选择'"
      clearable
      style="width: 100%"
    >
      <ElOption
        v-for="opt in resolvedOptions"
        :key="String(opt.value)"
        :label="opt.label"
        :value="opt.value"
        :title="String(opt.label)"
      />
    </ElSelect>

    <!-- MULTISELECT -->
    <ElSelect
      v-else-if="field.type === 'MULTISELECT'"
      v-model="normalizedValue"
      :disabled="disabled"
      :placeholder="field.placeholder ?? '请选择（可多选）'"
      multiple
      collapse-tags
      collapse-tags-tooltip
      :multiple-limit="field.max ?? 0"
      clearable
      style="width: 100%"
    >
      <ElOption
        v-for="opt in resolvedOptions"
        :key="String(opt.value)"
        :label="opt.label"
        :value="opt.value"
        :title="String(opt.label)"
      />
    </ElSelect>

    <!-- RADIO -->
    <ElRadioGroup
      v-else-if="field.type === 'RADIO'"
      v-model="normalizedValue"
      :disabled="disabled"
    >
      <ElRadio
        v-for="opt in resolvedOptions"
        :key="String(opt.value)"
        :value="opt.value"
      >
        {{ opt.label }}
      </ElRadio>
    </ElRadioGroup>

    <!-- CHECKBOX -->
    <ElCheckboxGroup
      v-else-if="field.type === 'CHECKBOX'"
      v-model="normalizedValue"
      :disabled="disabled"
    >
      <ElCheckbox
        v-for="opt in resolvedOptions"
        :key="String(opt.value)"
        :value="opt.value"
      >
        {{ opt.label }}
      </ElCheckbox>
    </ElCheckboxGroup>

    <!-- DATE -->
    <ElDatePicker
      v-else-if="field.type === 'DATE'"
      v-model="normalizedValue"
      type="date"
      value-format="YYYY-MM-DD"
      :disabled="disabled"
      :placeholder="field.placeholder ?? '请选择日期'"
      style="width: 100%"
    />

    <!-- DATETIME -->
    <ElDatePicker
      v-else-if="field.type === 'DATETIME'"
      v-model="normalizedValue"
      type="datetime"
      value-format="YYYY-MM-DD HH:mm:ss"
      :disabled="disabled"
      :placeholder="field.placeholder ?? '请选择日期时间'"
      style="width: 100%"
    />

    <!-- TIME -->
    <ElTimePicker
      v-else-if="field.type === 'TIME'"
      v-model="normalizedValue"
      value-format="HH:mm:ss"
      :disabled="disabled"
      :placeholder="field.placeholder ?? '请选择时间'"
      style="width: 100%"
    />

    <!-- DATERANGE -->
    <ElDatePicker
      v-else-if="field.type === 'DATERANGE'"
      v-model="normalizedValue"
      type="daterange"
      value-format="YYYY-MM-DD"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      unlink-panels
      :disabled="disabled"
      :placeholder="field.placeholder ?? '请选择日期范围'"
      style="width: 100%"
    />

    <!-- SWITCH -->
    <ElSwitch
      v-else-if="field.type === 'SWITCH'"
      v-model="switchValue"
      :disabled="disabled"
      :active-value="true"
      :inactive-value="false"
    />

    <!-- SLIDER -->
    <ElSlider
      v-else-if="field.type === 'SLIDER'"
      v-model="normalizedValue"
      :disabled="disabled"
      :min="field.min ?? 0"
      :max="field.max ?? 100"
      show-input
    />

    <!-- RATE -->
    <ElRate
      v-else-if="field.type === 'RATE'"
      v-model="normalizedValue"
      :disabled="disabled"
      :max="field.max ?? 5"
    />

    <!-- COLOR -->
    <ElColorPicker
      v-else-if="field.type === 'COLOR'"
      v-model="normalizedValue"
      :disabled="disabled"
      show-alpha
    />

    <!-- CASCADER -->
    <ElCascader
      v-else-if="field.type === 'CASCADER'"
      v-model="normalizedValue"
      :options="resolvedOptions"
      :props="cascaderProps"
      :disabled="disabled"
      :placeholder="field.placeholder ?? '请选择'"
      clearable
      collapse-tags
      collapse-tags-tooltip
      style="width: 100%"
    />

    <!-- MULTICASCADER -->
    <ElCascader
      v-else-if="field.type === 'MULTICASCADER'"
      v-model="normalizedValue"
      :options="resolvedOptions"
      :props="{ ...cascaderProps, multiple: true }"
      :disabled="disabled"
      :placeholder="field.placeholder ?? '请选择（可多选）'"
      clearable
      collapse-tags
      collapse-tags-tooltip
      style="width: 100%"
    />

    <!-- UPLOAD -->
    <UploadRenderer
      v-else-if="field.type === 'UPLOAD'"
      :field="field"
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- TABLE -->
    <TableRenderer
      v-else-if="field.type === 'TABLE'"
      :field="field"
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- Loading state -->
    <div v-if="optionLoading" class="field-renderer__loading">
      <ElIcon class="is-loading">
        <Loading />
      </ElIcon>
      <span>加载中...</span>
    </div>

    <!-- Error state -->
    <div v-if="optionError" class="field-renderer__error">
      <span class="field-renderer__error-text">{{ optionError }}</span>
      <ElButton type="primary" link size="small" :icon="RefreshRight" @click="$emit('retryOptions')">
        重试
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.field-renderer {
  width: 100%;
}

.field-renderer__loading {
  display: flex;
  align-items: center;
  gap: var(--df-space-xs);
  margin-top: var(--df-space-xs);
  font-size: 12px;
  color: var(--df-text-tertiary);
}

.field-renderer__loading .is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.field-renderer__error {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
  margin-top: var(--df-space-xs);
  padding: var(--df-space-xs) var(--df-space-sm);
  background: var(--df-danger);
  opacity: 0.08;
  border-radius: var(--df-radius-sm);
}

.field-renderer__error-text {
  font-size: 12px;
  color: var(--df-danger);
  flex: 1;
}

/* 选项 label 过长省略（Radio / Checkbox / Cascader 节点） */
.field-renderer :deep(.el-radio__label),
.field-renderer :deep(.el-checkbox__label),
.field-renderer :deep(.el-cascader-node__label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Select / Cascader 下拉项 */
.field-renderer :deep(.el-select-dropdown__item),
.field-renderer :deep(.el-cascader-node) {
  overflow: hidden;
}

.field-renderer :deep(.el-cascader-node__label) {
  max-width: 100%;
}
</style>
