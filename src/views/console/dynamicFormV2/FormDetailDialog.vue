<template>
  <ElDialog v-model="visible" fullscreen :close-on-click-modal="true" destroy-on-close class="form-detail-dialog"
    @closed="handleClosed">
    <template #header>
      <div class="dialog-header-center">
        <span class="dialog-title">表单详情</span>
      </div>
    </template>
    <div v-if="loading" class="dialog-loading">
      <ElIcon class="is-loading">
        <Loading />
      </ElIcon>
      <span>加载中...</span>
    </div>

    <div v-else class="dialog-body">
      <!-- 左侧：只读信息 -->
      <div class="dialog-info">
        <ElCard shadow="never">
          <template #header>
            <div class="card-header">
              <ElIcon>
                <Document />
              </ElIcon>
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
              <ElTag :type="FORM_STATUS_TAG_TYPES[formDetail.status]" size="small">
                {{ FORM_STATUS_LABELS[formDetail.status] }}
              </ElTag>
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
        </ElCard>
      </div>

      <!-- 右侧：表单预览 -->
      <div class="dialog-preview">
        <ElCard shadow="never">
          <template #header>
            <div class="card-header">
              <ElIcon>
                <View />
              </ElIcon>
              <span>表单预览</span>
            </div>
          </template>

          <FormRunner :fields="formDetail.fields" :groups="formDetail.groups" :linkage-rules="formDetail.linkageRules"
            mode="readonly" :model-value="{}" />
        </ElCard>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton type="primary" @click="handleEdit">
          <ElIcon>
            <Edit />
          </ElIcon>
          <span>编辑</span>
        </ElButton>
        <ElButton @click="visible = false">关闭</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Loading, Document, View, Edit } from '@element-plus/icons-vue'
import { http, alert } from '@/utils'
import FormRunner from '@/components/dynamicFormV2/core/FormRunner.vue'
import { FORM_STATUS_LABELS, FORM_STATUS_TAG_TYPES } from '@/components/dynamicFormV2/constants'
import type { FormStatusValue } from '@/components/dynamicFormV2/constants'
import type { FormField, FormFieldGroup, FormLinkageRule } from '@/components/dynamicFormV2/types'

// ============================================
// Props & Emits
// ============================================
const props = defineProps<{
  modelValue: boolean
  formId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'edit', formId: string): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

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
async function loadFormDetail() {
  if (!props.formId) return

  loading.value = true
  try {
    const data = await http.post('/dynamicForm/info', { id: props.formId })
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

watch(visible, (val) => {
  if (val && props.formId) {
    loadFormDetail()
  }
})

function handleClosed() {
  formDetail.value = {
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
  }
}

// ============================================
// 操作
// ============================================
function handleEdit() {
  visible.value = false
  emit('edit', formDetail.value.id)
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

.form-detail-dialog :deep(.el-dialog__body) {
  padding: var(--df-space-md);
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
  gap: var(--df-space-md);
  height: 100%;
  overflow: hidden;
}

.dialog-info {
  width: 280px;
  flex-shrink: 0;
}

.dialog-preview {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
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

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--df-space-md);
}
</style>
