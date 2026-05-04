<template>
    <div class="website-management-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon><Link /></el-icon>
                    </div>
                    <div class="title-text">
                        <h1>网站收藏管理</h1>
                        <p>管理和维护您的网站收藏</p>
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
                    <el-breadcrumb-item>网站收藏管理</el-breadcrumb-item>
                </el-breadcrumb>
            </div>

            <!-- 搜索和操作区域 -->
            <div class="search-section">
                <div class="section-header">
                    <div class="header-icon search">
                        <el-icon><Search /></el-icon>
                    </div>
                    <span class="header-title">筛选条件</span>
                </div>
                <div class="search-form">
                    <el-row :gutter="16">
                        <el-col :xs="24" :sm="18" :md="20" :lg="20">
                            <el-input
                                v-model="queryParam.search"
                                placeholder="请输入网站名称/地址搜索"
                                size="large"
                                clearable
                                @keyup.enter="queryPage"
                                @clear="queryPage">
                                <template #prefix>
                                    <el-icon><Search /></el-icon>
                                </template>
                            </el-input>
                        </el-col>
                        <el-col :xs="24" :sm="6" :md="4" :lg="4" class="search-actions">
                            <el-button type="primary" size="large" @click="dialogAdd = true" class="add-button">
                                <el-icon><Plus /></el-icon>
                                <span>添加收藏</span>
                            </el-button>
                        </el-col>
                    </el-row>
                </div>
            </div>

            <!-- 网站收藏表格 -->
            <div class="table-section" v-loading="loading" element-loading-text="加载中...">
                <div class="section-header">
                    <div class="header-icon table">
                        <el-icon><List /></el-icon>
                    </div>
                    <span class="header-title">网站列表</span>
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
                        <el-table-column prop="title" label="网站名称" min-width="150">
                            <template #default="scope">
                                <div class="name-cell">
                                    <div class="site-icon" :style="{ background: getSiteColor(scope.row.title) }">
                                        <el-icon><Link /></el-icon>
                                    </div>
                                    <span class="site-name">{{ scope.row.title }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="groupName" label="分组" min-width="120">
                            <template #default="scope">
                                <el-tag v-if="scope.row.groupName" type="primary" effect="light" size="small">
                                    <el-icon><Folder /></el-icon>
                                    <span>{{ scope.row.groupName }}</span>
                                </el-tag>
                                <span v-else class="no-group">-</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="url" label="网站地址" min-width="220">
                            <template #default="{ row }">
                                <div class="url-cell">
                                    <el-link :href="row.url" target="_blank" type="primary" class="site-link">
                                        <el-icon><Link /></el-icon>
                                        <span class="url-text">{{ row.url }}</span>
                                    </el-link>
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

        <!-- 网站详情/编辑对话框 -->
        <el-dialog
            v-model="dialogEdit.open"
            :title="dialogEdit.title"
            width="700px"
            center
            destroy-on-close
            @closed="closeDialog"
            class="website-dialog">
            <WebsiteEditView v-model:id="dialogEdit.id" v-model:type="dialogEdit.type" :key="dialogEdit.id" />
        </el-dialog>

        <!-- 添加网站对话框 -->
        <el-dialog
            v-model="dialogAdd"
            title="添加网站收藏"
            width="500px"
            center
            destroy-on-close
            @closed="queryPage"
            class="website-dialog">
            <WebsiteAddView @success="handleAddSuccess" />
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
    Link,
    List,
    Folder,
    Clock,
    Timer
} from '@element-plus/icons-vue'
import { alert, http, confirm } from '@/utils';
import { onMounted, ref } from 'vue';
import WebsiteEditView from './WebsiteEditView.vue';
import WebsiteAddView from './WebsiteAddView.vue';

const loading = ref(false)
const multipleSelection = ref<any[]>([])
const tableData = ref<any[]>([])

const queryParam = ref({
    search: '',
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
    id: '',
    type: 'view',
})

const dialogAdd = ref(false)

const getSiteColor = (name: string) => {
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

const queryPage = async () => {
    loading.value = true
    const result = await http.post('/website/queryPage', {
        current: pageInfo.value.current,
        size: pageInfo.value.size,
        search: queryParam.value.search,
        groupName: queryParam.value.groupName
    })
    tableData.value = result.records
    pageInfo.value.current = result.current
    pageInfo.value.size = result.size
    pageInfo.value.total = result.total
    pageInfo.value.pages = result.pages
    loading.value = false
}

const remove = async (id: any) => {
    await http.post('/website/delete', undefined, { params: { id } })
    alert('删除成功', 'success')
    queryPage()
}

const openDialog = (id: string | number, type: string) => {
    dialogEdit.value = {
        open: true,
        title: type === 'view' ? '网站详情' : '编辑网站',
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
}

const handleAddSuccess = () => {
    dialogAdd.value = false
    queryPage()
}

const confirmDelete = (id: string) => {
    confirm('提示', '确定删除该网站收藏吗？', async () => {
        await remove(id)
    })
}

onMounted(() => {
    queryPage()
})
</script>

<style scoped lang="scss">
.website-management-page {
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
                justify-content: flex-end;

                .add-button {
                    width: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
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

                .name-cell {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    .site-icon {
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;

                        .el-icon {
                            color: white;
                            font-size: 18px;
                        }
                    }

                    .site-name {
                        font-weight: 500;
                    }
                }

                .url-cell {
                    .site-link {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-family: 'Consolas', monospace;
                        font-size: 13px;

                        .el-icon {
                            font-size: 14px;
                        }

                        .url-text {
                            max-width: 200px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }
                }

                .no-group {
                    color: var(--el-text-color-secondary);
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

.website-dialog {
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
    .website-management-page {
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
                    width: 100%;
                }
            }
        }
    }
}
</style>
