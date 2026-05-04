<template>
    <div class="dynamic-form-management-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon><Document /></el-icon>
                    </div>
                    <div class="title-text">
                        <h1>动态表单管理</h1>
                        <p>管理和配置动态表单模板</p>
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
                    <el-breadcrumb-item>表单管理</el-breadcrumb-item>
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
                                placeholder="请输入表单名称/描述搜索"
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
                                <span>新建表单</span>
                            </el-button>
                        </el-col>
                    </el-row>
                </div>
            </div>

            <!-- 表单表格 -->
            <div class="table-section" v-loading="loading" element-loading-text="加载中...">
                <div class="section-header">
                    <div class="header-icon table">
                        <el-icon><List /></el-icon>
                    </div>
                    <span class="header-title">表单列表</span>
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
                        <el-table-column prop="id" label="表单ID" min-width="100">
                            <template #default="scope">
                                <div class="id-cell">
                                    <el-tag type="info" effect="dark" size="small">{{ scope.row.id }}</el-tag>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="name" label="表单名称" min-width="150">
                            <template #default="scope">
                                <div class="name-cell">
                                    <div class="form-icon" :style="{ background: getFormColor(scope.row.name) }">
                                        <el-icon><Document /></el-icon>
                                    </div>
                                    <span>{{ scope.row.name }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
                        <el-table-column prop="version" label="版本" width="100" align="center">
                            <template #default="scope">
                                <el-tag type="warning" effect="light" size="small">v{{ scope.row.version }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="status" label="状态" width="100" align="center">
                            <template #default="scope">
                                <el-tag v-if="scope.row.status == '1'" type="success" effect="light" class="status-tag">
                                    <el-icon><CircleCheck /></el-icon>
                                    <span>发布</span>
                                </el-tag>
                                <el-tag v-else-if="scope.row.status == '0'" type="warning" effect="light" class="status-tag">
                                    <el-icon><EditPen /></el-icon>
                                    <span>草稿</span>
                                </el-tag>
                                <el-tag v-else type="info" effect="light" class="status-tag">
                                    <el-icon><Close /></el-icon>
                                    <span>停用</span>
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="createBy" label="创建人" width="120">
                            <template #default="scope">
                                <div class="creator-cell">
                                    <div class="avatar" :style="{ background: getAvatarColor(scope.row.createBy) }">
                                        {{ scope.row.createBy ? scope.row.createBy.charAt(0).toUpperCase() : 'U' }}
                                    </div>
                                    <span>{{ scope.row.createBy }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="createTime" label="创建时间" width="170">
                            <template #default="scope">
                                <div class="time-cell">
                                    <el-icon><Clock /></el-icon>
                                    <span>{{ scope.row.createTime }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" fixed="right" width="320" align="center">
                            <template #default="scope">
                                <div class="action-buttons">
                                    <el-button type="primary" link size="small" @click="openDialog(scope.row.id, 'view')">
                                        <el-icon><View /></el-icon>
                                        <span>详情</span>
                                    </el-button>
                                    <el-button type="primary" link size="small" @click="openDialog(scope.row.id, 'edit')" v-if="scope.row.status == '0' || scope.row.status == '-1'">
                                        <el-icon><Edit /></el-icon>
                                        <span>编辑</span>
                                    </el-button>
                                    <el-button type="danger" link size="small" @click="confirmDelete(scope.row.id)" v-if="scope.row.status == '0'">
                                        <el-icon><Delete /></el-icon>
                                        <span>删除</span>
                                    </el-button>
                                    <el-button type="success" link size="small" @click="deploy(scope.row.id)" v-if="scope.row.status == '0' || scope.row.status == '-1'">
                                        <el-icon><Upload /></el-icon>
                                        <span>发布</span>
                                    </el-button>
                                    <el-button type="warning" link size="small" @click="stop(scope.row.id)" v-if="scope.row.status == '1'">
                                        <el-icon><SwitchButton /></el-icon>
                                        <span>停用</span>
                                    </el-button>
                                    <el-button type="info" link size="small" @click="makeUrl(scope.row.id, scope.row.version)" v-if="scope.row.status == '1'">
                                        <el-icon><Link /></el-icon>
                                        <span>链接</span>
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

        <!-- 详情/编辑对话框 -->
        <el-dialog
            v-if="dialogEdit.open"
            v-model="dialogEdit.open"
            :title="dialogEdit.title"
            fullscreen
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :show-close="false"
            center
            destroy-on-close
            @closed="closeDialog">
            <DynamicFormInfoView
                v-model:id="dialogEdit.id"
                v-model:type="dialogEdit.type"
                :key="dialogEdit.id"
                @success="dialogEdit.open = false;" />
        </el-dialog>

        <!-- 添加对话框 -->
        <el-dialog
            v-if="dialogAdd"
            v-model="dialogAdd"
            title="添加表单"
            fullscreen
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :show-close="false"
            center
            destroy-on-close
            @closed="queryPage">
            <DynamicFormAddView @success="handleAddSuccess" :type="dialogEdit.type" />
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
    Document,
    List,
    Clock,
    CircleCheck,
    EditPen,
    Close,
    Upload,
    SwitchButton,
    Link
} from '@element-plus/icons-vue'
import { http, alert, confirm } from '@/utils';
import { onMounted, ref } from 'vue';
import DynamicFormInfoView from './DynamicFormInfoView.vue';
import DynamicFormAddView from './DynamicFormAddView.vue';

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
    id: -1,
    type: 'view',
})

const dialogAdd = ref(false)

const getFormColor = (name: string) => {
    if (!name) return '#909399'
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a']
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
}

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

const queryPage = async () => {
    loading.value = true
    const result = await http.post('/dynamicForm/queryPage', {
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
    await http.post('/dynamicForm/remove', { id })
    alert('删除成功', 'success')
    queryPage()
}

const deploy = async (id: any) => {
    await http.post('/dynamicForm/deploy', undefined, { params: { formId: id } })
    alert('发布成功', 'success')
    queryPage()
}

const stop = async (id: any) => {
    await http.post('/dynamicForm/stop', undefined, { params: { formId: id } })
    alert('停用成功', 'success')
    queryPage()
}

const openDialog = (id: number, type: string) => {
    dialogEdit.value = {
        open: true,
        title: type === 'view' ? '表单详情' : '编辑表单',
        id: id,
        type: type
    }
}

const closeDialog = () => {
    dialogEdit.value = {
        open: false,
        title: '',
        id: -1,
        type: 'view'
    }
    queryPage()
}

const handleAddSuccess = () => {
    dialogAdd.value = false
    queryPage()
}

const confirmDelete = (id: string) => {
    confirm('提示', '确定删除该表单吗？', () => {
        remove(id)
    })
}

const makeUrl = (id: string, version: string) => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    const url = `${protocol}://${hostname}:${port}/dynamicForm/${id}/${version}`
    navigator.clipboard.writeText(url).then(() => {
        alert('复制成功', 'success')
    }).catch(() => {
        alert('复制失败', 'error')
    })
}

onMounted(() => {
    queryPage()
})
</script>

<style scoped lang="scss">
.dynamic-form-management-page {
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

                .id-cell {
                    display: flex;
                    justify-content: center;
                }

                .name-cell {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    .form-icon {
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
                }

                .status-tag {
                    display: flex;
                    align-items: center;
                    gap: 4px;

                    .el-icon {
                        font-size: 12px;
                    }
                }

                .creator-cell {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .avatar {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 14px;
                        font-weight: 600;
                        flex-shrink: 0;
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
                    flex-wrap: wrap;
                    gap: 4px;
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

@media (max-width: 768px) {
    .dynamic-form-management-page {
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
