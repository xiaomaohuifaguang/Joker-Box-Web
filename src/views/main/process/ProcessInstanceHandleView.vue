<template>
  <div class="process-instance-handle">
    <ProcessInstanceBaseInfo
      :item="item"
      :icon="Promotion"
      title="待处理任务"
      icon-bg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
    />

    <!-- 流程处理记录 -->
    <ProcessInstanceHandleRecord :records="handleRecords" />

    <!-- 占位：后续接入表单等内容 -->
    <div class="form-placeholder">
      <el-icon class="placeholder-icon">
        <Edit />
      </el-icon>
      <p>表单内容待接入</p>
      <span>后续在此处填入表单数据等内容</span>
    </div>

    <!-- 确认通过弹窗 -->
    <el-dialog
      v-model="confirmDialog.open"
      title="确认通过"
      width="480px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
      class="pass-confirm-dialog"
    >
      <div class="confirm-body">
        <p class="confirm-tip">确定要通过该审批吗？</p>
        <div class="remark-field">
          <div class="remark-label">备注 / 审批意见（可选）</div>
          <el-input
            v-model="confirmDialog.remark"
            type="textarea"
            :rows="3"
            placeholder="为空时默认存储“通过”"
            resize="none"
          />
        </div>
      </div>
      <template #footer>
        <div class="confirm-footer">
          <el-button size="large" @click="confirmDialog.open = false">取消</el-button>
          <el-button type="primary" size="large" :loading="confirmDialog.loading" @click="handleConfirm">
            <el-icon><Promotion /></el-icon>
            <span>确认通过</span>
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 确认拒绝弹窗 -->
    <el-dialog
      v-model="rejectDialog.open"
      title="确认拒绝"
      width="480px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
      class="reject-confirm-dialog"
    >
      <div class="confirm-body">
        <p class="confirm-tip">确定要拒绝该审批吗？</p>
        <div class="remark-field">
          <div class="remark-label">备注 / 审批意见（可选）</div>
          <el-input
            v-model="rejectDialog.remark"
            type="textarea"
            :rows="3"
            placeholder="为空时默认存储“拒绝”"
            resize="none"
          />
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Promotion, Edit, CircleClose } from '@element-plus/icons-vue'
import { http, alert } from '@/utils'
import ProcessInstanceBaseInfo from './ProcessInstanceBaseInfo.vue'
import ProcessInstanceHandleRecord from './ProcessInstanceHandleRecord.vue'

const props = defineProps<{
  item: any | null
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const confirmDialog = ref<{
  open: boolean
  remark: string
  loading: boolean
}>({
  open: false,
  remark: '',
  loading: false,
})

const rejectDialog = ref<{
  open: boolean
  remark: string
  loading: boolean
}>({
  open: false,
  remark: '',
  loading: false,
})

const handleRecords = ref<any[] | null>(null)

const queryHandleRecords = async () => {
  if (!props.item?.id) {
    handleRecords.value = null
    return
  }
  try {
    const result = await http.post('/processInstance/info', undefined, {
      params: { id: props.item.id },
      raw: true,
    })
    if (result.code === 200) {
      handleRecords.value = result.data?.processHandleInfoList ?? null
    }
  } catch {
    handleRecords.value = null
  }
}

watch(() => props.item, queryHandleRecords, { immediate: true })

const showConfirm = () => {
  if (!props.item?.id) {
    alert('流程实例主键为空，无法处理', 'warning')
    return
  }
  if (!props.item?.taskId) {
    alert('任务 ID 为空，无法处理', 'warning')
    return
  }
  confirmDialog.value.remark = ''
  confirmDialog.value.loading = false
  confirmDialog.value.open = true
}

const showReject = () => {
  if (!props.item?.id) {
    alert('流程实例主键为空，无法处理', 'warning')
    return
  }
  if (!props.item?.taskId) {
    alert('任务 ID 为空，无法处理', 'warning')
    return
  }
  rejectDialog.value.remark = ''
  rejectDialog.value.loading = false
  rejectDialog.value.open = true
}

const handleConfirm = async () => {
  confirmDialog.value.loading = true
  try {
    const result = await http.post('/processInstance/pass', {
      processInstanceId: props.item!.id,
      taskId: props.item!.taskId,
      remark: confirmDialog.value.remark || undefined,
    }, { raw: true })
    if (result.code === 200) {
      alert(result.msg || '审批通过', 'success')
      confirmDialog.value.open = false
      emit('success')
    }
  } finally {
    confirmDialog.value.loading = false
  }
}

const handleReject = async () => {
  rejectDialog.value.loading = true
  try {
    const result = await http.post('/processInstance/reject', {
      processInstanceId: props.item!.id,
      taskId: props.item!.taskId,
      remark: rejectDialog.value.remark || undefined,
    }, { raw: true })
    if (result.code === 200) {
      alert(result.msg || '审批拒绝', 'success')
      rejectDialog.value.open = false
      emit('success')
    }
  } finally {
    rejectDialog.value.loading = false
  }
}

defineExpose({ showConfirm, showReject })
</script>

<style scoped lang="scss">
.process-instance-handle {
  .form-placeholder {
    border: 1px dashed var(--border-light);
    border-radius: var(--radius-lg);
    background: var(--bg-overlay);
    padding: 48px 20px;
    text-align: center;
    color: var(--text-secondary);

    .placeholder-icon {
      font-size: 36px;
      color: var(--brand-primary);
      margin-bottom: 12px;
    }

    p {
      margin: 0 0 6px;
      font-size: var(--fs-lg);
      font-weight: var(--fw-semibold);
      color: var(--text-primary);
    }

    span {
      font-size: var(--fs-sm);
    }
  }
}

.pass-confirm-dialog,
.reject-confirm-dialog {
  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid var(--border-light);
  }

  .confirm-body {
    .confirm-tip {
      margin: 0 0 16px;
      font-size: var(--fs-md);
      color: var(--text-primary);
    }

    .remark-field {
      .remark-label {
        font-size: var(--fs-sm);
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
        margin-bottom: 8px;
      }

      :deep(.el-textarea__inner) {
        border-radius: var(--radius-md);
      }
    }
  }

  .confirm-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.pass-confirm-dialog {
  :deep(.el-dialog__header) {
    background: var(--brand-gradient);
    margin: 0;
    padding: 18px 24px;

    .el-dialog__title {
      color: var(--text-on-brand);
      font-weight: var(--fw-semibold);
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: var(--text-on-brand);
    }
  }
}

.reject-confirm-dialog {
  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
    margin: 0;
    padding: 18px 24px;

    .el-dialog__title {
      color: #fff;
      font-weight: var(--fw-semibold);
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: #fff;
    }
  }
}
</style>
