<template>
    <div class="condition-node" :class="nodeClass" :style="indentStyle">
        <!-- AND / OR 组节点 -->
        <template v-if="isGroup">
            <div class="group-header">
                <el-radio-group :model-value="node.nodeType" @update:model-value="onGroupTypeChange"
                    size="small">
                    <el-radio-button value="AND">且</el-radio-button>
                    <el-radio-button value="OR">或</el-radio-button>
                </el-radio-group>
                <el-button type="primary" link :icon="Plus" size="small" @click="addCondition">
                    添加条件
                </el-button>
                <el-button type="primary" link :icon="FolderOpened" size="small" @click="addGroup">
                    添加组
                </el-button>
                <el-button v-if="!isRoot" type="danger" link :icon="Delete" size="small"
                    @click="$emit('remove')">
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
                <el-select :model-value="node.triggerFieldId"
                    @update:model-value="onTriggerFieldChange" placeholder="触发字段" size="small"
                    style="width: 180px; flex-shrink: 0">
                    <el-option v-for="f in fields" :key="f.fieldId"
                        :label="`${f.title} (${f.fieldId})`" :value="f.fieldId" />
                </el-select>
                <el-select :model-value="node.triggerCondition"
                    @update:model-value="onTriggerConditionChange" size="small"
                    style="width: 140px; flex-shrink: 0">
                    <el-option v-for="c in conditionOptions" :key="c.value" :label="c.label"
                        :value="c.value" />
                </el-select>
                <div class="condition-value-wrap">
                    <LinkageValueInput v-if="needsTriggerValue" :model-value="triggerValueStr"
                        @update:model-value="onTriggerValueChange" :field="triggerField"
                        :condition="node.triggerCondition || 'EQ'" style="width: 100%" />
                    <span v-else class="condition-placeholder">无需输入值</span>
                </div>
                <el-button type="danger" link :icon="Delete" size="small" @click="$emit('remove')"
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
    type FormField,
    type FormFieldType,
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

// 根据字段类型返回可用的比较条件
const getValidConditions = (fieldType: FormFieldType): LinkageCondition[] => {
    const numericOrDate: FormFieldType[] = ['NUMBER', 'SLIDER', 'RATE', 'DATE', 'DATETIME', 'TIME', 'DATERANGE']
    if (numericOrDate.includes(fieldType)) {
        return ['EQ', 'NE', 'GT', 'LT', 'GE', 'LE', 'EMPTY', 'NOT_EMPTY', 'IN', 'NOT_IN']
    }
    const textLike: FormFieldType[] = ['INPUT', 'TEXTAREA', 'COLOR']
    if (textLike.includes(fieldType)) {
        return ['EQ', 'NE', 'EMPTY', 'NOT_EMPTY', 'REGEX', 'IN', 'NOT_IN']
    }
    const optionLike: FormFieldType[] = ['SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'CASCADER', 'MULTICASCADER']
    if (optionLike.includes(fieldType)) {
        return ['EQ', 'NE', 'EMPTY', 'NOT_EMPTY', 'IN', 'NOT_IN']
    }
    if (fieldType === 'SWITCH') {
        return ['EQ', 'NE', 'EMPTY', 'NOT_EMPTY']
    }
    return ['EMPTY', 'NOT_EMPTY']
}

const conditionOptions = computed(() => {
    const field = triggerField.value
    if (!field) return LINKAGE_CONDITION_OPTIONS
    const valid = getValidConditions(field.type)
    return LINKAGE_CONDITION_OPTIONS.filter(c => valid.includes(c.value))
})

// 组节点：切换 AND/OR
const onGroupTypeChange = (val: 'AND' | 'OR') => {
    emit('update:node', { ...props.node, nodeType: val })
}

// 组节点：添加条件
const addCondition = () => {
    const children = [...(props.node.children || [])]
    children.push({
        nodeType: 'CONDITION',
        triggerFieldId: props.fields[0]?.fieldId || '',
        triggerCondition: 'EQ',
        triggerValue: '',
    })
    emit('update:node', { ...props.node, children })
}

// 组节点：添加子组
const addGroup = () => {
    const children = [...(props.node.children || [])]
    children.push({
        nodeType: 'AND',
        children: [{
            nodeType: 'CONDITION',
            triggerFieldId: props.fields[0]?.fieldId || '',
            triggerCondition: 'EQ',
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
    const validConds = field ? getValidConditions(field.type) : []
    const currentCond = props.node.triggerCondition
    const nextCond = validConds.includes(currentCond as LinkageCondition) ? currentCond : 'EQ'
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
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .condition-value-wrap {
        flex: 1;
        min-width: 120px;
    }

    .condition-placeholder {
        color: var(--el-text-color-secondary);
        font-size: 12px;
        padding: 5px 0;
    }

    .remove-btn {
        flex-shrink: 0;
    }
}
</style>
