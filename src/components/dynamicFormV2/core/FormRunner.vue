<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElForm, ElFormItem, ElRow, ElCol } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { FormField, FormFieldGroup, FormLinkageRule, FieldRuntimeState } from '../types'
import { flattenGroups } from '../types'
import { useLinkageEngine } from '../composables/useLinkageEngine'
import { useRemoteOptions } from '../composables/useRemoteOptions'
import { useFormValidation } from '../composables/useFormValidation'
import FormGroup from '../shared/FormGroup.vue'
import FieldRenderer from './FieldRenderer.vue'

interface Props {
  fields: FormField[]
  groups?: FormFieldGroup[]
  linkageRules?: any[]
  mode?: 'fill' | 'readonly'
  modelValue?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  groups: undefined,
  linkageRules: () => [],
  mode: 'fill',
  modelValue: () => ({}),
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void
}>()

const formRef = ref<FormInstance>()

const isReadonly = computed(() => props.mode === 'readonly')

const allFields = computed<FormField[]>(() => {
  if (props.groups && props.groups.length > 0) {
    return flattenGroups(props.groups)
  }
  return props.fields
})

const ungroupedFields = computed<FormField[]>(() => {
  if (!props.groups || props.groups.length === 0) return []
  const groupedFieldIds = new Set<string>()
  props.groups.forEach(g => {
    g.fields.forEach(f => groupedFieldIds.add(f.fieldId))
  })
  return props.fields.filter(f => !groupedFieldIds.has(f.fieldId))
})

const formData = computed<Record<string, any>>({
  get: () => props.modelValue ?? {},
  set: (val) => emit('update:modelValue', val),
})

// 联动引擎
const { runtimeStates } = useLinkageEngine(
  allFields,
  computed(() => (props.linkageRules ?? []) as FormLinkageRule[]),
  formData,
  (updates) => {
    emit('update:modelValue', { ...props.modelValue, ...updates })
  },
)

// 远程选项
const {
  optionLoading,
  optionErrors,
  getFieldOptions,
  retryLoadOptions,
} = useRemoteOptions(allFields, formData)

// 表单校验
const { formRules } = useFormValidation(allFields, runtimeStates)

// 分组展开状态
const groupExpandedMap = ref<Record<string, boolean>>({})

watch(
  () => props.groups,
  (groups) => {
    if (!groups) return
    groups.forEach((g) => {
      if (groupExpandedMap.value[g.id] === undefined) {
        groupExpandedMap.value[g.id] = g.collapsed !== '1'
      }
    })
  },
  { immediate: true },
)

function getFieldRuntimeState(fieldId: string): FieldRuntimeState | undefined {
  return runtimeStates.value.get(fieldId)
}

function getFieldSpan(field: FormField): number {
  const state = getFieldRuntimeState(field.fieldId)
  return state?.span ?? field.span ?? 24
}

function isFieldVisible(field: FormField): boolean {
  const state = getFieldRuntimeState(field.fieldId)
  return state?.visible !== false
}

function isFieldDisabled(field: FormField): boolean {
  if (isReadonly.value) return true
  const state = getFieldRuntimeState(field.fieldId)
  return state?.disabled === true
}

function isFieldRequired(field: FormField): boolean {
  const state = getFieldRuntimeState(field.fieldId)
  return state?.required === true || field.required === '1'
}

function updateFieldValue(fieldId: string, value: any): void {
  emit('update:modelValue', { ...props.modelValue, [fieldId]: value })
}

async function validate(): Promise<boolean> {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

function getSubmitData(): Record<string, any> {
  const data: Record<string, any> = {}
  allFields.value.forEach((field) => {
    if (isFieldVisible(field)) {
      data[field.fieldId] = props.modelValue?.[field.fieldId]
    }
  })
  return data
}

function scrollToFirstError(): void {
  nextTick(() => {
    const firstError = document.querySelector('.el-form-item.is-error')
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

defineExpose({
  validate,
  getSubmitData,
  scrollToFirstError,
})
</script>

<template>
  <ElForm ref="formRef" :model="formData" :rules="formRules" label-position="top" class="form-runner"
    :class="{ 'form-runner--readonly': isReadonly }">
    <div class="form-runner__content">
      <!-- 有分组时按分组渲染 -->
      <template v-if="groups && groups.length > 0">
        <template v-for="group in groups" :key="group.id">
          <!-- 未分组：直接平铺，不显示分组头 -->
          <ElRow v-if="group.id === '_ungrouped' && group.fields.length > 0" :gutter="16">
            <ElCol v-for="field in group.fields" v-show="isFieldVisible(field)" :key="field.fieldId"
              :span="getFieldSpan(field)">
              <ElFormItem :prop="field.fieldId" :rules="formRules[field.fieldId]" class="form-runner__form-item">
                <template #label>
                  <span class="form-runner__label">
                    {{ field.title }}
                    <span v-if="isFieldRequired(field)" class="form-runner__required">*</span>
                  </span>
                </template>
                <FieldRenderer :field="field" :model-value="formData[field.fieldId]" :disabled="isFieldDisabled(field)"
                  :runtime-options="getFieldOptions(field)" :option-loading="optionLoading[field.fieldId]"
                  :option-error="optionErrors[field.fieldId]"
                  @update:model-value="updateFieldValue(field.fieldId, $event)"
                  @retry-options="retryLoadOptions(field.fieldId)" />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <!-- 普通分组 -->
          <FormGroup v-else-if="group.id !== '_ungrouped'" :group="group" v-model="groupExpandedMap[group.id]">
            <ElRow :gutter="16">
              <ElCol v-for="field in group.fields" v-show="isFieldVisible(field)" :key="field.fieldId"
                :span="getFieldSpan(field)">
                <ElFormItem :prop="field.fieldId" :rules="formRules[field.fieldId]" class="form-runner__form-item">
                  <template #label>
                    <span class="form-runner__label">
                      {{ field.title }}
                      <span v-if="isFieldRequired(field)" class="form-runner__required">*</span>
                    </span>
                  </template>
                  <FieldRenderer :field="field" :model-value="formData[field.fieldId]"
                    :disabled="isFieldDisabled(field)" :runtime-options="getFieldOptions(field)"
                    :option-loading="optionLoading[field.fieldId]" :option-error="optionErrors[field.fieldId]"
                    @update:model-value="updateFieldValue(field.fieldId, $event)"
                    @retry-options="retryLoadOptions(field.fieldId)" />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </FormGroup>
        </template>
      </template>

      <!-- 未分组字段兜底（groups 中不含 _ungrouped 时） -->
      <ElRow v-if="ungroupedFields.length > 0" :gutter="16">
        <ElCol v-for="field in ungroupedFields" v-show="isFieldVisible(field)" :key="field.fieldId"
          :span="getFieldSpan(field)">
          <ElFormItem :prop="field.fieldId" :rules="formRules[field.fieldId]" class="form-runner__form-item">
            <template #label>
              <span class="form-runner__label">
                {{ field.title }}
                <span v-if="isFieldRequired(field)" class="form-runner__required">*</span>
              </span>
            </template>
            <FieldRenderer :field="field" :model-value="formData[field.fieldId]" :disabled="isFieldDisabled(field)"
              :runtime-options="getFieldOptions(field)" :option-loading="optionLoading[field.fieldId]"
              :option-error="optionErrors[field.fieldId]" @update:model-value="updateFieldValue(field.fieldId, $event)"
              @retry-options="retryLoadOptions(field.fieldId)" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- 无分组时平铺渲染 -->
      <ElRow v-else-if="!groups || groups.length === 0" :gutter="16">
        <ElCol v-for="field in fields" v-show="isFieldVisible(field)" :key="field.fieldId" :span="getFieldSpan(field)">
          <ElFormItem :prop="field.fieldId" :rules="formRules[field.fieldId]" class="form-runner__form-item">
            <template #label>
              <span class="form-runner__label">
                {{ field.title }}
                <span v-if="isFieldRequired(field)" class="form-runner__required">*</span>
              </span>
            </template>
            <FieldRenderer :field="field" :model-value="formData[field.fieldId]" :disabled="isFieldDisabled(field)"
              :runtime-options="getFieldOptions(field)" :option-loading="optionLoading[field.fieldId]"
              :option-error="optionErrors[field.fieldId]" @update:model-value="updateFieldValue(field.fieldId, $event)"
              @retry-options="retryLoadOptions(field.fieldId)" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </div>
  </ElForm>
</template>

<style scoped>
.form-runner {
  width: 100%;
}

.form-runner__content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.form-runner__form-item {
  margin-bottom: var(--df-space-lg);
  background: var(--df-bg-card);
  border: 1px solid var(--df-border-light);
  border-radius: var(--df-radius-md);
  padding: 16px;
  transition: all var(--df-transition-fast);
}

.form-runner__form-item:hover {
  border-color: var(--df-primary);
  box-shadow: var(--df-shadow-card-hover);
  transform: translateY(-1px);
}

.form-runner--readonly .form-runner__form-item,
.form-runner--readonly .form-runner__form-item:hover {
  border-color: var(--df-border-light);
  box-shadow: none;
  transform: none;
  cursor: default;
}

.form-runner :deep(.el-form-item.is-error) {
  border-color: var(--df-danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-runner__form-item :deep(.el-form-item__label) {
  padding-bottom: 6px;
  line-height: 20px;
  font-weight: 600;
}

.form-runner__label {
  font-size: 14px;
  color: var(--df-text-primary);
}

.form-runner__required {
  color: var(--df-danger);
  margin-left: 2px;
  font-weight: 700;
}

.form-runner :deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--df-danger) inset;
}

.form-runner :deep(.el-form-item__error) {
  color: var(--df-danger);
  font-size: 12px;
  padding-top: 4px;
}
</style>
