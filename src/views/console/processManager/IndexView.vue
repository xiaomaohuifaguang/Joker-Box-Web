<template>
    <div class="process-management-container">
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
                <el-breadcrumb-item>流程定义</el-breadcrumb-item>
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
                        <el-col :xs="24" :sm="18" :md="20" :lg="20">
                            <el-input v-model="queryParam.search" placeholder="请输入流程名称/描述搜索" size="large" clearable
                                @keyup.enter="queryPage" @clear="queryPage">
                                <template #prefix>
                                    <el-icon>
                                        <Search />
                                    </el-icon>
                                </template>
                            </el-input>
                        </el-col>
                        <el-col :xs="24" :sm="6" :md="4" :lg="4" class="action-col">
                            <el-button type="primary" size="large" @click="dialogAdd = true" class="add-button">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                                <span>新建流程</span>
                            </el-button>
                        </el-col>
                    </el-row>
                </el-card>

                <!-- 流程表格 -->
                <el-card class="table-card" shadow="never">
                    <el-table :data="tableData" stripe border style="width: 100%"
                        @selection-change="handleSelectionChange" @sort-change="handleSortChange"
                        :default-sort="{ prop: 'createTime', order: 'descending' }">
                        <el-table-column type="selection" width="50" align="center" />
                        <el-table-column prop="processKey" label="流程定义Key" min-width="120" />
                        <el-table-column prop="processName" label="流程名称" min-width="150" />
                        <el-table-column prop="processDescription" label="流程描述" min-width="180" />
                        <el-table-column prop="version" label="版本" width="80" align="center" />
                        <el-table-column prop="status" label="状态" width="100" align="center">
                            <template #default="scope">
                                <el-tag :type="getStatusTagType(scope.row.status)" size="small" effect="light">
                                    {{ getStatusText(scope.row.status) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="createByName" label="创建人" width="120" />
                        <el-table-column prop="createTime" label="创建时间" sortable="custom" width="180" />
                        <el-table-column prop="updateTime" label="更新时间" sortable="custom" width="180" />
                        <el-table-column label="操作" fixed="right" width="280" align="center">
                            <template #default="scope">
                                <el-button type="primary" link size="small" @click="openDialog(scope.row.id, 'view')">
                                    <el-icon>
                                        <View />
                                    </el-icon>
                                    <span>详情</span>
                                </el-button>
                                <el-button v-if="scope.row.status == '0' || scope.row.status == '-1'" type="primary"
                                    link size="small" @click="openDialog(scope.row.id, 'edit')">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>
                                    <span>编辑</span>
                                </el-button>
                                <el-button v-if="scope.row.status == '0'" type="danger" link size="small"
                                    @click="confirmDelete(scope.row.id)">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                    <span>删除</span>
                                </el-button>
                                <el-button v-if="scope.row.status == '1'" type="warning" link size="small"
                                    @click="confirmStop(scope.row.id)">
                                    <el-icon>
                                        <SwitchButton />
                                    </el-icon>
                                    <span>停用</span>
                                </el-button>
                                <el-button v-if="scope.row.status == '0' || scope.row.status == '-1'" type="success"
                                    link size="small" @click="confirmDeploy(scope.row.id)">
                                    <el-icon>
                                        <Upload />
                                    </el-icon>
                                    <span>发布</span>
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

        <!-- 流程详情/编辑对话框 -->
        <el-dialog v-model="dialogEdit.open" :title="dialogEdit.title" fullscreen :close-on-click-modal="false"
            :close-on-press-escape="false" :show-close="false" @closed="closeDialog">
            <ProcessDefinitionAddTestView v-model:id="dialogEdit.id" v-model:type="dialogEdit.type" :key="dialogEdit.id"
                @success="handleDialogSuccess" />
        </el-dialog>

        <!-- 新建流程对话框 -->
        <el-dialog v-model="dialogAdd" title="新建流程" fullscreen :close-on-click-modal="false"
            :close-on-press-escape="false" :show-close="false" @closed="queryPage">
            <ProcessDefinitionAddView @success="handleAddSuccess" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {
    House, Search, Plus, View, Edit, Delete,
    SwitchButton, Upload, Switch
} from '@element-plus/icons-vue'
import { http, alert, confirm } from '@/utils';
import { onMounted, ref } from 'vue';
import ProcessDefinitionAddView from './ProcessDefinitionAddView.vue';
import ProcessDefinitionAddTestView from './ProcessDefinitionAddViewTest.vue';

const loading = ref(false)
const multipleSelection = ref([])
const tableData = ref([])

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
})

const dialogAdd = ref(false)

const getStatusTagType = (status: string) => {
    switch (status) {
        case '-1': return 'warning';
        case '0': return 'info';
        case '1': return 'success';
        default: return '';
    }
}

const getStatusText = (status: string) => {
    switch (status) {
        case '-1': return '已停用';
        case '0': return '草稿';
        case '1': return '已发布';
        default: return '';
    }
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

const queryPage = () => {
    loading.value = true
    http.result({
        url: '/processDefinition/queryPage',
        method: 'POST',
        data: {
            current: pageInfo.value.current,
            size: pageInfo.value.size,
            search: queryParam.value.search,
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
        url: '/processDefinition/remove',
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

const stop = (id: any) => {
    http.result({
        url: '/processDefinition/stop',
        method: 'POST',
        data: {
            id: id
        },
        success(result) {
            if (result.code == '200') {
                alert('停用成功', 'success')
            }
            queryPage()
        }
    })
}

const deploy = (id: any) => {
    http.result({
        url: '/processDefinition/deploy',
        method: 'POST',
        params: {
            id: id
        },
        success(result) {
            if (result.code == '200') {
                alert('发布成功', 'success')
            }
            queryPage()
        }
    })
}

const openDialog = (id: string, type: string) => {
    dialogEdit.value = {
        open: true,
        title: type === 'view' ? '流程详情' : '编辑流程',
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

const handleDialogSuccess = () => {
    dialogEdit.value.open = false
    queryPage()
}

const handleAddSuccess = () => {
    dialogAdd.value = false
    queryPage()
}

const confirmDelete = (id: string) => {
    confirm('提示', '确定删除该流程定义吗？', () => {
        remove(id)
    })
}

const confirmStop = (id: string) => {
    confirm('提示', '确定停用该流程定义吗？', () => {
        stop(id)
    })
}

const confirmDeploy = (id: string) => {
    confirm('提示', '确定发布该流程定义吗？', () => {
        deploy(id)
    })
}

onMounted(() => {
    queryPage()
})
</script>

<style scoped lang="scss">
.process-management-container {
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