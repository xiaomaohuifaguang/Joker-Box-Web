<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElButton, ElDialog } from 'element-plus'
import type { FormField, FormFieldGroup, FormLinkageRule } from '../types'
import FormRunner from '../core/FormRunner.vue'
import CodeDisplay from '@/components/media/CodeDisplay.vue'

interface Props {
  fields: FormField[]
  groups?: FormFieldGroup[]
  linkageRules?: FormLinkageRule[]
}

const props = withDefaults(defineProps<Props>(), {
  groups: undefined,
  linkageRules: () => [],
})

const allFields = computed<FormField[]>(() => props.fields)

/* ── 根据字段 defaultValue 初始化 formData ── */
function buildDefaultFormData(fields: FormField[]): Record<string, any> {
  const data: Record<string, any> = {}
  for (const f of fields) {
    if (f.defaultValue !== undefined) {
      data[f.fieldId] = f.defaultValue
    }
  }
  return data
}

const formData = ref<Record<string, any>>(buildDefaultFormData(props.fields))

watch(
  () => props.fields,
  (fields: FormField[]) => {
    formData.value = buildDefaultFormData(fields)
  },
  { deep: true },
)
const allGroups = computed<FormFieldGroup[] | undefined>(() => {
  if (!props.groups || props.groups.length === 0) return undefined
  const realGroups = props.groups.filter(g => g.id !== '_ungrouped')
  return realGroups.length > 0 ? props.groups : undefined
})

const formRunnerRef = ref<InstanceType<typeof FormRunner>>()

async function validate(): Promise<boolean> {
  if (!formRunnerRef.value) return false
  return formRunnerRef.value.validate()
}

function getSubmitData(): Record<string, any> {
  if (!formRunnerRef.value) return {}
  return formRunnerRef.value.getSubmitData()
}

defineExpose({
  validate,
  getSubmitData,
})

/* ── 工具栏 ── */
const showDataDialog = ref(false)
const validateResult = ref<{ valid: boolean; message: string } | null>(null)

async function handleValidate() {
  const valid = await validate()
  validateResult.value = {
    valid,
    message: valid ? '校验通过' : '校验失败，请检查表单填写',
  }
  setTimeout(() => {
    validateResult.value = null
  }, 3000)
}

function handleShowData() {
  showDataDialog.value = true
}
</script>

<template>
  <div class="preview-panel">
    <!-- 工具栏 -->
    <div class="preview-panel__toolbar">
      <ElButton type="primary" @click="handleValidate">
        数据校验
      </ElButton>
      <ElButton @click="handleShowData">
        数据展示
      </ElButton>
    </div>

    <!-- 校验结果提示 -->
    <div v-if="validateResult" class="preview-panel__validate-result"
      :class="{ 'is-success': validateResult.valid, 'is-error': !validateResult.valid }">
      {{ validateResult.message }}
    </div>

    <div class="preview-panel__content">
      <FormRunner ref="formRunnerRef" :fields="allFields" :groups="allGroups" :linkage-rules="linkageRules" mode="fill"
        v-model="formData" />
    </div>

    <!-- 数据展示弹窗 -->
    <ElDialog v-model="showDataDialog" title="表单数据" width="700px">
      <CodeDisplay :code="formData" language="json" />
    </ElDialog>
  </div>
</template>

<style scoped>
.preview-panel {
  width: 100%;
  height: 100%;
  background: var(--df-bg-page);
  overflow: auto;
}

.preview-panel__toolbar {
  display: flex;
  gap: var(--df-space-sm);
  padding: var(--df-space-lg) var(--df-space-3xl) 0;
}

.preview-panel__validate-result {
  margin: var(--df-space-sm) var(--df-space-3xl) 0;
  padding: var(--df-space-sm) var(--df-space-md);
  border-radius: var(--df-radius-md);
  font-size: 14px;
  font-weight: 500;
}

.preview-panel__validate-result.is-success {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.preview-panel__validate-result.is-error {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.preview-panel__content {
  margin: var(--df-space-md) auto 0;
  padding: var(--df-space-3xl);
}
</style>
