<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FormField, FormFieldGroup, FormFieldOption, FormTableColumn } from '../types'
import { OPTION_SOURCE_FIELD_TYPES } from '../types'
import { FIELD_TYPE_OPTIONS } from '../types'
import { PATTERN_PRESETS } from '../constants'
import FieldBadge from '../shared/FieldBadge.vue'
import OptionEditor from '../shared/OptionEditor.vue'
import FieldRenderer from '../core/FieldRenderer.vue'

interface Props {
  field?: FormField
  groups?: FormFieldGroup[]
}

const props = withDefaults(defineProps<Props>(), {
  groups: () => [],
})

const emit = defineEmits<{
  (e: 'update:field', field: FormField): void
  (e: 'deleteField', fieldId: string): void
  (e: 'moveField', fieldId: string, targetGroupId: string): void
}>()

const localField = ref<FormField | undefined>(props.field)

watch(() => props.field, (val) => {
  localField.value = val ? { ...val } : undefined
}, { immediate: true, deep: true })

const fieldTypeLabel = computed(() => {
  if (!localField.value) return ''
  const found = FIELD_TYPE_OPTIONS.find(opt => opt.value === localField.value!.type)
  return found?.label ?? localField.value.type
})

const showMinMax = computed(() => {
  if (!localField.value) return false
  return ['MULTISELECT', 'CHECKBOX', 'MULTICASCADER', 'TABLE', 'NUMBER'].includes(localField.value.type)
})

const showMinLengthMaxLength = computed(() => {
  if (!localField.value) return false
  return ['UPLOAD', 'INPUT', 'TEXTAREA'].includes(localField.value.type)
})

const limitLabels = computed(() => {
  if (!localField.value) return { min: '最小值', max: '最大值', minLength: '最小长度', maxLength: '最大长度' }
  switch (localField.value.type) {
    case 'MULTISELECT':
    case 'CHECKBOX':
    case 'MULTICASCADER':
      return { min: '最少选择数', max: '最多选择数', minLength: '最小长度', maxLength: '最大长度' }
    case 'TABLE':
      return { min: '最少行数', max: '最多行数', minLength: '最小长度', maxLength: '最大长度' }
    case 'NUMBER':
      return { min: '最小值', max: '最大值', minLength: '最小长度', maxLength: '最大长度' }
    case 'UPLOAD':
      return { min: '最小值', max: '最大值', minLength: '最少上传数', maxLength: '最多上传数' }
    case 'INPUT':
    case 'TEXTAREA':
      return { min: '最小值', max: '最大值', minLength: '最小长度', maxLength: '最大长度' }
    default:
      return { min: '最小值', max: '最大值', minLength: '最小长度', maxLength: '最大长度' }
  }
})

const supportsOptions = computed(() => {
  if (!localField.value) return false
  return OPTION_SOURCE_FIELD_TYPES.includes(localField.value.type)
})

const isInputOrTextarea = computed(() => {
  if (!localField.value) return false
  return localField.value.type === 'INPUT' || localField.value.type === 'TEXTAREA'
})

const isTable = computed(() => {
  if (!localField.value) return false
  return localField.value.type === 'TABLE'
})

const isCascader = computed(() => {
  if (!localField.value) return false
  return ['CASCADER', 'MULTICASCADER'].includes(localField.value.type)
})

const optionSourceType = computed({
  get: () => localField.value?.optionSource?.type ?? 'STATIC',
  set: (val: 'STATIC' | 'API') => {
    if (!localField.value) return
    emit('update:field', {
      ...localField.value,
      optionSource: { ...(localField.value.optionSource ?? {}), type: val },
    })
  },
})

const optionUrl = computed({
  get: () => localField.value?.optionSource?.url ?? '',
  set: (val: string) => {
    if (!localField.value) return
    emit('update:field', {
      ...localField.value,
      optionSource: { ...(localField.value.optionSource ?? {}), url: val },
    })
  },
})

const optionMethod = computed({
  get: () => localField.value?.optionSource?.method ?? 'GET',
  set: (val: 'GET' | 'POST') => {
    if (!localField.value) return
    emit('update:field', {
      ...localField.value,
      optionSource: { ...(localField.value.optionSource ?? {}), method: val },
    })
  },
})

function updateField(patch: Partial<FormField>) {
  if (!localField.value) return
  emit('update:field', { ...localField.value, ...patch })
}

function handleRequiredChange(val: '1' | '0') {
  updateField({ required: val })
}

function updateOptions(options: FormFieldOption[]) {
  if (!localField.value) return
  emit('update:field', { ...localField.value, options })
}

function addTableColumn() {
  if (!localField.value) return
  const columns = [...(localField.value.columns ?? [])]
  columns.push({ key: `col_${columns.length + 1}`, title: `列${columns.length + 1}` })
  emit('update:field', { ...localField.value, columns })
}

function removeTableColumn(index: number) {
  if (!localField.value) return
  const columns = [...(localField.value.columns ?? [])]
  columns.splice(index, 1)
  emit('update:field', { ...localField.value, columns })
}

function updateTableColumn(index: number, patch: Partial<FormTableColumn>) {
  if (!localField.value) return
  const columns = [...(localField.value.columns ?? [])]
  columns[index] = { ...columns[index], ...patch }
  emit('update:field', { ...localField.value, columns })
}

function handleDelete() {
  if (localField.value) {
    emit('deleteField', localField.value.fieldId)
  }
}

function applyPatternPreset(preset: typeof PATTERN_PRESETS[number]) {
  if (!localField.value) return
  emit('update:field', {
    ...localField.value,
    pattern: preset.pattern,
    patternTips: preset.patternTips,
  })
}
</script>

<template>
  <div class="field-config-panel">
    <!-- 空状态 -->
    <div v-if="!localField" class="field-config-panel__empty">
      <el-icon :size="48" class="field-config-panel__empty-icon">
        <Setting />
      </el-icon>
      <p class="field-config-panel__empty-text">点击字段进行配置</p>
    </div>

    <!-- 配置表单 -->
    <div v-else class="field-config-panel__content">
      <div class="field-config-panel__header">
        <FieldBadge :type="localField.type" size="small" />
        <span class="field-config-panel__type-label">{{ fieldTypeLabel }}</span>
      </div>

      <el-form label-position="top" size="small" class="field-config-panel__form">
        <!-- 标题 -->
        <el-form-item label="标题">
          <el-input
            :model-value="localField.title"
            placeholder="字段标题"
            @update:model-value="updateField({ title: $event })"
          />
        </el-form-item>

        <!-- 字段ID -->
        <el-form-item label="字段ID">
          <el-input :model-value="localField.fieldId" disabled />
        </el-form-item>

        <!-- 占位提示 -->
        <el-form-item label="占位提示">
          <el-input
            :model-value="localField.placeholder ?? ''"
            placeholder="请输入占位提示"
            @update:model-value="updateField({ placeholder: $event })"
          />
        </el-form-item>

        <!-- 布局宽度 -->
        <el-form-item label="布局宽度 (1-24)">
          <el-slider
            :model-value="localField.span ?? 24"
            :min="1"
            :max="24"
            show-stops
            @update:model-value="updateField({ span: $event })"
          />
        </el-form-item>

        <!-- min/max 配置 -->
        <template v-if="showMinMax"
        >
          <el-divider content-position="left"
          >数值限制</el-divider>

          <el-form-item :label="limitLabels.min">
            <el-input
              :model-value="localField.min ?? ''"
              type="number"
              placeholder="不限"
              :min="localField?.required === '1' ? 1 : 0"
              clearable
              @update:model-value="updateField({ min: $event === '' ? undefined : Number($event) })"
            />
          </el-form-item>
          <div
            v-if="localField?.min !== undefined && localField?.max !== undefined && Number(localField.min) > Number(localField.max)"
            class="validation-error"
          >
            {{ limitLabels.min }}不能大于{{ limitLabels.max }}
          </div>

          <el-form-item :label="limitLabels.max">
            <el-input
              :model-value="localField.max ?? ''"
              type="number"
              placeholder="不限"
              :min="0"
              clearable
              @update:model-value="updateField({ max: $event === '' ? undefined : Number($event) })"
            />
          </el-form-item>
        </template>

        <!-- minLength/maxLength 配置 -->
        <template v-if="showMinLengthMaxLength"
        >
          <el-divider content-position="left"
          >长度限制</el-divider>

          <el-form-item :label="limitLabels.minLength">
            <el-input
              :model-value="localField.minLength ?? ''"
              type="number"
              placeholder="不限"
              :min="localField?.required === '1' ? 1 : 0"
              clearable
              @update:model-value="updateField({ minLength: $event === '' ? undefined : Number($event) })"
            />
          </el-form-item>
          <div
            v-if="localField?.minLength !== undefined && localField?.maxLength !== undefined && Number(localField.minLength) > Number(localField.maxLength)"
            class="validation-error"
          >
            {{ limitLabels.minLength }}不能大于{{ limitLabels.maxLength }}
          </div>

          <el-form-item :label="limitLabels.maxLength">
            <el-input
              :model-value="localField.maxLength ?? ''"
              type="number"
              placeholder="不限"
              :min="0"
              clearable
              @update:model-value="updateField({ maxLength: $event === '' ? undefined : Number($event) })"
            />
          </el-form-item>
        </template>

        <!-- 必填 -->
        <el-form-item label="必填">
          <el-switch
            :model-value="localField.required"
            active-value="1"
            inactive-value="0"
            @update:model-value="handleRequiredChange"
          />
        </el-form-item>

        <!-- 默认值 -->
        <el-form-item label="默认值">
          <FieldRenderer
            :field="localField"
            :model-value="localField.defaultValue"
            @update:model-value="updateField({ defaultValue: $event })"
          />
        </el-form-item>

        <!-- 选项配置 -->
        <template v-if="supportsOptions">
          <el-divider content-position="left">选项配置</el-divider>

          <el-form-item label="选项来源">
            <el-radio-group v-model="optionSourceType">
              <el-radio-button value="STATIC">静态选项</el-radio-button>
              <el-radio-button value="API">远程接口</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <!-- 静态选项 -->
          <template v-if="optionSourceType === 'STATIC'">
            <OptionEditor
              :model-value="localField.options ?? []"
              :field-type="localField.type"
              @update:model-value="updateOptions"
            />
          </template>

          <!-- 远程接口 -->
          <template v-else>
            <el-form-item label="接口地址">
              <el-input v-model="optionUrl" placeholder="https://api.example.com/options" />
            </el-form-item>
            <el-form-item label="请求方法">
              <el-radio-group v-model="optionMethod">
                <el-radio-button value="GET">GET</el-radio-button>
                <el-radio-button value="POST">POST</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </template>
        </template>

        <!-- 级联属性 -->
        <template v-if="isCascader">
          <el-divider content-position="left">级联属性</el-divider>

          <el-form-item label="任意节点可选">
            <el-switch
              :model-value="localField.props?.checkStrictly ?? false"
              @update:model-value="updateField({ props: { ...(localField.props ?? {}), checkStrictly: $event } })"
            />
          </el-form-item>
        </template>

        <!-- 正则配置 -->
        <template v-if="isInputOrTextarea">
          <el-divider content-position="left">正则校验</el-divider>

          <el-form-item label="正则表达式">
            <el-input
              :model-value="localField.pattern ?? ''"
              placeholder="^\\d+$"
              @update:model-value="updateField({ pattern: $event })"
            />
          </el-form-item>

          <el-form-item label="错误提示">
            <el-input
              :model-value="localField.patternTips ?? ''"
              placeholder="输入不符合规则时的提示"
              @update:model-value="updateField({ patternTips: $event })"
            />
          </el-form-item>

          <el-form-item label="快速预设">
            <div class="field-config-panel__presets">
              <el-tag
                v-for="preset in PATTERN_PRESETS"
                :key="preset.label"
                size="small"
                class="field-config-panel__preset-tag"
                @click="applyPatternPreset(preset)"
              >
                {{ preset.label }}
              </el-tag>
            </div>
          </el-form-item>
        </template>

        <!-- 所属分组 -->
        <el-form-item v-if="groups.length > 1" label="所属分组">
          <el-select
            :model-value="localField.groupId || '_ungrouped'"
            size="small"
            style="width: 100%"
            @update:model-value="emit('moveField', localField!.fieldId, $event)"
          >
            <el-option
              v-for="g in groups"
              :key="g.id"
              :label="g.name"
              :value="g.id"
            />
          </el-select>
        </el-form-item>

        <!-- 表格列配置 -->
        <template v-if="isTable">
          <el-divider content-position="left">表格列配置</el-divider>

          <div class="field-config-panel__columns">
            <div
              v-for="(col, idx) in (localField.columns ?? [])"
              :key="idx"
              class="field-config-panel__column-row"
            >
              <el-input
                :model-value="col.key"
                placeholder="列key"
                size="small"
                @update:model-value="updateTableColumn(idx, { key: $event })"
              />
              <el-input
                :model-value="col.title"
                placeholder="列标题"
                size="small"
                @update:model-value="updateTableColumn(idx, { title: $event })"
              />
              <el-button
                type="danger"
                link
                size="small"
                @click="removeTableColumn(idx)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <el-button type="primary" link size="small" @click="addTableColumn">
            <el-icon><Plus /></el-icon>
            添加列
          </el-button>
        </template>
        <!-- 删除字段 -->
        <div class="field-config-panel__delete">
          <el-button type="danger" plain size="small" @click="handleDelete">
            <el-icon><Delete /></el-icon>
            删除字段
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.field-config-panel {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--df-bg-card);
  border-left: 1px solid var(--df-border);
  height: 100%;
  overflow: hidden;
}

.field-config-panel__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--df-space-md);
  color: var(--df-text-tertiary);
}

.field-config-panel__empty-icon {
  color: var(--df-border);
}

.field-config-panel__empty-text {
  font-size: 14px;
  color: var(--df-text-tertiary);
}

.field-config-panel__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.field-config-panel__header {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
  padding: var(--df-space-sm) var(--df-space-md);
  border-bottom: 1px solid var(--df-border);
  flex-shrink: 0;
}

.field-config-panel__type-label {
  font-size: 13px;
  color: var(--df-text-secondary);
}

.field-config-panel__form {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--df-space-sm) var(--df-space-md) var(--df-space-md);
}

.field-config-panel__form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.field-config-panel__form :deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--df-text-secondary);
  line-height: 18px;
}

.field-config-panel__form :deep(.el-divider) {
  margin-top: 8px;
  margin-bottom: 8px;
}
.field-config-panel__form :deep(.el-divider__text) {
  font-size: 13px;
  font-weight: 600;
  color: var(--df-text-secondary);
}

.field-config-panel__presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--df-space-xs);
}

.field-config-panel__preset-tag {
  cursor: pointer;
  transition: all var(--df-transition-fast);
}

.field-config-panel__preset-tag:hover {
  background: var(--df-primary-light);
  color: var(--df-primary);
}

.field-config-panel__columns {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-xs);
  margin-bottom: var(--df-space-sm);
}

.field-config-panel__column-row {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
  padding: 8px 12px;
  background: var(--df-bg-hover);
  border-radius: var(--df-radius-sm);
}

.field-config-panel__delete {
  margin-top: 4px;
  padding-top: var(--df-space-sm);
  border-top: 1px solid var(--df-border-light);
}

.validation-error {
  color: var(--df-danger);
  font-size: 12px;
  line-height: 18px;
  margin-top: -12px;
  margin-bottom: var(--df-space-sm);
}
</style>
