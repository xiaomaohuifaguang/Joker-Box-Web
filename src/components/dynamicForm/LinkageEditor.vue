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

        <draggable v-else v-model="innerRules" item-key="_uid" handle=".drag-handle" @end="onSorted" class="rule-list">
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
                        <el-input v-model="element.name" placeholder="规则名称（可选）" size="small" style="width: 200px" />
                        <el-switch v-model="element.enable" active-text="启用" inactive-text="禁用" size="small"
                            style="margin-left: auto" />
                        <el-button type="danger" link :icon="Delete" size="small"
                            @click="removeRule(index)">删除</el-button>
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
                                <el-select v-model="element.actionType" size="small" style="width: 100%">
                                    <el-option v-for="a in LINKAGE_ACTION_OPTIONS" :key="a.value" :label="a.label"
                                        :value="a.value" />
                                </el-select>
                            </el-col>
                            <el-col :xs="12" :sm="9" :md="7">
                                <div class="rule-label">目标字段</div>
                                <el-select v-model="element.targetFieldId" placeholder="目标字段" size="small"
                                    style="width: 100%">
                                    <el-option v-for="f in fields" :key="f.fieldId" :label="`${f.title} (${f.fieldId})`"
                                        :value="f.fieldId" />
                                </el-select>
                            </el-col>
                            <el-col :xs="24" :sm="9" :md="13">
                                <div class="rule-label">动作参数</div>
                                <div class="action-value-wrap">
                                    <template v-if="element.actionType === 'REQUIRED'">
                                        <el-switch :model-value="getActionValueBool(element)"
                                            @update:model-value="element.actionValue = $event" active-text="必填"
                                            inactive-text="非必填" size="small" />
                                    </template>
                                    <template v-else-if="element.actionType === 'DISABLED'">
                                        <el-switch :model-value="getActionValueBool(element)"
                                            @update:model-value="element.actionValue = $event" active-text="禁用"
                                            inactive-text="不禁用" size="small" />
                                    </template>
                                    <template v-else-if="element.actionType === 'SET_PATTERN'">
                                        <el-input v-model="element.actionValue.pattern" placeholder="正则表达式" size="small"
                                            style="flex: 1" />
                                        <el-input v-model="element.actionValue.patternTips" placeholder="提示信息"
                                            size="small" style="flex: 1" />
                                    </template>
                                    <template v-else-if="element.actionType === 'SET_SPAN'">
                                        <el-input-number v-model="element.actionValue" :min="1" :max="24"
                                            :controls="false" size="small" style="width: 80px" />
                                        <span class="action-unit">span（1-24）</span>
                                    </template>
                                    <template v-else-if="element.actionType === 'OPTION'">
                                        <el-input v-model="element.actionValue" placeholder="选项JSON数组" size="small"
                                            style="width: 100%" />
                                    </template>
                                    <template v-else-if="element.actionType === 'VALUE'">
                                        <el-input v-model="element.actionValue" placeholder="设定值" size="small"
                                            style="width: 100%" />
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
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { Plus, Delete, Rank, InfoFilled } from '@element-plus/icons-vue'
import { alert } from '@/utils'
import ConditionTreeNode from './ConditionTreeNode.vue'
import {
    LINKAGE_ACTION_OPTIONS,
    type FormField,
    type FormLinkageRule,
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

// 辅助：获取 boolean 类型的 actionValue 默认值 true
const getActionValueBool = (rule: InternalRule): boolean => {
    const v = rule.actionValue
    return v === undefined || v === null ? true : !!v
}

const wrap = (rules: FormLinkageRule[]): InternalRule[] =>
    (rules || []).map(r => {
        const rule: InternalRule = { ...r, _uid: ++uidSeq.value }
        // 初始化 actionValue
        if (rule.actionType === 'SET_PATTERN') {
            if (!rule.actionValue || typeof rule.actionValue !== 'object' || Array.isArray(rule.actionValue)) {
                rule.actionValue = { pattern: String(rule.actionValue || ''), patternTips: '' }
            }
        } else if (rule.actionType === 'SET_SPAN') {
            if (rule.actionValue === undefined || rule.actionValue === null) {
                rule.actionValue = 24
            }
        } else if (rule.actionType === 'REQUIRED' || rule.actionType === 'DISABLED') {
            if (rule.actionValue === undefined || rule.actionValue === null) {
                rule.actionValue = true
            }
        }
        // 确保 conditionTree 存在
        if (!rule.conditionTree || rule.conditionTree.length === 0) {
            rule.conditionTree = [{
                nodeType: 'AND',
                children: [{
                    nodeType: 'CONDITION',
                    triggerFieldId: props.fields[0]?.fieldId || '',
                    triggerCondition: 'EQ',
                    triggerValue: '',
                }],
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
                triggerCondition: 'EQ',
                triggerValue: '',
            }],
        }],
    })
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
            if (type === 'SET_PATTERN') {
                rule.actionValue = { pattern: '', patternTips: '' }
            } else if (type === 'SET_SPAN') {
                rule.actionValue = 24
            } else if (type === 'REQUIRED' || type === 'DISABLED') {
                rule.actionValue = true
            } else {
                rule.actionValue = undefined
            }
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
    min-height: 32px;
}

.action-unit {
    font-size: 12px;
    color: var(--el-text-color-secondary);
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
</style>
