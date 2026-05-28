<template>
  <el-dialog
    v-model="dialog.open"
    :title="dialogTitle"
    width="max(60vw, min(1400px, 90vw))"
    destroy-on-close
    :close-on-click-modal="false"
    class="claim-dialog"
  >
    <div v-loading="loading" class="dialog-body">
      <ProcessInstanceBaseInfo
        :item="infoData"
        :icon="Pointer"
        title="待认领任务"
        icon-bg="linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)"
      />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" @click="dialog.open = false">取消</el-button>
        <el-button type="success" size="large" :loading="claiming" @click="handleClaim">
          <el-icon><Pointer /></el-icon>
          <span>确认认领</span>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Pointer } from '@element-plus/icons-vue'
import { http, alert } from '@/utils'
import ProcessInstanceBaseInfo from './ProcessInstanceBaseInfo.vue'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const dialog = ref({ open: false })
const loading = ref(false)
const claiming = ref(false)
const infoData = ref<any>(null)
const currentId = ref<string | number>('')
const currentTaskId = ref<string | undefined>(undefined)

const dialogTitle = computed(() => {
  const name = infoData.value?.processDefinitionName || '未命名流程'
  return `认领任务 · ${name}`
})

const open = (id: string | number, taskId?: string) => {
  currentId.value = id
  currentTaskId.value = taskId
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
    }
  } finally {
    loading.value = false
  }
}

const handleClaim = async () => {
  claiming.value = true
  try {
    const result = await http.post('/processInstance/claim', {
      processInstanceId: currentId.value,
      taskId: currentTaskId.value,
    }, { raw: true })
    if (result.code === 200) {
      alert(result.msg || '认领成功', 'success')
      dialog.value.open = false
      emit('success')
    }
  } finally {
    claiming.value = false
  }
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.claim-dialog {
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
</style>
