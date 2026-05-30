<!-- src/components/process-designer/components/condition-editors/NativeConditionEditor.vue -->
<template>
  <div class="native-condition-editor">
    <el-form label-position="top">
      <el-form-item label="JUEL 表达式">
        <el-input
          v-model="expression"
          placeholder="${amount > 10000}"
          :disabled="readonly"
          style="font-family: monospace"
        />
      </el-form-item>
    </el-form>

    <div class="variable-hints">
      <div class="hint-label">可用变量（点击插入）：</div>
      <div class="hint-tags">
        <el-tag
          v-for="v in availableVariables"
          :key="v"
          size="small"
          class="hint-tag"
          @click="insertVariable(v)"
        >
          {{ v }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: string
  formFieldIds?: string[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const expression = computed({
  get: () => props.modelValue ?? '',
  set: (v) => emit('update:modelValue', v),
})

const builtinVariables = [
  'formData',
  '__handler_dept',
  '__handler_role',
  '__prev_handler_dept',
  '__prev_handler_role',
]

const availableVariables = computed(() => {
  return [...(props.formFieldIds ?? []), ...builtinVariables]
})

function insertVariable(variable: string) {
  const prefix = variable.startsWith('__') || variable === 'formData' ? '' : '${'
  const suffix = prefix ? '}' : ''
  expression.value = expression.value + prefix + variable + suffix
}
</script>

<style scoped>
.native-condition-editor {
  padding: 8px 0;
}

.variable-hints {
  margin-top: 12px;
}

.hint-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.hint-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hint-tag {
  cursor: pointer;
  font-family: monospace;
}

.hint-tag:hover {
  opacity: 0.8;
}
</style>
