<template>
    <div class="api-management-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon><Connection /></el-icon>
                    </div>
                    <div class="title-text">
                        <h1>API管理</h1>
                        <p>管理系统API接口和权限配置</p>
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
                    <el-breadcrumb-item>API管理</el-breadcrumb-item>
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
                        <el-col :xs="24" :sm="12" :md="10" :lg="8">
                            <el-input
                                v-model="queryParam.search"
                                placeholder="请输入API路径/名称搜索"
                                clearable
                                @keyup.enter="queryPage"
                                @clear="queryPage">
                                <template #prefix>
                                    <el-icon><Search /></el-icon>
                                </template>
                            </el-input>
                        </el-col>
                        <el-col :xs="12" :sm="6" :md="5" :lg="4">
                            <el-select
                                v-model="queryParam.roleId"
                                placeholder="角色筛选"
                                clearable
                                @change="queryPage">
                                <el-option
                                    v-for="item in roles"
                                    :key="item.key"
                                    :label="item.value"
                                    :value="item.key" />
                            </el-select>
                        </el-col>
                        <el-col :xs="12" :sm="6" :md="5" :lg="4">
                            <el-cascader
                                :options="cascade"
                                :props="{ checkStrictly: true }"
                                placeholder="服务/分组筛选"
                                clearable
                                @change="handleCascaderChange" />
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

            <!-- API表格 -->
            <div class="table-section" v-loading="loading" element-loading-text="加载中...">
                <div class="section-header">
                    <div class="header-icon table">
                        <el-icon><List /></el-icon>
                    </div>
                    <span class="header-title">API列表</span>
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
                        <el-table-column prop="path" label="API路径" sortable="custom" min-width="200">
                            <template #default="scope">
                                <div class="api-path-cell">
                                    <el-icon><Link /></el-icon>
                                    <span class="path-text">{{ scope.row.path }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="server" label="服务名称" min-width="120">
                            <template #default="scope">
                                <div class="server-cell">
                                    <div class="server-icon" :style="{ background: getServerColor(scope.row.server) }">
                                        <el-icon><Monitor /></el-icon>
                                    </div>
                                    <span>{{ scope.row.server }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="groupName" label="分组名称" min-width="120">
                            <template #default="scope">
                                <div class="group-cell">
                                    <el-icon><Folder /></el-icon>
                                    <span>{{ scope.row.groupName }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="name" label="API名称" min-width="150">
                            <template #default="scope">
                                <div class="api-name-cell">
                                    <el-icon><Document /></el-icon>
                                    <span>{{ scope.row.name }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="whiteListStr" label="白名单" min-width="100" align="center">
                            <template #default="{ row }">
                                <el-tag v-if="row.whiteList == '1'" type="success" size="small" effect="light" class="whitelist-tag">
                                    <el-icon><Check /></el-icon>
                                    <span>{{ row.whiteListStr }}</span>
                                </el-tag>
                                <el-tag v-else type="info" size="small" effect="light">
                                    <span>{{ row.whiteListStr }}</span>
                                </el-tag>
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
                        <el-table-column label="操作" fixed="right" width="180" align="center">
                            <template #default="scope">
                                <div class="action-buttons">
                                    <el-button type="primary" link size="small" @click="openDialog(scope.row, 'view')">
                                        <el-icon><View /></el-icon>
                                        <span>详情</span>
                                    </el-button>
                                    <el-button type="primary" link size="small" @click="openDialog(scope.row, 'edit')">
                                        <el-icon><Edit /></el-icon>
                                        <span>编辑</span>
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

        <!-- API详情/编辑对话框 -->
        <el-dialog
            v-model="dialogEdit.open"
            :title="dialogEdit.title"
            width="700px"
            center
            destroy-on-close
            @closed="closeDialog"
            class="api-dialog">
            <ApiEditView
                v-model:server="dialogEdit.server"
                v-model:path="dialogEdit.path"
                v-model:type="dialogEdit.type"
                :key="dialogEdit.server + dialogEdit.path" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {
    House,
    Search,
    View,
    Edit,
    Connection,
    List,
    Link,
    Monitor,
    Folder,
    Document,
    Check,
    Clock,
    Timer,
    RefreshRight
} from '@element-plus/icons-vue'
import { http } from '@/utils';
import { onMounted, ref } from 'vue';
import ApiEditView from './ApiEditView.vue';

const loading = ref(false)
const multipleSelection = ref<any[]>([])
const tableData = ref<any[]>([])

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

const roles = ref<any[]>([])
const cascade = ref<any[]>([])

const getServerColor = (server: string) => {
    if (!server) return '#909399'
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a']
    const index = server.charCodeAt(0) % colors.length
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

const resetQuery = () => {
    queryParam.value = {
        search: '',
        roleId: '',
        server: '',
        groupName: ''
    }
    pageInfo.value.current = 1
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
.api-management-page {
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

                .el-button:first-child {
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

                .api-path-cell {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: 'Consolas', monospace;
                    color: var(--el-color-primary);

                    .el-icon {
                        font-size: 14px;
                    }

                    .path-text {
                        font-size: 13px;
                    }
                }

                .server-cell {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .server-icon {
                        width: 28px;
                        height: 28px;
                        border-radius: 6px;
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        .el-icon {
                            font-size: 14px;
                            color: white;
                        }
                    }
                }

                .group-cell,
                .api-name-cell {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--el-text-color-regular);

                    .el-icon {
                        font-size: 14px;
                        color: var(--el-text-color-secondary);
                    }
                }

                .whitelist-tag {
                    display: flex;
                    align-items: center;
                    gap: 4px;

                    .el-icon {
                        font-size: 12px;
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

.api-dialog {
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
    .api-management-page {
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
