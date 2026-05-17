<template>
  <el-dialog
    v-model="dialog.open"
    :title="dialogTitle"
    width="720px"
    destroy-on-close
    :close-on-click-modal="false"
    class="start-dialog"
  >
    <ProcessInstanceStartView ref="startViewRef" :def="dialog.def" @success="onStartSuccess" @saved="onSaved" />

    <template #footer>
      <div class="start-footer">
        <el-button size="large" @click="dialog.open = false">取消</el-button>
        <el-button size="large" :loading="dialog.saving" @click="handleSave">
          <el-icon><Memo /></el-icon>
          <span>保存</span>
        </el-button>
        <el-button type="primary" size="large" :loading="dialog.starting" @click="handleSubmit">
          <el-icon><Promotion /></el-icon>
          <span>发起</span>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Promotion, Memo } from '@element-plus/icons-vue'
import ProcessInstanceStartView from './ProcessInstanceStartView.vue'

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'saved'): void
}>()

const dialog = ref<{
  open: boolean
  saving: boolean
  starting: boolean
  def: any | null
  draftId: string | number | null
}>({
  open: false,
  saving: false,
  starting: false,
  def: null,
  draftId: null,
})

const startViewRef = ref<InstanceType<typeof ProcessInstanceStartView> | null>(null)

const dialogTitle = computed(() => {
  const name = dialog.value.def?.processName || dialog.value.def?.processKey || '未知流程'
  return dialog.value.draftId ? `编辑草稿 · ${name}` : `发起流程 · ${name}`
})

const open = (def: any, draftId?: string | number) => {
  dialog.value.def = def
  dialog.value.draftId = draftId ?? null
  dialog.value.saving = false
  dialog.value.starting = false
  dialog.value.open = true
  nextTick(() => {
    startViewRef.value?.reset()
    if (draftId) {
      startViewRef.value?.loadDraft(draftId)
    }
  })
}

const handleSave = async () => {
  dialog.value.saving = true
  try {
    await startViewRef.value?.saveDraft()
  } finally {
    dialog.value.saving = false
  }
}

const handleSubmit = async () => {
  dialog.value.starting = true
  try {
    await startViewRef.value?.submit()
  } finally {
    dialog.value.starting = false
  }
}

const onStartSuccess = () => {
  dialog.value.open = false
  emit('success')
}

const onSaved = () => {
  emit('saved')
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.start-dialog {
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
    max-height: 70vh;
    overflow-y: auto;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid var(--border-light);
  }
}

.start-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
