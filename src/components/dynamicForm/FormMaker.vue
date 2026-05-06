<template>
    <!-- 设计模式：字段 / 联动 / 预览 -->
    <div v-if="type === 'create'" class="form-maker design">
        <el-tabs v-model="activeTab">
            <el-tab-pane label="字段设计" name="fields">
                <div class="design-toolbar">
                    <span class="design-tip">拖拽卡片右上角把手可调整字段顺序，预览按 span 实际布局</span>
                    <el-button type="primary" :icon="Plus" @click="onAddField">添加字段</el-button>
                </div>

                <div v-if="fieldList.length === 0" class="empty-state">
                    <el-empty description="点击右上角添加字段" />
                </div>

                <draggable v-else v-model="fieldList" item-key="fieldId" handle=".field-drag-handle"
                    @end="onFieldsSorted" class="field-grid">
                    <template #item="{ element, index }">
                        <div class="field-col" :style="{ width: `${((element.span || 24) / 24) * 100}%` }">
                            <div class="field-card" :class="cardSizeClass(element.span)">
                                <div class="card-head">
                                    <span class="field-index">#{{ index + 1 }}</span>
                                    <span class="field-title" :title="element.title">{{ element.title }}</span>
                                    <div class="card-actions">
                                        <el-button type="primary" link :icon="Edit" @click="onEditField(element)"
                                            title="编辑">
                                            <span class="action-text">编辑</span>
                                        </el-button>
                                        <el-button type="danger" link :icon="Delete"
                                            @click="onRemoveField(element.fieldId)" title="删除">
                                            <span class="action-text">删除</span>
                                        </el-button>
                                        <span class="field-drag-handle" title="拖拽排序">
                                            <el-icon>
                                                <Rank />
                                            </el-icon>
                                        </span>
                                    </div>
                                </div>
                                <div class="card-tags">
                                    <el-tag size="small" type="info">{{ typeLabel(element.type) }}</el-tag>
                                    <el-tag size="small" type="danger" v-if="element.required === '1'">必填</el-tag>
                                    <el-tag size="small" type="warning">span {{ element.span ?? 24 }}</el-tag>
                                    <span class="field-id">{{ element.fieldId }}</span>
                                </div>
                                <div class="card-preview">
                                    <FieldRenderer :field="element" :model-value="null" disabled />
                                </div>
                            </div>
                        </div>
                    </template>
                </draggable>
            </el-tab-pane>

            <el-tab-pane :label="`联动规则 (${linkageList.length})`" name="linkage">
                <LinkageEditor :rules="linkageList" :fields="fieldList" @update:rules="linkageList = $event" />
            </el-tab-pane>

            <el-tab-pane label="表单预览" name="preview">
                <div class="preview-tip">
                    <el-icon>
                        <InfoFilled />
                    </el-icon>
                    <span>这里实时反映字段配置和联动规则的运行效果。</span>
                </div>
                <el-form ref="previewFormRef" :model="previewData" :rules="previewRules" label-position="top">
                    <el-row :gutter="16">
                        <el-col v-for="field in visibleFieldsForPreview" :key="field.fieldId" :span="field.span || 24">
                            <el-form-item :label="field.title" :prop="field.fieldId"
                                :required="previewStates[field.fieldId]?.required">
                                <FieldRenderer :field="field" :model-value="previewData[field.fieldId]"
                                    @update:model-value="previewData[field.fieldId] = $event"
                                    :disabled="previewStates[field.fieldId]?.disabled" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <el-button type="primary" plain @click="verifyPreview">验证表单</el-button>
            </el-tab-pane>
        </el-tabs>

        <FieldEditor v-model="fieldEditorOpen" :field="editingField" :existing-field-ids="fieldIds"
            @submit="onFieldSubmit" />
    </div>

    <!-- 运行模式：填表 / 查看 -->
    <div v-else class="form-maker runtime">
        <el-form ref="runtimeFormRef" :model="modelValue" :rules="runtimeRules" label-position="top">
            <el-row :gutter="16">
                <el-col v-for="field in visibleFieldsForRuntime" :key="field.fieldId" :span="field.span || 24">
                    <el-form-item :label="field.title" :prop="field.fieldId"
                        :required="runtimeStates[field.fieldId]?.required">
                        <FieldRenderer :field="field" :model-value="modelValue[field.fieldId]"
                            @update:model-value="onRuntimeFieldUpdate(field.fieldId, $event)"
                            :disabled="type === 'view' || runtimeStates[field.fieldId]?.disabled" />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
import { Plus, Edit, Delete, Rank, InfoFilled } from '@element-plus/icons-vue'
import { alert } from '@/utils'
import FieldRenderer from './FieldRenderer.vue'
import FieldEditor from './FieldEditor.vue'
import LinkageEditor from './LinkageEditor.vue'
import {
    FIELD_TYPE_OPTIONS,
    type FormField,
    type FormLinkage,
} from './types'
import { computeFieldStates, validateTemplate } from './linkage'

interface Props {
    formFields: FormField[]
    linkageRules?: FormLinkage[]
    modelValue: Record<string, any>
    type: 'create' | 'view' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
    linkageRules: () => [],
    modelValue: () => ({}),
})

const emit = defineEmits<{
    (e: 'update:fields', v: FormField[]): void
    (e: 'update:rules', v: FormLinkage[]): void
    (e: 'update:modelValue', v: Record<string, any>): void
}>()

// 设计模式数据
const fieldList = computed<FormField[]>({
    get: () => props.formFields,
    set: v => emit('update:fields', v),
})

const linkageList = computed<FormLinkage[]>({
    get: () => props.linkageRules || [],
    set: v => emit('update:rules', v),
})

const fieldIds = computed(() => fieldList.value.map(f => f.fieldId))

const typeLabel = (type: string): string =>
    FIELD_TYPE_OPTIONS.find(o => o.value === type)?.label || type

const cardSizeClass = (span?: number): string => {
    const s = span ?? 24
    if (s >= 19) return 'card-full'
    if (s >= 12) return 'card-wide'
    if (s >= 7) return 'card-mid'
    return 'card-narrow'
}

const activeTab = ref<'fields' | 'linkage' | 'preview'>('fields')

// 字段编辑器
const fieldEditorOpen = ref(false)
const editingField = ref<FormField | null>(null)

const onAddField = () => {
    editingField.value = null
    fieldEditorOpen.value = true
}

const onEditField = (field: FormField) => {
    editingField.value = field
    fieldEditorOpen.value = true
}

const onFieldSubmit = (field: FormField) => {
    const list = [...fieldList.value]
    const idx = list.findIndex(f => f.fieldId === (editingField.value?.fieldId || field.fieldId))
    if (idx >= 0 && editingField.value) {
        list[idx] = { ...field, sort: list[idx].sort ?? idx }
    } else {
        list.push({ ...field, sort: list.length })
    }
    fieldList.value = reindexSort(list)
    syncDefaultValues(list)
}

const onRemoveField = (fieldId: string) => {
    const list = fieldList.value.filter(f => f.fieldId !== fieldId)
    fieldList.value = reindexSort(list)
    // 同步移除引用该字段的联动规则
    const rules = linkageList.value.filter(
        r => r.triggerFieldId !== fieldId && r.targetFieldId !== fieldId,
    )
    if (rules.length !== linkageList.value.length) {
        linkageList.value = rules
    }
    // 同步清掉 modelValue 中对应数据
    if (Object.prototype.hasOwnProperty.call(props.modelValue, fieldId)) {
        const next = { ...props.modelValue }
        delete next[fieldId]
        emit('update:modelValue', next)
    }
}

const onFieldsSorted = () => {
    // 拖拽结束 → 重新落 sort
    fieldList.value = reindexSort(fieldList.value)
}

const reindexSort = (list: FormField[]): FormField[] =>
    list.map((f, i) => ({ ...f, sort: i }))

// 默认值初始化（仅在新增字段时把 defaultValue 写入 modelValue）
const syncDefaultValues = (fields: FormField[]) => {
    const next = { ...props.modelValue }
    let changed = false
    fields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(next, field.fieldId)) return
        if (field.defaultValue === undefined || field.defaultValue === null) return
        switch (field.type) {
            case 'CHECKBOX':
            case 'MULTISELECT':
            case 'MULTICASCADER':
                next[field.fieldId] = Array.isArray(field.defaultValue) ? field.defaultValue : []
                break
            case 'NUMBER':
            case 'SLIDER':
            case 'RATE':
                next[field.fieldId] = Number(field.defaultValue) || 0
                break
            case 'SWITCH':
                next[field.fieldId] = !!field.defaultValue
                break
            default:
                next[field.fieldId] = field.defaultValue
        }
        changed = true
    })
    if (changed) emit('update:modelValue', next)
}

watch(() => props.formFields, list => syncDefaultValues(list), { immediate: true })

// 运行模式：联动求值 + 校验规则
const runtimeStates = computed(() =>
    computeFieldStates(props.formFields, props.linkageRules, props.modelValue),
)

const visibleFieldsForRuntime = computed(() =>
    props.formFields.filter(f => runtimeStates.value[f.fieldId]?.visible !== false),
)

const buildItemRules = (field: FormField, requiredOverride: boolean): FormItemRule[] => {
    const itemRules: FormItemRule[] = []
    if (requiredOverride) {
        itemRules.push({
            required: true,
            message: `${field.title}不能为空`,
            trigger: 'change',
        })
    }
    if (field.minLength != null) {
        itemRules.push({
            min: Number(field.minLength),
            message: `${field.title} 长度不能小于 ${field.minLength}`,
            trigger: 'change',
        })
    }
    if (field.maxLength != null) {
        itemRules.push({
            max: Number(field.maxLength),
            message: `${field.title} 长度不能大于 ${field.maxLength}`,
            trigger: 'change',
        })
    }
    if (field.pattern) {
        try {
            const re = new RegExp(field.pattern)
            itemRules.push({
                pattern: re,
                message: field.patternTips || `${field.title}格式不正确`,
                trigger: 'change',
            })
        } catch {
            // 无效正则忽略，不抛
        }
    }
    return itemRules
}

const runtimeRules = computed<FormRules>(() => {
    const rules: FormRules = {}
    props.formFields.forEach(field => {
        const state = runtimeStates.value[field.fieldId]
        if (!state || !state.visible) return // 隐藏字段不参与校验
        const itemRules = buildItemRules(field, state.required)
        if (itemRules.length > 0) rules[field.fieldId] = itemRules
    })
    return rules
})

const onRuntimeFieldUpdate = (fieldId: string, value: any) => {
    emit('update:modelValue', { ...props.modelValue, [fieldId]: value })
}

const runtimeFormRef = ref<FormInstance>()

const verify = async (): Promise<boolean> => {
    if (!runtimeFormRef.value) return true
    try {
        await runtimeFormRef.value.validate()
        return true
    } catch {
        return false
    }
}

// 设计模式：预览
const previewData = ref<Record<string, any>>({})

watch(
    () => props.formFields,
    fields => {
        const next: Record<string, any> = {}
        fields.forEach(f => {
            next[f.fieldId] = previewData.value[f.fieldId] ?? f.defaultValue ?? null
        })
        previewData.value = next
    },
    { immediate: true, deep: true },
)

const previewStates = computed(() =>
    computeFieldStates(props.formFields, linkageList.value, previewData.value),
)

const visibleFieldsForPreview = computed(() =>
    props.formFields.filter(f => previewStates.value[f.fieldId]?.visible !== false),
)

const previewRules = computed<FormRules>(() => {
    const rules: FormRules = {}
    props.formFields.forEach(field => {
        const state = previewStates.value[field.fieldId]
        if (!state || !state.visible) return
        const itemRules = buildItemRules(field, state.required)
        if (itemRules.length > 0) rules[field.fieldId] = itemRules
    })
    return rules
})

const previewFormRef = ref<FormInstance>()

const verifyPreview = async () => {
    if (!previewFormRef.value) return
    try {
        await previewFormRef.value.validate()
        alert('表单校验通过', 'success')
    } catch {
        alert('表单校验失败', 'error')
    }
}

// 模板预校验（外部用：发布前）
const validateTpl = (name?: string) =>
    validateTemplate(name ?? '_skip_', props.formFields, props.linkageRules)

defineExpose({
    verify, // 运行时表单校验
    validateTpl, // 模板预校验
})
</script>

<style scoped lang="scss">
.form-maker {
    width: 100%;
}

.design {
    .design-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        gap: 12px;

        .design-tip {
            color: var(--el-text-color-secondary);
            font-size: 12px;
        }
    }

    .empty-state {
        padding: 40px 0;
    }

    .field-grid {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -6px;
        min-height: 60px;
    }

    .field-col {
        box-sizing: border-box;
        padding: 12px 6px 12px;
        min-width: 0;
        margin-bottom: 12px;
    }

    .field-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color-light);
        border-radius: 10px;
        padding: 10px 12px;
        transition: all 0.2s;
        gap: 8px;

        &:hover {
            border-color: var(--el-color-primary-light-5);
            box-shadow: var(--el-box-shadow-light);
        }

        .card-head {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;

            .field-index {
                font-size: 12px;
                font-weight: 600;
                color: var(--el-color-primary);
                flex-shrink: 0;
            }

            .field-title {
                font-weight: 600;
                color: var(--el-text-color-primary);
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .card-actions {
                display: flex;
                align-items: center;
                gap: 2px;
                flex-shrink: 0;

                .field-drag-handle {
                    cursor: grab;
                    color: var(--el-text-color-secondary);
                    display: inline-flex;
                    align-items: center;
                    padding: 4px;
                    border-radius: 4px;

                    &:hover {
                        background: var(--el-fill-color);
                        color: var(--el-color-primary);
                    }

                    &:active {
                        cursor: grabbing;
                    }
                }

                :deep(.el-button + .el-button) {
                    margin-left: 0;
                }
            }
        }

        .card-tags {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
            min-width: 0;

            .field-id {
                font-size: 12px;
                color: var(--el-text-color-secondary);
                font-family: monospace;
                margin-left: auto;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 50%;
            }
        }

        .card-preview {
            background: var(--el-fill-color-lighter);
            padding: 8px 10px;
            border-radius: 6px;
            pointer-events: none;
            opacity: 0.85;
            min-width: 0;
        }

        // 窄宽度卡片的渐进精简
        &.card-mid {
            .card-tags .field-id {
                display: none;
            }

            .card-actions .action-text {
                display: none;
            }
        }

        &.card-narrow {
            padding: 8px 10px;
            gap: 6px;

            .card-tags .field-id {
                display: none;
            }

            .card-actions .action-text {
                display: none;
            }

            .card-preview {
                display: none;
            }
        }
    }

    // 拖拽过程的占位与幽灵态
    :deep(.sortable-ghost) {
        opacity: 0.4;
    }

    :deep(.sortable-chosen) {
        cursor: grabbing;
    }
}

.preview-tip {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
}

@media (max-width: 768px) {
    .design .field-col {
        width: 100% !important;
    }
}
</style>
