<!-- src/components/process-designer/components/condition-editors/ConditionRow.vue -->
<template>
  <div class="condition-row">
    <el-select
      v-model="localNode.category"
      size="small"
      style="width: 100px"
      :disabled="readonly"
      @change="onCategoryChange"
    >
      <el-option
        v-for="opt in CATEGORY_OPTIONS"
        :key="opt.value"
        :label="opt.label"
        :value="opt.value"
      />
    </el-select>

    <!-- FORM_FIELD 时显示下拉，其他显示固定文本 -->
    <el-select
      v-if="localNode.category === 'FORM_FIELD'"
      v-model="localNode.fieldKey"
      size="small"
      style="width: 100px"
      :disabled="readonly"
      placeholder="选择字段"
    >
      <el-option
        v-for="f in formFields"
        :key="f.fieldId"
        :label="f.title"
        :value="f.fieldId"
      />
    </el-select>
    <span v-else class="fixed-field">{{ fixedFieldKey }}</span>

    <el-select
      v-model="localNode.operator"
      size="small"
      style="width: 80px"
      :disabled="readonly"
    >
      <el-option
        v-for="opt in OPERATOR_OPTIONS"
        :key="opt.value"
        :label="opt.label"
        :value="opt.value"
      />
    </el-select>

    <el-input
      v-if="!isValuelessOperator"
      v-model="localNode.value"
      size="small"
      style="width: 120px"
      :disabled="readonly"
      :placeholder="valuePlaceholder"
    />
    <span v-else class="value-placeholder">—</span>

    <el-button
      v-if="!readonly"
      link
      type="danger"
      size="small"
      @click="$emit('delete')"
    >
      删除
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CATEGORY_OPTIONS,
  OPERATOR_OPTIONS,
  VALUELESS_OPERATORS,
  type RuleTreeNode,
} from '../../types/gateway-condition'

const props = defineProps<{
  node: RuleTreeNode
  formFields?: { fieldId: string; title: string }[]
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
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg-elevated, #1e1e2e);
  border-radius: 6px;
}

.fixed-field {
  width: 100px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.value-placeholder {
  width: 120px;
  text-align: center;
  color: var(--el-text-color-secondary);
}
</style>
