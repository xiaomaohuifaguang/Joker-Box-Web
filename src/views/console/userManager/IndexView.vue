<template>
    <div class="user-management">
        <!-- 面包屑导航 -->
        <div class="breadcrumb-wrapper">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/console' }">
                    <el-icon>
                        <House />
                    </el-icon>
                    <span>控制台</span>
                </el-breadcrumb-item>
                <el-breadcrumb-item>身份与权限</el-breadcrumb-item>
                <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-divider class="divider" />

        <!-- 主内容区 -->
        <div class="content-wrapper">
            <div v-loading="loading" element-loading-text="加载中..."
                element-loading-background="rgba(255, 255, 255, 0.7)">
                <!-- 搜索筛选区域 -->
                <el-card class="search-card" shadow="never">
                    <el-row :gutter="20" class="search-row">
                        <el-col :xs="24" :sm="16" :md="12" :lg="10">
                            <el-input v-model="queryParam.search" placeholder="请输入用户名/昵称搜索" size="large" clearable
                                @keyup.enter="queryPage" @clear="queryPage">
                                <template #prefix>
                                    <el-icon>
                                        <Search />
                                    </el-icon>
                                </template>
                            </el-input>
                        </el-col>
                        <el-col :xs="12" :sm="8" :md="6" :lg="4">
                            <el-select v-model="queryParam.roleId" placeholder="选择角色" size="large" clearable
                                @change="queryPage">
                                <el-option v-for="item in roles" :key="item.key" :label="item.value"
                                    :value="item.key" />
                            </el-select>
                        </el-col>
                        <el-col :xs="12" :sm="8" :md="6" :lg="4">
                            <el-cascader v-model="queryParam.orgId" :options="orgTree" :props="{
                                children: 'children',
                                label: 'name',
                                value: 'id',
                                emitPath: false,
                                checkStrictly: true,
                            }" placeholder="选择机构" size="large" clearable @change="queryPage" />
                        </el-col>
                    </el-row>
                </el-card>

                <!-- 用户表格 -->
                <el-card class="table-card" shadow="never">
                    <el-table :data="tableData" stripe border style="width: 100%"
                        @selection-change="handleSelectionChange" @sort-change="handleSortChange"
                        :default-sort="{ prop: 'createTime', order: 'descending' }">
                        <el-table-column type="selection" width="50" align="center" />
                        <el-table-column prop="username" label="用户名" sortable="custom" min-width="120" />
                        <el-table-column prop="nickname" label="用户昵称" min-width="120" />
                        <el-table-column prop="clientName" label="客户端名称" min-width="120" />
                        <el-table-column prop="createTime" label="创建时间" sortable="custom" width="180" />
                        <el-table-column prop="updateTime" label="更新时间" sortable="custom" width="180" />
                        <el-table-column label="操作" fixed="right" width="220" align="center">
                            <template #default="scope">
                                <el-button type="primary" link size="small" @click="openDialog(scope.row.id, 'view')">
                                    <el-icon>
                                        <View />
                                    </el-icon>
                                    <span>详情</span>
                                </el-button>
                                <el-button type="primary" link size="small" @click="openDialog(scope.row.id, 'edit')">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>
                                    <span>编辑</span>
                                </el-button>
                                <el-button type="warning" link size="small" @click="confirmResetPassword(scope.row.id)">
                                    <el-icon>
                                        <Refresh />
                                    </el-icon>
                                    <span>重置密码</span>
                                </el-button>
                                <el-button type="danger" link size="small" @click="confirmDelete(scope.row.id)">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                    <span>删除</span>
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 分页 -->
                    <div class="pagination-wrapper">
                        <el-pagination v-model:current-page="pageInfo.current" :page-size="pageInfo.size"
                            :total="pageInfo.total" layout="total, sizes, prev, pager, next, jumper"
                            :page-sizes="[10, 20, 50, 100]" @size-change="handleSizeChange"
                            @current-change="handleCurrentChange" />
                    </div>
                </el-card>
            </div>
        </div>

        <!-- 用户详情/编辑对话框 -->
        <el-dialog v-model="dialogEdit.open" :title="dialogEdit.title" width="800px" center destroy-on-close
            @closed="closeDialog">
            <UserEditView v-model:id="dialogEdit.id" v-model:type="dialogEdit.type" :key="dialogEdit.id" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { House, Search, View, Edit, Refresh, Delete } from '@element-plus/icons-vue'
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
.user-management {
    padding: 20px;
    background-color: var(--el-bg-color-page);
}

.breadcrumb-wrapper {
    padding: 0 0 10px 0;

    .el-breadcrumb {
        font-size: 14px;

        :deep(.el-breadcrumb__inner) {
            display: flex;
            align-items: center;

            .el-icon {
                margin-right: 5px;
            }
        }
    }
}

.divider {
    margin: 10px 0 20px 0;
}

.content-wrapper {
    background-color: var(--el-bg-color-overlay);
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.search-card {
    margin-bottom: 20px;
    border-radius: 4px;

    .search-row {
        margin-bottom: -20px;

        .el-col {
            margin-bottom: 20px;
        }
    }
}

.table-card {
    border-radius: 4px;

    :deep(.el-table) {
        .el-table__header th {
            background-color: var(--el-fill-color-light);
            font-weight: 600;
        }
    }
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
}

@media (max-width: 768px) {
    .search-card .search-row {
        .el-col {
            margin-bottom: 15px;

            &:nth-child(1) {
                order: 3;
                width: 100%;
            }

            &:nth-child(2),
            &:nth-child(3) {
                width: 50%;
            }
        }
    }

    .el-table {
        :deep(.el-table__cell) {
            padding: 8px 0;
        }
    }
}
</style>