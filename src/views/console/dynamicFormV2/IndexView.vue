<template>
  <div class="dfv2-list-page">
    <!-- 页面头部 -->
    <PageHeader :icon="Document" title="动态表单管理" description="管理系统动态表单模板" />

    <div class="page-container">
      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="section-header">
          <div class="header-icon search">
            <el-icon><Search /></el-icon>
          </div>
          <span class="header-title">筛选条件</span>
        </div>
        <div class="search-form">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-input
                v-model="queryParam.search"
                placeholder="请输入表单名称搜索"
                clearable
                @keyup.enter="queryPage"
                @clear="queryPage"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-select
                v-model="queryParam.status"
                placeholder="选择状态"
                clearable
                @change="queryPage"
              >
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="12" class="search-actions">
              <el-button type="primary" @click="queryPage">
                <el-icon><Search /></el-icon>
                <span>搜索</span>
              </el-button>
              <el-button @click="resetQuery">
                <el-icon><RefreshRight /></el-icon>
                <span>重置</span>
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 操作栏 + 表格 -->
      <div class="table-section" v-loading="loading" element-loading-text="加载中...">
        <div class="section-header">
          <div class="header-icon table">
            <el-icon><List /></el-icon>
          </div>
          <span class="header-title">表单列表</span>
          <span class="header-count">共 {{ pageInfo.total }} 条</span>
          <el-button
            type="primary"
            class="header-action-btn"
            @click="createVisible = true"
          >
            <el-icon><Plus /></el-icon>
            <span>新建表单</span>
          </el-button>
        </div>

        <div class="table-wrapper">
          <el-table :data="tableData" stripe style="width: 100%">
            <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="version" label="版本" width="80" align="center" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="scope">
                <el-tag :type="FORM_STATUS_TAG_TYPES[scope.row.status as FormStatusValue]" size="small">
                  {{ FORM_STATUS_LABELS[scope.row.status as FormStatusValue] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createBy" label="创建人" width="120" />
            <el-table-column prop="createTime" label="创建时间" width="170" show-overflow-tooltip />
            <el-table-column label="操作" fixed="right" width="260" align="center">
              <template #default="scope">
                <div class="action-buttons">
                  <el-button type="primary" link size="small" @click="openEdit(scope.row.id)">
                    <el-icon><Edit /></el-icon>
                    <span>编辑</span>
                  </el-button>
                  <el-button
                    v-if="scope.row.status === FORM_STATUS.DRAFT"
                    type="success"
                    link
                    size="small"
                    @click="handleDeploy(scope.row.id)"
                  >
                    <el-icon><Promotion /></el-icon>
                    <span>发布</span>
                  </el-button>
                  <el-button
                    v-else-if="scope.row.status === FORM_STATUS.PUBLISHED"
                    type="warning"
                    link
                    size="small"
                    @click="handleStop(scope.row.id)"
                  >
                    <el-icon><VideoPause /></el-icon>
                    <span>停用</span>
                  </el-button>
                  <el-button
                    v-else-if="scope.row.status === FORM_STATUS.STOPPED"
                    type="success"
                    link
                    size="small"
                    @click="handleDeploy(scope.row.id)"
                  >
                    <el-icon><Promotion /></el-icon>
                    <span>发布</span>
                  </el-button>
                  <el-button type="info" link size="small" @click="openDetail(scope.row.id)">
                    <el-icon><View /></el-icon>
                    <span>详情</span>
                  </el-button>
                  <el-button type="danger" link size="small" @click="handleDelete(scope.row.id)">
                    <el-icon><Delete /></el-icon>
                    <span>删除</span>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pageInfo.current"
            v-model:page-size="pageInfo.size"
            :total="pageInfo.total"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 新建弹窗 -->
    <FormCreateDialog v-model="createVisible" @success="onSuccess" />

    <!-- 编辑弹窗 -->
    <FormEditDialog v-model="editVisible" :form-id="currentFormId" @success="onSuccess" />

    <!-- 详情弹窗 -->
    <FormDetailDialog
      v-model="detailVisible"
      :form-id="currentFormId"
      @edit="handleDetailEdit"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Search,
  RefreshRight,
  List,
  Plus,
  Edit,
  Delete,
  View,
  Promotion,
  VideoPause,
  Document,
} from '@element-plus/icons-vue'
import { http, confirm, alert } from '@/utils'
import { onMounted, ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import {
  FORM_STATUS,
  FORM_STATUS_LABELS,
  FORM_STATUS_TAG_TYPES,
} from '@/components/dynamicFormV2/constants'
import type { FormStatusValue } from '@/components/dynamicFormV2/constants'
import FormCreateDialog from './FormCreateDialog.vue'
import FormEditDialog from './FormEditDialog.vue'
import FormDetailDialog from './FormDetailDialog.vue'

// ============================================
// 类型定义
// ============================================
interface FormListItem {
  id: string
  name: string
  description: string
  version: number
  status: FormStatusValue
  createBy: string
  createTime: string
}

interface PageResult {
  records: FormListItem[]
  current: number
  size: number
  total: number
  pages: number
}

// ============================================
// 状态
// ============================================
const loading = ref(false)
const tableData = ref<FormListItem[]>([])

const queryParam = ref({
  search: '',
  status: '' as FormStatusValue | '',
})

const pageInfo = ref({
  current: 1,
  size: 10,
  total: 0,
  pages: 0,
})

const statusOptions = [
  { label: '草稿', value: FORM_STATUS.DRAFT },
  { label: '已发布', value: FORM_STATUS.PUBLISHED },
  { label: '已停用', value: FORM_STATUS.STOPPED },
]

// 弹窗/抽屉状态
const createVisible = ref(false)
const editVisible = ref(false)
const detailVisible = ref(false)
const currentFormId = ref('')

// ============================================
// 查询
// ============================================
const queryPage = async () => {
  loading.value = true
  try {
    const result: PageResult = await http.post('/dynamicForm/queryPage', {
      current: pageInfo.value.current,
      size: pageInfo.value.size,
      search: queryParam.value.search,
      status: queryParam.value.status || undefined,
    })
    tableData.value = result.records
    pageInfo.value.current = result.current
    pageInfo.value.size = result.size
    pageInfo.value.total = result.total
    pageInfo.value.pages = result.pages
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryParam.value = {
    search: '',
    status: '',
  }
  pageInfo.value.current = 1
  queryPage()
}

const handleSizeChange = (size: number) => {
  pageInfo.value.size = size
  queryPage()
}

const handleCurrentChange = () => {
  queryPage()
}

// ============================================
// 弹窗/抽屉操作
// ============================================
const openEdit = (id: string) => {
  currentFormId.value = id
  editVisible.value = true
}

const openDetail = (id: string) => {
  currentFormId.value = id
  detailVisible.value = true
}

const handleDetailEdit = (id: string) => {
  // 详情弹窗点击编辑后，打开编辑抽屉
  currentFormId.value = id
  editVisible.value = true
}

const onSuccess = () => {
  // 保存成功后刷新列表
  queryPage()
}

// ============================================
// 操作
// ============================================
const handleDeploy = async (formId: string) => {
  try {
    await http.post('/dynamicForm/deploy', undefined, { params: { formId } })
    alert('发布成功', 'success')
    queryPage()
  } catch {
    // http interceptor handles error
  }
}

const handleStop = async (formId: string) => {
  try {
    await http.post('/dynamicForm/stop', undefined, { params: { formId } })
    alert('停用成功', 'success')
    queryPage()
  } catch {
    // http interceptor handles error
  }
}

const handleDelete = (id: string) => {
  confirm('提示', '确定删除该表单吗？删除后不可恢复。', async () => {
    try {
      await http.post('/dynamicForm/remove', { id })
      alert('删除成功', 'success')
      queryPage()
    } catch {
      // http interceptor handles error
    }
  })
}

onMounted(() => {
  queryPage()
})
</script>

<style scoped lang="scss">
.dfv2-list-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-elevated) 100%);

  .page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px 40px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .header-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.search {
        background: var(--brand-gradient);
      }

      &.table {
        background: var(--data-grad-3);
      }

      .el-icon {
        font-size: 18px;
        color: white;
      }
    }

    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .header-count {
      margin-left: auto;
      font-size: 14px;
      color: var(--text-secondary);
      background: var(--bg-overlay);
      padding: 4px 12px;
      border-radius: 20px;
    }

    .header-action-btn {
      margin-left: 16px;
      height: 36px;
    }
  }

  .search-section {
    background: var(--bg-container);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    margin-bottom: 24px;

    .search-form {
      .search-actions {
        display: flex;
        gap: 12px;

        .el-button {
          height: 40px;

          &:first-child {
            background: var(--brand-gradient);
            border: none;
          }
        }
      }
    }
  }

  .table-section {
    background: var(--bg-container);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);

    .table-wrapper {
      margin-bottom: 20px;

      :deep(.el-table) {
        border-radius: 12px;
        overflow: hidden;

        .el-table__header th {
          background: var(--bg-overlay);
          font-weight: 600;
          color: var(--text-primary);
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 4px 8px;
        }
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding-top: 20px;
      border-top: 1px solid var(--border-light);
    }
  }
}

@media (max-width: 768px) {
  .dfv2-list-page {
    .page-container {
      padding: 0 16px 24px;
    }

    .search-section,
    .table-section {
      padding: 16px;
    }

    .search-form {
      .search-actions {
        margin-top: 12px;

        .el-button {
          flex: 1;
        }
      }
    }
  }
}
</style>
