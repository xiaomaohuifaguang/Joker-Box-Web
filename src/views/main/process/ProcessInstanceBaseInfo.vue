<template>
  <div class="process-instance-base-info">
    <div class="section-header">
      <div class="section-icon" :style="{ background: iconBg || 'var(--brand-gradient)' }">
        <el-icon><component :is="icon" /></el-icon>
      </div>
      <span class="section-title">{{ title || item?.processDefinitionName || '未命名流程' }}</span>
      <el-tag
        v-if="item?.processStatus"
        :type="getStatusType(item.processStatus)"
        size="small"
        effect="light"
        round
        class="status-tag"
      >
        {{ getStatusLabel(item.processStatus) }}
      </el-tag>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">流程名称</span>
        <span class="info-value">{{ item?.processDefinitionName || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">申请人</span>
        <span class="info-value">{{ item?.createByName || item?.createBy || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">主键 ID</span>
        <span class="info-value">{{ item?.id ?? '-' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">流程定义 ID</span>
        <span class="info-value">{{ item?.processDefinitionId ?? '-' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">创建时间</span>
        <span class="info-value">{{ item?.createTime || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">更新时间</span>
        <span class="info-value">{{ item?.updateTime || '-' }}</span>
      </div>
      <div class="info-item full">
        <span class="info-label">引擎实例 ID</span>
        <span class="info-value mono">{{ item?.processInstanceId || '-' }}</span>
      </div>
      <div v-if="item?.taskId" class="info-item full">
        <span class="info-label">当前任务 ID</span>
        <span class="info-value mono">{{ item.taskId }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

const props = defineProps<{
  item: any | null
  icon: Component
  iconBg?: string
  title?: string
}>()

const STATUS_MAP: Record<
  string,
  { label: string; type: 'info' | 'primary' | 'success' | 'warning' | 'danger' }
> = {
  '0': { label: '草稿', type: 'info' },
  '1': { label: '审批中', type: 'primary' },
  '10': { label: '已完成', type: 'success' },
  '11': { label: '已终止', type: 'danger' },
  '20': { label: '已挂起', type: 'warning' },
  '21': { label: '待办', type: 'warning' },
}

const getStatusLabel = (status: string) => STATUS_MAP[status]?.label ?? status ?? '未知'
const getStatusType = (status: string) => STATUS_MAP[status]?.type ?? 'info'
</script>

<style scoped lang="scss">
.process-instance-base-info {
  background: var(--bg-container);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  margin-bottom: 24px;

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

      .el-icon {
        font-size: 18px;
        color: var(--text-on-brand);
      }
    }

    .section-title {
      font-size: var(--fs-xl);
      font-weight: var(--fw-semibold);
      color: var(--text-primary);
    }

    .status-tag {
      margin-left: auto;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 24px;

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      &.full {
        grid-column: 1 / -1;
      }

      .info-label {
        font-size: var(--fs-sm);
        color: var(--text-secondary);
      }

      .info-value {
        font-size: var(--fs-md);
        color: var(--text-primary);
        word-break: break-all;

        &.mono {
          font-family: 'Courier New', monospace;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .process-instance-base-info {
    padding: 16px;

    .info-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
