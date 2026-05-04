<template>
    <div class="mail-management-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon><Message /></el-icon>
                    </div>
                    <div class="title-text">
                        <h1>邮件管理</h1>
                        <p>管理和查看邮件记录</p>
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
                    <el-breadcrumb-item>邮件管理</el-breadcrumb-item>
                </el-breadcrumb>
            </div>

            <!-- 搜索区域 -->
            <div class="search-section">
                <div class="section-header">
                    <div class="header-icon search">
                        <el-icon><Search /></el-icon>
                    </div>
                    <span class="header-title">筛选条件</span>
                </div>
                <div class="search-form">
                    <el-input
                        v-model="queryParam.search"
                        placeholder="请输入搜索内容"
                        size="large"
                        clearable
                        @keyup.enter="queryPage"
                        @clear="queryPage">
                        <template #prefix>
                            <el-icon><Search /></el-icon>
                        </template>
                    </el-input>
                </div>
            </div>

            <!-- 邮件表格 -->
            <div class="table-section" v-loading="loading" element-loading-text="加载中...">
                <div class="section-header">
                    <div class="header-icon table">
                        <el-icon><List /></el-icon>
                    </div>
                    <span class="header-title">邮件列表</span>
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
                        <el-table-column prop="id" label="邮件ID" min-width="120">
                            <template #default="scope">
                                <el-tag type="info" effect="dark" size="small">{{ scope.row.id }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="toMail" label="收件人邮箱" min-width="180">
                            <template #default="scope">
                                <div class="email-cell">
                                    <el-icon><Message /></el-icon>
                                    <span>{{ scope.row.toMail }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="subject" label="主题" min-width="200">
                            <template #default="scope">
                                <div class="subject-cell">
                                    <el-icon><ChatLineRound /></el-icon>
                                    <span>{{ scope.row.subject }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="sendTime" label="发送时间" min-width="170">
                            <template #default="scope">
                                <div class="time-cell">
                                    <el-icon><Clock /></el-icon>
                                    <span>{{ scope.row.sendTime }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" fixed="right" width="120" align="center">
                            <template #default="scope">
                                <div class="action-buttons">
                                    <el-button type="primary" link size="small" @click="openDialog(scope.row.id, 'view')">
                                        <el-icon><View /></el-icon>
                                        <span>详情</span>
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

        <!-- 详情对话框 -->
        <el-dialog
            v-model="dialogEdit.open"
            :title="dialogEdit.title"
            width="800px"
            center
            destroy-on-close
            @closed="closeDialog"
            class="mail-dialog">
            <MailInfoInfoView v-model:id="dialogEdit.id" v-model:type="dialogEdit.type" :key="dialogEdit.id" />
        </el-dialog>

        <!-- 添加对话框 -->
        <el-dialog
            v-model="dialogAdd"
            title="添加邮件"
            width="500px"
            center
            destroy-on-close
            @closed="queryPage"
            class="mail-dialog">
            <MailInfoAddView @success="handleAddSuccess" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {
    House,
    Search,
    View,
    Message,
    List,
    ChatLineRound,
    Clock
} from '@element-plus/icons-vue'
import { http, alert, confirm } from '@/utils';
import { onMounted, ref } from 'vue';
import MailInfoInfoView from './MailInfoInfoView.vue';
import MailInfoAddView from './MailInfoAddView.vue';

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

const queryPage = async () => {
    loading.value = true
    const result = await http.post('/mailInfo/queryPage', {
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
    await http.post('/mailInfo/remove', { id })
    alert('删除成功', 'success')
    queryPage()
}

const openDialog = (id: string | number, type: string) => {
    dialogEdit.value = {
        open: true,
        title: type === 'view' ? '邮件详情' : '编辑邮件',
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
    confirm('提示', '确定删除该邮件吗？', async () => {
        await remove(id)
    })
}

onMounted(() => {
    queryPage()
})
</script>

<style scoped lang="scss">
.mail-management-page {
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
                background: var(--brand-gradient);
            }

            &.table {
                background: var(--data-grad-3);
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

        .header-count {
            margin-left: auto;
            font-size: 14px;
            color: var(--text-secondary);
            background: var(--bg-overlay);
            padding: 4px 12px;
            border-radius: 20px;
        }
    }

    .search-section {
        background: var(--bg-container);
        border-radius: 16px;
        padding: 24px;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border-light);
        margin-bottom: 24px;
    }

    .table-section {
        background: var(--bg-container);
        border-radius: 16px;
        padding: 24px;
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

                .email-cell,
                .subject-cell,
                .time-cell {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .el-icon {
                        font-size: 14px;
                        color: var(--text-secondary);
                    }
                }

                .action-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 4px;
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

.mail-dialog {
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
    .mail-management-page {
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
    }
}
</style>
