<template>
    <div class="org-management-container">
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
                <el-breadcrumb-item>机构管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-divider class="custom-divider" />

        <!-- 主内容区 -->
        <div class="main-content">
            <el-row :gutter="20">
                <!-- 左侧机构树 -->
                <el-col :xs="24" :sm="8" :md="6" :lg="6">
                    <el-card class="tree-card" shadow="never">
                        <el-tree :data="orgTree" :props="{
                            children: 'children',
                            label: 'name',
                        }" @node-click="handleNodeClick" node-key="id" :default-expanded-keys="[-1]" highlight-current>
                            <template #default="{ node, data }">
                                <span class="tree-node">
                                    <el-icon class="tree-icon">
                                        <OfficeBuilding />
                                    </el-icon>
                                    <span class="tree-label" @click="handleNodeClick(data)">{{ node.label }}</span>
                                </span>
                            </template>
                        </el-tree>
                    </el-card>
                </el-col>

                <!-- 右侧内容区 -->
                <el-col :xs="24" :sm="16" :md="18" :lg="18">
                    <div v-loading="loading" class="content-wrapper">
                        <!-- 搜索和操作区域 -->
                        <el-card class="search-card" shadow="never">
                            <el-row :gutter="20" class="search-row">
                                <el-col :xs="24" :sm="18" :md="20" :lg="20">
                                    <el-input v-model="queryParam.search" placeholder="请输入机构名称搜索" size="large" clearable
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
                                        <span>新建</span>
                                    </el-button>
                                </el-col>
                            </el-row>
                        </el-card>

                        <!-- 机构表格 -->
                        <el-card class="table-card" shadow="never">
                            <el-table :data="tableData" stripe border style="width: 100%"
                                @selection-change="handleSelectionChange" @sort-change="handleSortChange"
                                :default-sort="{ prop: 'createTime', order: 'descending' }">
                                <el-table-column type="selection" width="50" align="center" />
                                <el-table-column prop="parentName" label="父级机构" min-width="120" />
                                <el-table-column prop="name" label="机构名称" min-width="150" />
                                <el-table-column prop="createTime" label="创建时间" sortable="custom" width="180" />
                                <el-table-column prop="updateTime" label="更新时间" sortable="custom" width="180" />
                                <el-table-column label="操作" fixed="right" width="220" align="center">
                                    <template #default="scope">
                                        <el-button type="primary" link size="small"
                                            @click="openDialog(scope.row.id, 'view')">
                                            <el-icon>
                                                <View />
                                            </el-icon>
                                            <span>详情</span>
                                        </el-button>
                                        <el-button type="primary" link size="small"
                                            @click="openDialog(scope.row.id, 'edit')">
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
                </el-col>
            </el-row>
        </div>

        <!-- 机构详情/编辑对话框 -->
        <el-dialog v-model="dialogEdit.open" :title="dialogEdit.title" width="800px" center destroy-on-close
            @closed="closeDialog">
            <OrgInfoView v-model:id="dialogEdit.id" v-model:type="dialogEdit.type" :key="dialogEdit.id" />
        </el-dialog>

        <!-- 添加机构对话框 -->
        <el-dialog v-model="dialogAdd" title="添加机构" width="400px" center destroy-on-close @closed="queryPage">
            <OrgAddView @success="handleAddSuccess" v-model:parentId="selectOrg.parentId"
                v-model:parentName="selectOrg.parentName" :key="selectOrg.parentId" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {
    House, Search, Plus, View, Edit, Delete, OfficeBuilding
} from '@element-plus/icons-vue'
import { http, alert, confirm } from '@/utils';
import { onMounted, ref } from 'vue';
import OrgInfoView from './OrgInfoView.vue';
import OrgAddView from './OrgAddView.vue';

const loading = ref(false)
const multipleSelection = ref([])
const tableData = ref([])

const queryParam = ref({
    search: '',
    parentId: ''
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
const orgTree = ref([])
const selectOrg = ref({ parentId: '', parentName: '' })

const handleNodeClick = (data: any) => {
    selectOrg.value.parentId = data.id
    selectOrg.value.parentName = data.name
    queryParam.value.parentId = data.id
    queryPage()
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

const queryOrgTree = () => {
    http.result({
        url: '/org/getOrgTree',
        method: 'POST',
        success(result) {
            orgTree.value = []
            orgTree.value.push(result.data);
            selectOrg.value.parentId = orgTree.value[0]['id']
            selectOrg.value.parentName = orgTree.value[0]['name']
            queryPage();
        }
    })
}

const queryPage = () => {
    loading.value = true
    http.result({
        url: '/org/queryPage',
        method: 'POST',
        data: {
            current: pageInfo.value.current,
            size: pageInfo.value.size,
            search: queryParam.value.search,
            parentId: queryParam.value.parentId
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
        url: '/org/remove',
        method: 'POST',
        data: {
            id: id
        },
        success(result) {
            if (result.code == '200') {
                alert('删除成功', 'success')
            }
            queryPage()
            queryOrgTree()
        }
    })
}

const openDialog = (id: string, type: string) => {
    dialogEdit.value = {
        open: true,
        title: type === 'view' ? '机构详情' : '编辑机构',
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
    queryOrgTree()
}

const handleAddSuccess = () => {
    dialogAdd.value = false
    queryPage()
    queryOrgTree()
}

const confirmDelete = (id: string) => {
    confirm('提示', '确定删除该机构吗？', () => {
        remove(id)
    })
}

onMounted(() => {
    queryOrgTree();
})
</script>

<style scoped lang="scss">
.org-management-container {
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

.main-content {
    background-color: var(--el-bg-color-overlay);
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.tree-card {
    height: calc(100vh - 180px);
    overflow: auto;
    border-radius: 4px;

    .tree-node {
        display: flex;
        align-items: center;
        width: 100%;

        .tree-icon {
            margin-right: 8px;
            color: var(--el-color-primary);
        }

        .tree-label {
            flex: 1;
            cursor: pointer;
            font-size: 14px;
        }
    }
}

.content-wrapper {
    height: calc(100vh - 180px);
    overflow: auto;
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
    .tree-card {
        height: auto;
        margin-bottom: 20px;
    }

    .content-wrapper {
        height: auto;
    }

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