<template>
  <div class="process-instance-info" v-loading="loading" element-loading-text="加载中...">
    <!-- 空状态 -->
    <div v-if="!loading && !info" class="empty-state">
      <div class="empty-icon">
        <el-icon>
          <DocumentDelete />
        </el-icon>
      </div>
      <h3>未查到流程实例</h3>
      <p>该实例可能已被删除或无访问权限</p>
    </div>

    <template v-else-if="info">
      <!-- 基础信息 -->
      <div class="info-section">
        <div class="section-header">
          <div class="section-icon base">
            <el-icon>
              <Tickets />
            </el-icon>
          </div>
          <span class="section-title">基础信息</span>
          <el-tag
            :type="getStatusType(info.processStatus)"
            size="small"
            effect="light"
            round
            class="status-tag"
          >
            {{ getStatusLabel(info.processStatus) }}
          </el-tag>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">流程名称</span>
            <span class="info-value">{{ info.processDefinitionName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">申请人</span>
            <span class="info-value">{{ info.createByName || info.createBy || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">主键 ID</span>
            <span class="info-value">{{ info.id ?? '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">流程定义 ID</span>
            <span class="info-value">{{ info.processDefinitionId ?? '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ info.createTime || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">更新时间</span>
            <span class="info-value">{{ info.updateTime || '-' }}</span>
          </div>
          <div class="info-item full">
            <span class="info-label">引擎实例 ID</span>
            <span class="info-value mono">{{ info.processInstanceId || '-' }}</span>
          </div>
          <div v-if="info.taskId" class="info-item full">
            <span class="info-label">当前任务 ID</span>
            <span class="info-value mono">{{ info.taskId }}</span>
          </div>
        </div>
      </div>

      <!-- 后续扩展区：审批历史 / 表单数据 / 附件 / 评论 等可以在此追加新的 .info-section -->
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Tickets, DocumentDelete } from '@element-plus/icons-vue'
import { http } from '@/utils'

const props = defineProps<{
  id: string | number | null | undefined
}>()

const loading = ref(false)
const info = ref<any | null>(null)

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

const queryInfo = async () => {
  if (props.id === null || props.id === undefined || props.id === '') {
    info.value = null
    return
  }
  loading.value = true
  try {
    info.value = await http.post('/processInstance/info', undefined, {
      params: { id: props.id },
    })
  } finally {
    loading.value = false
  }
}

watch(() => props.id, queryInfo)

onMounted(queryInfo)
</script>

<style scoped lang="scss">
.process-instance-info {
  padding: 24px;
  background: var(--bg-page);
  min-height: 200px;

  .empty-state {
    padding: 60px 20px;
    text-align: center;
    color: var(--text-secondary);

    .empty-icon {
      width: 88px;
      height: 88px;
      margin: 0 auto 16px;
      border-radius: 50%;
      background: var(--bg-overlay);
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon {
        font-size: 40px;
        color: var(--text-secondary);
      }
    }

    h3 {
      margin: 0 0 8px;
      font-size: var(--fs-lg);
      font-weight: var(--fw-semibold);
      color: var(--text-primary);
    }

    p {
      margin: 0;
      font-size: var(--fs-md);
    }
  }

  .info-section {
    background: var(--bg-container);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

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

        &.base {
          background: var(--brand-gradient);
        }

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
}

@media (max-width: 768px) {
  .process-instance-info {
    padding: 16px;

    .info-section {
      padding: 16px;

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
