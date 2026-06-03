<script setup lang="ts">
import { computed } from 'vue'
import type { LinkageAction, FormFieldOption } from '../types'

interface Props {
  modelValue?: any
  actionType: LinkageAction
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const isSwitchAction = computed(() => props.actionType === 'REQUIRED' || props.actionType === 'DISABLED')

const isSetPattern = computed(() => props.actionType === 'SET_PATTERN')

const isSetSpan = computed(() => props.actionType === 'SET_SPAN')

const isOptionAction = computed(() => props.actionType === 'OPTION')

const isValueAction = computed(() => props.actionType === 'VALUE')

const patternValue = computed({
  get: () => {
    if (typeof props.modelValue === 'object' && props.modelValue !== null) {
      return props.modelValue.pattern ?? ''
    }
    return ''
  },
  set: (val: string) => {
    const current = typeof props.modelValue === 'object' && props.modelValue !== null
      ? props.modelValue
      : { pattern: '', patternTips: '' }
    emit('update:modelValue', { ...current, pattern: val })
  },
})

const patternTipsValue = computed({
  get: () => {
    if (typeof props.modelValue === 'object' && props.modelValue !== null) {
      return props.modelValue.patternTips ?? ''
    }
    return ''
  },
  set: (val: string) => {
    const current = typeof props.modelValue === 'object' && props.modelValue !== null
      ? props.modelValue
      : { pattern: '', patternTips: '' }
    emit('update:modelValue', { ...current, patternTips: val })
  },
})

const spanValue = computed({
  get: () => {
    if (typeof props.modelValue === 'object' && props.modelValue !== null) {
      return props.modelValue.span ?? 24
    }
    return 24
  },
  set: (val: number) => {
    emit('update:modelValue', { span: val })
  },
})

const optionValue = computed({
  get: () => {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue as FormFieldOption[]
    }
    return []
  },
  set: (val: FormFieldOption[]) => {
    emit('update:modelValue', val)
  },
})

const switchValue = computed({
  get: () => {
    if (props.modelValue === undefined || props.modelValue === null) return true
    return props.modelValue === true || props.modelValue === 'true' || props.modelValue === '1'
  },
  set: (val: boolean) => {
    emit('update:modelValue', val)
  },
})
</script>

<template>
  <div class="action-param-input">
    <!-- REQUIRED / DISABLED: 开关 -->
    <el-switch
      v-if="isSwitchAction"
      v-model="switchValue"
      :active-value="true"
      :inactive-value="false"
      size="small"
    />

    <!-- SET_PATTERN: pattern + patternTips -->
    <template v-else-if="isSetPattern">
      <el-input
        v-model="patternValue"
        placeholder="正则表达式"
        size="small"
        class="action-param-input__input"
      />
      <el-input
        v-model="patternTipsValue"
        placeholder="错误提示"
        size="small"
        class="action-param-input__input"
      />
    </template>

    <!-- SET_SPAN: slider 1-24 -->
    <el-slider
      v-else-if="isSetSpan"
      v-model="spanValue"
      :min="1"
      :max="24"
      show-stops
      size="small"
    />

    <!-- OPTION: 多选输入（JSON 数组字符串） -->
    <el-select
      v-else-if="isOptionAction"
      v-model="optionValue"
      multiple
      collapse-tags
      placeholder="输入选项值"
      size="small"
      style="width: 100%"
      allow-create
      filterable
      default-first-option
    />

    <!-- VALUE: 文本输入 -->
    <el-input
      v-else-if="isValueAction"
      :model-value="modelValue"
      placeholder="设置值"
      size="small"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- 其他：不显示额外输入 -->
    <span v-else class="action-param-input__none">—</span>
  </div>
</template>

<style scoped>
.action-param-input {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-xs);
  width: 100%;
}

.action-param-input__input {
  width: 100%;
}

.action-param-input__none {
  font-size: 13px;
  color: var(--df-text-tertiary);
}
</style>
