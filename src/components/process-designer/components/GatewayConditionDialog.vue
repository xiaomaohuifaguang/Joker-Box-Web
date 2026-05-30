<!-- src/components/process-designer/components/GatewayConditionDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="720px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div v-loading="loading" class="dialog-body" @mousedown.stop @mouseup.stop @click.stop>
      <!-- 模式切换 -->
      <div class="mode-switch">
        <div
          v-for="mode in modes"
          :key="mode.value"
          class="mode-item"
          :class="{ active: currentMode === mode.value }"
          @click="switchMode(mode.value)"
        >
          {{ mode.label }}
        </div>
      </div>

      <!-- NATIVE -->
      <div v-if="currentMode === 'NATIVE'" class="mode-panel">
        <NativeConditionEditor
          v-model="form.nativeExpression"
          :form-field-ids="formFieldIds"
          :readonly="readonly"
        />
      </div>

      <!-- CUSTOM -->
      <div v-else-if="currentMode === 'CUSTOM'" class="mode-panel">
        <CustomConditionEditor
          v-model="form.ruleTree"
          :form-fields="formFields"
          :readonly="readonly"
        />
      </div>

      <!-- DEFAULT -->
      <div v-else-if="currentMode === 'DEFAULT'" class="mode-panel default-panel">
        <el-icon :size="48" color="#67c23a"><CircleCheck /></el-icon>
        <div class="default-title">此连线已设为默认走向</div>
        <div class="default-desc">当所有其他条件都不满足时，流程将自动走此分支</div>
      </div>
    </div>

    <template #footer>
      <span @mousedown.stop @mouseup.stop @click.stop>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :disabled="readonly" @click="onConfirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'
import type { GatewayConditionData, RuleTreeNode } from '../types/gateway-condition'
import { VALUELESS_OPERATORS } from '../types/gateway-condition'
import NativeConditionEditor from './condition-editors/NativeConditionEditor.vue'
import CustomConditionEditor from './condition-editors/CustomConditionEditor.vue'

const props = defineProps<{
  modelValue: boolean
  edgeData?: {
    id: string
    sourceNodeId: string
    targetNodeId: string
  }
  initialData?: GatewayConditionData
  formFields?: { fieldId: string; title: string }[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: GatewayConditionData): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const dialogTitle = computed(() => {
  const e = props.edgeData
  if (!e) return '条件配置'
  return `条件配置 — ${e.id}（${e.sourceNodeId} → ${e.targetNodeId}）`
})

const formFieldIds = computed(() => props.formFields?.map((f) => f.fieldId) ?? [])

const modes = [
  { label: 'NATIVE 表达式', value: 'NATIVE' as const },
  { label: 'CUSTOM 规则', value: 'CUSTOM' as const },
  { label: '默认走向', value: 'DEFAULT' as const },
]

const currentMode = ref<'NATIVE' | 'CUSTOM' | 'DEFAULT'>('CUSTOM')
const loading = ref(false)

const defaultForm = (): GatewayConditionData => ({
  conditionType: 'CUSTOM',
  isDefault: false,
  nativeExpression: '',
  ruleTree: {
    nodeType: 'AND',
    sort: 0,
    children: [],
  },
})

const form = ref<GatewayConditionData>(defaultForm())

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      const init = props.initialData
      if (init) {
        form.value = { ...init }
        if (init.isDefault) {
          currentMode.value = 'DEFAULT'
        } else if (init.conditionType === 'NATIVE') {
          currentMode.value = 'NATIVE'
        } else {
          currentMode.value = 'CUSTOM'
        }
      } else {
        form.value = defaultForm()
        currentMode.value = 'CUSTOM'
      }
    }
  }
)

async function switchMode(mode: 'NATIVE' | 'CUSTOM' | 'DEFAULT') {
  if (currentMode.value === mode) return

  const hasData =
    currentMode.value === 'NATIVE'
      ? !!form.value.nativeExpression
      : currentMode.value === 'CUSTOM'
        ? (form.value.ruleTree?.children?.length ?? 0) > 0
        : false

  if (hasData) {
    try {
      await ElMessageBox.confirm('切换模式将清空当前条件，是否继续？', '提示', {
        confirmButtonText: '继续',
        cancelButtonText: '取消',
        type: 'warning',
      })
    } catch {
      return
    }
  }

  currentMode.value = mode
  if (mode === 'NATIVE') {
    form.value = { conditionType: 'NATIVE', isDefault: false, nativeExpression: '' }
  } else if (mode === 'CUSTOM') {
    form.value = {
      conditionType: 'CUSTOM',
      isDefault: false,
      ruleTree: { nodeType: 'AND', sort: 0, children: [] },
    }
  } else {
    form.value = { conditionType: null, isDefault: true }
  }
}

function onConfirm() {
  if (currentMode.value === 'NATIVE') {
    if (!form.value.nativeExpression?.trim()) {
      ElMessageBox.alert('请填写 JUEL 表达式', '校验失败', { type: 'error' })
      return
    }
  } else if (currentMode.value === 'CUSTOM') {
    const tree = form.value.ruleTree
    if (!tree || !tree.children || tree.children.length === 0) {
      ElMessageBox.alert('请至少添加一个条件', '校验失败', { type: 'error' })
      return
    }
    const errors = validateTree(tree)
    if (errors.length > 0) {
      ElMessageBox.alert(errors[0], '校验失败', { type: 'error' })
      return
    }
  }

  emit('confirm', { ...form.value })
  visible.value = false
}

function validateTree(node: RuleTreeNode): string[] {
  const errors: string[] = []
  if (node.nodeType === 'CONDITION') {
    if (!node.category) errors.push('存在未选择条件来源的条件')
    if (!node.fieldKey) errors.push('存在未选择字段的条件')
    if (!node.operator) errors.push('存在未选择运算符的条件')
    if (!VALUELESS_OPERATORS.includes(node.operator as any) && !node.value) {
      errors.push('存在未填写比较值的条件')
    }
    if ((node.operator === 'IN' || node.operator === 'NOT_IN') && node.value) {
      try {
        JSON.parse(node.value)
      } catch {
        errors.push(`"在列表中/不在列表中"的值必须是有效的 JSON 数组格式`)
      }
    }
  }
  if (node.children) {
    for (const child of node.children) {
      errors.push(...validateTree(child))
    }
  }
  return errors
}
</script>

<style scoped>
.dialog-body {
  min-height: 200px;
}

.mode-switch {
  display: flex;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
}

.mode-item {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 13px;
  cursor: pointer;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  transition: all 0.2s;
}

.mode-item:hover {
  background: var(--el-fill-color);
}

.mode-item.active {
  background: var(--el-color-primary);
  color: #fff;
  font-weight: bold;
}

.mode-panel {
  padding: 8px 0;
}

.default-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  gap: 12px;
}

.default-title {
  font-size: 15px;
  color: #67c23a;
}

.default-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
