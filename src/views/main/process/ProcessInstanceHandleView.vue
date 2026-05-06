<template>
  <div class="process-instance-handle">
    <ProcessInstanceBaseInfo
      :item="item"
      :icon="Promotion"
      title="待处理任务"
      icon-bg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
    />

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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Promotion, Edit } from '@element-plus/icons-vue'
import { http, alert } from '@/utils'
import ProcessInstanceBaseInfo from './ProcessInstanceBaseInfo.vue'

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

defineExpose({ showConfirm })
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
</style>
