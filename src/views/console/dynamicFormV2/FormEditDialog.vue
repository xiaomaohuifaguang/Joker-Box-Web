<template>
  <ElDialog v-model="visible" fullscreen :close-on-click-modal="false" destroy-on-close class="form-edit-dialog"
    @closed="handleClosed">
    <template #header>
      <div class="dialog-header-center">
        <span class="dialog-title">编辑表单</span>
      </div>
    </template>
    <div v-if="loading" class="dialog-loading">
      <ElIcon class="is-loading">
        <Loading />
      </ElIcon>
      <span>加载中...</span>
    </div>

    <div v-else class="dialog-body">
      <!-- 左侧：表单信息 -->
      <div class="dialog-sidebar">
        <ElForm ref="infoFormRef" :model="formInfo" :rules="infoRules" label-position="top" class="info-form">
          <ElFormItem label="表单名称" prop="name">
            <ElInput v-model="formInfo.name" placeholder="请输入表单名称" maxlength="100" show-word-limit />
          </ElFormItem>

          <ElFormItem label="表单描述" prop="description">
            <ElInput v-model="formInfo.description" type="textarea" :rows="4" placeholder="请输入表单描述" maxlength="500"
              show-word-limit />
          </ElFormItem>
        </ElForm>
      </div>

      <!-- 右侧：表单设计器 -->
      <div class="dialog-main">
        <FormDesigner ref="designerRef" v-model:fields="designerFields" v-model:groups="designerGroups"
          v-model:linkage-rules="designerLinkageRules" :form-name="formInfo.name"
          :form-description="formInfo.description" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSave">
          <ElIcon>
            <Check />
          </ElIcon>
          <span>保存</span>
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Check, Loading } from '@element-plus/icons-vue'
import { http, alert } from '@/utils'
import FormDesigner from '@/components/dynamicFormV2/designer/FormDesigner.vue'
import type { FormField, FormFieldGroup, FormLinkageRule } from '@/components/dynamicFormV2/types'
import type { TemplateCheckResult } from '@/components/dynamicFormV2/utils/validation'

// ============================================
// Props & Emits
// ============================================
const props = defineProps<{
  modelValue: boolean
  formId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// ============================================
// 类型定义
// ============================================
interface FormInfo {
  id: string
  name: string
  description: string
}

interface SavePayload {
  id: string
  name: string
  description: string
  fields: FormField[]
  groups: FormFieldGroup[]
  linkageRules: FormLinkageRule[]
}

// ============================================
// 状态
// ============================================
const loading = ref(false)
const saving = ref(false)
const infoFormRef = ref<FormInstance>()
const designerRef = ref<InstanceType<typeof FormDesigner>>()

const formInfo = ref<FormInfo>({
  id: '',
  name: '',
  description: '',
})

const designerFields = ref<FormField[]>([])
const designerGroups = ref<FormFieldGroup[]>([])
const designerLinkageRules = ref<FormLinkageRule[]>([])

const infoRules: FormRules<FormInfo> = {
  name: [
    { required: true, message: '请输入表单名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' },
  ],
}

// ============================================
// 数据加载
// ============================================
async function loadFormDetail() {
  if (!props.formId) return

  loading.value = true
  try {
    const data = await http.post('/dynamicForm/info', { id: props.formId })
    formInfo.value = {
      id: data.id,
      name: data.name,
      description: data.description,
    }
    designerFields.value = data.fields ?? data.fields ?? []
    designerGroups.value = data.groups ?? []
    designerLinkageRules.value = data.linkageRules ?? []
  } catch {
    // http interceptor handles error
  } finally {
    loading.value = false
  }
}

watch(visible, (val) => {
  if (val && props.formId) {
    loadFormDetail()
  }
})

function handleClosed() {
  formInfo.value = { id: '', name: '', description: '' }
  designerFields.value = []
  designerGroups.value = []
  designerLinkageRules.value = []
}

// ============================================
// 保存
// ============================================
async function handleSave() {
  const valid = await infoFormRef.value?.validate().catch(() => false)
  if (!valid) return

  const checkResult: TemplateCheckResult | undefined = designerRef.value?.validate()
  if (checkResult && !checkResult.ok) {
    alert(`设计器校验失败：${checkResult.errors[0] ?? '请检查表单设计'}`, 'warning')
    return
  }

  const config = designerRef.value?.getConfig()
  if (!config) {
    alert('无法获取表单配置', 'error')
    return
  }

  saving.value = true
  try {
    const payload: SavePayload = {
      id: formInfo.value.id,
      name: formInfo.value.name,
      description: formInfo.value.description,
      fields: config.fields,
      groups: config.groups,
      linkageRules: config.linkageRules,
    }
    await http.post('/dynamicForm/update', payload)
    alert('保存成功', 'success')
    visible.value = false
    emit('success')
  } catch {
    // http interceptor handles error
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.dialog-header-center {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--df-text-primary);
}

.form-edit-dialog :deep(.el-dialog__body) {
  padding: 0;
  height: calc(100vh - 120px);
  overflow: hidden;
}

.dialog-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--df-space-sm);
  height: 100%;
  color: var(--df-text-tertiary);
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.dialog-body {
  display: flex;
  height: 100%;
  gap: var(--df-space-md);
  padding: var(--df-space-md);
  background: var(--df-bg-page);
}

.dialog-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--df-bg-card);
  border-radius: var(--df-radius-md);
  padding: var(--df-space-md);
  overflow-y: auto;
}

.dialog-main {
  flex: 1;
  min-width: 0;
  background: var(--df-bg-card);
  border-radius: var(--df-radius-md);
  overflow: hidden;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--df-space-md);
}
</style>
