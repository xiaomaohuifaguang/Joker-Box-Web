<template>
  <div class="console-home-page">
    <!-- 页面头部 -->
    <PageHeader :icon="Monitor" title="控制台首页" :description="`欢迎回来，${greeting}！这是您的系统概览`">
      <template #extra>
        <div class="header-time">
          <el-icon><Clock /></el-icon>
          <span>{{ currentTime }}</span>
        </div>
      </template>
    </PageHeader>

    <div class="page-container">
      <!-- 统计卡片区域 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" :lg="6" v-for="(stat, index) in statsData" :key="index">
            <el-card class="stat-card" :class="stat.type">
              <div class="stat-content">
                <div class="stat-icon-wrapper">
                  <el-icon class="stat-icon">
                    <component :is="stat.icon" />
                  </el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
              <div class="stat-footer">
                <span :class="['stat-change', stat.trend > 0 ? 'up' : 'down']">
                  <el-icon><ArrowUp v-if="stat.trend > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(stat.trend) }}%
                </span>
                <span class="stat-period">较上周</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 快捷入口与最近动态 -->
      <div class="main-content">
        <el-row :gutter="20">
          <!-- 系统状态 -->
          <el-col :xs="24" :sm="24" :md="16" :lg="16">
            <el-card class="section-card system-status">
              <template #header>
                <div class="card-header">
                  <div class="header-left">
                    <div class="header-icon green">
                      <el-icon><Cpu /></el-icon>
                    </div>
                    <span>系统状态</span>
                  </div>
                  <el-tag type="success" size="small" effect="light">运行正常</el-tag>
                </div>
              </template>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="12" :lg="12">
                  <div class="status-item">
                    <div class="status-label">服务器负载</div>
                    <el-progress :percentage="32" :color="statusColors" :stroke-width="10" />
                  </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12">
                  <div class="status-item">
                    <div class="status-label">内存使用</div>
                    <el-progress :percentage="58" :color="statusColors" :stroke-width="10" />
                  </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12">
                  <div class="status-item">
                    <div class="status-label">磁盘空间</div>
                    <el-progress :percentage="76" :color="statusColors" :stroke-width="10" />
                  </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12">
                  <div class="status-item">
                    <div class="status-label">数据库连接</div>
                    <el-progress :percentage="12" :color="statusColors" :stroke-width="10" />
                  </div>
                </el-col>
              </el-row>
            </el-card>
          </el-col>

          <!-- 最近动态 -->
          <el-col :xs="24" :sm="24" :md="8" :lg="8">
            <el-card class="section-card recent-activities">
              <template #header>
                <div class="card-header">
                  <div class="header-left">
                    <div class="header-icon orange">
                      <el-icon><Bell /></el-icon>
                    </div>
                    <span>最近动态</span>
                  </div>
                </div>
              </template>
              <div class="activity-list">
                <div v-for="(activity, index) in activities" :key="index" class="activity-item">
                  <div class="activity-dot" :class="activity.type"></div>
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-desc">{{ activity.desc }}</div>
                    <div class="activity-time">{{ activity.time }}</div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 待办事项 -->
            <el-card class="section-card todo-list">
              <template #header>
                <div class="card-header">
                  <div class="header-left">
                    <div class="header-icon purple">
                      <el-icon><List /></el-icon>
                    </div>
                    <span>待办事项</span>
                  </div>
                  <el-badge :value="pendingTodos.length" type="primary" />
                </div>
              </template>
              <div class="todo-items">
                <div v-for="(todo, index) in todos" :key="index" class="todo-item" :class="{ done: todo.done }" @click="toggleTodo(index)">
                  <div class="todo-checkbox">
                    <el-icon v-if="todo.done"><Check /></el-icon>
                  </div>
                  <span class="todo-text">{{ todo.text }}</span>
                  <el-tag :type="todo.priority" size="small" effect="light">{{ priorityLabel(todo.priority) }}</el-tag>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import PageHeader from '@/components/common/PageHeader.vue';
import {
  Monitor, Clock, User, Document,
  ArrowUp, ArrowDown, Cpu, Bell, List,
  Check, Connection
} from '@element-plus/icons-vue';

// 问候语
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 11) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
};
const greeting = ref(getGreeting());

// 当前时间
const currentTime = ref('');
let timeTimer: ReturnType<typeof setInterval> | null = null;

const updateTime = () => {
  const now = new Date();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  currentTime.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// 统计数据
const statsData = ref([
  { label: '用户总数', value: 1286, trend: 12.5, icon: User, type: 'primary' },
  { label: '表单数量', value: 48, trend: 8.3, icon: Document, type: 'success' },
  { label: 'AI 模型', value: 6, trend: -2.1, icon: Cpu, type: 'warning' },
  { label: 'API 接口', value: 156, trend: 23.7, icon: Connection, type: 'info' }
]);

// 状态进度条颜色
const statusColors = [
  { color: '#22D3EE', percentage: 30 },
  { color: '#A855F7', percentage: 60 },
  { color: '#EC4899', percentage: 80 },
  { color: '#F43F5E', percentage: 100 }
];

// 最近动态
const activities = ref([
  { title: '新用户注册', desc: '用户 admin 刚刚注册', time: '5分钟前', type: 'success' },
  { title: '表单提交', desc: '动态表单 "入职申请" 收到新提交', time: '30分钟前', type: 'primary' },
  { title: '系统更新', desc: '系统已自动备份完成', time: '2小时前', type: 'info' },
  { title: 'AI 对话', desc: 'AI 模型 gpt-4 调用次数达到阈值', time: '昨天', type: 'warning' },
  { title: '角色变更', desc: '角色 "管理员" 权限已更新', time: '昨天', type: 'primary' }
]);

// 待办事项
const todos = ref([
  { text: '审核新用户申请', priority: 'danger', done: false },
  { text: '更新系统提示词模板', priority: 'warning', done: false },
  { text: '检查 API 接口性能', priority: 'info', done: true },
  { text: '备份数据库', priority: 'success', done: true },
  { text: '优化表单联动规则', priority: 'warning', done: false }
]);

const pendingTodos = ref(todos.value.filter(t => !t.done));

const priorityLabel = (priority: string) => {
  const map: Record<string, string> = { danger: '紧急', warning: '重要', info: '一般', success: '低' };
  return map[priority] || '一般';
};

const toggleTodo = (index: number) => {
  todos.value[index].done = !todos.value[index].done;
  pendingTodos.value = todos.value.filter(t => !t.done);
};

onMounted(() => {
  updateTime();
  timeTimer = setInterval(updateTime, 60000);
});

onBeforeUnmount(() => {
  if (timeTimer) clearInterval(timeTimer);
});
</script>

<style scoped lang="scss">
.console-home-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-elevated) 100%);

  .header-time {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    color: var(--text-on-brand);
    font-size: 14px;

    .el-icon {
      font-size: 16px;
    }
  }

  .page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px 40px;
  }

  .stats-section {
    margin-bottom: 24px;

    .el-col {
      margin-bottom: 20px;
    }
  }

  .stat-card {
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    transition: transform var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out);

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;

      .stat-icon {
        font-size: 28px;
      }
    }

    &.primary .stat-icon-wrapper {
      background: var(--brand-gradient-soft);
      color: var(--brand-primary);
    }

    &.success .stat-icon-wrapper {
      background: var(--success-bg);
      color: var(--success);
    }

    &.warning .stat-icon-wrapper {
      background: var(--warning-bg);
      color: var(--warning);
    }

    &.info .stat-icon-wrapper {
      background: var(--info-bg);
      color: var(--info);
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.2;
      }

      .stat-label {
        font-size: 14px;
        color: var(--text-secondary);
        margin-top: 4px;
      }
    }

    .stat-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid var(--border-light);

      .stat-change {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        font-weight: 600;

        &.up {
          color: var(--success);
        }

        &.down {
          color: var(--danger);
        }

        .el-icon {
          font-size: 12px;
        }
      }

      .stat-period {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }

  .section-card {
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    margin-bottom: 20px;

    :deep(.el-card__header) {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-light);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .header-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.blue {
        background: var(--brand-gradient);
      }

      &.green {
        background: var(--success-bg);
      }

      &.orange {
        background: var(--warning-bg);
      }

      &.purple {
        background: var(--brand-gradient-soft);
      }

      .el-icon {
        font-size: 18px;
        color: var(--text-on-brand);
      }
    }

    .header-icon.green .el-icon {
      color: var(--success);
    }

    .header-icon.orange .el-icon {
      color: var(--warning);
    }

    .header-icon.purple .el-icon {
      color: var(--brand-primary);
    }
  }

  .system-status {
    .status-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .status-label {
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 8px;
      }
    }

    :deep(.el-progress__text) {
      font-size: 12px;
      font-weight: 600;
    }
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .activity-item {
    display: flex;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid var(--border-light);

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    &:first-child {
      padding-top: 0;
    }

    .activity-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;

      &.success {
        background: var(--success);
      }

      &.primary {
        background: var(--brand-primary);
      }

      &.info {
        background: var(--info);
      }

      &.warning {
        background: var(--warning);
      }
    }

    .activity-content {
      flex: 1;

      .activity-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 4px;
      }

      .activity-desc {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 4px;
      }

      .activity-time {
        font-size: 11px;
        color: var(--text-disabled);
      }
    }
  }

  .todo-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .todo-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    background: var(--bg-overlay);
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-out);

    &:hover {
      background: var(--bg-overlay-strong);
    }

    &.done {
      .todo-text {
        text-decoration: line-through;
        color: var(--text-disabled);
      }

      .todo-checkbox {
        background: var(--success);
        border-color: var(--success);
        color: #fff;
      }
    }

    .todo-checkbox {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 2px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all var(--duration-normal) var(--ease-out);

      .el-icon {
        font-size: 12px;
      }
    }

    .todo-text {
      flex: 1;
      font-size: 14px;
      color: var(--text-primary);
      transition: color var(--duration-normal) var(--ease-out);
    }
  }
}

@media (max-width: 768px) {
  .console-home-page {
    .page-container {
      padding: 0 16px 24px;
    }

    .stat-card {
      .stat-content {
        .stat-value {
          font-size: 24px;
        }
      }
    }

  }
}
</style>
