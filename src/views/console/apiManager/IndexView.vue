<template>
    <div class="api-management-container">
        <!-- 面包屑导航 -->
        <div class="breadcrumb-wrapper">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/console' }">
                    <el-icon>
                        <House />
                    </el-icon>
                    <span>控制台</span>
                </el-breadcrumb-item>
                <el-breadcrumb-item>API管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-divider class="custom-divider" />

        <!-- 主内容区 -->
        <div class="content-wrapper">
            <div v-loading="loading" element-loading-text="加载中..."
                element-loading-background="rgba(255, 255, 255, 0.7)">
                <!-- 搜索和操作区域 -->
                <el-card class="search-card" shadow="never">
                    <el-row :gutter="20" class="search-row">
                        <el-col :xs="24" :sm="12" :md="10" :lg="8">
                            <el-input v-model="queryParam.search" placeholder="请输入API路径/名称搜索" size="large" clearable
                                @keyup.enter="queryPage" @clear="queryPage">
                                <template #prefix>
                                    <el-icon>
                                        <Search />
                                    </el-icon>
                                </template>
                            </el-input>
                        </el-col>
                        <el-col :xs="12" :sm="6" :md="5" :lg="4">
                            <el-select v-model="queryParam.roleId" placeholder="角色筛选" size="large" clearable
                                @change="queryPage">
                                <el-option v-for="item in roles" :key="item.key" :label="item.value"
                                    :value="item.key" />
                            </el-select>
                        </el-col>
                        <el-col :xs="12" :sm="6" :md="5" :lg="4">
                            <el-cascader :options="cascade" :props="{ checkStrictly: true }" placeholder="服务/分组筛选"
                                size="large" clearable @change="handleCascaderChange" />
                        </el-col>
                    </el-row>
                </el-card>

                <!-- API表格 -->
                <el-card class="table-card" shadow="never">
                    <el-table :data="tableData" stripe border style="width: 100%"
                        @selection-change="handleSelectionChange" @sort-change="handleSortChange"
                        :default-sort="{ prop: 'createTime', order: 'descending' }">
                        <el-table-column type="selection" width="50" align="center" />
                        <el-table-column prop="path" label="API路径" sortable="custom" min-width="180" />
                        <el-table-column prop="server" label="服务名称" min-width="120" />
                        <el-table-column prop="groupName" label="分组名称" min-width="120" />
                        <el-table-column prop="name" label="API名称" min-width="150" />
                        <el-table-column prop="whiteListStr" label="白名单" min-width="120">
                            <template #default="{ row }">
                                <el-tag v-if="row.whiteList == '1'" type="success" size="small" effect="light">
                                    {{ row.whiteListStr }}
                                </el-tag>
                                <span v-else>{{ row.whiteListStr }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="createTime" label="创建时间" sortable="custom" width="180" />
                        <el-table-column prop="updateTime" label="更新时间" sortable="custom" width="180" />
                        <el-table-column label="操作" fixed="right" width="180" align="center">
                            <template #default="scope">
                                <el-button type="primary" link size="small" @click="openDialog(scope.row, 'view')">
                                    <el-icon>
                                        <View />
                                    </el-icon>
                                    <span>详情</span>
                                </el-button>
                                <el-button type="primary" link size="small" @click="openDialog(scope.row, 'edit')">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>
                                    <span>编辑</span>
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

        <!-- API详情/编辑对话框 -->
        <el-dialog v-model="dialogEdit.open" :title="dialogEdit.title" width="800px" center destroy-on-close
            @closed="closeDialog">
            <ApiEditView v-model:server="dialogEdit.server" v-model:path="dialogEdit.path"
                v-model:type="dialogEdit.type" :key="dialogEdit.server + dialogEdit.path" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { House, Search, View, Edit } from '@element-plus/icons-vue'
import { http } from '@/utils';
import { onMounted, ref } from 'vue';
import ApiEditView from './ApiEditView.vue';

const loading = ref(false)
const multipleSelection = ref([])
const tableData = ref([])

const queryParam = ref({
    search: '',
    roleId: '',
    server: '',
    groupName: ''
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
    server: '',
    path: '',
    type: 'view',
})

const roles = ref([])
const cascade = ref([])

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

const handleCascaderChange = (value: any) => {
    if (value && value.length > 0) {
        queryParam.value.server = value[0]
        queryParam.value.groupName = value.length > 1 ? value[1] : ''
    } else {
        queryParam.value.server = ''
        queryParam.value.groupName = ''
    }
    queryPage()
}

const queryPage = () => {
    loading.value = true
    http.result({
        url: '/apiPath/queryPage',
        method: 'POST',
        data: {
            current: pageInfo.value.current,
            size: pageInfo.value.size,
            search: queryParam.value.search,
            roleId: queryParam.value.roleId,
            server: queryParam.value.server,
            groupName: queryParam.value.groupName
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

const cascadeServerGroup = () => {
    http.result({
        url: '/apiPath/cascadeServerGroup',
        method: 'POST',
        success(result) {
            cascade.value = result.data
        }
    })
}

const openDialog = (row: any, type: string) => {
    dialogEdit.value = {
        open: true,
        title: type === 'view' ? 'API详情' : '编辑API',
        server: row.server,
        path: row.path,
        type
    }
}

const closeDialog = () => {
    dialogEdit.value = {
        open: false,
        title: '',
        server: '',
        path: '',
        type: 'view'
    }
    queryPage()
}

onMounted(() => {
    selectorRole()
    cascadeServerGroup()
    queryPage()
})
</script>

<style scoped lang="scss">
.api-management-container {
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

.custom-divider {
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
        display: flex;
        align-items: center;
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
        flex-direction: column;

        .el-col {
            width: 100%;
            margin-bottom: 15px;

            &:last-child {
                margin-bottom: 0;
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