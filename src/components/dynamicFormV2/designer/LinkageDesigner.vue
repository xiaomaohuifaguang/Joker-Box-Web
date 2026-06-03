<script setup lang="ts">
import { computed } from 'vue'
import type { FormField, FormLinkageRule, LinkageAction } from '../types'
import { LINKAGE_ACTION_OPTIONS, getValidActionsByFieldType, getActionParamDefault } from '../types'
import { LINKAGE_ACTION_LABELS } from '../constants'
import ConditionBuilder from './ConditionBuilder.vue'
import ActionParamInput from './ActionParamInput.vue'

interface Props {
  rules: FormLinkageRule[]
  fields: FormField[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:rules', rules: FormLinkageRule[]): void
}>()

function updateRules(rules: FormLinkageRule[]) {
  emit('update:rules', rules)
}

function addRule() {
  const list = [...props.rules]
  list.push({
    name: `联动规则 ${list.length + 1}`,
    targetFieldId: props.fields[0]?.fieldId ?? '',
    actionType: 'SHOW',
    enable: true,
    conditionTree: [],
  })
  updateRules(list)
}

function removeRule(index: number) {
  const list = [...props.rules]
  list.splice(index, 1)
  updateRules(list)
}

function updateRule(index: number, patch: Partial<FormLinkageRule>) {
  const list = [...props.rules]
  list[index] = { ...list[index], ...patch }
  updateRules(list)
}

function updateTargetFieldId(index: number, fieldId: string) {
  const list = [...props.rules]
  const rule = list[index]
  const validActions = getValidActionsByFieldType(
    props.fields.find(f => f.fieldId === fieldId)?.type ?? 'INPUT'
  )
  const newActionType: LinkageAction = validActions.includes(rule.actionType)
    ? rule.actionType
    : validActions[0] ?? 'SHOW'
  list[index] = {
    ...rule,
    targetFieldId: fieldId,
    actionType: newActionType,
    actionValue: getActionParamDefault(newActionType),
  }
  updateRules(list)
}

function updateActionType(index: number, actionType: LinkageAction) {
  const list = [...props.rules]
  list[index] = {
    ...list[index],
    actionType,
    actionValue: getActionParamDefault(actionType),
  }
  updateRules(list)
}

function getActionOptions(fieldId: string) {
  const field = props.fields.find(f => f.fieldId === fieldId)
  if (!field) return LINKAGE_ACTION_OPTIONS
  const validActions = getValidActionsByFieldType(field.type)
  return LINKAGE_ACTION_OPTIONS.filter(opt => validActions.includes(opt.value))
}

function updateConditionTree(index: number, conditionTree: typeof props.rules[number]['conditionTree']) {
  const list = [...props.rules]
  list[index] = { ...list[index], conditionTree }
  updateRules(list)
}
</script>

<template>
  <div class="linkage-designer">
    <div class="linkage-designer__header">
      <span class="linkage-designer__title">联动规则 ({{ rules.length }})</span>
      <el-button type="primary" size="small" @click="addRule">
        <el-icon>
          <Plus />
        </el-icon>
        添加规则
      </el-button>
    </div>

    <div v-if="rules.length === 0" class="linkage-designer__empty">
      <el-icon :size="32" class="linkage-designer__empty-icon">
        <Link />
      </el-icon>
      <p class="linkage-designer__empty-text">暂无联动规则，点击添加</p>
    </div>

    <div v-else class="linkage-designer__list">
      <el-card v-for="(rule, idx) in rules" :key="idx" class="linkage-designer__card" :body-style="{ padding: '0' }"
        shadow="never">
        <div class="linkage-designer__card-header">
          <div class="linkage-designer__card-title">
            <el-input :model-value="rule.name ?? `规则 ${idx + 1}`" size="small" placeholder="规则名称"
              class="linkage-designer__name-input" @update:model-value="updateRule(idx, { name: $event })" />
            <el-switch :model-value="rule.enable" size="small"
              @update:model-value="updateRule(idx, { enable: $event })" />
          </div>
          <el-button type="danger" link size="small" @click="removeRule(idx)">
            <el-icon>
              <Delete />
            </el-icon>
          </el-button>
        </div>

        <!-- 触发条件区域 -->
        <div class="linkage-designer__condition-section">
          <div class="linkage-designer__section-label">当满足以下条件时</div>
          <ConditionBuilder :nodes="rule.conditionTree" :fields="fields"
            @update:nodes="updateConditionTree(idx, $event)" />
        </div>

        <!-- 执行动作区域 -->
        <div class="linkage-designer__action-section">
          <div class="linkage-designer__section-label">则执行以下动作</div>
          <el-form label-position="top" size="small" class="linkage-designer__action-form">
            <el-form-item label="目标字段">
              <el-select :model-value="rule.targetFieldId" placeholder="选择目标字段" size="small"
                @update:model-value="updateTargetFieldId(idx, $event as string)">
                <el-option v-for="f in fields" :key="f.fieldId" :label="f.title" :value="f.fieldId" />
              </el-select>
            </el-form-item>

            <el-form-item label="动作类型">
              <el-select :model-value="rule.actionType" placeholder="选择动作" size="small"
                @update:model-value="updateActionType(idx, $event as LinkageAction)">
                <el-option v-for="opt in getActionOptions(rule.targetFieldId)" :key="opt.value" :label="opt.label"
                  :value="opt.value" />
              </el-select>
            </el-form-item>

            <el-form-item label="动作参数">
              <ActionParamInput :model-value="rule.actionValue" :action-type="rule.actionType"
                @update:model-value="updateRule(idx, { actionValue: $event })" />
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.linkage-designer {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-md);
}

.linkage-designer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--df-space-sm);
  border-bottom: 1px solid var(--df-border);
}

.linkage-designer__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--df-text-primary);
}

.linkage-designer__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--df-space-xl);
  gap: var(--df-space-sm);
  color: var(--df-text-tertiary);
  background: var(--df-bg-page);
  border-radius: var(--df-radius-md);
  border: 1px dashed var(--df-border);
}

.linkage-designer__empty-icon {
  color: var(--df-border);
}

.linkage-designer__empty-text {
  font-size: 13px;
}

.linkage-designer__list {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-lg);
}

.linkage-designer__card {
  border: 1px solid var(--df-border);
  border-radius: var(--df-radius-md);
}

.linkage-designer__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--df-border-light);
}

.linkage-designer__card-title {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
  flex: 1;
}

.linkage-designer__name-input {
  width: 200px;
}

.linkage-designer__condition-section {
  background: #f8fafc;
  padding: 20px;
}

.linkage-designer__action-section {
  background: #ffffff;
  padding: 20px;
}

.linkage-designer__section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--df-text-secondary);
  margin-bottom: 12px;
}

.linkage-designer__action-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.linkage-designer__action-form :deep(.el-form-item):last-child {
  margin-bottom: 0;
}
</style>
