<template>
    <div class="org-management-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon><OfficeBuilding /></el-icon>
                    </div>
                    <div class="title-text">
                        <h1>机构管理</h1>
                        <p>管理系统组织架构和层级关系</p>
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
                    <el-breadcrumb-item>机构管理</el-breadcrumb-item>
                </el-breadcrumb>
            </div>

            <!-- 主内容区 -->
            <div class="main-content">
                <el-row :gutter="24">
                    <!-- 左侧机构树 -->
                    <el-col :xs="24" :sm="8" :md="6" :lg="5">
                        <div class="tree-card">
                            <div class="card-header">
                                <div class="header-icon tree">
                                    <el-icon><FolderOpened /></el-icon>
                                </div>
                                <span class="header-title">机构树</span>
                            </div>
                            <div class="tree-wrapper">
                                <el-tree
                                    :data="orgTree"
                                    :props="{
                                        children: 'children',
                                        label: 'name',
                                    }"
                                    @node-click="handleNodeClick"
                                    node-key="id"
                                    :default-expanded-keys="[-1]"
                                    highlight-current
                                    class="org-tree">
                                    <template #default="{ node, data }">
                                        <span class="tree-node" :class="{ 'is-active': selectOrg.parentId === data.id }">
                                            <div class="node-icon" :style="{ background: getNodeColor(node.level) }">
                                                <el-icon><OfficeBuilding /></el-icon>
                                            </div>
                                            <span class="tree-label">{{ node.label }}</span>
                                        </span>
                                    </template>
                                </el-tree>
                            </div>
                        </div>
                    </el-col>

                    <!-- 右侧内容区 -->
                    <el-col :xs="24" :sm="16" :md="18" :lg="19">
                        <div v-loading="loading" element-loading-text="加载中...">
                            <!-- 搜索和操作区域 -->
                            <div class="search-section">
                                <div class="section-header">
                                    <div class="header-icon search">
                                        <el-icon><Search /></el-icon>
                                    </div>
                                    <span class="header-title">机构列表</span>
                                    <span v-if="selectOrg.parentName" class="current-org">
                                        当前: {{ selectOrg.parentName }}
                                    </span>
                                </div>
                                <div class="search-form">
                                    <el-row :gutter="16">
                                        <el-col :xs="24" :sm="16" :md="18" :lg="20">
                                            <el-input
                                                v-model="queryParam.search"
                                                placeholder="请输入机构名称搜索"
                                                clearable
                                                @keyup.enter="queryPage"
                                                @clear="queryPage">
                                                <template #prefix>
                                                    <el-icon><Search /></el-icon>
                                                </template>
                                            </el-input>
                                        </el-col>
                                        <el-col :xs="24" :sm="8" :md="6" :lg="4" class="search-actions">
                                            <el-button type="primary" @click="dialogAdd = true" class="add-button">
                                                <el-icon><Plus /></el-icon>
                                                <span>新建</span>
                                            </el-button>
                                        </el-col>
                                    </el-row>
                                </div>
                            </div>

                            <!-- 机构表格 -->
                            <div class="table-section">
                                <div class="table-wrapper">
                                    <el-table
                                        :data="tableData"
                                        stripe
                                        style="width: 100%"
                                        @selection-change="handleSelectionChange"
                                        @sort-change="handleSortChange"
                                        :default-sort="{ prop: 'createTime', order: 'descending' }">
                                        <el-table-column type="selection" width="50" align="center" />
                                        <el-table-column prop="parentName" label="父级机构" min-width="140">
                                            <template #default="scope">
                                                <div class="parent-cell">
                                                    <el-icon><Connection /></el-icon>
                                                    <span>{{ scope.row.parentName || '根机构' }}</span>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="name" label="机构名称" min-width="160">
                                            <template #default="scope">
                                                <div class="org-cell">
                                                    <div class="org-icon" :style="{ background: getOrgColor(scope.row.name) }">
                                                        <el-icon><OfficeBuilding /></el-icon>
                                                    </div>
                                                    <span class="org-name">{{ scope.row.name }}</span>
                                                </div>
                                            </template>
                                        </el-table-column>
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
                                                    <el-button type="danger" link size="small" @click="confirmDelete(scope.row.id)">
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
                                        :page-size="pageInfo.size"
                                        :total="pageInfo.total"
                                        layout="total, sizes, prev, pager, next, jumper"
                                        :page-sizes="[10, 20, 50, 100]"
                                        @size-change="handleSizeChange"
                                        @current-change="handleCurrentChange" />
                                </div>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </div>

        <!-- 机构详情/编辑对话框 -->
        <el-dialog
            v-model="dialogEdit.open"
            :title="dialogEdit.title"
            width="600px"
            center
            destroy-on-close
            @closed="closeDialog"
            class="org-dialog">
            <OrgInfoView v-model:id="dialogEdit.id" v-model:type="dialogEdit.type" :key="dialogEdit.id" />
        </el-dialog>

        <!-- 添加机构对话框 -->
        <el-dialog
            v-model="dialogAdd"
            title="添加机构"
            width="450px"
            center
            destroy-on-close
            @closed="queryPage"
            class="add-org-dialog">
            <OrgAddView
                @success="handleAddSuccess"
                v-model:parentId="selectOrg.parentId"
                v-model:parentName="selectOrg.parentName"
                :key="selectOrg.parentId" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {
    House,
    Search,
    Plus,
    View,
    Edit,
    Delete,
    OfficeBuilding,
    FolderOpened,
    Connection,
    Clock,
    Timer
} from '@element-plus/icons-vue'
import { http, alert, confirm } from '@/utils';
import { onMounted, ref } from 'vue';
import OrgInfoView from './OrgInfoView.vue';
import OrgAddView from './OrgAddView.vue';

const loading = ref(false)
const multipleSelection = ref<any[]>([])
const tableData = ref<any[]>([])

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
const orgTree = ref<any[]>([])
const selectOrg = ref({ parentId: '', parentName: '' })

const getNodeColor = (level: number) => {
    const colors = ['var(--data-1)', 'var(--data-2)', 'var(--data-3)', 'var(--data-4)', 'var(--data-5)']
    return colors[(level - 1) % colors.length]
}

const getOrgColor = (name: string) => {
    if (!name) return 'var(--text-secondary)'
    const colors = ['var(--data-1)', 'var(--data-2)', 'var(--data-3)', 'var(--data-4)', 'var(--data-5)', 'var(--data-6)', 'var(--data-7)', 'var(--data-8)']
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
}

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

const queryOrgTree = async () => {
    const result = await http.post('/org/getOrgTree')
    orgTree.value = []
    orgTree.value.push(result);
    selectOrg.value.parentId = orgTree.value[0]['id']
    selectOrg.value.parentName = orgTree.value[0]['name']
    queryPage();
}

const queryPage = async () => {
    loading.value = true
    try {
        const result = await http.post('/org/queryPage', {
            current: pageInfo.value.current,
            size: pageInfo.value.size,
            search: queryParam.value.search,
            parentId: queryParam.value.parentId
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

const remove = async (id: any) => {
    await http.post('/org/remove', {
        id: id
    })
    alert('删除成功', 'success')
    queryPage()
    queryOrgTree()
}

const openDialog = (id: string | number, type: string) => {
    dialogEdit.value = {
        open: true,
        title: type === 'view' ? '机构详情' : '编辑机构',
        id: String(id),
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
.org-management-page {
    min-height: calc(100vh - 60px);
    background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-elevated) 100%);

    .page-header {
        background: var(--brand-gradient);
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

    .main-content {
        .tree-card {
            background: var(--bg-container);
            border-radius: 16px;
            padding: 20px;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-light);
            height: calc(100vh - 280px);
            display: flex;
            flex-direction: column;

            .card-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid var(--border-light);

                .header-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    &.tree {
                        background: var(--data-grad-4);
                    }

                    .el-icon {
                        font-size: 18px;
                        color: white;
                    }
                }

                .header-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text-primary);
                }
            }

            .tree-wrapper {
                flex: 1;
                overflow: auto;

                .org-tree {
                    .tree-node {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 4px 0;

                        &.is-active {
                            .tree-label {
                                color: var(--brand-primary);
                                font-weight: 600;
                            }
                        }

                        .node-icon {
                            width: 24px;
                            height: 24px;
                            border-radius: 6px;
                            display: flex;
                            align-items: center;
                            justify-content: center;

                            .el-icon {
                                font-size: 12px;
                                color: white;
                            }
                        }

                        .tree-label {
                            font-size: 14px;
                            transition: all 0.3s;
                        }
                    }
                }
            }
        }
    }

    .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

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

        .current-org {
            margin-left: auto;
            font-size: 13px;
            color: var(--text-secondary);
            background: var(--bg-overlay);
            padding: 4px 12px;
            border-radius: 20px;
        }
    }

    .search-section {
        background: var(--bg-container);
        border-radius: 16px;
        padding: 20px;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border-light);
        margin-bottom: 20px;

        .search-form {
            .search-actions {
                display: flex;
                justify-content: flex-end;

                .add-button {
                    background: var(--brand-gradient);
                    border: none;
                    width: 100%;
                }
            }
        }
    }

    .table-section {
        background: var(--bg-container);
        border-radius: 16px;
        padding: 20px;
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

                .parent-cell {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--text-secondary);

                    .el-icon {
                        font-size: 14px;
                    }
                }

                .org-cell {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    .org-icon {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        .el-icon {
                            font-size: 14px;
                            color: white;
                        }
                    }

                    .org-name {
                        font-weight: 500;
                    }
                }

                .time-cell {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--text-secondary);

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
            border-top: 1px solid var(--border-light);
        }
    }
}

.org-dialog,
.add-org-dialog {
    :deep(.el-dialog__header) {
        background: var(--brand-gradient);
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
    .org-management-page {
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

        .tree-card {
            height: auto;
            max-height: 400px;
            margin-bottom: 20px;
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
