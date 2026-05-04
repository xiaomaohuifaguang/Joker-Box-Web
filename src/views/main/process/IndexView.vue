<template>
    <div class="process-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon><Connection /></el-icon>
                    </div>
                    <div class="title-text">
                        <h1>流程审批</h1>
                        <p>管理和跟踪您的审批流程</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="page-body">
            <!-- 筛选卡片区域 -->
            <div class="filter-section">
                <div class="filter-grid">
                    <div v-for="filter in filters" :key="filter.value"
                         class="filter-card"
                         :class="{ active: queryParam.type === filter.value }"
                         @click="selectFilter(filter.value)">
                        <div class="filter-icon" :class="filter.class">
                            <el-icon :size="24">
                                <component :is="filter.icon" />
                            </el-icon>
                        </div>
                        <div class="filter-info">
                            <span class="filter-name">{{ filter.label }}</span>
                            <span class="filter-count">{{ filter.count }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 搜索和操作区域 -->
            <div class="toolbar-section">
                <div class="search-box">
                    <el-input v-model="queryParam.search" placeholder="搜索流程名称、工单号..." clearable
                        @keyup.enter="queryPage" class="search-input">
                        <template #prefix>
                            <el-icon><Search /></el-icon>
                        </template>
                    </el-input>
                </div>
                <el-button type="primary" @click="dialogAdd.show = true" class="create-btn">
                    <el-icon><Plus /></el-icon>
                    <span>发起审批</span>
                </el-button>
            </div>

            <!-- 表格区域 -->
            <div class="table-section" v-loading="loading">
                <el-table :data="tableData" style="width: 100%" stripe
                    @selection-change="handleSelectionChange" @sort-change="handleSortChange"
                    :default-sort="{ prop: 'date', order: 'descending' }" class="custom-table">
                    <el-table-column type="selection" width="50" align="center" />
                    <el-table-column prop="orderNo" label="工单号" min-width="140" show-overflow-tooltip />
                    <el-table-column prop="processDefinitionName" label="流程名称" min-width="150" show-overflow-tooltip />
                    <el-table-column prop="createByName" label="申请人" width="100" />
                    <el-table-column prop="createTime" label="创建时间" width="160" sortable />
                    <el-table-column prop="taskNames" label="当前任务" min-width="120" show-overflow-tooltip />
                    <el-table-column prop="processStatus" label="状态" width="100" align="center">
                        <template #default="scope">
                            <el-tag v-if="scope.row.status == '0'" type="info" effect="light" size="small">
                                草稿
                            </el-tag>
                            <el-tag v-else-if="scope.row.status == '1' && scope.row.processStatus == '1' && scope.row.taskId == null"
                                type="success" effect="light" size="small">
                                审批中
                            </el-tag>
                            <el-tag v-else-if="scope.row.status == '1' && scope.row.processStatus == '21' && scope.row.taskId != null"
                                type="primary" effect="light" size="small">
                                待办
                            </el-tag>
                            <el-tag v-else-if="scope.row.status == '1' && scope.row.processStatus == '10'"
                                type="info" effect="light" size="small">
                                已结束
                            </el-tag>
                            <el-tag v-else-if="scope.row.status == '1' && scope.row.processStatus == '11'"
                                type="success" effect="light" size="small">
                                已终止
                            </el-tag>
                            <el-tag v-else-if="scope.row.status == '1' && scope.row.processStatus == '20'"
                                type="warning" effect="light" size="small">
                                已挂起
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" label="操作" width="150" align="center">
                        <template #default="scope">
                            <div class="action-btns">
                                <el-button v-if="scope.row.status == '0'" link type="primary" size="small"
                                    @click="openEdit('draft', scope.row.id)">
                                    编辑
                                </el-button>
                                <el-button v-if="scope.row.status == '1' && scope.row.processStatus == '21' && scope.row.taskId != null"
                                    link type="success" size="small"
                                    @click="openEdit('handle', scope.row.id)">
                                    审批
                                </el-button>
                                <el-button link type="primary" size="small"
                                    @click="openEdit('view', scope.row.id)">
                                    查看
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <div class="pagination-wrapper">
                    <el-pagination background layout="total, prev, pager, next, jumper"
                        :total="pageInfo.total" :page-size="pageInfo.size"
                        v-model:current-page="pageInfo.current"
                        @current-change="handleCurrentChange" />
                </div>
            </div>
        </div>

        <!-- 对话框 -->
        <el-dialog v-model="dialogAdd.show" title="选择流程" width="900px" destroy-on-close
            class="process-dialog">
            <ProcessDefinitionList
                @choose="handleProcessChoose"
                :key="dialogAdd.show + randomId('')" />
        </el-dialog>

        <el-dialog v-model="dialogEdit.show" width="85%" top="5vh" :close-on-click-modal="false"
            :close-on-press-escape="false" v-if="dialogEdit.show" :show-close="false"
            class="process-edit-dialog">
            <ProcessInstanceEdit :type="dialogEdit.type"
                :process-definition-id="dialogEdit.processDefinitionId"
                :workOrderId="dialogEdit.workOrderId"
                @success="handleEditSuccess"
                :key="dialogEdit.show + randomId('')" />
        </el-dialog>
    </div>
</template>

<script setup lang='ts'>
import { http, randomId } from '@/utils';
import { onMounted, ref, shallowRef } from 'vue';
import {
    Search, Plus, Grid, Timer, Document, Collection, Connection
} from '@element-plus/icons-vue'
import ProcessDefinitionList from './ProcessDefinitionList.vue'
import ProcessInstanceEdit from './ProcessInstanceEdit.vue';

const loading = ref(false)
const tableData = ref<any[]>([])
const queryParam = ref({
    search: '',
    type: '1'
})
const pageInfo = ref({
    current: 1,
    size: 10,
    total: 0,
    pages: 0
})

const filters = shallowRef([
    { label: '全部', value: '', icon: Grid, class: 'all', count: 0 },
    { label: '待办', value: '2', icon: Timer, class: 'todo', count: 0 },
    { label: '已申请', value: '11', icon: Collection, class: 'apply', count: 0 },
    { label: '草稿', value: '0', icon: Document, class: 'draft', count: 0 },
])

const dialogAdd = ref({ show: false })
const dialogEdit = ref<{
    show: boolean
    type?: string
    processDefinitionId?: number
    workOrderId?: number
}>({
    show: false,
    type: undefined,
    processDefinitionId: undefined,
    workOrderId: undefined,
})

const selectFilter = (type: string) => {
    queryParam.value.type = type
    queryPage()
}

const handleSelectionChange = (val: any) => {
    console.log(val)
}

const handleSortChange = (column: any) => {
    console.log(column)
}

const handleCurrentChange = () => {
    queryPage()
}

const queryPage = () => {
    loading.value = true
    http.result({
        url: '/workOrder/queryPage',
        method: 'POST',
        data: {
            current: pageInfo.value.current,
            size: pageInfo.value.size,
            search: queryParam.value.search,
            type: queryParam.value.type
        },
        success(result) {
            tableData.value = result.data.records
            pageInfo.value.total = result.data.total
            pageInfo.value.pages = result.data.pages
            loading.value = false
        }
    })
}

const openEdit = (type: string, workOrderId: number) => {
    dialogEdit.value.type = type
    dialogEdit.value.workOrderId = workOrderId
    dialogEdit.value.show = true
}

const handleProcessChoose = (processDefinitionId: number) => {
    dialogEdit.value.processDefinitionId = processDefinitionId
    dialogEdit.value.type = 'apply'
    dialogEdit.value.show = true
    dialogAdd.value.show = false
}

const handleEditSuccess = () => {
    dialogEdit.value.show = false
    dialogEdit.value.processDefinitionId = undefined
    dialogEdit.value.type = undefined
    dialogEdit.value.workOrderId = undefined
    queryPage()
}

onMounted(() => {
    queryPage()
})
</script>

<style scoped lang="scss">
.process-page {
    min-height: calc(100vh - 70px);
    background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);
}

/* Page Header */
.page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 36px 0;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
}

.header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 32px;
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
        color: white;
        font-size: 32px;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .title-text {
        h1 {
            font-size: 28px;
            font-weight: 700;
            color: white;
            margin: 0 0 6px 0;
        }

        p {
            font-size: 15px;
            color: rgba(255, 255, 255, 0.9);
            margin: 0;
        }
    }
}

/* Page Body */
.page-body {
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px;
}

/* Filter Section */
.filter-section {
    margin-bottom: 28px;
}

.filter-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.filter-card {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 24px;
    background: var(--el-bg-color);
    border-radius: 16px;
    border: 1px solid var(--el-border-color-lighter);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        transform: scaleX(0);
        transition: transform 0.3s ease;
    }

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
        border-color: rgba(102, 126, 234, 0.4);

        &::before {
            transform: scaleX(1);
        }
    }

    &.active {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
        border-color: #667eea;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);

        &::before {
            transform: scaleX(1);
        }

        .filter-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .filter-name {
            color: #667eea;
            font-weight: 600;
        }
    }
}

.filter-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    flex-shrink: 0;

    &.all {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.18) 0%, rgba(118, 75, 162, 0.18) 100%);
        color: #667eea;
    }

    &.todo {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(251, 191, 36, 0.18) 100%);
        color: #f59e0b;
    }

    &.apply {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(52, 211, 153, 0.18) 100%);
        color: #10b981;
    }

    &.draft {
        background: linear-gradient(135deg, rgba(107, 114, 128, 0.18) 0%, rgba(156, 163, 175, 0.18) 100%);
        color: #6b7280;
    }
}

.filter-info {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .filter-name {
        font-size: 15px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        transition: color 0.3s ease;
    }

    .filter-count {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        font-weight: 600;
        background: var(--el-fill-color-light);
        padding: 2px 10px;
        border-radius: 10px;
        width: fit-content;
    }
}

/* Toolbar Section */
.toolbar-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 20px;
}

.search-box {
    flex: 1;
    max-width: 480px;

    .search-input {
        :deep(.el-input__wrapper) {
            border-radius: 12px;
            box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
            padding: 0 18px;
            transition: all 0.3s ease;

            &:hover, &.is-focus {
                box-shadow: 0 0 0 2px #667eea inset;
            }
        }

        :deep(.el-input__inner) {
            height: 48px;
        }
    }
}

.create-btn {
    height: 48px;
    padding: 0 28px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    font-weight: 600;
    font-size: 15px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
    }

    &:active {
        transform: translateY(0);
    }
}

/* Table Section */
.table-section {
    background: var(--el-bg-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--el-border-color-lighter);
}

.custom-table {
    :deep(.el-table__header-wrapper) {
        th.el-table__cell {
            background: linear-gradient(180deg, var(--el-fill-color-light) 0%, var(--el-fill-color) 100%);
            font-weight: 700;
            color: var(--el-text-color-primary);
            font-size: 14px;
        }
    }

    :deep(.el-table__row) {
        transition: all 0.2s ease;

        &:hover {
            background: linear-gradient(90deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
        }
    }
}

.action-btns {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding-top: 24px;
    border-top: 1px solid var(--el-border-color-lighter);
    margin-top: 24px;
}

/* Dialogs */
.process-dialog, .process-edit-dialog {
    :deep(.el-dialog__header) {
        padding: 24px 28px;
        border-bottom: 1px solid var(--el-border-color-lighter);
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);

        .el-dialog__title {
            font-weight: 700;
            font-size: 18px;
            color: var(--el-text-color-primary);
        }
    }

    :deep(.el-dialog__body) {
        padding: 0;
    }
}

/* Responsive */
@media (max-width: 1200px) {
    .filter-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .page-header {
        padding: 28px 0;
    }

    .header-content {
        padding: 0 20px;
    }

    .page-body {
        padding: 20px;
    }

    .filter-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .toolbar-section {
        flex-direction: column;
        align-items: stretch;

        .search-box {
            max-width: 100%;
        }

        .create-btn {
            width: 100%;
        }
    }

    .header-title {
        flex-direction: column;
        text-align: center;

        .title-icon {
            width: 56px;
            height: 56px;
            font-size: 28px;
        }

        .title-text h1 {
            font-size: 22px;
        }
    }

    .table-section {
        padding: 16px;
        border-radius: 12px;
    }
}
</style>