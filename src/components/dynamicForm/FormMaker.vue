<template>
    <!-- 设计模式：字段 / 联动 / 预览 -->
    <div v-if="type === 'create'" class="form-maker design">
        <el-tabs v-model="activeTab">
            <el-tab-pane label="字段设计" name="fields">
                <div class="design-toolbar">
                    <span class="design-tip">拖拽分组可调整分组顺序；拖拽字段卡片可调整组内字段顺序</span>
                    <div class="toolbar-actions">
                        <el-button type="success" :icon="FolderAdd" @click="onAddGroup">添加分组</el-button>
                        <el-button type="primary" :icon="Plus" @click="onAddField">添加字段</el-button>
                    </div>
                </div>

                <!-- 分组快速导航 -->
                <div v-if="designGroups.length > 0 || ungroupedFields.length > 0" class="group-nav">
                    <span class="nav-label">快速定位：</span>
                    <div class="nav-tags">
                        <el-tag v-if="ungroupedFields.length > 0" class="nav-tag" size="small" effect="plain"
                            @click="scrollToGroup('_ungrouped')">
                            未分组 ({{ ungroupedFields.length }})
                        </el-tag>
                        <el-tag v-for="g in designGroups" :key="g.id" class="nav-tag" size="small" effect="plain"
                            @click="scrollToGroup(g.id)">
                            {{ g.name || g.id }} ({{ g.fields.length }})
                        </el-tag>
                    </div>
                </div>

                <!-- 未分组字段 -->
                <div v-if="ungroupedFields.length > 0" class="ungrouped-section" data-group-id="_ungrouped">
                    <div class="group-header ungrouped">
                        <span class="group-name">未分组字段</span>
                        <span class="group-count">({{ ungroupedFields.length }} 个字段)</span>
                    </div>
                    <div class="group-body">
                        <draggable v-model="ungroupedFields" item-key="fieldId" handle=".field-drag-handle"
                            @end="onUngroupedSorted" class="field-grid">
                            <template #item="{ element, index }">
                                <div class="field-col" :style="{ width: `${((element.span || 24) / 24) * 100}%` }">
                                    <div class="field-card" :class="cardSizeClass(element.span)">
                                        <div class="card-head">
                                            <span class="field-index">#{{ index + 1 }}</span>
                                            <span class="field-title" :title="element.title">{{ element.title }}</span>
                                            <div class="card-actions">
                                                <el-button type="primary" link :icon="Edit"
                                                    @click="onEditField(element)" title="编辑">
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
                                            <el-tag size="small" type="danger"
                                                v-if="element.required === '1'">必填</el-tag>
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
                    </div>
                </div>

                <div v-if="designGroups.length === 0 && ungroupedFields.length === 0" class="empty-state">
                    <el-empty description="暂无字段，请先添加分组和字段" />
                </div>

                <draggable v-if="designGroups.length > 0" v-model="designGroups" item-key="id"
                    handle=".group-drag-handle" @end="onGroupsSorted" class="groups-container">
                    <template #item="{ element: group }">
                        <div class="group-section" :data-group-id="group.id">
                            <div class="group-header">
                                <span class="group-drag-handle" title="拖拽调整分组顺序">
                                    <el-icon>
                                        <Rank />
                                    </el-icon>
                                </span>
                                <span class="group-name" :title="group.name">{{ group.name || group.id }}</span>
                                <span class="group-count">({{ group.fields.length }} 个字段)</span>
                                <div class="group-actions">
                                    <el-button link type="primary" :icon="Plus" @click="onAddField(group.id)"
                                        title="添加字段">
                                        <span class="action-text">添加字段</span>
                                    </el-button>
                                    <el-button link :icon="Edit" @click="onRenameGroup(group)" title="重命名">
                                        <span class="action-text">重命名</span>
                                    </el-button>
                                    <el-button link :icon="group.collapsed === '1' ? ArrowRight : ArrowDown"
                                        @click="toggleGroupCollapsed(group)"
                                        :title="group.collapsed === '1' ? '默认展开' : '默认折叠'">
                                        <span class="action-text">{{ group.collapsed === '1' ? '展开' : '折叠' }}</span>
                                    </el-button>
                                    <el-button link type="danger" :icon="Delete" @click="onRemoveGroup(group.id)"
                                        title="删除分组">
                                        <span class="action-text">删除</span>
                                    </el-button>
                                </div>
                            </div>
                            <div class="group-body">
                                <draggable v-model="group.fields" item-key="fieldId" handle=".field-drag-handle"
                                    @end="onFieldsSorted(group)" class="field-grid">
                                    <template #item="{ element, index }">
                                        <div class="field-col"
                                            :style="{ width: `${((element.span || 24) / 24) * 100}%` }">
                                            <div class="field-card" :class="cardSizeClass(element.span)">
                                                <div class="card-head">
                                                    <span class="field-index">#{{ index + 1 }}</span>
                                                    <span class="field-title" :title="element.title">{{ element.title
                                                        }}</span>
                                                    <div class="card-actions">
                                                        <el-button type="primary" link :icon="Edit"
                                                            @click="onEditField(element)" title="编辑">
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
                                                    <el-tag size="small" type="info">{{ typeLabel(element.type)
                                                        }}</el-tag>
                                                    <el-tag size="small" type="danger"
                                                        v-if="element.required === '1'">必填</el-tag>
                                                    <el-tag size="small" type="warning">span {{ element.span ?? 24
                                                        }}</el-tag>
                                                    <span class="field-id">{{ element.fieldId }}</span>
                                                </div>
                                                <div class="card-preview">
                                                    <FieldRenderer :field="element" :model-value="null" disabled />
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </draggable>
                                <div v-if="group.fields.length === 0" class="group-empty">
                                    <el-empty description="暂无字段，点击右上角添加字段" :image-size="60" />
                                </div>
                            </div>
                        </div>
                    </template>
                </draggable>

                <!-- 分组编辑对话框 -->
                <el-dialog v-model="groupEditorOpen" :title="groupEditorMode === 'create' ? '添加分组' : '重命名分组'"
                    width="400px" append-to-body destroy-on-close>
                    <el-input v-model="groupEditorName" placeholder="请输入分组名称" @keyup.enter="onSubmitGroupName" />
                    <template #footer>
                        <el-button @click="groupEditorOpen = false">取消</el-button>
                        <el-button type="primary" @click="onSubmitGroupName">确定</el-button>
                    </template>
                </el-dialog>
            </el-tab-pane>

            <el-tab-pane :label="`联动规则 (${linkageList.length})`" name="linkage">
                <LinkageEditor :rules="linkageList" :fields="designFieldsWithLoadedOptions"
                    @update:rules="linkageList = $event" />
            </el-tab-pane>

            <el-tab-pane label="表单预览" name="preview">
                <div class="preview-tip">
                    <el-icon>
                        <InfoFilled />
                    </el-icon>
                    <span>这里实时反映字段配置和联动规则的运行效果。</span>
                </div>
                <el-form ref="previewFormRef" :model="previewData" :rules="previewRules" label-position="top">
                    <!-- 未分组字段优先平铺渲染 -->
                    <el-row v-if="ungroupedPreviewFields.length > 0" :gutter="16">
                        <el-col v-for="field in ungroupedPreviewFields" :key="field.fieldId"
                            :span="previewStates[field.fieldId]?.span ?? field.span ?? 24">
                            <el-form-item :id="`form-item-${field.fieldId}`" :label="field.title" :prop="field.fieldId"
                                :required="previewStates[field.fieldId]?.required">
                                <FieldRenderer :field="field" :model-value="previewData[field.fieldId]"
                                    @update:model-value="updatePreviewField(field.fieldId, $event)"
                                    :disabled="previewStates[field.fieldId]?.disabled"
                                    :runtime-options="getEffectiveOptions(field, previewStates[field.fieldId]?.options)"
                                    :option-loading="remoteOptionLoading[field.fieldId]"
                                    :option-error="remoteOptionErrors[field.fieldId]"
                                    @retry-options="reloadFieldOptions(field)" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <!-- 分组字段 -->
                    <template v-if="previewGroups.length > 0">
                        <el-collapse v-model="activePreviewGroupIds" class="group-collapse">
                            <el-collapse-item v-for="g in previewGroups" :key="g.id" :name="g.id"
                                :title="g.name || g.id">
                                <el-row :gutter="16">
                                    <el-col v-for="field in g.fields" :key="field.fieldId"
                                        :span="previewStates[field.fieldId]?.span ?? field.span ?? 24">
                                        <el-form-item :id="`form-item-${field.fieldId}`" :label="field.title"
                                            :prop="field.fieldId" :required="previewStates[field.fieldId]?.required">
                                            <FieldRenderer :field="field" :model-value="previewData[field.fieldId]"
                                                @update:model-value="updatePreviewField(field.fieldId, $event)"
                                                :disabled="previewStates[field.fieldId]?.disabled"
                                                :runtime-options="getEffectiveOptions(field, previewStates[field.fieldId]?.options)"
                                                :option-loading="remoteOptionLoading[field.fieldId]"
                                                :option-error="remoteOptionErrors[field.fieldId]"
                                                @retry-options="reloadFieldOptions(field)" />
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                            </el-collapse-item>
                        </el-collapse>
                    </template>
                    <!-- 既没有分组也没有未分组时保持扁平渲染 -->
                    <el-row v-if="previewGroups.length === 0 && ungroupedPreviewFields.length === 0" :gutter="16">
                        <el-col v-for="field in visibleFieldsForPreview" :key="field.fieldId"
                            :span="previewStates[field.fieldId]?.span ?? field.span ?? 24">
                            <el-form-item :id="`form-item-${field.fieldId}`" :label="field.title" :prop="field.fieldId"
                                :required="previewStates[field.fieldId]?.required">
                                <FieldRenderer :field="field" :model-value="previewData[field.fieldId]"
                                    @update:model-value="updatePreviewField(field.fieldId, $event)"
                                    :disabled="previewStates[field.fieldId]?.disabled"
                                    :runtime-options="getEffectiveOptions(field, previewStates[field.fieldId]?.options)"
                                    :option-loading="remoteOptionLoading[field.fieldId]"
                                    :option-error="remoteOptionErrors[field.fieldId]"
                                    @retry-options="reloadFieldOptions(field)" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <el-button type="primary" plain @click="verifyPreview">验证表单</el-button>
            </el-tab-pane>
        </el-tabs>

        <FieldEditor v-model="fieldEditorOpen" :field="editingField" :existing-field-ids="fieldIds"
            :groups="groupOptions" :default-group-id="fieldEditorDefaultGroupId" @submit="onFieldSubmit" />
    </div>

    <!-- 运行模式：填表 / 查看 -->
    <div v-else class="form-maker runtime">
        <el-form ref="runtimeFormRef" :model="modelValue" :rules="runtimeRules" label-position="top">
            <!-- 未分组字段优先平铺渲染 -->
            <el-row v-if="ungroupedRuntimeFields.length > 0" :gutter="16">
                <el-col v-for="field in ungroupedRuntimeFields" :key="field.fieldId"
                    :span="runtimeStates[field.fieldId]?.span ?? field.span ?? 24">
                    <el-form-item :id="`form-item-${field.fieldId}`" :label="field.title" :prop="field.fieldId"
                        :required="runtimeStates[field.fieldId]?.required">
                        <FieldRenderer :field="field" :model-value="modelValue[field.fieldId]"
                            @update:model-value="onRuntimeFieldUpdate(field.fieldId, $event)"
                            :disabled="type === 'view' || runtimeStates[field.fieldId]?.disabled"
                            :runtime-options="getEffectiveOptions(field, runtimeStates[field.fieldId]?.options)"
                            :option-loading="remoteOptionLoading[field.fieldId]"
                            :option-error="remoteOptionErrors[field.fieldId]"
                            @retry-options="reloadFieldOptions(field)" />
                    </el-form-item>
                </el-col>
            </el-row>
            <!-- 有分组时按折叠面板渲染 -->
            <template v-if="runtimeGroups.length > 0">
                <el-collapse v-model="activeGroupIds" class="group-collapse">
                    <el-collapse-item v-for="g in runtimeGroups" :key="g.id" :name="g.id" :title="g.name || g.id">
                        <el-row :gutter="16">
                            <el-col v-for="field in g.fields" :key="field.fieldId"
                                :span="runtimeStates[field.fieldId]?.span ?? field.span ?? 24">
                                <el-form-item :id="`form-item-${field.fieldId}`" :label="field.title"
                                    :prop="field.fieldId" :required="runtimeStates[field.fieldId]?.required">
                                    <FieldRenderer :field="field" :model-value="modelValue[field.fieldId]"
                                        @update:model-value="onRuntimeFieldUpdate(field.fieldId, $event)"
                                        :disabled="type === 'view' || runtimeStates[field.fieldId]?.disabled"
                                        :runtime-options="getEffectiveOptions(field, runtimeStates[field.fieldId]?.options)"
                                        :option-loading="remoteOptionLoading[field.fieldId]"
                                        :option-error="remoteOptionErrors[field.fieldId]"
                                        @retry-options="reloadFieldOptions(field)" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-collapse-item>
                </el-collapse>
            </template>
            <!-- 既没有分组也没有未分组时保持扁平渲染 -->
            <el-row v-if="runtimeGroups.length === 0 && ungroupedRuntimeFields.length === 0" :gutter="16">
                <el-col v-for="field in visibleFieldsForRuntime" :key="field.fieldId"
                    :span="runtimeStates[field.fieldId]?.span ?? field.span ?? 24">
                    <el-form-item :id="`form-item-${field.fieldId}`" :label="field.title" :prop="field.fieldId"
                        :required="runtimeStates[field.fieldId]?.required">
                        <FieldRenderer :field="field" :model-value="modelValue[field.fieldId]"
                            @update:model-value="onRuntimeFieldUpdate(field.fieldId, $event)"
                            :disabled="type === 'view' || runtimeStates[field.fieldId]?.disabled"
                            :runtime-options="getEffectiveOptions(field, runtimeStates[field.fieldId]?.options)"
                            :option-loading="remoteOptionLoading[field.fieldId]"
                            :option-error="remoteOptionErrors[field.fieldId]"
                            @retry-options="reloadFieldOptions(field)" />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, shallowRef, triggerRef } from 'vue'
import draggable from 'vuedraggable'
import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
import { Plus, Edit, Delete, Rank, InfoFilled, FolderAdd, ArrowDown, ArrowRight } from '@element-plus/icons-vue'
import { alert } from '@/utils'
import FieldRenderer from './FieldRenderer.vue'
import FieldEditor from './FieldEditor.vue'
import LinkageEditor from './LinkageEditor.vue'
import {
    FIELD_TYPE_OPTIONS,
    type FormField,
    type FormFieldGroup,
    type FormLinkageRule,
    type FormFieldType,
    flattenGroups,
    buildGroups,
    isApiOptionSource,
    parseSwitchValue,
} from './types'
import { computeFieldStates, validateTemplate, cleanConditionTree, type ComputeFieldStatesCache } from './linkage'
import { collectRemoteOptionParamRefs, loadRemoteOptions } from './remoteOptions'

interface Props {
    fields: FormField[]
    linkageRules?: FormLinkageRule[]
    groups?: FormFieldGroup[]
    modelValue: Record<string, any>
    type: 'create' | 'view' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
    linkageRules: () => [],
    modelValue: () => ({}),
})

const emit = defineEmits<{
    (e: 'update:fields', v: FormField[]): void
    (e: 'update:groups', v: FormFieldGroup[]): void
    (e: 'update:rules', v: FormLinkageRule[]): void
    (e: 'update:modelValue', v: Record<string, any>): void
}>()

// 设计模式数据
const fieldList = computed<FormField[]>({
    get: () => props.fields,
    set: v => emit('update:fields', v),
})

// 联动规则：内部维护一份本地状态，确保 LinkageEditor 修改后立即
// 反映到 previewStates，不受父组件异步更新的影响
const _internalLinkageRules = ref<FormLinkageRule[]>([])

watch(
    () => props.linkageRules,
    (val) => {
        _internalLinkageRules.value = val || []
    },
    { immediate: true },
)

const linkageList = computed<FormLinkageRule[]>({
    get: () => _internalLinkageRules.value,
    set: (v) => {
        _internalLinkageRules.value = v
        emit('update:rules', v)
    },
})

const fieldIds = computed(() => [
    ...flattenGroups(designGroups.value).map(f => f.fieldId),
    ...ungroupedFields.value.map(f => f.fieldId),
])

const previewData = shallowRef<Record<string, any>>({})

/** 判断值是否为"空"（null / undefined / '' 均视为空） */
const isEmptyish = (v: any): boolean => v === null || v === undefined || v === ''

/** 比较两个值是否实质相同（防止 Element Plus 组件规范化 emit 导致死循环）
 *  - null / undefined / '' 互为等价（均为"空"）
 *  - null / undefined / [] 互为等价（数组字段未赋值时，组件规范化为 []）
 *  - 数字与数字字符串等价（"10" ≡ 10）
 *  - 布尔与布尔字符串等价（"true" ≡ true）
 */
const isSameValue = (a: any, b: any): boolean => {
    if (a === b) return true
    // 两者均为"空"值 → 等价（含空数组，因为 Element Plus 多选组件会将 undefined 规范化为 []）
    if (isEmptyish(a) && isEmptyish(b)) return true
    // 一侧为空、另一侧为空数组 → 等价（MULTISELECT/CHECKBOX/MULTICASCADER 的常见规范化）
    if ((isEmptyish(a) && Array.isArray(b) && b.length === 0) ||
        (isEmptyish(b) && Array.isArray(a) && a.length === 0)) return true
    // 数组内容比较
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false
        return a.every((v: any, i: number) => v === b[i])
    }
    // 数字 vs 数字字符串
    if (typeof a === 'number' && typeof b === 'string') return Number.isFinite(a) && a === Number(b)
    if (typeof b === 'number' && typeof a === 'string') return Number.isFinite(b) && Number(a) === b
    // 布尔 vs 布尔字符串/数字
    if (typeof a === 'boolean' && typeof b !== 'boolean') return a === parseSwitchValue(b)
    if (typeof b === 'boolean' && typeof a !== 'boolean') return b === parseSwitchValue(a)
    return false
}

/** 更新预览字段值（就地修改 + triggerRef，避免每次创建新对象引发连锁重渲染） */
const updatePreviewField = (fieldId: string, value: any) => {
    if (isSameValue(previewData.value[fieldId], value)) return
    previewData.value[fieldId] = value ?? undefined
    triggerRef(previewData)
}

const remoteOptions = ref<Record<string, any[]>>({})
const remoteOptionLoading = ref<Record<string, boolean>>({})
const remoteOptionErrors = ref<Record<string, string>>({})
const remoteOptionRequestSeq = ref<Record<string, number>>({})

// withLoadedOptions 缓存：避免 .map() 总是返回新数组引用导致 computeFieldStates 缓存失效
// 每个调用点需要独立缓存，避免互相覆盖
const createWithLoadedOptions = () => {
    let cache: { fields: FormField[]; remoteOptions: Record<string, any[]>; result: FormField[] } | null = null
    return (fields: FormField[]): FormField[] => {
        if (cache && cache.fields === fields && cache.remoteOptions === remoteOptions.value) {
            return cache.result
        }
        let changed = false
        const result = fields.map(field => {
            if (!isApiOptionSource(field)) return field
            const loadedOptions = remoteOptions.value[field.fieldId] || []
            if (field.options === loadedOptions) return field
            if (field.options && loadedOptions && field.options.length === loadedOptions.length) {
                const same = field.options.every((opt, i) => opt === loadedOptions[i])
                if (same) return field
            }
            changed = true
            return { ...field, options: loadedOptions }
        })
        const finalResult = changed ? result : fields
        cache = { fields, remoteOptions: remoteOptions.value, result: finalResult }
        return finalResult
    }
}

const withLoadedOptions = createWithLoadedOptions()
const withLoadedOptionsForDesign = createWithLoadedOptions()

const fieldsWithLoadedOptions = computed(() => withLoadedOptions(props.fields))
const designFieldsWithLoadedOptions = computed(() => withLoadedOptionsForDesign(fieldList.value))

const getRemoteOptionFormData = () => props.type === 'create' ? previewData.value : props.modelValue

const loadFieldOptions = async (field: FormField) => {
    if (!isApiOptionSource(field)) return
    const seq = (remoteOptionRequestSeq.value[field.fieldId] || 0) + 1
    remoteOptionRequestSeq.value = { ...remoteOptionRequestSeq.value, [field.fieldId]: seq }
    remoteOptionLoading.value = { ...remoteOptionLoading.value, [field.fieldId]: true }
    remoteOptionErrors.value = { ...remoteOptionErrors.value, [field.fieldId]: '' }
    try {
        const result = await loadRemoteOptions(field, getRemoteOptionFormData())
        if (remoteOptionRequestSeq.value[field.fieldId] !== seq) return
        remoteOptions.value = { ...remoteOptions.value, [field.fieldId]: result.options }
    } catch (e: any) {
        if (remoteOptionRequestSeq.value[field.fieldId] !== seq) return
        remoteOptionErrors.value = { ...remoteOptionErrors.value, [field.fieldId]: e?.message || '选项加载失败' }
    } finally {
        if (remoteOptionRequestSeq.value[field.fieldId] === seq) {
            remoteOptionLoading.value = { ...remoteOptionLoading.value, [field.fieldId]: false }
        }
    }
}

const reloadFieldOptions = (field: FormField) => {
    loadFieldOptions(field)
}

const getEffectiveOptions = (field: FormField, stateOptions?: any[]) => {
    if (stateOptions) return stateOptions
    if (isApiOptionSource(field)) return remoteOptions.value[field.fieldId] || []
    return field.options
}

const getRemoteOptionLoadKey = (field: FormField) => {
    const formData = getRemoteOptionFormData()
    const refValues = collectRemoteOptionParamRefs(field.optionSource?.params).reduce<Record<string, any>>((acc, fieldId) => {
        acc[fieldId] = formData?.[fieldId]
        return acc
    }, {})
    return JSON.stringify({
        fieldId: field.fieldId,
        optionSource: field.optionSource,
        refValues,
    })
}

watch(
    () => props.fields.map(getRemoteOptionLoadKey),
    () => {
        props.fields.forEach(field => {
            if (isApiOptionSource(field)) {
                loadFieldOptions(field)
            }
        })
    },
    { immediate: true },
)

const groupOptions = computed(() =>
    designGroups.value.map(g => ({ id: g.id, name: g.name || g.id }))
)

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
const activeGroupIds = ref<string[]>([])
const activePreviewGroupIds = ref<string[]>([])
const activeDesignGroupIds = ref<string[]>([])

// 分组设计数据
const designGroups = ref<FormFieldGroup[]>([])
const ungroupedFields = ref<FormField[]>([])

const initDesignGroups = () => {
    const allFields = props.fields
    // 未分组字段总是从 fields 中提取（groupId 为空或不存在）
    const ungrouped = allFields.filter(f => !f.groupId).map((f, i) => ({ ...f, sort: i }))

    if (props.groups && props.groups.length > 0) {
        const grouped = JSON.parse(JSON.stringify(props.groups))
        designGroups.value = grouped.map((g: FormFieldGroup) => ({
            ...g,
            fields: allFields
                .filter(f => f.groupId === g.id)
                .map((f, idx) => ({ ...f, sort: f.sort ?? idx }))
                .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
        }))
    } else if (allFields.length > 0) {
        const grouped = buildGroups(allFields)
        designGroups.value = grouped ? JSON.parse(JSON.stringify(grouped)) : []
    } else {
        designGroups.value = []
    }
    ungroupedFields.value = ungrouped
    activeDesignGroupIds.value = designGroups.value.map(g => g.id)
}

watch(
    () => props.fields.map(f => `${f.fieldId}:${f.options?.length}:${f.optionSource?.type}:${f.columns?.length}`),
    () => {
        const allFields = props.fields
        const ungrouped = allFields.filter(f => !f.groupId).map((f, i) => ({ ...f, sort: i }))
        ungroupedFields.value = ungrouped
        designGroups.value.forEach(g => {
            g.fields = allFields
                .filter(f => f.groupId === g.id)
                .map((f, idx) => ({ ...f, sort: f.sort ?? idx }))
                .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
        })
        activeDesignGroupIds.value = designGroups.value.map(g => g.id)
    },
)

watch(
    () => ({ groupsLen: props.groups?.length ?? 0, fieldsLen: props.fields.length }),
    initDesignGroups,
    { immediate: true },
)

const emitGroups = () => {
    designGroups.value.forEach((g, i) => {
        g.sort = i
        g.fields.forEach((f, j) => {
            f.sort = j
            f.groupId = g.id
        })
    })
    ungroupedFields.value.forEach((f, i) => {
        f.sort = i
        delete (f as any).groupId
    })
    const flat = [
        ...flattenGroups(designGroups.value),
        ...ungroupedFields.value,
    ]
    emit('update:fields', flat)
    emit('update:groups', JSON.parse(JSON.stringify(designGroups.value)))
}

// 字段编辑器
const fieldEditorOpen = ref(false)
const editingField = ref<FormField | null>(null)
const fieldEditorDefaultGroupId = ref<string>('')

const onAddField = (groupId?: string | Event) => {
    editingField.value = null
    fieldEditorDefaultGroupId.value = typeof groupId === 'string' ? groupId : ''
    fieldEditorOpen.value = true
}

const onEditField = (field: FormField) => {
    editingField.value = field
    fieldEditorOpen.value = true
}

const addFieldToGroup = (field: FormField) => {
    const targetId = field.groupId!
    const g = designGroups.value.find(gg => gg.id === targetId)
    if (g) {
        g.fields.push({ ...field, sort: g.fields.length })
    } else {
        designGroups.value.push({
            id: targetId,
            name: targetId,
            fields: [{ ...field, sort: 0 }],
            sort: designGroups.value.length,
            collapsed: '0',
        })
        activeDesignGroupIds.value.push(targetId)
    }
}

const onFieldSubmit = (field: FormField) => {
    if (editingField.value) {
        const oldId = editingField.value.fieldId
        // 先在 designGroups 中找
        for (const g of designGroups.value) {
            const idx = g.fields.findIndex(f => f.fieldId === oldId)
            if (idx >= 0) {
                if (field.groupId && field.groupId !== g.id) {
                    g.fields.splice(idx, 1)
                    addFieldToGroup(field)
                } else if (!field.groupId) {
                    g.fields.splice(idx, 1)
                    ungroupedFields.value.push({ ...field, sort: ungroupedFields.value.length })
                } else {
                    g.fields[idx] = { ...field, sort: g.fields[idx].sort ?? idx }
                }
                emitGroups()
                syncDefaultValues(flattenGroups(designGroups.value).concat(ungroupedFields.value))
                return
            }
        }
        // 再在 ungroupedFields 中找
        const uidx = ungroupedFields.value.findIndex(f => f.fieldId === oldId)
        if (uidx >= 0) {
            if (field.groupId) {
                ungroupedFields.value.splice(uidx, 1)
                addFieldToGroup(field)
            } else {
                ungroupedFields.value[uidx] = { ...field, sort: ungroupedFields.value[uidx].sort ?? uidx }
            }
            emitGroups()
            syncDefaultValues(flattenGroups(designGroups.value).concat(ungroupedFields.value))
            return
        }
    }
    // 新增字段
    if (field.groupId) {
        addFieldToGroup(field)
    } else {
        ungroupedFields.value.push({ ...field, sort: ungroupedFields.value.length })
    }
    emitGroups()
    syncDefaultValues(flattenGroups(designGroups.value).concat(ungroupedFields.value))
}

const onRemoveField = (fieldId: string) => {
    let found = false
    for (const g of designGroups.value) {
        const idx = g.fields.findIndex(f => f.fieldId === fieldId)
        if (idx >= 0) {
            g.fields.splice(idx, 1)
            found = true
            break
        }
    }
    if (!found) {
        const uidx = ungroupedFields.value.findIndex(f => f.fieldId === fieldId)
        if (uidx >= 0) {
            ungroupedFields.value.splice(uidx, 1)
        }
    }
    // 同步移除引用该字段的联动规则（目标字段被删则整条规则删除；条件字段被删则清理条件树）
    const rules = linkageList.value
        .filter(r => r.targetFieldId !== fieldId)
        .map(r => ({
            ...r,
            conditionTree: cleanConditionTree(r.conditionTree, fieldId),
        }))
        .filter(r => r.conditionTree.length > 0)
    linkageList.value = rules
    // 同步清掉 modelValue 中对应数据
    if (Object.prototype.hasOwnProperty.call(props.modelValue, fieldId)) {
        const next = { ...props.modelValue }
        delete next[fieldId]
        emit('update:modelValue', next)
    }
    emitGroups()
}

const onFieldsSorted = (_group: FormFieldGroup) => {
    emitGroups()
}

const onUngroupedSorted = () => {
    emitGroups()
}

const onGroupsSorted = () => {
    emitGroups()
}

// 分组导航快速定位
const scrollToGroup = (groupId: string) => {
    const el = document.querySelector(`[data-group-id="${groupId}"]`)
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
}

// 分组管理
const groupEditorOpen = ref(false)
const groupEditorName = ref('')
const editingGroupId = ref<string>('')
const groupEditorMode = ref<'create' | 'rename'>('create')

const onAddGroup = () => {
    groupEditorMode.value = 'create'
    editingGroupId.value = ''
    groupEditorName.value = ''
    groupEditorOpen.value = true
}

const onRemoveGroup = (groupId: string) => {
    const idx = designGroups.value.findIndex(g => g.id === groupId)
    if (idx < 0) return
    const group = designGroups.value[idx]
    const fields = group.fields
    designGroups.value.splice(idx, 1)
    if (fields.length > 0) {
        ungroupedFields.value.push(...fields.map(f => ({ ...f, groupId: undefined })))
    }
    emitGroups()
}

const onRenameGroup = (group: FormFieldGroup) => {
    groupEditorMode.value = 'rename'
    editingGroupId.value = group.id
    groupEditorName.value = group.name
    groupEditorOpen.value = true
}

const onSubmitGroupName = () => {
    const name = groupEditorName.value.trim()
    if (!name) {
        groupEditorOpen.value = false
        return
    }
    if (groupEditorMode.value === 'create') {
        const id = `group_${Date.now()}`
        designGroups.value.push({
            id,
            name,
            fields: [],
            sort: designGroups.value.length,
            collapsed: '0',
        })
        activeDesignGroupIds.value.push(id)
    } else {
        const group = designGroups.value.find(g => g.id === editingGroupId.value)
        if (group) {
            group.name = name
        }
    }
    emitGroups()
    groupEditorOpen.value = false
}

const toggleGroupCollapsed = (group: FormFieldGroup) => {
    group.collapsed = group.collapsed === '1' ? '0' : '1'
    emitGroups()
}

// 默认值初始化（为所有字段填充类型安全默认值，避免 Element Plus 组件
// 因 modelValue 为 undefined 而规范化为 []/false 等，导致 isSameValue 误判
// "值变化"，触发 update:modelValue 反馈循环）
const syncDefaultValues = (fields: FormField[]) => {
    // 设计模式下由 previewData 管理数据，不需要写入 modelValue
    if (props.type === 'create') return
    const next = { ...props.modelValue }
    let changed = false
    fields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(next, field.fieldId)) return
        switch (field.type) {
            case 'CHECKBOX':
            case 'MULTISELECT':
            case 'MULTICASCADER':
                next[field.fieldId] = Array.isArray(field.defaultValue) ? field.defaultValue : []
                break
            case 'TABLE':
            case 'UPLOAD':
            case 'DATERANGE':
                next[field.fieldId] = Array.isArray(field.defaultValue) ? field.defaultValue : []
                break
            case 'NUMBER':
            case 'SLIDER':
            case 'RATE':
                if (field.defaultValue != null) {
                    next[field.fieldId] = Number(field.defaultValue) || 0
                }
                // 无默认值时保持 undefined，ElInputNumber 原生支持 undefined
                break
            case 'SWITCH':
                // Switch 必须初始化为 boolean，否则 parseSwitchValue(undefined)=false
                // 每次渲染产生新 boolean → isSameValue(undefined, false) 虽有兼容
                // 但保持 formData 类型一致可避免缓存抖动
                next[field.fieldId] = parseSwitchValue(field.defaultValue)
                break
            default:
                if (field.defaultValue !== undefined && field.defaultValue !== null) {
                    next[field.fieldId] = field.defaultValue
                }
                break
        }
        // 仅当实际写入了非 undefined 值时标记 changed，避免向 formData 注入无意义 key
        if (next[field.fieldId] !== undefined) {
            changed = true
        }
    })
    if (changed) emit('update:modelValue', next)
}

watch(() => props.fields, list => syncDefaultValues(list), { immediate: true })

// 默认展开所有分组
watch(
    () => props.groups,
    groups => {
        if (groups && groups.length > 0) {
            activeGroupIds.value = groups.map(g => g.id)
        }
    },
    { immediate: true },
)

// 预览模式：根据 collapsed 属性决定默认展开/折叠
watch(
    () => props.groups,
    groups => {
        if (groups && groups.length > 0) {
            activePreviewGroupIds.value = groups
                .filter(g => g.collapsed !== '1')
                .map(g => g.id)
        }
    },
    { immediate: true },
)

// 运行模式：联动求值 + 校验规则
const _runtimeStatesCache: ComputeFieldStatesCache = {}
const runtimeStates = computed(() => {
    // 设计模式下不需要计算运行时状态，返回空对象避免无效计算
    if (props.type === 'create') return {} as Record<string, any>
    return computeFieldStates(fieldsWithLoadedOptions.value, props.linkageRules, props.modelValue, _runtimeStatesCache)
})

/** VALUE 动作：仅在条件刚触发时自动填充，用户手动修改后不再覆盖 */
let isApplyingRuntimeValues = false
/** 记录哪些字段的 VALUE 条件当前处于触发态，用于检测"从不满足→满足"的转换 */
const runtimeValueTriggered = new Map<string, boolean>()

watch(
    runtimeStates,
    (newStates) => {
        // 设计模式下由 previewData + previewStates 管理数据，不需要 runtime VALUE watch
        if (props.type === 'create') return
        if (isApplyingRuntimeValues) return
        const next = { ...props.modelValue }
        let changed = false
        props.fields.forEach(field => {
            const newState = newStates[field.fieldId]
            const isTriggered = newState?.value !== undefined
            const wasTriggered = runtimeValueTriggered.get(field.fieldId) ?? false
            runtimeValueTriggered.set(field.fieldId, !!isTriggered)

            if (isTriggered && !wasTriggered) {
                // 条件从不满足→满足：自动填充联动值
                if (next[field.fieldId] !== newState.value) {
                    next[field.fieldId] = newState.value
                    changed = true
                }
            }
        })
        if (changed) {
            isApplyingRuntimeValues = true
            emit('update:modelValue', next)
            nextTick(() => { isApplyingRuntimeValues = false })
        }
    },
)

const visibleFieldsForRuntime = computed(() =>
    props.fields.filter(f => runtimeStates.value[f.fieldId]?.visible !== false),
)

// 未分组字段（运行时）
const ungroupedRuntimeFields = computed(() =>
    props.fields
        .filter(f => !f.groupId && runtimeStates.value[f.fieldId]?.visible !== false)
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
)

// 运行时按 group 分组（仅当外部传入 groups 时启用）
const runtimeGroups = computed(() => {
    if (!props.groups || props.groups.length === 0) return []
    return props.groups
        .map(g => ({
            ...g,
            fields: g.fields
                .filter(f => runtimeStates.value[f.fieldId]?.visible !== false)
                .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
        }))
        .filter(g => g.fields.length > 0)
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
})

const ARRAY_VALUE_TYPES: FormFieldType[] = ['UPLOAD', 'CHECKBOX', 'MULTISELECT', 'CASCADER', 'MULTICASCADER', 'TABLE']

const buildItemRules = (field: FormField, requiredOverride: boolean, state?: { pattern?: string; patternTips?: string }): FormItemRule[] => {
    const itemRules: FormItemRule[] = []
    const isArrayField = ARRAY_VALUE_TYPES.includes(field.type)
    if (requiredOverride) {
        // 布尔 / 数值字段不走 type: 'string'，避免 false/0 被判定为空值
        if (['SWITCH', 'NUMBER', 'RATE', 'SLIDER'].includes(field.type)) {
            itemRules.push({
                required: true,
                message: `${field.title}不能为空`,
                trigger: 'change',
            })
        } else {
            itemRules.push({
                type: isArrayField ? 'array' : 'string',
                required: true,
                message: `${field.title}不能为空`,
                trigger: 'change',
            })
        }
    }
    if (field.minLength != null) {
        const isUpload = field.type === 'UPLOAD'
        itemRules.push({
            type: isArrayField ? 'array' : 'string',
            min: Number(field.minLength),
            message: isUpload
                ? `${field.title} 最少上传 ${field.minLength} 个文件`
                : `${field.title} 长度不能小于 ${field.minLength}`,
            trigger: 'change',
        })
    }
    if (field.maxLength != null) {
        const isUpload = field.type === 'UPLOAD'
        itemRules.push({
            type: isArrayField ? 'array' : 'string',
            max: Number(field.maxLength),
            message: isUpload
                ? `${field.title} 最多上传 ${field.maxLength} 个文件`
                : `${field.title} 长度不能大于 ${field.maxLength}`,
            trigger: 'change',
        })
    }
    if (field.type === 'TABLE') {
        if (field.min != null && field.min > 0) {
            itemRules.push({
                type: 'array',
                min: Number(field.min),
                message: `${field.title} 至少需要 ${field.min} 行`,
                trigger: 'change',
            })
        }
        if (field.max != null) {
            itemRules.push({
                type: 'array',
                max: Number(field.max),
                message: `${field.title} 最多 ${field.max} 行`,
                trigger: 'change',
            })
        }
    }
    const pat = state?.pattern ?? field.pattern
    if (pat) {
        try {
            const re = new RegExp(pat)
            itemRules.push({
                pattern: re,
                message: state?.patternTips ?? field.patternTips ?? `${field.title}格式不正确`,
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
    props.fields.forEach(field => {
        const state = runtimeStates.value[field.fieldId]
        if (!state || !state.visible) return // 隐藏字段不参与校验
        const itemRules = buildItemRules(field, state.required, state)
        if (itemRules.length > 0) rules[field.fieldId] = itemRules
    })
    return rules
})

const onRuntimeFieldUpdate = (fieldId: string, value: any) => {
    if (isSameValue(props.modelValue[fieldId], value)) return
    emit('update:modelValue', { ...props.modelValue, [fieldId]: value })
}

const runtimeFormRef = ref<FormInstance>()

const verify = async (): Promise<boolean> => {
    if (!runtimeFormRef.value) return true
    try {
        await runtimeFormRef.value.validate()
        return true
    } catch (error: any) {
        const failedFields = error && typeof error === 'object' ? Object.keys(error) : []
        const groupIdsToOpen = new Set<string>()
        for (const fieldId of failedFields) {
            const field = props.fields.find(f => f.fieldId === fieldId)
            if (field?.groupId) {
                groupIdsToOpen.add(field.groupId)
            }
        }
        if (groupIdsToOpen.size > 0) {
            activeGroupIds.value = [...new Set([...activeGroupIds.value, ...groupIdsToOpen])]
        }
        const firstFieldId = failedFields[0]
        if (firstFieldId) {
            nextTick(() => {
                const el = document.getElementById(`form-item-${firstFieldId}`)
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            })
        }
        return false
    }
}

// 设计模式：预览数据初始化
watch(
    () => props.fields.map(f => `${f.fieldId}:${f.type}:${f.defaultValue}`),
    () => {
        const prev = previewData.value || {}
        const next: Record<string, any> = {}
        const seenIds = new Set<string>()
        props.fields.forEach(f => {
            seenIds.add(f.fieldId)
            // 保留用户已输入的值，仅对新字段或无值字段初始化
            if (f.fieldId in prev && prev[f.fieldId] !== undefined) {
                next[f.fieldId] = prev[f.fieldId]
                return
            }
            let val = f.defaultValue ?? null
            // 空值按字段类型回退为安全默认值，避免 Element Plus 组件收到 null 后同步 emit 导致死循环
            if (val === null || val === undefined) {
                switch (f.type) {
                    case 'NUMBER':
                    case 'SLIDER':
                    case 'RATE':
                        val = 0
                        break
                    case 'SWITCH':
                        val = false
                        break
                    case 'CHECKBOX':
                    case 'MULTISELECT':
                    case 'MULTICASCADER':
                    case 'TABLE':
                    case 'UPLOAD':
                        val = []
                        break
                    default:
                        val = undefined
                }
            } else {
                switch (f.type) {
                    case 'NUMBER':
                    case 'SLIDER':
                    case 'RATE': {
                        const n = Number(val)
                        val = Number.isFinite(n) ? n : 0
                        break
                    }
                    case 'SWITCH':
                        val = parseSwitchValue(val)
                        break
                    case 'CHECKBOX':
                    case 'MULTISELECT':
                    case 'MULTICASCADER':
                    case 'TABLE':
                    case 'UPLOAD':
                        val = Array.isArray(val) ? val : []
                        break
                }
            }
            next[f.fieldId] = val
        })
        // 保留已被删除字段的冗余数据不影响功能，但清理更干净
        previewData.value = next
    },
    { immediate: true },
)

const _previewStatesCache: ComputeFieldStatesCache = {}
const previewStates = computed(() =>
    computeFieldStates(fieldsWithLoadedOptions.value, linkageList.value, previewData.value, _previewStatesCache),
)

/** 预览模式 VALUE 动作：仅在条件刚触发时自动填充，用户手动修改后不再覆盖 */
let isApplyingPreviewValues = false
/** 记录哪些字段的 VALUE 条件当前处于触发态，用于检测"从不满足→满足"的转换 */
const previewValueTriggered = new Map<string, boolean>()

watch(
    previewStates,
    (newStates) => {
        if (isApplyingPreviewValues) return
        let changed = false
        props.fields.forEach(field => {
            const newState = newStates[field.fieldId]
            const isTriggered = newState?.value !== undefined
            const wasTriggered = previewValueTriggered.get(field.fieldId) ?? false
            previewValueTriggered.set(field.fieldId, !!isTriggered)

            if (isTriggered && !wasTriggered) {
                // 条件从不满足→满足：自动填充联动值
                if (!isSameValue(previewData.value[field.fieldId], newState.value)) {
                    previewData.value[field.fieldId] = newState.value
                    changed = true
                }
            }
        })
        if (changed) {
            isApplyingPreviewValues = true
            triggerRef(previewData)
            nextTick(() => { isApplyingPreviewValues = false })
        }
    },
)

const visibleFieldsForPreview = computed(() =>
    props.fields.filter(f => previewStates.value[f.fieldId]?.visible !== false),
)

// 未分组字段（预览）
const ungroupedPreviewFields = computed(() =>
    props.fields
        .filter(f => !f.groupId && previewStates.value[f.fieldId]?.visible !== false)
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
)

const previewRules = computed<FormRules>(() => {
    const rules: FormRules = {}
    props.fields.forEach(field => {
        const state = previewStates.value[field.fieldId]
        if (!state || !state.visible) return
        const itemRules = buildItemRules(field, state.required, state)
        if (itemRules.length > 0) rules[field.fieldId] = itemRules
    })
    return rules
})

const previewGroups = computed(() => {
    if (!props.groups || props.groups.length === 0) return []
    return props.groups
        .map(g => ({
            ...g,
            fields: g.fields
                .filter(f => previewStates.value[f.fieldId]?.visible !== false)
                .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
        }))
        .filter(g => g.fields.length > 0)
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
})

const previewFormRef = ref<FormInstance>()

const verifyPreview = async () => {
    if (!previewFormRef.value) return
    try {
        await previewFormRef.value.validate()
        alert('表单校验通过', 'success')
    } catch (error: any) {
        const failedFields = error && typeof error === 'object' ? Object.keys(error) : []
        const groupIdsToOpen = new Set<string>()
        for (const fieldId of failedFields) {
            const field = props.fields.find(f => f.fieldId === fieldId)
            if (field?.groupId) {
                groupIdsToOpen.add(field.groupId)
            }
        }
        if (groupIdsToOpen.size > 0) {
            activePreviewGroupIds.value = [...new Set([...activePreviewGroupIds.value, ...groupIdsToOpen])]
        }
        const firstFieldId = failedFields[0]
        if (firstFieldId) {
            nextTick(() => {
                const el = document.getElementById(`form-item-${firstFieldId}`)
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            })
        }
        alert('表单校验失败', 'error')
    }
}

// 模板预校验（外部用：发布前）
const validateTpl = (name?: string) =>
    validateTemplate(name ?? '_skip_', props.fields, props.linkageRules)

defineExpose({
    verify, // 运行时表单校验
    validateTpl, // 模板预校验
    runtimeStates, // 运行时状态（用于提交时过滤隐藏字段）
})
</script>

<style scoped lang="scss">
.form-maker {
    width: 100%;
}

.design {
    padding: 20px;
    background: var(--el-fill-color-lighter);
    border-radius: 16px;
    border: 1px solid var(--el-border-color-light);

    .design-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        gap: 12px;

        .design-tip {
            color: var(--el-text-color-secondary);
            font-size: 12px;
        }
    }

    .empty-state {
        padding: 40px 0;
    }

    .toolbar-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
    }

    .group-nav {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
        padding: 10px 14px;
        background: var(--el-bg-color);
        border-radius: 10px;
        border: 1px solid var(--el-border-color-light);
        overflow-x: auto;

        .nav-label {
            font-size: 13px;
            color: var(--el-text-color-secondary);
            flex-shrink: 0;
        }

        .nav-tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .nav-tag {
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
                color: var(--el-color-primary);
                border-color: var(--el-color-primary-light-5);
                background: var(--el-color-primary-light-9);
            }
        }
    }

    .ungrouped-section {
        margin-bottom: 16px;
        background: var(--el-bg-color);
        border: 2px dashed var(--el-color-warning-light-5);
        border-radius: 14px;
        overflow: hidden;
        box-shadow: var(--el-box-shadow-lighter);
        transition: all 0.2s;

        &:hover {
            border-color: var(--el-color-warning);
            box-shadow: var(--el-box-shadow-light);
        }

        .group-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            background: var(--el-color-warning-light-9);
            border-bottom: 2px dashed var(--el-color-warning-light-5);
            position: relative;
            min-width: 0;

            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                background: var(--el-color-warning);
                border-radius: 0 2px 2px 0;
            }

            .group-name {
                font-weight: 600;
                font-size: 15px;
                color: var(--el-text-color-primary);
            }

            .group-count {
                font-size: 13px;
                color: var(--el-text-color-secondary);
            }
        }

        .group-body {
            padding: 14px 14px 10px;
            background: var(--el-fill-color-lighter);
        }
    }

    .groups-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .group-section {
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color-light);
        border-radius: 14px;
        overflow: hidden;
        box-shadow: var(--el-box-shadow-lighter);
        transition: all 0.25s ease;

        &:hover {
            box-shadow: var(--el-box-shadow-light);
            border-color: var(--el-border-color);
        }

        .group-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 18px;
            background: var(--el-color-primary-light-9);
            border-bottom: 1px solid var(--el-border-color-light);
            position: relative;
            min-width: 0;

            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                background: var(--el-color-primary);
                border-radius: 0 2px 2px 0;
            }

            .group-drag-handle {
                cursor: grab;
                color: var(--el-text-color-secondary);
                display: inline-flex;
                align-items: center;
                padding: 4px;
                border-radius: 4px;
                flex-shrink: 0;

                &:hover {
                    background: var(--el-fill-color);
                    color: var(--el-color-primary);
                }

                &:active {
                    cursor: grabbing;
                }
            }

            .group-name {
                font-weight: 600;
                font-size: 15px;
                color: var(--el-text-color-primary);
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .group-count {
                font-size: 13px;
                color: var(--el-text-color-secondary);
                flex-shrink: 0;
            }

            .group-actions {
                display: flex;
                align-items: center;
                gap: 2px;
                flex-shrink: 0;

                :deep(.el-button + .el-button) {
                    margin-left: 0;
                }
            }
        }

        .group-body {
            padding: 14px 14px 10px;
            background: var(--el-fill-color-lighter);
        }

        .group-empty {
            padding: 20px 0;
        }
    }

    .field-grid {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -4px;
        min-height: 60px;
    }

    .field-col {
        box-sizing: border-box;
        padding: 6px 4px;
        min-width: 0;
        margin-bottom: 4px;
    }

    .field-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 10px;
        padding: 10px 12px;
        transition: all 0.2s ease;
        gap: 8px;
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 8px;
            bottom: 8px;
            width: 3px;
            background: var(--el-color-primary);
            border-radius: 0 3px 3px 0;
            opacity: 0;
            transition: opacity 0.2s;
        }

        &:hover {
            border-color: var(--el-color-primary-light-5);
            box-shadow: var(--el-box-shadow-light);
            transform: scale(1.005);

            &::before {
                opacity: 1;
            }
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
            padding: 8px 14px;
            border-radius: 6px;
            pointer-events: none;
            opacity: 0.85;
            min-width: 0;
            min-height: 32px;
            display: flex;
            align-items: center;

            :deep(.el-slider) {
                width: 100%;
                padding: 0 10px;
                box-sizing: border-box;
            }

            :deep(.el-slider__runway) {
                margin: 10px 0;
            }
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

.group-collapse {
    :deep(.el-collapse-item) {
        background: var(--bg-container);
        border: 1px solid var(--border-light);
        border-radius: 14px;
        margin-bottom: 16px;
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        transition: all 0.25s ease;

        &:hover {
            box-shadow: var(--shadow-md);
            border-color: var(--el-border-color);
        }
    }

    :deep(.el-collapse-item__header) {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-primary);
        padding: 14px 18px;
        background: var(--el-color-primary-light-9);
        border-bottom: 1px solid var(--el-border-color-light);
        position: relative;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: var(--el-color-primary);
            border-radius: 0 2px 2px 0;
        }
    }

    :deep(.el-collapse-item__content) {
        padding: 16px 18px;
        background: var(--bg-container);
    }

    :deep(.el-collapse-item__wrap) {
        border-bottom: none;
        background: var(--bg-container);
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

/* ============================================================
   运行时表单（填表 / 查看模式）
   ============================================================ */
.runtime {
    padding: var(--space-lg);

    :deep(.el-form-item) {
        margin-bottom: var(--space-lg);
    }

    :deep(.el-form-item__label) {
        font-size: var(--fs-sm);
        font-weight: var(--fw-medium);
        color: var(--text-primary);
        padding-bottom: var(--space-xs);
        line-height: var(--lh-tight);
    }

    :deep(.el-form-item.is-required .el-form-item__label) {
        &::after {
            content: '*';
            color: var(--danger);
            margin-left: 2px;
        }
    }

    /* 查看模式只读态 */
    :deep(.el-input.is-disabled .el-input__inner),
    :deep(.el-textarea.is-disabled .el-textarea__inner) {
        background: var(--bg-elevated);
        color: var(--text-regular);
    }
}

@media (max-width: 768px) {
    .design .field-col {
        width: 100% !important;
    }

    .design .group-header {
        .group-count {
            display: none;
        }

        .group-actions .action-text {
            display: none;
        }
    }

    .design .toolbar-actions {
        flex-wrap: wrap;
    }

    .design .group-nav {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
}
</style>
