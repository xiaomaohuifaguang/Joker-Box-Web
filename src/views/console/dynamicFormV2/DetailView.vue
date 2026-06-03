<template>
  <div class="dfv2-detail-page">
    <!-- 顶部 -->
    <div class="page-header-bar">
      <el-button text @click="handleBack">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        <span>返回</span>
      </el-button>
      <h2 class="page-title">表单详情</h2>
      <el-button type="primary" @click="handleEdit">
        <el-icon>
          <Edit />
        </el-icon>
        <span>编辑</span>
      </el-button>
    </div>

    <div class="page-body">
      <!-- 左侧：只读信息 -->
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

          <div class="info-list">
            <div class="info-item">
              <span class="info-label">表单名称</span>
              <span class="info-value">{{ formDetail.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">表单描述</span>
              <span class="info-value">{{ formDetail.description || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">状态</span>
              <el-tag :type="FORM_STATUS_TAG_TYPES[formDetail.status as FormStatusValue]" size="small">
                {{ FORM_STATUS_LABELS[formDetail.status as FormStatusValue] }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">版本</span>
              <span class="info-value">v{{ formDetail.version }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建人</span>
              <span class="info-value">{{ formDetail.createBy || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{ formDetail.createTime || '—' }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：表单预览（只读） -->
      <div class="page-main">
        <el-card class="runner-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon>
                <View />
              </el-icon>
              <span>表单预览</span>
            </div>
          </template>

          <FormRunner :fields="formDetail.fields" :groups="formDetail.groups" :linkage-rules="formDetail.linkageRules"
            mode="readonly" :model-value="{}" />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Edit, Document, View } from '@element-plus/icons-vue'
import { http, alert } from '@/utils'
import FormRunner from '@/components/dynamicFormV2/core/FormRunner.vue'
import {
  FORM_STATUS_LABELS,
  FORM_STATUS_TAG_TYPES,
} from '@/components/dynamicFormV2/constants'
import type { FormStatusValue } from '@/components/dynamicFormV2/constants'
import type { FormField, FormFieldGroup, FormLinkageRule } from '@/components/dynamicFormV2/types'

// ============================================
// 类型定义
// ============================================
interface FormDetail {
  id: string
  name: string
  description: string
  status: FormStatusValue
  version: number
  createBy: string
  createTime: string
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

const formDetail = ref<FormDetail>({
  id: '',
  name: '',
  description: '',
  status: '0',
  version: 1,
  createBy: '',
  createTime: '',
  fields: [],
  groups: [],
  linkageRules: [],
})

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
    formDetail.value = {
      ...formDetail.value,
      ...data,
    }
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

const handleEdit = () => {
  router.push(`/console/dynamicFormV2/edit/${formId.value}`)
}

onMounted(() => {
  loadFormDetail()
})
</script>

<style scoped>
.dfv2-detail-page {
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
  flex: 1;
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
  overflow: auto;
}

.info-card {
  height: 100%;
}

.info-card :deep(.el-card__header) {
  padding: var(--df-space-md);
  border-bottom: 1px solid var(--df-border);
}

.runner-card {
  height: 100%;
}

.runner-card :deep(.el-card__header) {
  padding: var(--df-space-md);
  border-bottom: 1px solid var(--df-border);
}

.runner-card :deep(.el-card__body) {
  padding: var(--df-space-md);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
  font-size: 15px;
  font-weight: 600;
  color: var(--df-text-primary);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-xs);
}

.info-label {
  font-size: 12px;
  color: var(--df-text-tertiary);
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: var(--df-text-primary);
  word-break: break-all;
}
</style>
