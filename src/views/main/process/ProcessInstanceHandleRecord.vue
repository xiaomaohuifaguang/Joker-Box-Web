<template>
  <div class="process-handle-record">
    <div
      class="section-header"
      :class="{ clickable: collapsible !== false }"
      role="button"
      tabindex="0"
      :aria-expanded="expanded"
      @click="toggleExpanded"
      @keydown.enter.space.prevent="toggleExpanded"
    >
      <div class="section-icon record">
        <el-icon>
          <Timer />
        </el-icon>
      </div>
      <span class="section-title">流程处理记录</span>

      <!-- 视图切换（仅当有时间线数据时显示） -->
      <div v-if="hasTimeline" class="view-switch" @click.stop>
        <button
          :class="['switch-btn', { active: viewMode === 'timeline' }]"
          @click="setViewMode('timeline')"
        >
          时间线
        </button>
        <button
          :class="['switch-btn', { active: viewMode === 'record' }]"
          @click="setViewMode('record')"
        >
          记录
        </button>
      </div>

      <el-icon class="expand-icon">
        <component :is="expanded ? ArrowUp : ArrowDown" />
      </el-icon>
    </div>

    <div v-show="expanded">
      <!-- 空状态 -->
      <div v-if="(viewMode === 'timeline' ? !effectiveTimeline.length : !effectiveRecords.length)" class="empty-state">
        <el-icon>
          <DocumentDelete />
        </el-icon>
        <span>暂无处理记录</span>
      </div>

      <!-- 时间线视图 -->
      <div v-else-if="viewMode === 'timeline'" class="timeline-list">
        <div
          v-for="(node, nodeIndex) in effectiveTimeline"
          :key="node.nodeId ?? nodeIndex"
          class="timeline-item"
        >
          <div class="timeline-line">
            <div class="timeline-dot" :class="node.nodeStatus"></div>
            <div v-if="nodeIndex < effectiveTimeline.length - 1" class="timeline-bar"></div>
          </div>
          <div class="timeline-card">
            <div class="timeline-header">
              <span class="timeline-node-name">{{ node.nodeName || '-' }}</span>
              <el-tag
                :type="getNodeStatusType(node.nodeStatus)"
                size="small"
                effect="light"
                round
              >
                {{ getNodeStatusLabel(node.nodeStatus) }}
              </el-tag>
            </div>
            <!-- 节点内的处理记录 -->
            <div v-if="node.handlers && node.handlers.length > 0" class="timeline-handlers">
              <div
                v-for="(handler, hIndex) in node.handlers"
                :key="handler.id ?? hIndex"
                class="handler-item"
              >
                <div class="handler-header">
                  <span class="handler-user">{{ handler.handleUserName || handler.handleUser || '-' }}</span>
                  <el-tag
                    :type="handler.handleType ? getHandleTypeType(handler.handleType) : (handler.taskId && !handler.handleTime ? 'primary' : 'info')"
                    size="small"
                    effect="light"
                    round
                  >
                    {{ handler.handleType ? getHandleTypeLabel(handler.handleType) : (handler.taskId && !handler.handleTime ? '处理中' : '-') }}
                  </el-tag>
                </div>
                <div v-if="handler.remark" class="handler-remark">{{ handler.remark }}</div>
                <div class="handler-time">{{ handler.handleTime || '-' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 记录视图 -->
      <div v-else class="record-list">
        <div
          v-for="(record, index) in effectiveRecords"
          :key="record.id ?? index"
          class="record-item"
        >
          <div class="record-line">
            <div class="record-dot"></div>
            <div v-if="index < effectiveRecords.length - 1" class="record-bar"></div>
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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

interface TimelineNode {
  nodeId?: string
  nodeName?: string
  round?: number
  nodeStatus?: string
  startTime?: string
  endTime?: string
  handlers?: HandleRecord[]
}

const props = defineProps<{
  records: HandleRecord[] | null | undefined
  timeline?: TimelineNode[] | null | undefined
  collapsible?: boolean
}>()

const expanded = ref(true)
const viewMode = ref<'timeline' | 'record'>('timeline')

const hasTimeline = computed(() => !!props.timeline && props.timeline.length > 0)
const effectiveRecords = computed(() => props.records ?? [])
const effectiveTimeline = computed(() => props.timeline ?? [])

const toggleExpanded = () => {
  if (props.collapsible !== false) {
    expanded.value = !expanded.value
  }
}

const setViewMode = (mode: 'timeline' | 'record') => {
  viewMode.value = mode
}

const HANDLE_TYPE_MAP: Record<string, { label: string; type: 'info' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  'apply': { label: '申请', type: 'primary' },
  'pass': { label: '通过', type: 'success' },
  'reject': { label: '拒绝', type: 'danger' },
  'transfer': { label: '转办', type: 'primary' },
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

const NODE_STATUS_MAP: Record<string, { label: string; type: 'info' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  'completed': { label: '已完成', type: 'success' },
  'active': { label: '进行中', type: 'primary' },
}

const getNodeStatusLabel = (status: string | undefined) => {
  if (!status) return '-'
  return NODE_STATUS_MAP[status]?.label || status
}

const getNodeStatusType = (status: string | undefined) => {
  if (!status) return 'info'
  return NODE_STATUS_MAP[status]?.type || 'info'
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

  // 视图切换
  .view-switch {
    display: flex;
    align-items: center;
    gap: 0;
    margin-left: auto;
    margin-right: 12px;
    background: var(--bg-overlay);
    border-radius: var(--radius-pill);
    padding: 2px;
    border: 1px solid var(--border-light);

    .switch-btn {
      padding: 4px 12px;
      border: none;
      background: transparent;
      border-radius: var(--radius-pill);
      font-size: var(--fs-sm);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-out);

      &.active {
        background: var(--bg-container);
        color: var(--brand-primary);
        font-weight: var(--fw-semibold);
        box-shadow: var(--shadow-sm);
      }

      &:hover:not(.active) {
        color: var(--text-primary);
      }
    }
  }

  // 时间线视图
  .timeline-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .timeline-item {
    display: flex;
    gap: 16px;

    .timeline-line {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 20px;
      flex-shrink: 0;
      padding-top: 8px;

      .timeline-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--brand-primary);
        border: 2px solid var(--bg-container);
        box-shadow: 0 0 0 2px var(--brand-primary);

        &.active {
          background: var(--brand-primary);
          box-shadow: 0 0 0 2px var(--brand-primary), 0 0 0 6px var(--brand-primary-alpha);
          animation: pulse 2s infinite;
        }

        &.completed {
          background: #10b981;
          box-shadow: 0 0 0 2px #10b981;
        }
      }

      .timeline-bar {
        width: 2px;
        flex: 1;
        min-height: 24px;
        background: var(--border-light);
        margin-top: 8px;
      }
    }

    .timeline-card {
      flex: 1;
      padding-bottom: 24px;

      .timeline-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 6px;

        .timeline-node-name {
          font-size: var(--fs-md);
          font-weight: var(--fw-semibold);
          color: var(--text-primary);
        }
      }

      .timeline-handlers {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .handler-item {
          background: var(--bg-overlay);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 12px 14px;

          .handler-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 6px;

            .handler-user {
              font-size: var(--fs-sm);
              font-weight: var(--fw-semibold);
              color: var(--text-primary);
            }
          }

          .handler-remark {
            font-size: var(--fs-sm);
            color: var(--text-primary);
            margin-bottom: 6px;
            word-break: break-all;
          }

          .handler-time {
            font-size: 12px;
            color: var(--text-secondary);
            font-family: 'Courier New', monospace;
          }
        }
      }
    }

    &:last-child .timeline-card {
      padding-bottom: 0;
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 2px var(--brand-primary), 0 0 0 6px var(--brand-primary-alpha);
  }
  50% {
    box-shadow: 0 0 0 2px var(--brand-primary), 0 0 0 10px transparent;
  }
  100% {
    box-shadow: 0 0 0 2px var(--brand-primary), 0 0 0 6px var(--brand-primary-alpha);
  }
}

@media (max-width: 768px) {
  .process-handle-record {
    padding: 16px;
  }
}
</style>
