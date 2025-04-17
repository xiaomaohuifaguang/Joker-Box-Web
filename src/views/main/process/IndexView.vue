<template>
    <div class="process-container">
        <el-divider />
        <div v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.7)">
            <!-- 筛选卡片区域 -->
            <div class="filter-section">
                <el-row :gutter="20" style="margin-bottom: 1rem;">
                    <el-col :span="4" :offset="2">
                        <el-card :class="['filter-card', { 'active': queryParam.type === '' }]" shadow="hover"
                            @click="queryParam.type = ''; queryPage()">
                            <div class="filter-content">
                                <span class="filter-icon all">
                                    <i class="el-icon-menu"></i>
                                </span>
                                <span>全部</span>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card :class="['filter-card', { 'active': queryParam.type === '2' }]" shadow="hover"
                            @click="queryParam.type = '2'; queryPage()">
                            <div class="filter-content">
                                <span class="filter-icon todo">
                                    <i class="el-icon-time"></i>
                                </span>
                                <span>待办</span>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card :class="['filter-card', { 'active': queryParam.type === '11' }]" shadow="hover"
                            @click="queryParam.type = '11'; queryPage()">
                            <div class="filter-content">
                                <span class="filter-icon apply">
                                    <i class="el-icon-time"></i>
                                </span>
                                <span>本人已申请</span>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card :class="['filter-card', { 'active': queryParam.type === '0' }]" shadow="hover"
                            @click="queryParam.type = '0'; queryPage()">
                            <div class="filter-content">
                                <span class="filter-icon draft">
                                    <i class="el-icon-document"></i>
                                </span>
                                <span>草稿</span>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <!-- 搜索和操作区域 -->
            <el-card class="search-card" shadow="never">
                <el-row :gutter="20">
                    <el-col :span="24">
                        <el-input v-model="queryParam.search" style="width: 100%" size="large" placeholder="搜索"
                            @keyup.enter="queryPage" :prefix-icon="Search" clearable>
                        </el-input>
                    </el-col>
                    <el-col :span="6" style="margin-top: 1rem;">
                        <el-button type="primary" plain @click="dialogAdd.show = true;" icon="el-icon-plus">
                            发起审批
                        </el-button>
                    </el-col>
                </el-row>
            </el-card>

            <!-- 表格区域 -->
            <el-card class="table-card" shadow="never">
                <el-table :data="tableData" style="width: 100%;min-height: 30vh;" stripe border
                    @selection-change="handleSelectionChange" @sort-change="handleSortChange"
                    :default-sort="{ prop: 'date', order: 'descending' }">
                    <el-table-column type="selection" width="50" align="center" />
                    <el-table-column prop="orderNo" label="工单号" />
                    <el-table-column prop="processDefinitionName" label="流程名称" />
                    <el-table-column prop="createByName" label="申请人" />
                    <el-table-column prop="createTime" label="创建时间" />
                    <el-table-column prop="updateTime" label="更新时间" />
                    <el-table-column prop="processInstanceCreateTime" label="提交时间" />
                    <el-table-column prop="processInstanceUpdateTime" label="流程更新时间" />
                    <el-table-column prop="taskNames" label="任务名称" />
                    <el-table-column prop="processStatus" label="流程状态" align="center">
                        <template #default="scope">
                            <el-tag v-if="scope.row.status == '0'" type="info" effect="light">
                                草稿
                            </el-tag>
                            <el-tag
                                v-if="scope.row.status == '1' && scope.row.processStatus == '1' && scope.row.taskId == null"
                                type="success" effect="light">
                                审批中
                            </el-tag>
                            <el-tag
                                v-if="scope.row.status == '1' && scope.row.processStatus == '21' && scope.row.taskId != null"
                                type="primary" effect="light">
                                待办
                            </el-tag>
                            <el-tag v-if="scope.row.status == '1' && scope.row.processStatus == '10'" type="info"
                                effect="light">
                                已结束
                            </el-tag>
                            <el-tag v-if="scope.row.status == '1' && scope.row.processStatus == '11'" type="success"
                                effect="light">
                                已终止
                            </el-tag>
                            <el-tag v-if="scope.row.status == '1' && scope.row.processStatus == '20'" type="success"
                                effect="light">
                                已挂起
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" label="操作" align="center">
                        <template #default="scope">
                            <!-- 保持原有操作按钮不变 -->
                            <el-button type="text" v-if="scope.row.status == '0'"
                                @click="dialogEdit.type = 'draft'; dialogEdit.workOrderId = scope.row.id; dialogEdit.show = true;">编辑</el-button>
                            <el-button type="text"
                                v-if="scope.row.status == '1' && scope.row.processStatus == '21' && scope.row.taskId != null"
                                @click="dialogEdit.type = 'handle'; dialogEdit.workOrderId = scope.row.id; dialogEdit.show = true;">审批</el-button>
                            <el-button type="text"
                                @click="dialogEdit.type = 'view'; dialogEdit.workOrderId = scope.row.id; dialogEdit.show = true;">查看</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <div class="pagination-container">
                    <el-pagination background layout="prev, pager, next, jumper, total" :total="pageInfo.total"
                        :page-size="pageInfo.size" v-model:current-page="pageInfo.current"
                        @current-change="handleCurrentChange" />
                </div>
            </el-card>
        </div>

        <!-- 对话框 - 保持原有不变 -->
        <el-dialog v-model="dialogAdd.show" width="80%">
            <ProcessDefinitionList
                @choose="dialogEdit.processDefinitionId = $event; dialogEdit.type = 'apply'; dialogEdit.show = true; dialogAdd.show = false;"
                :key="dialogEdit.show + randomId('')" />
        </el-dialog>
        <el-dialog v-model="dialogEdit.show" width="80%" :close-on-click-modal="false" :close-on-press-escape="false"
            v-if="dialogEdit.show" :show-close="false">
            <ProcessInstanceEdit :type="dialogEdit.type" :process-definition-id="dialogEdit.processDefinitionId"
                :workOrderId="dialogEdit.workOrderId"
                @success="dialogEdit.show = false; dialogEdit.processDefinitionId = undefined; dialogEdit.type = undefined; dialogEdit.workOrderId = undefined; queryPage()"
                :key="dialogEdit.show + randomId('')" />
        </el-dialog>
    </div>
</template>

<script setup lang='ts'>
// 保持原有脚本完全不变
import { http, alert, confirm, randomId } from '@/utils';
import { onMounted, ref } from 'vue';
import { Search } from '@element-plus/icons-vue'
import ProcessDefinitionList from './ProcessDefinitionList.vue'
import ProcessInstanceEdit from './ProcessInstanceEdit.vue';

const loading = ref(false)

const multipleSelection = ref([])

const tableData = ref([])

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

const dialogAdd = ref({
    show: false
})

const dialogEdit = ref({
    show: false,
    type: undefined,
    processDefinitionId: undefined,
    workOrderId: undefined,
})


const handleSelectionChange = (val: any) => {
    multipleSelection.value = val
    console.log(val)
}

const handleSortChange = (column: any) => {
    console.log(column)
}

const handleCurrentChange = (val: number) => {
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
            pageInfo.value.current = result.data.current
            pageInfo.value.size = result.data.size
            pageInfo.value.total = result.data.total
            pageInfo.value.pages = result.data.pages
            loading.value = false
        }
    })
}


onMounted(() => {
    queryPage()
})
</script>

<style scoped lang="scss">
.process-container {
    padding: 20px;
    //   background-color: #f5f7fa;

    .filter-section {
        margin-bottom: 20px;

        .filter-card {
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 8px;

            &:hover {
                transform: translateY(-3px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            &.active {
                border-color: var(--el-color-primary);
                background-color: rgba(64, 158, 255, 0.05);
            }

            .filter-content {
                display: flex;
                align-items: center;
                padding: 10px 0;

                .filter-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    color: white;
                    margin-right: 8px;

                    &.all {
                        background-color: #673AB7;
                    }

                    &.todo {
                        background-color: #FFC107;
                    }

                    &.apply {
                        background-color: #2196F3;
                    }

                    &.draft {
                        background-color: #909399;
                    }
                }
            }
        }
    }

    .search-card {
        margin-bottom: 20px;
        border-radius: 8px;

        :deep(.el-card__body) {
            padding: 15px 20px;
        }
    }

    .table-card {
        border-radius: 8px;

        :deep(.el-card__body) {
            padding: 0;
        }
    }

    .pagination-container {
        padding: 20px;
        display: flex;
        justify-content: center;
    }

}

@media (max-width: 768px) {
    .process-container {
        padding: 10px;

        .filter-section {
            .el-col {
                margin-bottom: 10px;
            }
        }
    }
}
</style>