<template>
  <div class="dfv2-edit-page">
    <!-- 顶部 -->
    <div class="page-header-bar">
      <el-button text @click="handleBack">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        <span>返回</span>
      </el-button>
      <h2 class="page-title">编辑表单</h2>
    </div>

    <div class="page-body">
      <!-- 左侧：表单信息 -->
      <div class="page-sidebar">
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon>
                <Document />
              </el-icon>
              <span>表单信息</span>
            </div>
          </template>

          <el-form ref="infoFormRef" :model="formInfo" :rules="infoRules" label-position="top" class="info-form">
            <el-form-item label="表单名称" prop="name">
              <el-input v-model="formInfo.name" placeholder="请输入表单名称" maxlength="100" show-word-limit />
            </el-form-item>

            <el-form-item label="表单描述" prop="description">
              <el-input v-model="formInfo.description" type="textarea" :rows="4" placeholder="请输入表单描述" maxlength="500"
                show-word-limit />
            </el-form-item>
          </el-form>

          <div class="info-actions">
            <el-button type="primary" :loading="saving" @click="handleSave">
              <el-icon>
                <Check />
              </el-icon>
              <span>保存</span>
            </el-button>
            <el-button @click="handleCancel">
              <el-icon>
                <Close />
              </el-icon>
              <span>取消</span>
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 右侧：表单设计器 -->
      <div class="page-main">
        <el-card class="designer-card" shadow="never">
          <FormDesigner ref="designerRef" v-model:fields="designerFields" v-model:groups="designerGroups"
            v-model:linkage-rules="designerLinkageRules" :form-name="formInfo.name"
            :form-description="formInfo.description" />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowLeft, Document, Check, Close } from '@element-plus/icons-vue'
import { http, alert } from '@/utils'
import FormDesigner from '@/components/dynamicFormV2/designer/FormDesigner.vue'
import type { FormField, FormFieldGroup, FormLinkageRule } from '@/components/dynamicFormV2/types'
import type { TemplateCheckResult } from '@/components/dynamicFormV2/utils/validation'

// ============================================
// 类型定义
// ============================================
interface FormInfo {
  id: string
  name: string
  description: string
}

interface FormDetail {
  id: string
  name: string
  description: string
  fields: FormField[]
  groups: FormFieldGroup[]
  linkageRules: FormLinkageRule[]
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
const router = useRouter()
const route = useRoute()
const formId = ref<string>(String(route.params.id ?? ''))

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
const loadFormDetail = async () => {
  if (!formId.value) {
    alert('表单 ID 无效', 'error')
    router.push('/console/dynamicFormV2')
    return
  }

  loading.value = true
  try {
    const data: FormDetail = await http.post('/dynamicForm/info', { id: formId.value })
    formInfo.value = {
      id: data.id,
      name: data.name,
      description: data.description,
    }
    designerFields.value = data.fields ?? []
    designerGroups.value = data.groups ?? []
    designerLinkageRules.value = data.linkageRules ?? []
  } catch {
    // http interceptor handles error
  } finally {
    loading.value = false
  }
}

// ============================================
// 操作
// ============================================
const handleBack = () => {
  router.push('/console/dynamicFormV2')
}

const handleCancel = () => {
  router.push('/console/dynamicFormV2')
}

const handleSave = async () => {
  // 1. 校验表单信息
  const valid = await infoFormRef.value?.validate().catch(() => false)
  if (!valid) return

  // 2. 校验设计器
  const checkResult: TemplateCheckResult | undefined = designerRef.value?.validate()
  if (checkResult && !checkResult.ok) {
    const firstError = checkResult.errors[0]
    alert(`设计器校验失败：${firstError ?? '请检查表单设计'}`, 'warning')
    return
  }

  // 3. 获取设计器配置
  const config = designerRef.value?.getConfig()
  if (!config) {
    alert('无法获取表单配置', 'error')
    return
  }

  // 4. 提交
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
    router.push('/console/dynamicFormV2')
  } catch {
    // http interceptor handles error
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadFormDetail()
})
</script>

<style scoped>
.dfv2-edit-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--df-bg-page);
  overflow: hidden;
}

.page-header-bar {
  display: flex;
  align-items: center;
  gap: var(--df-space-md);
  padding: var(--df-space-md) var(--df-space-lg);
  background: var(--df-bg-card);
  border-bottom: 1px solid var(--df-border);
  flex-shrink: 0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--df-text-primary);
  margin: 0;
}

.page-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: var(--df-space-md);
  padding: var(--df-space-md);
}

.page-sidebar {
  width: 320px;
  flex-shrink: 0;
  overflow: auto;
}

.page-main {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.info-card {
  height: 100%;
}

.info-card :deep(.el-card__header) {
  padding: var(--df-space-md);
  border-bottom: 1px solid var(--df-border);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
  font-size: 15px;
  font-weight: 600;
  color: var(--df-text-primary);
}

.info-form {
  padding: var(--df-space-sm) 0;
}

.info-actions {
  display: flex;
  gap: var(--df-space-sm);
  padding-top: var(--df-space-md);
  border-top: 1px solid var(--df-border-light);
}

.designer-card {
  height: 100%;
}

.designer-card :deep(.el-card__body) {
  height: 100%;
  padding: 0;
}
</style>
