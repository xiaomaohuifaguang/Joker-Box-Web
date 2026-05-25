<template>
  <div class="processDefinition-management-page">
    <!-- 页面头部 -->
    <PageHeader :icon="Document" title="流程管理" description="管理和维护流程数据" />

    <div class="page-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-wrapper">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/console' }">
            <el-icon>
              <House />
            </el-icon>
            <span>控制台</span>
          </el-breadcrumb-item>
          <el-breadcrumb-item>流程管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 搜索和操作区域 -->
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
            <el-col :xs="24" :sm="18" :md="20" :lg="20">
              <el-input v-model="queryParam.search" placeholder="请输入搜索内容" size="large" clearable
                @keyup.enter="queryPage" @clear="queryPage">
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="6" :md="4" :lg="4" class="search-actions">
              <el-button type="primary" size="large" @click="dialogAdd = true" class="add-button">
                <el-icon>
                  <Plus />
                </el-icon>
                <span>新建</span>
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-section" v-loading="loading" element-loading-text="加载中...">
        <div class="section-header">
          <div class="header-icon table">
            <el-icon>
              <List />
            </el-icon>
          </div>
          <span class="header-title">数据列表</span>
          <span class="header-count">共 {{ pageInfo.total }} 条</span>
        </div>

        <div class="table-wrapper">
          <el-table :data="tableData" stripe style="width: 100%" @selection-change="handleSelectionChange"
            @sort-change="handleSortChange" :default-sort="{ prop: 'createTime', order: 'descending' }">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column prop="id" label="流程id" min-width="150" />
            <!-- <el-table-column prop="processKey" label="流程定义key
ACT_RE_PROCDEF" min-width="150" /> -->
            <el-table-column prop="processName" label="流程名称" min-width="150" />
            <el-table-column prop="processDescription" label="流程描述" min-width="150" />
            <el-table-column prop="version" label="版本" min-width="80" align="center">
              <template #default="scope">
                <span v-if="scope.row.version === 'DRAFT'">草稿</span>
                <span v-else>V{{ scope.row.version }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="流程状态" min-width="120">
              <template #default="scope">
                <el-tag v-if="scope.row.status == '0'" type="info">草稿</el-tag>
                <el-tag v-else-if="scope.row.status == '1'" type="success">已发布</el-tag>
                <el-tag v-else-if="scope.row.status == '-1'" type="danger">已停用</el-tag>
                <el-tag v-else type="info">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <!-- <el-table-column prop="createBy" label="创建人userid" min-width="150" /> -->
            <el-table-column prop="createTime" label="创建时间" min-width="150" />
            <el-table-column prop="updateTime" label="更新时间" min-width="150" />
            <!-- <el-table-column prop="deleted" label="逻辑删除" min-width="150" /> -->
            <el-table-column label="操作" fixed="right" width="280" align="center">
              <template #default="scope">
                <div class="action-buttons">
                  <el-button type="primary" link size="small" @click="openDialog(scope.row.id, 'view')">
                    <el-icon>
                      <View />
                    </el-icon>
                    <span>详情</span>
                  </el-button>
                  <el-button type="primary" link size="small" @click="openDialog(scope.row.id, 'edit')"
                    v-if="scope.row.status == '0' || scope.row.status == '-1'">
                    <el-icon>
                      <Edit />
                    </el-icon>
                    <span>编辑</span>
                  </el-button>
                  <el-button type="primary" link size="small" @click="openVersionHistory(scope.row.id)"
                    v-if="scope.row.version !== 'DRAFT'">
                    <el-icon>
                      <Clock />
                    </el-icon>
                    <span>版本历史</span>
                  </el-button>
                  <el-button type="danger" link size="small" @click="confirmDelete(scope.row.id)"
                    v-if="scope.row.status == '0'">
                    <el-icon>
                      <Delete />
                    </el-icon>
                    <span>删除</span>
                  </el-button>
                  <el-button type="primary" link size="small" @click="confirmDeploy(scope.row.id)"
                    v-if="scope.row.status == '0' || scope.row.status == '-1'">
                    <el-icon>
                      <Promotion />
                    </el-icon>
                    <span>部署</span>
                  </el-button>
                  <el-button type="danger" link size="small" @click="confirmStop(scope.row.id)"
                    v-if="scope.row.status == '1'">
                    <el-icon>
                      <Delete />
                    </el-icon>
                    <span>停用</span>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination v-model:current-page="pageInfo.current" :page-size="pageInfo.size" :total="pageInfo.total"
            layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 50, 100]"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>

    <!-- 详情/编辑对话框 -->
    <el-dialog v-model="dialogEdit.open" fullscreen :title="dialogEdit.title" center destroy-on-close
      @closed="closeDialog" class="custom-dialog">
      <ProcessDefinitionInfoView v-model:id="dialogEdit.id" v-model:type="dialogEdit.type" :version="dialogEdit.version" :key="dialogEdit.id + (dialogEdit.version ?? '')" />
    </el-dialog>

    <!-- 添加对话框 -->
    <el-dialog v-model="dialogAdd" fullscreen title="添加流程定义" center destroy-on-close @closed="queryPage"
      class="custom-dialog">
      <ProcessDefinitionAddView @success="handleAddSuccess" />
    </el-dialog>

    <!-- 版本历史对话框 -->
    <el-dialog v-model="versionDialog.open" title="版本历史" width="600px" destroy-on-close class="custom-dialog">
      <div v-loading="versionDialog.loading">
        <el-table :data="versionDialog.list" style="width: 100%">
          <el-table-column prop="version" label="版本" width="80" align="center">
            <template #default="scope">
              V{{ scope.row.version }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="部署时间" min-width="160" />
          <el-table-column prop="createBy" label="操作人" min-width="100" />
          <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" link size="small" @click="viewVersion(scope.row.version)">
                查看
              </el-button>
              <el-button type="warning" link size="small" @click="confirmRollback(scope.row.version)">
                回滚
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { House, Search, Plus, View, Edit, Delete, Document, List, Promotion, Clock } from '@element-plus/icons-vue'
import { http, alert, confirm } from '@/utils';
import { onMounted, ref } from 'vue';
import PageHeader from '@/components/common/PageHeader.vue';
import ProcessDefinitionInfoView from './ProcessDefinitionInfoView.vue';
import ProcessDefinitionAddView from './ProcessDefinitionAddView.vue';

const loading = ref(false)
const multipleSelection = ref<any[]>([])
const tableData = ref<any[]>([])

const queryParam = ref({
  search: '',
})

const pageInfo = ref({
  current: 1,
  size: 10,
  total: 0,
  pages: 0
})

const dialogEdit = ref({
  open: false,
  title: '',
  id: '',
  type: 'view',
  version: undefined as string | undefined,
})

const dialogAdd = ref(false)

const handleSelectionChange = (val: any) => {
  multipleSelection.value = val
}

const handleSortChange = (column: any) => {
  console.log(column)
}

const handleSizeChange = (size: number) => {
  pageInfo.value.size = size
  queryPage()
}

const handleCurrentChange = (val: number) => {
  queryPage()
}

const queryPage = async () => {
  loading.value = true
  const result = await http.post('/processDefinition/queryPage', {
    current: pageInfo.value.current,
    size: pageInfo.value.size,
    search: queryParam.value.search,
  })
  tableData.value = result.records
  pageInfo.value.current = result.current
  pageInfo.value.size = result.size
  pageInfo.value.total = result.total
  pageInfo.value.pages = result.pages
  loading.value = false
}

const remove = async (id: any) => {
  await http.post('/processDefinition/remove', { id })
  alert('删除成功', 'success')
  queryPage()
}

const deploy = async (id: any) => {
  await http.post('/processDefinition/deploy', undefined, { params: { id } })
  alert('部署成功', 'success')
  queryPage()
}

const stop = async (id: any) => {
  await http.post('/processDefinition/stop', { id })
  alert('停用成功', 'success')
  queryPage()
}

const openDialog = (id: string | number, type: string) => {
  dialogEdit.value = {
    open: true,
    title: type === 'view' ? '流程定义详情' : '流程定义编辑',
    id: String(id),
    type,
    version: undefined,
  }
}

const closeDialog = () => {
  dialogEdit.value = {
    open: false,
    title: '',
    id: '',
    type: 'view',
    version: undefined,
  }
  queryPage()
}

const handleAddSuccess = () => {
  dialogAdd.value = false
  queryPage()
}

const confirmDelete = (id: string) => {
  confirm('提示', '确定删除该ProcessDefinition吗？', () => {
    remove(id)
  })
}

const confirmDeploy = (id: string) => {
  confirm('提示', '确定部署该流程吗？', () => {
    deploy(id)
  })
}

const confirmStop = (id: string) => {
  confirm('提示', '确定停用该流程吗？', () => {
    stop(id)
  })
}

// 版本历史
const versionDialog = ref({
  open: false,
  loading: false,
  processDefinitionId: null as number | null,
  list: [] as any[],
})

const openVersionHistory = async (id: number) => {
  versionDialog.value.processDefinitionId = id
  versionDialog.value.open = true
  versionDialog.value.loading = true
  versionDialog.value.list = []
  try {
    const result = await http.post('/processDefinition/versionList', null, {
      params: { processDefinitionId: id }
    })
    versionDialog.value.list = result ?? []
  } finally {
    versionDialog.value.loading = false
  }
}

const viewVersion = (version: string) => {
  versionDialog.value.open = false
  dialogEdit.value = {
    open: true,
    title: `流程定义详情 - V${version}`,
    id: String(versionDialog.value.processDefinitionId),
    type: 'view',
    version,
  }
}

const rollback = async (processDefinitionId: number, targetVersion: string) => {
  await http.post('/processDefinition/rollback', null, {
    params: { processDefinitionId, targetVersion }
  })
  alert('回滚成功，流程已变为草稿状态', 'success')
  versionDialog.value.open = false
  queryPage()
}

const confirmRollback = (targetVersion: string) => {
  confirm('提示', `确认回滚到 V${targetVersion}？回滚后流程变为草稿状态`, () => {
    rollback(versionDialog.value.processDefinitionId!, targetVersion)
  })
}

onMounted(() => {
  queryPage()
})
</script>

<style scoped lang="scss">
.processDefinition-management-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-elevated) 100%);

  .page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px 40px;
  }

  .breadcrumb-wrapper {
    margin-bottom: 20px;

    :deep(.el-breadcrumb) {
      font-size: var(--fs-md);

      .el-breadcrumb__inner {
        display: flex;
        align-items: center;
        gap: 4px;
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

      &.table {
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
      margin-left: auto;
      font-size: var(--fs-md);
      color: var(--text-secondary);
      background: var(--bg-overlay);
      padding: 4px 12px;
      border-radius: var(--radius-pill);
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

        .add-button {
          width: 100%;
          background: var(--brand-gradient);
          border: none;
        }
      }
    }
  }

  .table-section {
    background: var(--bg-container);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);

    .table-wrapper {
      margin-bottom: 20px;

      :deep(.el-table) {
        border-radius: var(--radius-md);
        overflow: hidden;

        .el-table__header th {
          background: var(--bg-elevated);
          font-weight: var(--fw-semibold);
          color: var(--text-primary);
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 8px;
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

.custom-dialog {
  :deep(.el-dialog__header) {
    background: var(--brand-gradient);
    margin: 0;
    padding: 20px 24px;

    .el-dialog__title {
      color: var(--text-on-brand);
      font-weight: var(--fw-semibold);
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: var(--text-on-brand);
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }


  :deep(.el-dialog.is-fullscreen) {
    display: flex !important;
    flex-direction: column;
    height: 100vh !important;
    overflow: hidden !important;
  }

  :deep(.el-dialog.is-fullscreen .el-dialog__body) {
    flex: 1;
    overflow: hidden;
  }
}

@media (max-width: 768px) {
  .processDefinition-management-page {
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
          width: 100%;
        }
      }
    }
  }
}
</style>
