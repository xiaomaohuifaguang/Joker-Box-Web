<template>
    <div class="linkage-editor">
        <div class="linkage-toolbar">
            <div class="linkage-tip">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <span>规则按列表顺序执行（sortOrder = 索引）。后执行的规则会覆盖前者对相同字段的同类动作。</span>
            </div>
            <el-button type="primary" :icon="Plus" @click="addRule" :disabled="fields.length < 2">
                添加联动规则
            </el-button>
        </div>

        <div v-if="!rules || rules.length === 0" class="empty-state">
            <el-empty description="暂无联动规则" />
        </div>

        <draggable v-else ref="ruleListRef" v-model="innerRules" item-key="_uid" handle=".drag-handle" @end="onSorted"
            class="rule-list">
            <template #item="{ element, index }">
                <div class="rule-card">
                    <!-- 规则头部 -->
                    <div class="rule-header">
                        <span class="drag-handle" title="拖拽排序">
                            <el-icon>
                                <Rank />
                            </el-icon>
                        </span>
                        <span class="rule-index">#{{ index + 1 }}</span>
                        <el-input v-model="element.name" placeholder="规则名称（可选）" style="width: 200px" />
                        <el-switch v-model="element.enable" active-text="启用" inactive-text="禁用"
                            style="margin-left: auto" />
                        <el-button type="danger" link :icon="Delete" @click="removeRule(index)">删除</el-button>
                    </div>

                    <!-- 条件区域 -->
                    <div class="rule-section">
                        <div class="section-title">当满足以下条件时</div>
                        <ConditionTreeNode v-if="element.conditionTree?.[0]" :node="element.conditionTree[0]"
                            :fields="fields" :is-root="true" @update:node="updateConditionTree(index, $event)" />
                    </div>

                    <!-- 动作区域 -->
                    <div class="rule-section">
                        <div class="section-title">则执行</div>
                        <el-row :gutter="12" class="action-row">
                            <el-col :xs="12" :sm="6" :md="4">
                                <div class="rule-label">动作类型</div>
                                <el-select v-model="element.actionType" class="w-full">
                                    <el-option v-for="a in getActionOptionsForRule(element)" :key="a.value"
                                        :label="a.label" :value="a.value" />
                                </el-select>
                            </el-col>
                            <el-col :xs="12" :sm="9" :md="7">
                                <div class="rule-label">目标字段</div>
                                <el-select v-model="element.targetFieldId" placeholder="目标字段" class="w-full">
                                    <el-option v-for="f in getTargetFieldsForRule(element)" :key="f.fieldId"
                                        :label="`${f.title} (${f.fieldId})`" :value="f.fieldId" />
                                </el-select>
                            </el-col>
                            <el-col :xs="24" :sm="9" :md="13">
                                <div class="rule-label">动作参数</div>
                                <div class="action-value-wrap">
                                    <template v-if="element.actionType === 'REQUIRED'">
                                        <el-switch :model-value="getActionValueBool(element)"
                                            @update:model-value="element.actionValue = $event" active-text="必填"
                                            inactive-text="非必填" />
                                    </template>
                                    <template v-else-if="element.actionType === 'DISABLED'">
                                        <el-switch :model-value="getActionValueBool(element)"
                                            @update:model-value="element.actionValue = $event" active-text="禁用"
                                            inactive-text="不禁用" />
                                    </template>
                                    <template v-else-if="element.actionType === 'SET_PATTERN'">
                                        <el-input v-model="element.actionValue.pattern" placeholder="正则表达式"
                                            style="flex: 1">
                                            <template #append>
                                                <el-button @click="openPatternPicker(element)" title="选择常用正则">
                                                    <el-icon>
                                                        <Collection />
                                                    </el-icon>
                                                </el-button>
                                            </template>
                                        </el-input>
                                        <el-input v-model="element.actionValue.patternTips" placeholder="提示信息"
                                            style="flex: 1" />
                                    </template>
                                    <template v-else-if="element.actionType === 'SET_SPAN'">
                                        <el-input-number v-model="element.actionValue.span" :min="1" :max="24"
                                            :controls="false" style="width: 80px" />
                                        <span class="action-unit">span（1-24）</span>
                                    </template>
                                    <template v-else-if="element.actionType === 'OPTION'">
                                        <el-button type="primary" plain @click="openOptionDialog(element)"
                                            style="width: 100%">
                                            配置选项显隐
                                            <el-tag v-if="getOptionValueList(element.actionValue).length > 0"
                                                type="info" size="small" style="margin-left: 8px">
                                                已选 {{ getOptionValueList(element.actionValue).length }} 项
                                            </el-tag>
                                        </el-button>
                                    </template>
                                    <template v-else-if="element.actionType === 'VALUE'">
                                        <template
                                            v-if="getTargetFieldType(element) === 'INPUT' || getTargetFieldType(element) === 'TEXTAREA'">
                                            <el-input v-model="element.actionValue" placeholder="输入值"
                                                :maxlength="getTargetField(element)?.maxLength"
                                                :show-word-limit="!!getTargetField(element)?.maxLength" />
                                        </template>
                                        <template v-else-if="getTargetFieldType(element) === 'NUMBER'">
                                            <el-input-number v-model="element.actionValue"
                                                :min="getTargetField(element)?.min ?? -Infinity"
                                                :max="getTargetField(element)?.max ?? Infinity" :controls="false" />
                                        </template>
                                        <template
                                            v-else-if="['SELECT', 'RADIO'].includes(getTargetFieldType(element) || '')">
                                            <el-select v-model="element.actionValue" placeholder="选择值">
                                                <el-option v-for="opt in getTargetField(element)?.options || []"
                                                    :key="opt.value" :label="opt.label" :value="opt.value" />
                                            </el-select>
                                        </template>
                                        <template
                                            v-else-if="['MULTISELECT', 'CHECKBOX'].includes(getTargetFieldType(element) || '')">
                                            <el-select v-model="element.actionValue" placeholder="选择值" multiple>
                                                <el-option v-for="opt in getTargetField(element)?.options || []"
                                                    :key="opt.value" :label="opt.label" :value="opt.value" />
                                            </el-select>
                                        </template>
                                        <template v-else-if="getTargetFieldType(element) === 'SWITCH'">
                                            <el-switch v-model="element.actionValue" active-text="开"
                                                inactive-text="关" />
                                        </template>
                                        <template v-else-if="getTargetFieldType(element) === 'DATE'">
                                            <el-date-picker v-model="element.actionValue" type="date" placeholder="选择日期"
                                                value-format="YYYY-MM-DD" />
                                        </template>
                                        <template v-else-if="getTargetFieldType(element) === 'DATETIME'">
                                            <el-date-picker v-model="element.actionValue" type="datetime"
                                                placeholder="选择日期时间" value-format="YYYY-MM-DD HH:mm:ss" />
                                        </template>
                                        <template v-else-if="getTargetFieldType(element) === 'TIME'">
                                            <el-time-picker v-model="element.actionValue" placeholder="选择时间"
                                                value-format="HH:mm:ss" />
                                        </template>
                                        <template v-else-if="getTargetFieldType(element) === 'DATERANGE'">
                                            <el-date-picker v-model="element.actionValue" type="daterange"
                                                range-separator="至" start-placeholder="开始" end-placeholder="结束"
                                                value-format="YYYY-MM-DD" />
                                        </template>
                                        <template v-else-if="getTargetFieldType(element) === 'COLOR'">
                                            <el-color-picker v-model="element.actionValue" show-alpha />
                                        </template>
                                        <template v-else-if="getTargetFieldType(element) === 'SLIDER'">
                                            <el-slider v-model="element.actionValue"
                                                :min="getTargetField(element)?.min ?? 0"
                                                :max="getTargetField(element)?.max ?? 100" />
                                        </template>
                                        <template v-else-if="getTargetFieldType(element) === 'RATE'">
                                            <el-rate v-model="element.actionValue"
                                                :max="getTargetField(element)?.max ?? 5" />
                                        </template>
                                        <template
                                            v-else-if="['CASCADER', 'MULTICASCADER'].includes(getTargetFieldType(element) || '')">
                                            <el-cascader v-model="element.actionValue"
                                                :options="getTargetField(element)?.options || []"
                                                :props="{ multiple: getTargetFieldType(element) === 'MULTICASCADER' }" />
                                        </template>
                                        <template v-else>
                                            <el-input v-model="element.actionValue" placeholder="设定值" />
                                        </template>
                                    </template>
                                    <template v-else>
                                        <span class="action-hint">无需额外参数</span>
                                    </template>
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </div>
            </template>
        </draggable>
    </div>

    <OptionVisibilityDialog v-model="optionDialogVisible" :options="optionDialogOptions"
        :selected-values="optionDialogSelected" :is-cascader-type="optionDialogIsCascader"
        @submit="onOptionDialogSubmit" />

    <PatternPresetPicker v-model="patternPickerVisible" @select="({ pattern, patternTips }) => {
        if (activePatternRuleUid == null) return
        const rule = innerRules.find((r: InternalRule) => r._uid === activePatternRuleUid)
        if (rule) {
            rule.actionValue = { pattern, patternTips }
        }
    }" />
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { Plus, Delete, Rank, InfoFilled, Collection } from '@element-plus/icons-vue'
import { alert } from '@/utils'
import ConditionTreeNode from './ConditionTreeNode.vue'
import OptionVisibilityDialog from './OptionVisibilityDialog.vue'
import PatternPresetPicker from './PatternPresetPicker.vue'
import {
    LINKAGE_ACTION_OPTIONS,
    getDefaultCondition,
    getValidActionsByFieldType,
    getActionParamDefault,
    type FormField,
    type FormFieldType,
    type FormLinkageRule,
    type LinkageAction,
} from './types'

const props = defineProps<{
    rules: FormLinkageRule[]
    fields: FormField[]
}>()

const emit = defineEmits<{
    (e: 'update:rules', v: FormLinkageRule[]): void
}>()

interface InternalRule extends FormLinkageRule {
    _uid: number
}

const uidSeq = ref(0)
const innerRules = ref<InternalRule[]>([])
const ruleListRef = ref<any>(null)

// 选项显隐对话框状态
const optionDialogVisible = ref(false)
const optionDialogOptions = ref<any[]>([])
const optionDialogSelected = ref<string[]>([])
const optionDialogIsCascader = ref(false)
const currentOptionRule = ref<InternalRule | null>(null)

const patternPickerVisible = ref(false)
const activePatternRuleUid = ref<number | null>(null)

const openOptionDialog = (rule: InternalRule) => {
    currentOptionRule.value = rule
    const target = getTargetField(rule)
    optionDialogOptions.value = target?.options ? JSON.parse(JSON.stringify(target.options)) : []
    optionDialogSelected.value = getOptionValueList(rule.actionValue)
    optionDialogIsCascader.value = ['CASCADER', 'MULTICASCADER'].includes(target?.type || '')
    optionDialogVisible.value = true
}

const openPatternPicker = (rule: InternalRule) => {
    activePatternRuleUid.value = rule._uid
    patternPickerVisible.value = true
}

const onOptionDialogSubmit = (values: string[]) => {
    if (!currentOptionRule.value) return
    currentOptionRule.value.actionValue = values
}

// 辅助：获取 boolean 类型的 actionValue 默认值 true
const getActionValueBool = (rule: InternalRule): boolean => {
    const v = rule.actionValue
    return v === undefined || v === null ? true : !!v
}

/** 获取规则的目标字段 */
const getTargetField = (rule: InternalRule): FormField | undefined =>
    props.fields.find(f => f.fieldId === rule.targetFieldId)

/** 获取规则的目标字段类型 */
const getTargetFieldType = (rule: InternalRule): FormFieldType | undefined =>
    getTargetField(rule)?.type

/** 兼容旧数据：提取 actionValue 中的 value 列表 */
const getOptionValueList = (actionValue: any): string[] => {
    if (!Array.isArray(actionValue)) return []
    return actionValue.map(item => typeof item === 'string' ? item : String(item.value || '')).filter(Boolean)
}

/** 根据字段类型返回 VALUE 动作的默认值 */
const getDefaultValueForFieldType = (fieldType?: FormFieldType): any => {
    switch (fieldType) {
        case 'CHECKBOX':
        case 'MULTISELECT':
        case 'MULTICASCADER':
        case 'DATERANGE':
            return []
        case 'NUMBER':
        case 'SLIDER':
        case 'RATE':
            return 0
        case 'SWITCH':
            return false
        case 'DATE':
        case 'DATETIME':
        case 'TIME':
            return null
        default:
            return ''
    }
}

/** 当目标字段变化时，规范化 VALUE 的 actionValue */
const normalizeValueAction = (rule: InternalRule) => {
    if (rule.actionType !== 'VALUE') return
    const fieldType = getTargetFieldType(rule)
    const current = rule.actionValue
    // 数组字段 → 非数组时重置
    if (['CHECKBOX', 'MULTISELECT', 'MULTICASCADER', 'DATERANGE'].includes(fieldType || '')) {
        if (!Array.isArray(current)) {
            rule.actionValue = getDefaultValueForFieldType(fieldType)
        }
        return
    }
    // 数值字段 → 非数值时重置
    if (['NUMBER', 'SLIDER', 'RATE'].includes(fieldType || '')) {
        if (typeof current !== 'number') {
            const n = Number(current)
            rule.actionValue = isNaN(n) ? getDefaultValueForFieldType(fieldType) : n
        }
        return
    }
    // 布尔字段 → 非布尔时重置
    if (fieldType === 'SWITCH') {
        if (typeof current !== 'boolean') {
            rule.actionValue = getDefaultValueForFieldType(fieldType)
        }
        return
    }
    // 其他字段 → 字符串化
    if (current === undefined || current === null || typeof current === 'object') {
        rule.actionValue = getDefaultValueForFieldType(fieldType)
    }
}

/** 根据目标字段过滤动作类型选项 */
const getActionOptionsForRule = (rule: InternalRule) => {
    const target = props.fields.find(f => f.fieldId === rule.targetFieldId)
    if (!target) return LINKAGE_ACTION_OPTIONS
    const valid = getValidActionsByFieldType(target.type)
    return LINKAGE_ACTION_OPTIONS.filter(a => valid.includes(a.value))
}

/** 根据动作类型过滤目标字段选项 */
const getTargetFieldsForRule = (rule: InternalRule) => {
    if (!rule.actionType) return props.fields
    return props.fields.filter(f => {
        const valid = getValidActionsByFieldType(f.type)
        return valid.includes(rule.actionType as LinkageAction)
    })
}

/** 修正规则中不合法的动作类型，返回 true 表示有修改 */
const fixInvalidAction = (rule: InternalRule): boolean => {
    if (!rule.targetFieldId || !rule.actionType) return false
    const target = props.fields.find(f => f.fieldId === rule.targetFieldId)
    if (!target) return false
    const valid = getValidActionsByFieldType(target.type)
    if (!valid.includes(rule.actionType as LinkageAction)) {
        rule.actionType = 'SHOW'
        rule.actionValue = undefined
        return true
    }
    return false
}

const wrap = (rules: FormLinkageRule[]): InternalRule[] =>
    (rules || []).map(r => {
        const rule: InternalRule = { ...r, _uid: ++uidSeq.value }
        // 加载时修正不合法的动作类型
        fixInvalidAction(rule)
        // 初始化 actionValue
        if (rule.actionType === 'SET_PATTERN') {
            if (!rule.actionValue || typeof rule.actionValue !== 'object' || Array.isArray(rule.actionValue)) {
                rule.actionValue = { pattern: String(rule.actionValue || ''), patternTips: '' }
            }
        } else if (rule.actionType === 'SET_SPAN') {
            if (!rule.actionValue || typeof rule.actionValue !== 'object' || Array.isArray(rule.actionValue)) {
                const sp = Number(rule.actionValue)
                rule.actionValue = { span: !isNaN(sp) && sp >= 1 && sp <= 24 ? sp : 24 }
            }
        } else if (rule.actionType === 'REQUIRED' || rule.actionType === 'DISABLED') {
            if (rule.actionValue === undefined || rule.actionValue === null) {
                rule.actionValue = true
            }
        } else if (rule.actionType === 'OPTION') {
            if (typeof rule.actionValue === 'string') {
                try {
                    const parsed = JSON.parse(rule.actionValue)
                    rule.actionValue = Array.isArray(parsed) ? parsed : []
                } catch {
                    rule.actionValue = []
                }
            } else if (!Array.isArray(rule.actionValue)) {
                rule.actionValue = []
            }
        } else if (rule.actionType === 'VALUE') {
            const target = props.fields.find(f => f.fieldId === rule.targetFieldId)
            if (rule.actionValue === undefined || rule.actionValue === null) {
                rule.actionValue = getDefaultValueForFieldType(target?.type)
            }
            // 加载时规范化已有 actionValue，避免类型不匹配导致组件死循环
            normalizeValueAction(rule)
        }
        // 确保 conditionTree 存在
        if (!rule.conditionTree || rule.conditionTree.length === 0) {
            const defaultField = props.fields[0]
            rule.conditionTree = [{
                nodeType: 'AND',
                children: [{
                    nodeType: 'CONDITION',
                    triggerFieldId: defaultField?.fieldId || '',
                    triggerCondition: getDefaultCondition(defaultField?.type || 'INPUT'),
                    triggerValue: '',
                }],
            }]
        }
        // 兼容旧数据：单条件作为根节点时自动包一层 AND
        if (rule.conditionTree[0]?.nodeType === 'CONDITION') {
            rule.conditionTree = [{
                nodeType: 'AND',
                children: [rule.conditionTree[0]],
            }]
        }
        if (rule.enable === undefined) rule.enable = true
        return rule
    })

const unwrap = (list: InternalRule[]): FormLinkageRule[] =>
    list.map(({ _uid, ...rest }, idx) => ({ ...rest, sortOrder: idx }))

const deepEqual = (a: any, b: any): boolean => JSON.stringify(a) === JSON.stringify(b)

watch(
    () => props.rules,
    val => {
        const current = unwrap(innerRules.value)
        if (val.length !== current.length || val.some((r, i) => !deepEqual(r, current[i]))) {
            innerRules.value = wrap(val)
        }
    },
    { immediate: true },
)

watch(
    innerRules,
    val => {
        emit('update:rules', unwrap(val))
    },
    { deep: true },
)

const scrollRuleListToBottom = async () => {
    await nextTick()
    const el = ruleListRef.value?.$el || ruleListRef.value
    if (!el) return
    el.scrollTop = el.scrollHeight
}

const addRule = () => {
    if (props.fields.length < 2) {
        alert('请先添加至少 2 个字段', 'warning')
        return
    }
    const trigger = props.fields[0]
    const target = props.fields.find(f => f.fieldId !== trigger.fieldId) || props.fields[1]
    innerRules.value.push({
        _uid: ++uidSeq.value,
        name: '',
        targetFieldId: target?.fieldId || '',
        actionType: 'SHOW',
        enable: true,
        sortOrder: innerRules.value.length,
        conditionTree: [{
            nodeType: 'AND',
            children: [{
                nodeType: 'CONDITION',
                triggerFieldId: trigger.fieldId,
                triggerCondition: getDefaultCondition(trigger.type || 'INPUT'),
                triggerValue: '',
            }],
        }],
    })
    scrollRuleListToBottom()
}

const removeRule = (index: number) => {
    innerRules.value.splice(index, 1)
}

const onSorted = () => {
    innerRules.value = innerRules.value.map((r, i) => ({ ...r, sortOrder: i }))
}

const updateConditionTree = (index: number, node: FormLinkageRule['conditionTree'][number]) => {
    const rule = innerRules.value[index]
    if (!rule) return
    rule.conditionTree = [node]
}

// actionType 变化时自动初始化 actionValue
watch(
    () => innerRules.value.map(r => r.actionType),
    (newTypes, oldTypes) => {
        if (!oldTypes || oldTypes.length === 0) return
        newTypes.forEach((type, i) => {
            if (type === oldTypes[i]) return
            const rule = innerRules.value[i]
            rule.actionValue = getActionParamDefault(type as LinkageAction)
            if (type === 'VALUE') {
                normalizeValueAction(rule)
            }
        })
    },
    { deep: true },
)

// targetFieldId 变化时，若当前 actionType 对新字段不合法则重置
watch(
    () => innerRules.value.map(r => r.targetFieldId),
    (newIds, oldIds) => {
        if (!oldIds || oldIds.length === 0) return
        newIds.forEach((id, i) => {
            if (id === oldIds[i]) return
            const rule = innerRules.value[i]
            fixInvalidAction(rule)
            normalizeValueAction(rule)
        })
    },
    { deep: true },
)
</script>

<style scoped>
.linkage-editor {
    width: 100%;
}

.linkage-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.linkage-tip {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 280px;
}

.empty-state {
    padding: 30px 0;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
}

.rule-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 620px;
    overflow-y: auto;
    padding-right: 4px;
}

.rule-card {
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    padding: 12px 14px;
    transition: border-color 0.2s;
}

.rule-card:hover {
    border-color: var(--el-color-primary-light-5);
}

.rule-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px dashed var(--el-border-color-light);
    flex-wrap: wrap;
}

.drag-handle {
    cursor: grab;
    color: var(--el-text-color-secondary);
    display: inline-flex;
    align-items: center;
    user-select: none;
}

.drag-handle:active {
    cursor: grabbing;
}

.rule-index {
    font-weight: 600;
    color: var(--el-color-primary);
    flex-shrink: 0;
}

.rule-section {
    margin-bottom: 12px;
}

.rule-section:last-child {
    margin-bottom: 0;
}

.section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
}

.action-row {
    width: 100%;
}

.action-value-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-height: 36px;
    width: 100%;
}

/* 统一动作参数区域内所有输入组件的宽度 */
.action-value-wrap :deep(.el-input),
.action-value-wrap :deep(.el-select),
.action-value-wrap :deep(.el-date-editor),
.action-value-wrap :deep(.el-input-number) {
    width: 100% !important;
}

.w-full {
    width: 100%;
}

.action-value-wrap :deep(.el-slider) {
    width: 100%;
    flex: 1;
}

.action-value-wrap :deep(.el-color-picker) {
    vertical-align: middle;
}

.action-value-wrap :deep(.el-switch) {
    white-space: nowrap;
}

/* 动作参数单行容器 */
.action-value-wrap .param-box {
    width: 100%;
    display: flex;
    align-items: center;
}

.action-unit {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
}

.action-hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    padding: 5px 0;
}

.rule-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
}

/* 简单选项编辑器 */
.option-editor-mini {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
}

.option-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.option-row :deep(.el-input) {
    width: auto !important;
    flex: 1;
}

/* 限制级联选项编辑器在联动规则中的高度 */
.action-value-wrap :deep(.dynamic-options) {
    width: 100%;
}

.action-value-wrap :deep(.dynamic-options .preview-component) {
    display: none;
}

.action-value-wrap :deep(.dynamic-options .options-management) {
    margin-top: 0;
    border-top: none;
    padding-top: 0;
}

.action-value-wrap :deep(.dynamic-options .management-header) {
    margin-bottom: 8px;
}

.action-value-wrap :deep(.dynamic-options .options-list) {
    max-height: 200px;
    overflow-y: auto;
}
</style>
