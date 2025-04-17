<template>
    <div class="menu-management-container">
        <!-- 面包屑导航 -->
        <div class="breadcrumb-wrapper">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/console' }">
                    <el-icon>
                        <House />
                    </el-icon>
                    <span>控制台</span>
                </el-breadcrumb-item>
                <el-breadcrumb-item>系统管理</el-breadcrumb-item>
                <el-breadcrumb-item>菜单管理</el-breadcrumb-item>
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
                        <el-col :xs="24" :sm="16" :md="14" :lg="14">
                            <el-input v-model="queryParam.search" placeholder="请输入菜单名称/路由搜索" size="large" clearable
                                @keyup.enter="queryPage" @clear="queryPage">
                                <template #prefix>
                                    <el-icon>
                                        <Search />
                                    </el-icon>
                                </template>
                            </el-input>
                        </el-col>
                        <el-col :xs="12" :sm="4" :md="4" :lg="4">
                            <el-select v-model="queryParam.menuType" placeholder="菜单类型" size="large" clearable
                                @change="queryPage">
                                <el-option label="前台" value="-2" />
                                <el-option label="后台" value="-1" />
                            </el-select>
                        </el-col>
                        <el-col :xs="12" :sm="4" :md="6" :lg="6" class="action-col">
                            <el-button type="primary" size="large" @click="dialogAdd = true" class="add-button">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                                <span>新建菜单</span>
                            </el-button>
                        </el-col>
                    </el-row>
                </el-card>

                <!-- 菜单表格 -->
                <el-card class="table-card" shadow="never">
                    <el-table :data="tableData" stripe border style="width: 100%"
                        @selection-change="handleSelectionChange" @sort-change="handleSortChange"
                        :default-sort="{ prop: 'createTime', order: 'descending' }">
                        <el-table-column type="selection" width="50" align="center" />
                        <el-table-column label="类型" width="100" align="center">
                            <template #default="scope">
                                <el-tag :type="scope.row.menuType == '-1' ? 'primary' : 'success'" effect="light">
                                    {{ scope.row.menuType == '-1' ? '后台' : '前台' }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="name" label="菜单名称" min-width="150" />
                        <el-table-column prop="path" label="路由路径" min-width="180" />
                        <el-table-column label="图标" width="100" align="center">
                            <template #default="scope">
                                <el-icon v-if="scope.row.icon" :size="20">
                                    <component :is="scope.row.icon" />
                                </el-icon>
                                <span v-else>-</span>
                            </template>
                        </el-table-column>
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

        <!-- 菜单详情/编辑对话框 -->
        <el-dialog v-model="dialogEdit.open" :title="dialogEdit.title" width="800px" center destroy-on-close
            @closed="closeDialog">
            <MenuInfoView v-model:id="dialogEdit.id" v-model:type="dialogEdit.type" :key="dialogEdit.id" />
        </el-dialog>

        <!-- 添加菜单对话框 -->
        <el-dialog v-model="dialogAdd" title="添加菜单" width="400px" center destroy-on-close @closed="queryPage">
            <MenuAddView @success="handleAddSuccess" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {
    House, Search, Plus, View, Edit, Delete
} from '@element-plus/icons-vue'
import { http, alert, confirm } from '@/utils';
import { onMounted, ref } from 'vue';
import MenuInfoView from './MenuInfoView.vue';
import MenuAddView from './MenuAddView.vue';

const loading = ref(false)
const multipleSelection = ref([])
const tableData = ref([])

const queryParam = ref({
    search: '',
    menuType: ''
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

const queryPage = () => {
    loading.value = true
    http.result({
        url: '/menu/queryPage',
        method: 'POST',
        data: {
            current: pageInfo.value.current,
            size: pageInfo.value.size,
            search: queryParam.value.search,
            menuType: queryParam.value.menuType
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

const remove = (id: any) => {
    http.result({
        url: '/menu/remove',
        method: 'POST',
        data: {
            id: id
        },
        success(result) {
            if (result.code == '200') {
                alert('删除成功', 'success')
            }
            queryPage()
        }
    })
}

const openDialog = (id: string, type: string) => {
    dialogEdit.value = {
        open: true,
        title: type === 'view' ? '菜单详情' : '编辑菜单',
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

const handleAddSuccess = () => {
    dialogAdd.value = false
    queryPage()
}

const confirmDelete = (id: string) => {
    confirm('提示', '确定删除该菜单吗？', () => {
        remove(id)
    })
}

onMounted(() => {
    queryPage()
})
</script>

<style scoped lang="scss">
.menu-management-container {
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

        .action-col {
            display: flex;
            justify-content: flex-end;
        }

        .add-button {
            width: 100%;
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
        flex-direction: column;

        .el-col {
            width: 100%;
            margin-bottom: 15px;

            &:last-child {
                margin-bottom: 0;
            }
        }

        .action-col {
            justify-content: flex-start;
        }
    }

    .el-table {
        :deep(.el-table__cell) {
            padding: 8px 0;
        }
    }
}
</style>