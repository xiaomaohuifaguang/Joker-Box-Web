<!-- src/components/process-designer/components/condition-editors/ConditionRow.vue -->
<template>
  <div class="condition-row">
    <!-- 来源 -->
    <div class="field-cell">
      <div class="field-label">来源</div>
      <el-select
        v-model="localNode.category"
        size="small"
        class="field-select"
        :disabled="readonly"
        :teleported="false"
        @change="onCategoryChange"
      >
        <el-option
          v-for="opt in CATEGORY_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>

    <!-- 字段 -->
    <div class="field-cell">
      <div class="field-label">字段</div>
      <el-select
        v-if="localNode.category === 'FORM_FIELD'"
        v-model="localNode.fieldKey"
        size="small"
        class="field-select"
        :disabled="readonly"
        :teleported="false"
        placeholder="选择字段"
      >
        <el-option
          v-for="f in formFields"
          :key="f.fieldId"
          :label="f.groupName ? `${f.groupName} - ${f.title}` : f.title"
          :value="f.fieldId"
        />
      </el-select>
      <span v-else class="field-fixed">{{ fixedFieldKey }}</span>
    </div>

    <!-- 运算符 -->
    <div class="field-cell">
      <div class="field-label">运算符</div>
      <el-select
        v-model="localNode.operator"
        size="small"
        class="field-select"
        style="width: 80px"
        :disabled="readonly"
        :teleported="false"
      >
        <el-option
          v-for="opt in OPERATOR_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>

    <!-- 值 -->
    <div class="field-cell field-value">
      <div class="field-label">值</div>
      <el-input
        v-if="!isValuelessOperator"
        v-model="localNode.value"
        size="small"
        class="field-input"
        :disabled="readonly"
        :placeholder="valuePlaceholder"
      />
      <span v-else class="field-empty">无需填写</span>
    </div>

    <!-- 删除 -->
    <el-button
      v-if="!readonly"
      class="delete-btn"
      link
      type="danger"
      size="small"
      :icon="Delete"
      @click="$emit('delete')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import {
  CATEGORY_OPTIONS,
  OPERATOR_OPTIONS,
  VALUELESS_OPERATORS,
  type RuleTreeNode,
} from '../../types/gateway-condition'

const props = defineProps<{
  node: RuleTreeNode
  formFields?: { fieldId: string; title: string; groupName?: string }[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', value: RuleTreeNode): void
  (e: 'delete'): void
}>()

const localNode = computed({
  get: () => props.node,
  set: (v) => emit('update', v),
})

const fixedFieldKey = computed(() => {
  const opt = CATEGORY_OPTIONS.find((o) => o.value === props.node.category)
  return opt?.fieldKey ?? ''
})

const isValuelessOperator = computed(() => {
  return VALUELESS_OPERATORS.includes(props.node.operator as any)
})

const valuePlaceholder = computed(() => {
  if (props.node.operator === 'IN' || props.node.operator === 'NOT_IN') {
    return '["1","2"]'
  }
  return ''
})

function onCategoryChange() {
  const opt = CATEGORY_OPTIONS.find((o) => o.value === props.node.category)
  emit('update', {
    ...props.node,
    fieldKey: opt?.fieldKey ?? '',
  })
}
</script>

<style scoped>
.condition-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg-elevated, #1e1e2e);
  border-radius: 6px;
}

.field-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  white-space: nowrap;
}

.field-select {
  min-width: 80px;
  max-width: 130px;
}

.field-fixed {
  min-width: 80px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 4px 0;
}

.field-input {
  min-width: 80px;
  max-width: 140px;
}

.field-empty {
  min-width: 80px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 4px 0;
}

.field-value {
  flex: 1;
  min-width: 80px;
}

.delete-btn {
  margin-bottom: 2px;
}
</style>
