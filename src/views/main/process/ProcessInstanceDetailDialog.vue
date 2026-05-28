<template>
  <el-dialog
    v-model="dialog.open"
    :title="dialogTitle"
    width="max(60vw, min(1400px, 90vw))"
    destroy-on-close
    :close-on-click-modal="false"
    class="detail-dialog"
  >
    <div v-loading="loading" class="dialog-body">
      <ProcessInstanceBaseInfo
        :item="infoData"
        :icon="dialog.mode === 'handle' ? Promotion : Tickets"
        :title="dialog.mode === 'handle' ? '待处理任务' : '流程详情'"
        icon-bg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
      />

      <!-- 表单区（handle 模式） -->
      <template v-if="dialog.mode === 'handle'">
        <template v-if="hasForm">
          <div v-if="globalForm" class="form-section">
            <div class="form-section-header" @click="globalCollapsed = !globalCollapsed">
              <div class="header-left">
                <el-icon><Collection /></el-icon>
                <span>{{ globalForm.name || '全局表单' }}</span>
              </div>
              <el-icon class="collapse-icon" :class="{ collapsed: globalCollapsed }"><ArrowDown /></el-icon>
            </div>
            <FormMaker
              v-show="!globalCollapsed"
              ref="globalFormRef"
              type="edit"
              v-model="globalFormData"
              :form-fields="globalForm.formFields"
              :groups="globalForm.groups"
              :linkage-rules="globalForm.linkageRules"
            />
          </div>
          <div v-if="nodeForm" class="form-section">
            <div class="form-section-header" @click="nodeCollapsed = !nodeCollapsed">
              <div class="header-left">
                <el-icon><Document /></el-icon>
                <span>{{ nodeForm.name || '表单' }}</span>
              </div>
              <el-icon class="collapse-icon" :class="{ collapsed: nodeCollapsed }"><ArrowDown /></el-icon>
            </div>
            <FormMaker
              v-show="!nodeCollapsed"
              ref="nodeFormRef"
              type="edit"
              v-model="nodeFormData"
              :form-fields="nodeForm.formFields"
              :groups="nodeForm.groups"
              :linkage-rules="nodeForm.linkageRules"
            />
          </div>
        </template>
        <div v-else-if="!loading" class="form-placeholder">
          <el-icon class="placeholder-icon"><Edit /></el-icon>
          <p>该任务未配置表单</p>
          <span>直接进行审批操作即可</span>
        </div>
      </template>

      <!-- 处理记录 -->
      <ProcessInstanceHandleRecord :records="records" :timeline="timeline" collapsible />
    </div>

    <template v-if="dialog.mode === 'handle'" #footer>
      <div class="dialog-footer">
        <el-button size="large" @click="dialog.open = false">取消</el-button>
        <el-button type="warning" size="large" :loading="actionLoading" @click="showBack">
          <el-icon><RefreshLeft /></el-icon>
          <span>驳回</span>
        </el-button>
        <el-button type="danger" size="large" :loading="actionLoading" @click="showReject">
          <el-icon><CircleClose /></el-icon>
          <span>拒绝</span>
        </el-button>
        <el-button type="primary" size="large" :loading="actionLoading" @click="showPass">
          <el-icon><Promotion /></el-icon>
          <span>通过</span>
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 确认通过弹窗 -->
  <el-dialog v-model="passDialog.open" title="确认通过" width="480px" :close-on-click-modal="false" append-to-body destroy-on-close class="pass-confirm-dialog">
    <div class="confirm-body">
      <p class="confirm-tip">确定要通过该审批吗？</p>
      <div class="remark-field">
        <div class="remark-label">备注 / 审批意见（可选）</div>
        <el-input v-model="passDialog.remark" type="textarea" :rows="3" placeholder="为空时默认存储“通过”" resize="none" />
      </div>
    </div>
    <template #footer>
      <div class="confirm-footer">
        <el-button size="large" @click="passDialog.open = false">取消</el-button>
        <el-button type="primary" size="large" :loading="passDialog.loading" @click="handlePass">
          <el-icon><Promotion /></el-icon>
          <span>确认通过</span>
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 确认拒绝弹窗 -->
  <el-dialog v-model="rejectDialog.open" title="确认拒绝" width="480px" :close-on-click-modal="false" append-to-body destroy-on-close class="reject-confirm-dialog">
    <div class="confirm-body">
      <p class="confirm-tip">确定要拒绝该审批吗？</p>
      <div class="remark-field">
        <div class="remark-label">备注 / 审批意见（可选）</div>
        <el-input v-model="rejectDialog.remark" type="textarea" :rows="3" placeholder="为空时默认存储“拒绝”" resize="none" />
      </div>
    </div>
    <template #footer>
      <div class="confirm-footer">
        <el-button size="large" @click="rejectDialog.open = false">取消</el-button>
        <el-button type="danger" size="large" :loading="rejectDialog.loading" @click="handleReject">
          <el-icon><CircleClose /></el-icon>
          <span>确认拒绝</span>
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 确认驳回弹窗 -->
  <el-dialog v-model="backDialog.open" title="确认驳回" width="480px" :close-on-click-modal="false" append-to-body destroy-on-close class="back-confirm-dialog">
    <div class="confirm-body">
      <p class="confirm-tip">确定要驳回该审批吗？</p>
      <div class="remark-field">
        <div class="remark-label">备注 / 审批意见（可选）</div>
        <el-input v-model="backDialog.remark" type="textarea" :rows="3" placeholder="为空时默认存储“驳回”" resize="none" />
      </div>
    </div>
    <template #footer>
      <div class="confirm-footer">
        <el-button size="large" @click="backDialog.open = false">取消</el-button>
        <el-button type="warning" size="large" :loading="backDialog.loading" @click="handleBack">
          <el-icon><RefreshLeft /></el-icon>
          <span>确认驳回</span>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Promotion, Tickets, Edit, CircleClose, RefreshLeft, Document, Collection, ArrowDown } from '@element-plus/icons-vue'
import { http, alert } from '@/utils'
import ProcessInstanceBaseInfo from './ProcessInstanceBaseInfo.vue'
import ProcessInstanceHandleRecord from './ProcessInstanceHandleRecord.vue'
import FormMaker from '@/components/dynamicForm/FormMaker.vue'
import { flattenGroups } from '@/components/dynamicForm/types'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const dialog = ref({
  open: false,
  mode: 'detail' as 'detail' | 'handle',
})

const loading = ref(false)
const actionLoading = ref(false)
const infoData = ref<any>(null)
const records = ref<any[]>([])
const timeline = ref<any[]>([])
const currentId = ref<string | number>('')
const currentTaskId = ref<string | undefined>(undefined)

// 表单相关（handle 模式）
const taskForm = computed(() => infoData.value?.taskForm)
const nodeForm = computed(() => taskForm.value?.nodeForm)
const globalForm = computed(() => taskForm.value?.globalForm)
const hasForm = computed(() => !!nodeForm.value || !!globalForm.value)

const nodeFormData = ref<Record<string, any>>({})
const globalFormData = ref<Record<string, any>>({})
const nodeFormRef = ref<InstanceType<typeof FormMaker> | null>(null)
const globalFormRef = ref<InstanceType<typeof FormMaker> | null>(null)

// 表单折叠状态
const globalCollapsed = ref(false)
const nodeCollapsed = ref(false)

const applyPermission = (field: any): any => {
  const f = { ...field }
  switch (f.permission) {
    case 'HIDDEN':
      f._hidden = true
      break
    case 'READONLY':
      f._readonly = true
      break
    case 'REQUIRED':
      f.required = '1'
      break
    case 'VISIBLE':
    default:
      break
  }
  delete f.permission
  return f
}

const initFormData = (fields: any[]): Record<string, any> => {
  const data: Record<string, any> = {}
  fields.forEach((f: any) => {
    if (f._hidden) return
    data[f.fieldId] = f.value ?? f.defaultValue ?? null
  })
  return data
}

const initForm = (form: any): Record<string, any> => {
  if (!form) return {}
  form.formFields = (form.formFields || []).map(applyPermission).filter((f: any) => !f._hidden)
  form.groups = (form.groups || []).map((g: any) => ({
    ...g,
    fields: (g.fields || []).map(applyPermission).filter((f: any) => !f._hidden)
  }))
  form.formFields = flattenGroups(form.groups).concat(form.formFields)
  return initFormData(form.formFields)
}

const dialogTitle = computed(() => {
  const name = infoData.value?.processDefinitionName || '未命名流程'
  return dialog.value.mode === 'handle' ? `处理任务 · ${name}` : `流程详情 · ${name}`
})

const open = (id: string | number, taskId?: string, mode: 'detail' | 'handle' = 'detail') => {
  currentId.value = id
  currentTaskId.value = taskId
  dialog.value.mode = mode
  dialog.value.open = true
  loadInfo()
}

const loadInfo = async () => {
  loading.value = true
  try {
    const result = await http.post('/processInstance/info', undefined, {
      params: { id: currentId.value, taskId: currentTaskId.value },
      raw: true,
    })
    if (result.code === 200) {
      infoData.value = result.data
      records.value = result.data?.processHandleInfoList ?? []
      timeline.value = result.data?.timeline ?? []

      // 初始化任务表单
      const tf = result.data?.taskForm
      if (tf) {
        if (tf.nodeForm) nodeFormData.value = initForm(tf.nodeForm)
        if (tf.globalForm) globalFormData.value = initForm(tf.globalForm)
      }
    }
  } finally {
    loading.value = false
  }
}

// 通过
const passDialog = ref({ open: false, remark: '', loading: false })
const showPass = () => { passDialog.value = { open: true, remark: '', loading: false } }
const handlePass = async () => {
  passDialog.value.loading = true
  try {
    const result = await http.post('/processInstance/pass', {
      processInstanceId: currentId.value,
      taskId: currentTaskId.value,
      remark: passDialog.value.remark || undefined,
    }, { raw: true })
    if (result.code === 200) {
      alert(result.msg || '审批通过', 'success')
      passDialog.value.open = false
      dialog.value.open = false
      emit('success')
    }
  } finally {
    passDialog.value.loading = false
  }
}

// 拒绝
const rejectDialog = ref({ open: false, remark: '', loading: false })
const showReject = () => { rejectDialog.value = { open: true, remark: '', loading: false } }
const handleReject = async () => {
  rejectDialog.value.loading = true
  try {
    const result = await http.post('/processInstance/reject', {
      processInstanceId: currentId.value,
      taskId: currentTaskId.value,
      remark: rejectDialog.value.remark || undefined,
    }, { raw: true })
    if (result.code === 200) {
      alert(result.msg || '审批拒绝', 'success')
      rejectDialog.value.open = false
      dialog.value.open = false
      emit('success')
    }
  } finally {
    rejectDialog.value.loading = false
  }
}

// 驳回
const backDialog = ref({ open: false, remark: '', targetNodeId: undefined as string | undefined, loading: false })
const showBack = () => { backDialog.value = { open: true, remark: '', targetNodeId: undefined, loading: false } }
const handleBack = async () => {
  backDialog.value.loading = true
  try {
    const result = await http.post('/processInstance/back', {
      processInstanceId: currentId.value,
      taskId: currentTaskId.value,
      remark: backDialog.value.remark || undefined,
      targetNodeId: backDialog.value.targetNodeId,
    }, { raw: true })
    if (result.code === 200) {
      alert(result.msg || '审批驳回', 'success')
      backDialog.value.open = false
      dialog.value.open = false
      emit('success')
    }
  } finally {
    backDialog.value.loading = false
  }
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.detail-dialog {
  :deep(.el-dialog__header) {
    background: var(--brand-gradient);
    margin: 0;
    padding: 18px 24px;
    .el-dialog__title { color: var(--text-on-brand); font-weight: var(--fw-semibold); }
    .el-dialog__headerbtn .el-dialog__close { color: var(--text-on-brand); }
  }
  :deep(.el-dialog__body) { padding: 0; }
  :deep(.el-dialog__footer) { padding: 16px 24px; border-top: 1px solid var(--border-light); }
}

.dialog-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-section {
  margin-bottom: 24px;
  .form-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 16px;
    font-size: var(--fs-md);
    font-weight: var(--fw-semibold);
    color: var(--text-primary);
    padding: 10px 14px;
    background: var(--bg-overlay);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-light);
    cursor: pointer;
    user-select: none;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        font-size: 18px;
        color: var(--brand-primary);
      }
    }

    .collapse-icon {
      font-size: 16px;
      color: var(--text-secondary);
      transition: transform 0.2s ease;

      &.collapsed {
        transform: rotate(-90deg);
      }
    }
  }
}

.form-placeholder {
  border: 1px dashed var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-overlay);
  padding: 48px 20px;
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 24px;
  .placeholder-icon { font-size: 36px; color: var(--brand-primary); margin-bottom: 12px; }
  p { margin: 0 0 6px; font-size: var(--fs-lg); font-weight: var(--fw-semibold); color: var(--text-primary); }
  span { font-size: var(--fs-sm); }
}

.confirm-body {
  .confirm-tip { margin: 0 0 16px; font-size: var(--fs-md); color: var(--text-primary); }
  .remark-field {
    .remark-label { font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--text-primary); margin-bottom: 8px; }
    :deep(.el-textarea__inner) { border-radius: var(--radius-md); }
  }
}
.confirm-footer { display: flex; justify-content: flex-end; gap: 12px; }

.pass-confirm-dialog {
  :deep(.el-dialog__header) {
    background: var(--brand-gradient); margin: 0; padding: 18px 24px;
    .el-dialog__title { color: var(--text-on-brand); font-weight: var(--fw-semibold); }
    .el-dialog__headerbtn .el-dialog__close { color: var(--text-on-brand); }
  }
}
.reject-confirm-dialog {
  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); margin: 0; padding: 18px 24px;
    .el-dialog__title { color: #fff; font-weight: var(--fw-semibold); }
    .el-dialog__headerbtn .el-dialog__close { color: #fff; }
  }
}
.back-confirm-dialog {
  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); margin: 0; padding: 18px 24px;
    .el-dialog__title { color: #fff; font-weight: var(--fw-semibold); }
    .el-dialog__headerbtn .el-dialog__close { color: #fff; }
  }
}
</style>
