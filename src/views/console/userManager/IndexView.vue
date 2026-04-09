<template>
  <div class="user-management-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <div class="title-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="title-text">
            <h1>用户管理</h1>
            <p>管理系统用户、角色和权限分配</p>
          </div>
        </div>
      </div>
    </div>

    <div class="page-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-wrapper">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/console' }">
            <el-icon><House /></el-icon>
            <span>控制台</span>
          </el-breadcrumb-item>
          <el-breadcrumb-item>身份与权限</el-breadcrumb-item>
          <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 搜索筛选区域 -->
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
                placeholder="请输入用户名/昵称搜索"
                clearable
                @keyup.enter="queryPage"
                @clear="queryPage">
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :xs="12" :sm="6" :md="6" :lg="5">
              <el-select
                v-model="queryParam.roleId"
                placeholder="选择角色"
                clearable
                @change="queryPage">
                <el-option
                  v-for="item in roles"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key" />
              </el-select>
            </el-col>
            <el-col :xs="12" :sm="6" :md="6" :lg="5">
              <el-cascader
                v-model="queryParam.orgId"
                :options="orgTree"
                :props="{
                  children: 'children',
                  label: 'name',
                  value: 'id',
                  emitPath: false,
                  checkStrictly: true,
                }"
                placeholder="选择机构"
                clearable
                @change="queryPage" />
            </el-col>
            <el-col :xs="24" :sm="24" :md="4" :lg="8" class="search-actions">
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

      <!-- 用户表格 -->
      <div class="table-section" v-loading="loading" element-loading-text="加载中...">
        <div class="section-header">
          <div class="header-icon table">
            <el-icon><List /></el-icon>
          </div>
          <span class="header-title">用户列表</span>
          <span class="header-count">共 {{ pageInfo.total }} 条</span>
        </div>

        <div class="table-wrapper">
          <el-table
            :data="tableData"
            stripe
            style="width: 100%"
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
            :default-sort="{ prop: 'createTime', order: 'descending' }">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column prop="username" label="用户名" sortable="custom" min-width="120">
              <template #default="scope">
                <div class="user-cell">
                  <div class="user-avatar" :style="{ background: getAvatarColor(scope.row.username) }">
                    {{ scope.row.username ? scope.row.username.charAt(0).toUpperCase() : '?' }}
                  </div>
                  <span class="user-name">{{ scope.row.username }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="nickname" label="用户昵称" min-width="120" />
            <el-table-column prop="clientName" label="客户端名称" min-width="120" />
            <el-table-column prop="createTime" label="创建时间" sortable="custom" width="170">
              <template #default="scope">
                <div class="time-cell">
                  <el-icon><Clock /></el-icon>
                  <span>{{ scope.row.createTime }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" sortable="custom" width="170">
              <template #default="scope">
                <div class="time-cell">
                  <el-icon><Timer /></el-icon>
                  <span>{{ scope.row.updateTime }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="220" align="center">
              <template #default="scope">
                <div class="action-buttons">
                  <el-button type="primary" link size="small" @click="openDialog(scope.row.id, 'view')">
                    <el-icon><View /></el-icon>
                    <span>详情</span>
                  </el-button>
                  <el-button type="primary" link size="small" @click="openDialog(scope.row.id, 'edit')">
                    <el-icon><Edit /></el-icon>
                    <span>编辑</span>
                  </el-button>
                  <el-dropdown trigger="click" size="small">
                    <el-button type="info" link size="small">
                      <el-icon><More /></el-icon>
                      <span>更多</span>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="confirmResetPassword(scope.row.id)">
                          <el-icon><Key /></el-icon>
                          <span>重置密码</span>
                        </el-dropdown-item>
                        <el-dropdown-item divided @click="confirmDelete(scope.row.id)">
                          <el-icon><Delete /></el-icon>
                          <span>删除</span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pageInfo.current"
            :page-size="pageInfo.size"
            :total="pageInfo.total"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>

    <!-- 用户详情/编辑对话框 -->
    <el-dialog
      v-model="dialogEdit.open"
      :title="dialogEdit.title"
      width="850px"
      center
      destroy-on-close
      @closed="closeDialog"
      class="user-dialog">
      <UserEditView v-model:id="dialogEdit.id" v-model:type="dialogEdit.type" :key="dialogEdit.id" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  House,
  Search,
  User,
  View,
  Edit,
  Delete,
  RefreshRight,
  List,
  Clock,
  Timer,
  More,
  Key
} from '@element-plus/icons-vue'
import { http, confirm, alert } from '@/utils';
import { onMounted, ref } from 'vue';
import UserEditView from './UserEditView.vue';

const loading = ref(false)
const multipleSelection = ref([])
const tableData = ref([])

const queryParam = ref({
  search: '',
  roleId: '',
  orgId: '',
  type: ''
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
})

const roles = ref([])
const orgTree = ref([])

// 获取头像颜色
const getAvatarColor = (name: string) => {
  if (!name) return '#909399'
  const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a']
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

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

const resetQuery = () => {
  queryParam.value = {
    search: '',
    roleId: '',
    orgId: '',
    type: ''
  }
  pageInfo.value.current = 1
  queryPage()
}

const queryPage = () => {
  loading.value = true
  http.result({
    url: '/user/queryPage',
    method: 'POST',
    data: {
      current: pageInfo.value.current,
      size: pageInfo.value.size,
      search: queryParam.value.search,
      roleId: queryParam.value.roleId,
      orgId: queryParam.value.orgId,
      type: queryParam.value.type
    },
    success(result) {
      tableData.value = result.data.records
      pageInfo.value.current = result.data.current
      pageInfo.value.size = result.data.size
      pageInfo.value.total = result.data.total
      pageInfo.value.pages = result.data.pages
      loading.value = false
    }
  })
}

const selectorRole = () => {
  http.result({
    url: '/role/selector',
    method: 'POST',
    success(result) {
      roles.value = result.data
    }
  })
}

const queryOrgTree = () => {
  http.result({
    url: '/org/getOrgTree',
    method: 'POST',
    success(result) {
      orgTree.value = []
      orgTree.value.push(result.data);
    }
  })
}

const remove = (userId: any) => {
  http.result({
    url: '/user/delete',
    method: 'POST',
    params: {
      userId: userId
    },
    success(result) {
      if (result.code == '200') {
        alert('删除成功', 'success')
      }
      queryPage()
    }
  })
}

const resetPassword = (userId: any) => {
  http.result({
    url: '/user/resetPassword',
    method: 'POST',
    params: {
      userId: userId
    },
    success(result) {
      if (result.code == '200') {
        alert('重置成功', 'success')
      }
      queryPage()
    }
  })
}

const openDialog = (id: string, type: string) => {
  dialogEdit.value = {
    open: true,
    title: type === 'view' ? '用户详情' : '编辑用户',
    id,
    type
  }
}

const closeDialog = () => {
  dialogEdit.value = {
    open: false,
    title: '',
    id: '',
    type: 'view'
  }
  queryPage()
}

const confirmDelete = (userId: string) => {
  confirm('提示', '确定删除该用户吗？', () => {
    remove(userId)
  })
}

const confirmResetPassword = (userId: string) => {
  confirm('提示', '确定重置该用户密码吗？', () => {
    resetPassword(userId)
  })
}

onMounted(() => {
  selectorRole()
  queryOrgTree()
  queryPage()
})
</script>

<style scoped lang="scss">
.user-management-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);

  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 32px 0;
    margin-bottom: 24px;

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 20px;

      .title-icon {
        width: 64px;
        height: 64px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);

        .el-icon {
          font-size: 32px;
          color: white;
        }
      }

      .title-text {
        h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 600;
          color: white;
        }

        p {
          margin: 0;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.85);
        }
      }
    }
  }

  .page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px 40px;
  }

  .breadcrumb-wrapper {
    margin-bottom: 20px;

    :deep(.el-breadcrumb) {
      font-size: 14px;

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
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.search {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.table {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      .el-icon {
        font-size: 18px;
        color: white;
      }
    }

    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .header-count {
      margin-left: auto;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color-light);
      padding: 4px 12px;
      border-radius: 20px;
    }
  }

  .search-section {
    background: var(--el-bg-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--el-border-color-lighter);
    margin-bottom: 24px;

    .search-form {
      .search-actions {
        display: flex;
        gap: 12px;

        .el-button {
          height: 40px;

          &:first-child {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
          }
        }
      }
    }
  }

  .table-section {
    background: var(--el-bg-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--el-border-color-lighter);

    .table-wrapper {
      margin-bottom: 20px;

      :deep(.el-table) {
        border-radius: 12px;
        overflow: hidden;

        .el-table__header th {
          background: var(--el-fill-color-light);
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 10px;

          .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            color: white;
          }

          .user-name {
            font-weight: 500;
          }
        }

        .time-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--el-text-color-secondary);

          .el-icon {
            font-size: 14px;
          }
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
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }
}

.user-dialog {
  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0;
    padding: 20px 24px;

    .el-dialog__title {
      color: white;
      font-weight: 600;
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: white;
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

@media (max-width: 768px) {
  .user-management-page {
    .page-header {
      padding: 24px 0;

      .header-content {
        padding: 0 16px;
      }

      .header-title {
        flex-direction: column;
        text-align: center;

        .title-text {
          h1 {
            font-size: 22px;
          }
        }
      }
    }

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
