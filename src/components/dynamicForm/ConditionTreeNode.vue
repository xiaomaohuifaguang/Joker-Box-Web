<template>
    <div class="condition-node" :class="nodeClass" :style="indentStyle">
        <!-- AND / OR 组节点 -->
        <template v-if="isGroup">
            <div class="group-header">
                <el-radio-group :model-value="node.nodeType" @update:model-value="onGroupTypeChange"
                   >
                    <el-radio-button value="AND">且</el-radio-button>
                    <el-radio-button value="OR">或</el-radio-button>
                </el-radio-group>
                <el-button type="primary" link :icon="Plus" @click="addCondition">
                    添加条件
                </el-button>
                <el-button type="primary" link :icon="FolderOpened" @click="addGroup">
                    添加组
                </el-button>
                <el-button v-if="!isRoot" type="danger" link :icon="Delete"                     @click="$emit('remove')">
                    删除
                </el-button>
            </div>
            <div class="group-body">
                <div v-for="(child, i) in node.children" :key="i" class="child-wrapper">
                    <ConditionTreeNode :node="child" :fields="fields" :depth="depth + 1"
                        :is-root="false" @update:node="updateChild(i, $event)"
                        @remove="removeChild(i)" />
                </div>
                <div v-if="!node.children || node.children.length === 0" class="empty-children">
                    <span class="empty-tip">点击上方按钮添加条件</span>
                </div>
            </div>
        </template>

        <!-- CONDITION 叶子节点 -->
        <template v-else>
            <div class="condition-row">
                <div class="condition-field">
                    <div class="field-label">触发字段</div>
                    <el-select :model-value="node.triggerFieldId"
                        @update:model-value="onTriggerFieldChange" placeholder="触发字段"
                        class="trigger-field-select">
                        <el-option v-for="f in fields" :key="f.fieldId"
                            :label="`${f.title} (${f.fieldId})`" :value="f.fieldId" />
                    </el-select>
                </div>
                <div class="condition-field">
                    <div class="field-label">比较方式</div>
                    <el-select :model-value="node.triggerCondition"
                        @update:model-value="onTriggerConditionChange"
                        class="condition-select">
                        <el-option v-for="c in conditionOptions" :key="c.value" :label="c.label"
                            :value="c.value" />
                    </el-select>
                </div>
                <div class="condition-field condition-value-field">
                    <div class="field-label">比较值</div>
                    <div class="condition-value-wrap">
                        <LinkageValueInput v-if="needsTriggerValue" :model-value="triggerValueStr"
                            @update:model-value="onTriggerValueChange" :field="triggerField"
                            :condition="node.triggerCondition || 'EQ'" />
                        <span v-else class="condition-placeholder">无需输入值</span>
                    </div>
                </div>
                <el-button type="danger" link :icon="Delete" @click="$emit('remove')"
                    class="remove-btn" />
            </div>
        </template>
    </div>
</template>

<script lang="ts">
// 为了让递归组件在 <script setup> 中可用，需要显式命名
export default { name: 'ConditionTreeNode' }
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Delete, FolderOpened } from '@element-plus/icons-vue'
import LinkageValueInput from './LinkageValueInput.vue'
import {
    LINKAGE_CONDITION_OPTIONS,
    getDefaultCondition,
    getValidConditionsByFieldType,
    type FormField,
    type FormLinkageNode,
    type LinkageCondition,
} from './types'

const props = defineProps<{
    node: FormLinkageNode
    fields: FormField[]
    depth?: number
    isRoot?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:node', v: FormLinkageNode): void
    (e: 'remove'): void
}>()

const isGroup = computed(() => props.node.nodeType === 'AND' || props.node.nodeType === 'OR')

const nodeClass = computed(() => {
    if (props.node.nodeType === 'AND') return 'group-and'
    if (props.node.nodeType === 'OR') return 'group-or'
    return 'condition-leaf'
})

const indentStyle = computed(() => {
    if (props.depth <= 0) return {}
    return { marginLeft: `${Math.min(props.depth * 12, 48)}px` }
})

// 触发字段
const triggerField = computed(() =>
    props.fields.find(f => f.fieldId === props.node.triggerFieldId),
)

// 条件是否需要值输入
const needsTriggerValue = computed(() => {
    const cond = props.node.triggerCondition
    return cond !== 'EMPTY' && cond !== 'NOT_EMPTY'
})

// triggerValue 字符串化（与 LinkageValueInput 兼容）
const triggerValueStr = computed(() => {
    const v = props.node.triggerValue
    if (v === null || v === undefined) return ''
    if (Array.isArray(v)) return v.join(',')
    return String(v)
})

const conditionOptions = computed(() => {
    const field = triggerField.value
    if (!field) return LINKAGE_CONDITION_OPTIONS
    const valid = getValidConditionsByFieldType(field.type)
    return LINKAGE_CONDITION_OPTIONS.filter(c => valid.includes(c.value))
})

// 组节点：切换 AND/OR
const onGroupTypeChange = (val: 'AND' | 'OR') => {
    emit('update:node', { ...props.node, nodeType: val })
}

// 组节点：添加条件
const addCondition = () => {
    const defaultField = props.fields[0]
    const children = [...(props.node.children || [])]
    children.push({
        nodeType: 'CONDITION',
        triggerFieldId: defaultField?.fieldId || '',
        triggerCondition: getDefaultCondition(defaultField?.type || 'INPUT'),
        triggerValue: '',
    })
    emit('update:node', { ...props.node, children })
}

// 组节点：添加子组
const addGroup = () => {
    const defaultField = props.fields[0]
    const children = [...(props.node.children || [])]
    children.push({
        nodeType: 'AND',
        children: [{
            nodeType: 'CONDITION',
            triggerFieldId: defaultField?.fieldId || '',
            triggerCondition: getDefaultCondition(defaultField?.type || 'INPUT'),
            triggerValue: '',
        }],
    })
    emit('update:node', { ...props.node, children })
}

// 组节点：更新子节点
const updateChild = (index: number, child: FormLinkageNode) => {
    const children = [...(props.node.children || [])]
    children[index] = child
    emit('update:node', { ...props.node, children })
}

// 组节点：删除子节点
const removeChild = (index: number) => {
    const children = [...(props.node.children || [])]
    children.splice(index, 1)
    emit('update:node', { ...props.node, children })
}

// 条件节点：字段变化
const onTriggerFieldChange = (fieldId: string) => {
    const field = props.fields.find(f => f.fieldId === fieldId)
    const validConds = field ? getValidConditionsByFieldType(field.type) : []
    const currentCond = props.node.triggerCondition
    const fallbackCond = field ? getDefaultCondition(field.type) : 'EQ'
    const nextCond = validConds.includes(currentCond as LinkageCondition) ? currentCond : fallbackCond
    emit('update:node', {
        ...props.node,
        triggerFieldId: fieldId,
        triggerCondition: nextCond,
        triggerValue: '',
    })
}

// 条件节点：条件变化
const onTriggerConditionChange = (cond: LinkageCondition) => {
    const oldNeeds = needsTriggerValue.value
    const newNeeds = cond !== 'EMPTY' && cond !== 'NOT_EMPTY'
    emit('update:node', {
        ...props.node,
        triggerCondition: cond,
        triggerValue: oldNeeds !== newNeeds ? '' : props.node.triggerValue,
    })
}

// 条件节点：值变化
const onTriggerValueChange = (val: string) => {
    emit('update:node', { ...props.node, triggerValue: val })
}
</script>

<style scoped lang="scss">
.condition-node {
    &.group-and {
        border-left: 3px solid var(--el-color-primary);
        padding-left: 12px;
        margin: 8px 0;
    }

    &.group-or {
        border-left: 3px solid var(--el-color-warning);
        padding-left: 12px;
        margin: 8px 0;
    }

    &.condition-leaf {
        margin: 4px 0;
    }
}

.group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
}

.group-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.empty-children {
    padding: 8px 0;
    color: var(--el-text-color-secondary);
}

.condition-row {
    display: flex;
    align-items: stretch;
    gap: 12px;
    flex-wrap: wrap;

    .condition-field {
        display: flex;
        flex-direction: column;
    }

    .field-label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 4px;
        flex-shrink: 0;
    }

    .trigger-field-select {
        width: 180px;
    }

    .condition-select {
        width: 140px;
    }

    .condition-value-field {
        flex: 1;
        min-width: 120px;
    }

    .condition-value-wrap {
        display: flex;
        align-items: center;
        min-height: 36px;
        width: 100%;

        /* 统一比较值输入组件宽度 */
        :deep(.el-input),
        :deep(.el-select),
        :deep(.el-date-editor),
        :deep(.el-input-number) {
            width: 100% !important;
        }

        :deep(.el-slider) {
            width: 100%;
        }

        :deep(.el-color-picker) {
            vertical-align: middle;
        }
    }

    .condition-placeholder {
        color: var(--el-text-color-placeholder);
        font-size: 12px;
        line-height: 24px;
        background: var(--el-fill-color-light);
        border: 1px solid var(--el-border-color-light);
        border-radius: 4px;
        padding: 3px 11px;
        width: 100%;
        box-sizing: border-box;
    }

    .remove-btn {
        flex-shrink: 0;
        align-self: center;
        margin-top: 18px;
    }
}
</style>
