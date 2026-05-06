<template>
    <div class="linkage-editor">
        <div class="linkage-toolbar">
            <div class="linkage-tip">
                <el-icon><InfoFilled /></el-icon>
                <span>规则按列表顺序执行（sortOrder = 索引）。后执行的规则会覆盖前者对相同字段的同类动作。</span>
            </div>
            <el-button type="primary" :icon="Plus" @click="addRule" :disabled="fields.length < 2">
                添加联动规则
            </el-button>
        </div>

        <div v-if="!rules || rules.length === 0" class="empty-state">
            <el-empty description="暂无联动规则" />
        </div>

        <draggable v-else v-model="innerRules" item-key="_uid" handle=".drag-handle"
            @end="onSorted" class="rule-list">
            <template #item="{ element, index }">
                <div class="rule-card">
                    <div class="rule-header">
                        <span class="drag-handle" title="拖拽排序">
                            <el-icon><Rank /></el-icon>
                        </span>
                        <span class="rule-index">#{{ index + 1 }}</span>
                        <el-button type="danger" link :icon="Delete" @click="removeRule(index)">删除</el-button>
                    </div>
                    <el-row :gutter="12" class="rule-body">
                        <el-col :span="6">
                            <div class="rule-label">当字段</div>
                            <el-select v-model="element.triggerFieldId" placeholder="触发字段"
                                style="width: 100%">
                                <el-option v-for="f in fields" :key="f.fieldId"
                                    :label="`${f.title} (${f.fieldId})`" :value="f.fieldId" />
                            </el-select>
                        </el-col>
                        <el-col :span="5">
                            <div class="rule-label">满足</div>
                            <el-select v-model="element.triggerCondition" style="width: 100%">
                                <el-option v-for="c in LINKAGE_CONDITION_OPTIONS"
                                    :key="c.value" :label="c.label" :value="c.value" />
                            </el-select>
                        </el-col>
                        <el-col :span="5" v-if="needsTriggerValue(element.triggerCondition)">
                            <div class="rule-label">值</div>
                            <LinkageValueInput
                                v-model="element.triggerValue"
                                :field="getField(element.triggerFieldId)"
                                :condition="element.triggerCondition" />
                        </el-col>
                        <el-col :span="4">
                            <div class="rule-label">则执行</div>
                            <el-select v-model="element.actionType" style="width: 100%">
                                <el-option v-for="a in LINKAGE_ACTION_OPTIONS"
                                    :key="a.value" :label="a.label" :value="a.value" />
                            </el-select>
                        </el-col>
                        <el-col :span="needsTriggerValue(element.triggerCondition) ? 4 : 9">
                            <div class="rule-label">目标字段</div>
                            <el-select v-model="element.targetFieldId" style="width: 100%">
                                <el-option v-for="f in fields" :key="f.fieldId"
                                    :label="`${f.title} (${f.fieldId})`" :value="f.fieldId"
                                    :disabled="f.fieldId === element.triggerFieldId" />
                            </el-select>
                        </el-col>
                    </el-row>
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
import LinkageValueInput from './LinkageValueInput.vue'
import {
    LINKAGE_CONDITION_OPTIONS,
    LINKAGE_ACTION_OPTIONS,
    type FormField,
    type FormLinkage,
    type LinkageCondition,
} from './types'

const props = defineProps<{
    rules: FormLinkage[]
    fields: FormField[]
}>()

const emit = defineEmits<{
    (e: 'update:rules', v: FormLinkage[]): void
}>()

// 内部包装一下，加 _uid 让 vuedraggable 排序更稳；同步回 props
interface InternalRule extends FormLinkage {
    _uid: number
}

const uidSeq = ref(0)
const innerRules = ref<InternalRule[]>([])

const wrap = (rules: FormLinkage[]): InternalRule[] =>
    (rules || []).map(r => ({ ...r, _uid: ++uidSeq.value }))

const unwrap = (list: InternalRule[]): FormLinkage[] =>
    list.map(({ _uid, ...rest }, idx) => ({ ...rest, sortOrder: idx }))

watch(
    () => props.rules,
    val => {
        // 仅在引用不同（外部更新）时同步内部
        if (val.length !== innerRules.value.length ||
            val.some((r, i) => r !== innerRules.value[i] && r.triggerFieldId !== innerRules.value[i]?.triggerFieldId)) {
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
        triggerFieldId: trigger.fieldId,
        triggerCondition: 'EQ',
        triggerValue: '',
        actionType: 'SHOW',
        targetFieldId: target.fieldId,
        actionValue: undefined,
        sortOrder: innerRules.value.length,
    })
}

const removeRule = (index: number) => {
    innerRules.value.splice(index, 1)
}

const onSorted = () => {
    // 拖拽结束 → 重新落 sortOrder
    innerRules.value = innerRules.value.map((r, i) => ({ ...r, sortOrder: i }))
}

const needsTriggerValue = (cond: LinkageCondition): boolean =>
    cond !== 'EMPTY' && cond !== 'NOT_EMPTY'

const getField = (fieldId: string): FormField | undefined =>
    props.fields.find(f => f.fieldId === fieldId)
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
    margin-bottom: 10px;
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
}

.rule-header .el-button {
    margin-left: auto;
}

.rule-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
}
</style>
