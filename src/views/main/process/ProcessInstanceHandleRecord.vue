<template>
  <div class="process-handle-record">
    <div
      class="section-header"
      :class="{ clickable: collapsible !== false }"
      @click="toggleExpanded"
    >
      <div class="section-icon record">
        <el-icon>
          <Timer />
        </el-icon>
      </div>
      <span class="section-title">流程处理记录</span>
      <el-icon class="expand-icon">
        <component :is="expanded ? ArrowUp : ArrowDown" />
      </el-icon>
    </div>

    <div v-show="expanded" v-if="!records || records.length === 0" class="empty-state">
      <el-icon>
        <DocumentDelete />
      </el-icon>
      <span>暂无处理记录</span>
    </div>

    <div v-show="expanded" v-else class="record-list">
      <div
        v-for="(record, index) in records"
        :key="record.id ?? index"
        class="record-item"
      >
        <div class="record-line">
          <div class="record-dot" />
          <div v-if="index < records.length - 1" class="record-bar" />
        </div>
        <div class="record-card">
          <div class="record-header">
            <span class="record-task">{{ record.taskName || '-' }}</span>
            <el-tag
              :type="getHandleTypeType(record.handleType)"
              size="small"
              effect="light"
              round
            >
              {{ getHandleTypeLabel(record.handleType) }}
            </el-tag>
          </div>
          <div class="record-body">
            <div class="record-row">
              <span class="record-label">处理人</span>
              <span class="record-value">
                {{ record.handleUserName || record.handleUser || '-' }}
              </span>
            </div>
            <div v-if="record.remark" class="record-row">
              <span class="record-label">备注</span>
              <span class="record-value">{{ record.remark }}</span>
            </div>
            <div class="record-row">
              <span class="record-label">处理时间</span>
              <span class="record-value">{{ record.handleTime || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Timer, DocumentDelete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

interface HandleRecord {
  id?: number
  processInstanceId?: number
  taskId?: string
  taskName?: string
  handleUser?: string
  handleUserName?: string
  handleType?: string
  remark?: string
  handleTime?: string
}

const props = defineProps<{
  records: HandleRecord[] | null | undefined
  collapsible?: boolean
}>()

const expanded = ref(true)

const toggleExpanded = () => {
  if (props.collapsible !== false) {
    expanded.value = !expanded.value
  }
}

const HANDLE_TYPE_MAP: Record<string, { label: string; type: 'info' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  'apply': { label: '申请', type: 'primary' },
  'pass': { label: '通过', type: 'success' },
  'reject': { label: '拒绝', type: 'danger' },
  'transfter': { label: '转办', type: 'primary' },
  'delegate': { label: '委派', type: 'primary' },
  'add_sign': { label: '加签', type: 'warning' },
  'back': { label: '驳回', type: 'danger' },
  'copy': { label: '抄送', type: 'info' },
  'claim': { label: '认领', type: 'warning' },
}

const getHandleTypeLabel = (type: string | undefined) => {
  if (!type) return '-'
  return HANDLE_TYPE_MAP[type]?.label || type
}

const getHandleTypeType = (type: string | undefined) => {
  if (!type) return 'info'
  return HANDLE_TYPE_MAP[type]?.type || 'info'
}
</script>

<style scoped lang="scss">
.process-handle-record {
  background: var(--bg-container);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-light);

    .section-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;

      &.record {
        background: linear-gradient(135deg, #f59e0b 0%, #fb923c 100%);
      }

      .el-icon {
        font-size: 18px;
        color: #fff;
      }
    }

    .section-title {
      font-size: var(--fs-xl);
      font-weight: var(--fw-semibold);
      color: var(--text-primary);
    }

    &.clickable {
      cursor: pointer;
      user-select: none;
    }

    .expand-icon {
      margin-left: auto;
      font-size: 16px;
      color: var(--text-secondary);
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 40px 20px;
    color: var(--text-secondary);

    .el-icon {
      font-size: 36px;
    }

    span {
      font-size: var(--fs-sm);
    }
  }

  .record-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .record-item {
    display: flex;
    gap: 16px;

    .record-line {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 20px;
      flex-shrink: 0;
      padding-top: 6px;

      .record-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--brand-primary);
        border: 2px solid var(--bg-container);
        box-shadow: 0 0 0 2px var(--brand-primary);
      }

      .record-bar {
        width: 2px;
        flex: 1;
        min-height: 24px;
        background: var(--border-light);
        margin-top: 8px;
      }
    }

    .record-card {
      flex: 1;
      padding-bottom: 20px;

      .record-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;

        .record-task {
          font-size: var(--fs-md);
          font-weight: var(--fw-semibold);
          color: var(--text-primary);
        }
      }

      .record-body {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .record-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;

          .record-label {
            font-size: var(--fs-sm);
            color: var(--text-secondary);
            flex-shrink: 0;
            min-width: 56px;
          }

          .record-value {
            font-size: var(--fs-sm);
            color: var(--text-primary);
            word-break: break-all;
          }
        }
      }
    }

    &:last-child .record-card {
      padding-bottom: 0;
    }
  }
}

@media (max-width: 768px) {
  .process-handle-record {
    padding: 16px;
  }
}
</style>
