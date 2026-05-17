<template>
  <div class="process-approval-page">
    <!-- 页面头部 -->
    <PageHeader :icon="Tickets" title="就酱审" description="处理待办任务、跟进流程进度">
      <template #extra>
        <div class="header-actions">
          <div class="stat-item">
            <span class="stat-value">{{ pageInfo.total }}</span>
            <span class="stat-label">{{ activeTab.label }}</span>
          </div>
          <el-button class="create-btn" size="large" @click="openCreate">
            <el-icon>
              <Plus />
            </el-icon>
            <span>发起流程</span>
          </el-button>
        </div>
      </template>
    </PageHeader>

    <div class="page-container">
      <!-- 分类标签 -->
      <div class="tabs-section">
        <div v-for="tab in tabs" :key="tab.type" :class="['tab-item', { active: queryParam.type === tab.type }]"
          @click="switchTab(tab.type)">
          <div class="tab-icon" :style="{ background: tab.bg }">
            <el-icon>
              <component :is="tab.icon" />
            </el-icon>
          </div>
          <div class="tab-text">
            <div class="tab-label-row">
              <span class="tab-label">{{ tab.label }}</span>
              <span v-if="tabCounts[tab.type] > 0" class="tab-count">{{ tabCounts[tab.type] }}</span>
            </div>
            <span class="tab-desc">{{ tab.desc }}</span>
          </div>
        </div>
      </div>

      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="section-header">
          <div class="header-icon search">
            <el-icon>
              <Search />
            </el-icon>
          </div>
          <span class="header-title">筛选条件</span>
        </div>
        <div class="search-form">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="16" :md="18" :lg="18">
              <el-input v-model="queryParam.search" placeholder="搜索流程名称、申请人..." size="large" clearable
                @keyup.enter="handleSearch" @clear="handleSearch">
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="8" :md="6" :lg="6" class="search-actions">
              <el-button type="primary" size="large" @click="handleSearch" class="search-btn">
                <el-icon>
                  <Search />
                </el-icon>
                <span>搜索</span>
              </el-button>
              <el-button size="large" @click="resetQuery">
                <el-icon>
                  <Refresh />
                </el-icon>
                <span>重置</span>
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 列表区域 -->
      <div class="list-section" v-loading="loading" element-loading-text="加载中...">
        <div class="section-header">
          <div class="header-icon list">
            <el-icon>
              <List />
            </el-icon>
          </div>
          <span class="header-title">流程列表</span>
          <span class="header-count">共 {{ pageInfo.total }} 条</span>
          <div class="header-right">
            <el-button link @click="queryPage">
              <el-icon>
                <Refresh />
              </el-icon>
              <span>刷新</span>
            </el-button>
          </div>
        </div>

        <div class="list-wrapper">
          <div v-for="item in tableData" :key="item.id" class="process-card" @click="openDetail(item)">
            <div class="card-icon" :style="{ background: getIconBg(item) }">
              <el-icon>
                <Document />
              </el-icon>
            </div>
            <div class="card-main">
              <div class="card-title-row">
                <span class="card-title">{{ item.title || item.processDefinitionName || '未命名流程' }}</span>
                <el-tag :type="getStatusType(item.processStatus)" size="small" effect="light" round>
                  {{ getStatusLabel(item.processStatus) }}
                </el-tag>
              </div>
              <div class="card-meta">
                <span v-if="item.code" class="meta-item id-item">
                  <el-icon>
                    <Link />
                  </el-icon>
                  {{ item.code }}
                </span>
                <span class="meta-item">
                  <el-icon>
                    <UserFilled />
                  </el-icon>
                  申请人：{{ item.createByName || item.createBy || '-' }}
                </span>
                <span v-if="item.taskName" class="meta-item">
                  <el-icon>
                    <Document />
                  </el-icon>
                  任务：{{ item.taskName }}
                </span>
                <span class="meta-item">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  创建：{{ item.createTime || '-' }}
                </span>
                <span v-if="item.updateTime && item.updateTime !== item.createTime" class="meta-item">
                  <el-icon>
                    <Timer />
                  </el-icon>
                  更新：{{ item.updateTime }}
                </span>
                <span v-if="item.processInstanceId" class="meta-item id-item">
                  <el-icon>
                    <Link />
                  </el-icon>
                  {{ shortId(item.processInstanceId) }}
                </span>
              </div>
            </div>
            <div class="card-actions" @click.stop>
              <!-- 待办 -->
              <el-button v-if="queryParam.type === '2'" type="primary" size="small" @click="handleProcess(item)">
                <el-icon>
                  <Promotion />
                </el-icon>
                <span>处理</span>
              </el-button>
              <!-- 待认领 -->
              <el-button v-if="queryParam.type === '3'" type="success" size="small" @click="handleClaim(item)">
                <el-icon>
                  <Pointer />
                </el-icon>
                <span>认领</span>
              </el-button>
              <!-- 草稿 -->
              <template v-if="queryParam.type === '0'">
                <el-button type="primary" size="small" @click="handleEdit(item)">
                  <el-icon>
                    <Edit />
                  </el-icon>
                  <span>编辑</span>
                </el-button>
                <el-button type="danger" size="small" @click="confirmDelete(item)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  <span>删除</span>
                </el-button>
              </template>
              <!-- 详情按钮（所有类型可见） -->
              <el-button size="small" @click="openDetail(item)">
                <el-icon>
                  <View />
                </el-icon>
                <span>详情</span>
              </el-button>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && tableData.length === 0" class="empty-state">
            <div class="empty-icon">
              <el-icon>
                <DocumentDelete />
              </el-icon>
            </div>
            <h3>{{ emptyTitle }}</h3>
            <p>{{ emptyDesc }}</p>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="tableData.length > 0" class="pagination-wrapper">
          <el-pagination v-model:current-page="pageInfo.current" :page-size="pageInfo.size" :total="pageInfo.total"
            layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 50, 100]"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>

    <ProcessInstanceDetailDialog ref="detailDialogRef" @success="queryPage" />
    <ProcessInstanceClaimDialog ref="claimDialogRef" @success="queryPage" />
    <ProcessInstanceCreateDialog ref="createDialogRef" @select="handleStart" />
    <ProcessInstanceStartDialog ref="startDialogRef" @success="onStartSuccess" @saved="onDraftSaved" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  Tickets, Search, Refresh, List, Document, UserFilled, Clock, Timer, Link,
  Edit, Delete, View, Pointer, DocumentDelete, Promotion,
  BellFilled, Memo, Files, Plus,
} from '@element-plus/icons-vue'
import { http, alert, confirm } from '@/utils'
import PageHeader from '@/components/common/PageHeader.vue'
import ProcessInstanceDetailDialog from './ProcessInstanceDetailDialog.vue'
import ProcessInstanceClaimDialog from './ProcessInstanceClaimDialog.vue'
import ProcessInstanceCreateDialog from './ProcessInstanceCreateDialog.vue'
import ProcessInstanceStartDialog from './ProcessInstanceStartDialog.vue'

const tabs = [
  {
    type: '2',
    label: '待办',
    desc: '需要我审批的任务',
    icon: BellFilled,
    bg: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
  },
  {
    type: '3',
    label: '待认领',
    desc: '可由我认领的任务',
    icon: Promotion,
    bg: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
  },
  {
    type: '0',
    label: '草稿',
    desc: '我创建未提交的草稿',
    icon: Memo,
    bg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  {
    type: '1',
    label: '全部',
    desc: '我参与的所有流程',
    icon: Files,
    bg: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  },
] as const

const loading = ref(false)
const tableData = ref<any[]>([])

const queryParam = ref({
  type: '2',
  search: '',
})

const pageInfo = ref({
  current: 1,
  size: 10,
  total: 0,
})

const tabCounts = ref<Record<string, number>>({
  '0': 0,
  '1': 0,
  '2': 0,
  '3': 0,
})

const detailDialogRef = ref<InstanceType<typeof ProcessInstanceDetailDialog> | null>(null)
const claimDialogRef = ref<InstanceType<typeof ProcessInstanceClaimDialog> | null>(null)
const createDialogRef = ref<InstanceType<typeof ProcessInstanceCreateDialog> | null>(null)
const startDialogRef = ref<InstanceType<typeof ProcessInstanceStartDialog> | null>(null)

const activeTab = computed(
  () => tabs.find(t => t.type === queryParam.value.type) ?? tabs[0]
)

const emptyTitle = computed(() => {
  if (queryParam.value.search) return '没有匹配的流程'
  return `暂无${activeTab.value.label}流程`
})

const emptyDesc = computed(() => {
  if (queryParam.value.search) return '换个关键词试试吧'
  const tipMap: Record<string, string> = {
    '2': '当前没有需要您审批的任务',
    '3': '当前没有可认领的任务',
    '0': '您还没有创建草稿',
    '1': '您还没有参与任何流程',
  }
  return tipMap[queryParam.value.type] ?? ''
})

const switchTab = (type: string) => {
  if (queryParam.value.type === type) return
  queryParam.value.type = type
  pageInfo.value.current = 1
  queryPage()
}

const handleSearch = () => {
  pageInfo.value.current = 1
  queryPage()
}

const resetQuery = () => {
  queryParam.value.search = ''
  pageInfo.value.current = 1
  queryPage()
}

const queryPage = async () => {
  loading.value = true
  try {
    const result = await http.post('/processInstance/queryPage', {
      current: pageInfo.value.current,
      size: pageInfo.value.size,
      search: queryParam.value.search,
      type: queryParam.value.type,
    })
    tableData.value = result?.records ?? []
    pageInfo.value.current = result?.current ?? 1
    pageInfo.value.size = result?.size ?? 10
    pageInfo.value.total = result?.total ?? 0
    tabCounts.value[queryParam.value.type] = result?.total ?? 0
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (size: number) => {
  pageInfo.value.size = size
  pageInfo.value.current = 1
  queryPage()
}

const handleCurrentChange = (val: number) => {
  pageInfo.value.current = val
  queryPage()
}

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

const ICON_PALETTE = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
  'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
]

const getIconBg = (item: any) => {
  const id = Number(item?.id ?? 0)
  return ICON_PALETTE[Math.abs(id) % ICON_PALETTE.length]
}

const shortId = (id: string) => (id && id.length > 12 ? id.slice(0, 8) + '…' + id.slice(-4) : id)

const openDetail = (item: any) => {
  detailDialogRef.value?.open(item.id, item.taskId, 'detail')
}

const openCreate = () => {
  createDialogRef.value?.open()
}

const handleStart = (def: any) => {
  startDialogRef.value?.open(def)
}

const onStartSuccess = () => {
  // 切到”全部”页签确保新发起的实例可见
  queryParam.value.type = '1'
  pageInfo.value.current = 1
  queryPage()
}

const onDraftSaved = () => {
  // 草稿保存成功，如果在草稿页签则刷新列表
  if (queryParam.value.type === '0') {
    queryPage()
  }
}

const handleProcess = (item: any) => {
  detailDialogRef.value?.open(item.id, item.taskId, 'handle')
}

const handleClaim = (item: any) => {
  claimDialogRef.value?.open(item.id, item.taskId)
}

const handleEdit = (item: any) => {
  const def = { id: item.processDefinitionId, processName: item.processDefinitionName || '未知流程' }
  startDialogRef.value?.open(def, item.id)
}

const confirmDelete = (item: any) => {
  confirm('提示', `确定删除该草稿（${item.processDefinitionName || item.id}）吗？`, () => {
    alert('草稿删除接口接入后启用', 'warning')
  })
}

onMounted(() => {
  queryPage()
})
</script>

<style scoped lang="scss">
.process-approval-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-elevated) 100%);

  .page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px 40px;
  }

  .tabs-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .tab-item {
      background: var(--bg-container);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      transition: transform var(--duration-normal) var(--ease-out),
        box-shadow var(--duration-normal) var(--ease-out),
        border-color var(--duration-normal) var(--ease-out);
      box-shadow: var(--shadow-sm);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      &.active {
        border-color: transparent;
        box-shadow: var(--shadow-glow);
        background: var(--brand-gradient-soft);

        .tab-text .tab-label {
          color: var(--brand-primary);
        }
      }

      .tab-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .el-icon {
          font-size: 22px;
          color: #fff;
        }
      }

      .tab-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;

        .tab-label-row {
          display: flex;
          align-items: center;
          gap: 8px;

          .tab-label {
            font-size: var(--fs-lg);
            font-weight: var(--fw-semibold);
            color: var(--text-primary);
          }

          .tab-count {
            font-size: 12px;
            font-weight: 600;
            color: #fff;
            background: var(--brand-gradient);
            padding: 1px 8px;
            border-radius: 10px;
            min-width: 18px;
            text-align: center;
          }
        }

        .tab-desc {
          font-size: var(--fs-sm);
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .header-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;

      &.search {
        background: var(--brand-gradient);
      }

      &.list {
        background: var(--data-grad-3);
      }

      .el-icon {
        font-size: 18px;
        color: var(--text-on-brand);
      }
    }

    .header-title {
      font-size: var(--fs-xl);
      font-weight: var(--fw-semibold);
      color: var(--text-primary);
    }

    .header-count {
      margin-left: 8px;
      font-size: var(--fs-sm);
      color: var(--text-secondary);
      background: var(--bg-overlay);
      padding: 4px 12px;
      border-radius: var(--radius-pill);
    }

    .header-right {
      margin-left: auto;
    }
  }

  .search-section {
    background: var(--bg-container);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    margin-bottom: 24px;

    .search-form {
      .search-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;

        .search-btn {
          background: var(--brand-gradient);
          border: none;
        }

        .el-button {
          flex: 1;
        }
      }
    }
  }

  .list-section {
    background: var(--bg-container);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);

    .list-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 200px;
    }

    .process-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      background: var(--bg-overlay);
      cursor: pointer;
      transition: transform var(--duration-normal) var(--ease-out),
        box-shadow var(--duration-normal) var(--ease-out),
        border-color var(--duration-normal) var(--ease-out);

      &:hover {
        transform: translateY(-2px);
        border-color: var(--brand-primary);
        box-shadow: var(--shadow-md);
      }

      .card-icon {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .el-icon {
          font-size: 26px;
          color: #fff;
        }
      }

      .card-main {
        flex: 1;
        min-width: 0;

        .card-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;

          .card-title {
            font-size: var(--fs-lg);
            font-weight: var(--fw-semibold);
            color: var(--text-primary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
          }
        }

        .card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          font-size: var(--fs-sm);
          color: var(--text-secondary);

          .meta-item {
            display: inline-flex;
            align-items: center;
            gap: 4px;

            .el-icon {
              font-size: 14px;
            }

            &.id-item {
              font-family: 'Courier New', monospace;
              opacity: 0.85;
            }
          }
        }
      }

      .card-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }
    }

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

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding-top: 20px;
      margin-top: 12px;
      border-top: 1px solid var(--border-light);
    }
  }
}

@media (max-width: 1024px) {
  .process-approval-page {
    .tabs-section {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .process-approval-page {
    .page-container {
      padding: 0 16px 24px;
    }

    .tabs-section {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .search-section,
    .list-section {
      padding: 16px;
    }

    .search-form {
      .search-actions {
        margin-top: 12px;
        flex-direction: column;

        .el-button {
          width: 100%;
        }
      }
    }

    .list-section {
      .process-card {
        flex-direction: column;
        align-items: flex-start;

        .card-actions {
          width: 100%;
          flex-wrap: wrap;

          .el-button {
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
