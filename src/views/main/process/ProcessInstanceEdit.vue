<template>
    <div v-loading="loading" class="process-detail-container">
        <!-- 流程信息卡片 -->
        <el-card shadow="hover" class="process-info-card">
            <template #header>
                <div class="card-header">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>流程信息</span>
                </div>
            </template>
            <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="8">
                    <div class="info-item">
                        <span class="info-label">流程ID</span>
                        <el-tag type="info" class="info-value" effect="light">
                            {{ processDefinitionInfo['id'] }}
                        </el-tag>
                    </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8">
                    <div class="info-item">
                        <span class="info-label">流程Key</span>
                        <el-tag type="warning" class="info-value" effect="light">
                            {{ processDefinitionInfo['processKey'] }}
                        </el-tag>
                    </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8">
                    <div class="info-item">
                        <span class="info-label">流程名称</span>
                        <el-tag type="success" class="info-value" effect="light">
                            {{ processDefinitionInfo['processName'] }}
                        </el-tag>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 流程处理记录卡片（已添加收起/展开功能） -->
        <el-card shadow="hover" class="process-info-card" v-if="workOrder.status == '1'">
            <template #header>
                <div class="card-header" @click="toggleProcessRecord">
                    <el-icon>
                        <Clock />
                    </el-icon>
                    <span>流程处理记录</span>
                    <el-icon class="collapse-icon" :class="{ 'is-collapsed': isProcessRecordCollapsed }">
                        <ArrowDown />
                    </el-icon>
                </div>
            </template>
            <el-collapse-transition>
                <div v-show="!isProcessRecordCollapsed">
                    <el-timeline>
                        <el-timeline-item v-for="(item, index) in workOrder.processInfo.handleInfos" :key="item.id"
                            :type="getTimelineType(item.handleType)" :timestamp="item.handleTime" placement="top">
                            <el-card shadow="never" class="timeline-card">
                                <div class="timeline-header">
                                    <span class="task-name">{{ item.taskName }}</span>
                                    <el-tag :type="getTagType(item.handleType)" size="small">
                                        {{ getHandleTypeText(item.handleType) }}
                                    </el-tag>
                                </div>
                                <div class="timeline-content">
                                    <div class="content-item">
                                        <span class="item-label">处理人:</span>
                                        <span class="item-value">{{ item.handleUserName }}</span>
                                    </div>
                                    <div class="content-item" v-if="item.remark">
                                        <span class="item-label">备注:</span>
                                        <span class="item-value">{{ item.remark }}</span>
                                    </div>
                                </div>
                            </el-card>
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </el-collapse-transition>
        </el-card>

        <!-- 工单信息卡片 -->
        <el-card shadow="hover" class="work-order-card">
            <template #header>
                <div class="card-header">
                    <el-icon>
                        <Tickets />
                    </el-icon>
                    <span>工单信息</span>
                </div>
            </template>
            <el-descriptions :column="2" border>
                <el-descriptions-item label="工单ID">{{ workOrder.id }}</el-descriptions-item>
                <el-descriptions-item label="工单编号">{{ workOrder.orderNo }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                    <el-tag :type="getStatusTagType(workOrder.status)">
                        {{ getStatusText(workOrder.status) }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建人">{{ workOrder.createByName }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ workOrder.createTime }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ workOrder.updateTime }}</el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">
                    {{ workOrder.remark || '无' }}
                </el-descriptions-item>
            </el-descriptions>
        </el-card>

        <!-- 操作按钮区域 -->
        <div class="action-buttons">
            <template v-if="props.type == 'apply' || props.type == 'draft'">
                <el-button type="primary" @click="startApi" plain>
                    <el-icon>
                        <Promotion />
                    </el-icon>
                    <span>发起流程</span>
                </el-button>
                <el-button type="warning" @click="draftApi" plain>
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>保存草稿</span>
                </el-button>
                <el-button @click="emit('success')" plain>
                    <el-icon>
                        <Close />
                    </el-icon>
                    <span>{{ props.type == 'apply' ? '关闭' : '取消' }}</span>
                </el-button>
            </template>

            <template v-if="props.type == 'handle'">
                <el-button type="success" @click="pass" v-if="workOrder['processInfo']['handleButton'].includes('1')"
                    plain>
                    <el-icon>
                        <CircleCheck />
                    </el-icon>
                    <span>通过</span>
                </el-button>
                <el-button type="danger" @click="reject" v-if="workOrder['processInfo']['handleButton'].includes('2')"
                    plain>
                    <el-icon>
                        <CircleClose />
                    </el-icon>
                    <span>拒绝</span>
                </el-button>
                <el-button type="primary" @click="transferDialog.show = true"
                    v-if="workOrder['processInfo']['handleButton'].includes('3')" plain>
                    <el-icon>
                        <Share />
                    </el-icon>
                    <span>转办</span>
                </el-button>
                <el-button @click="emit('success')" plain>
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                    <span>返回</span>
                </el-button>
            </template>

            <template v-if="props.type != 'handle' && props.type != 'apply' && props.type != 'draft'">
                <el-button @click="emit('success')" plain>
                    <el-icon>
                        <Close />
                    </el-icon>
                    <span>关闭</span>
                </el-button>
            </template>
        </div>

        <!-- 转办对话框 -->
        <el-dialog v-model="transferDialog.show" title="选择转办人" width="400px" center>
            <el-card shadow="never">
                <UserSelectorSingle @update:id="(newId) => { transferDialog.userId = newId }" />
            </el-card>
            <template #footer>
                <el-button @click="transferDialog.show = false">取消</el-button>
                <el-button type="primary" @click="transfer(transferDialog.userId)">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { Document, Clock, Tickets, Promotion, Close, CircleCheck, CircleClose, Share, ArrowLeft, ArrowDown } from '@element-plus/icons-vue'
import UserSelectorSingle from '@/components/common/user/UserSelectorSingle.vue';
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const emit = defineEmits(['success'])

const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    processDefinitionId: {
        type: Number,
        default: 0
    },
    workOrderId: {
        type: Number,
        default: 0
    }
})

const transferDialog = ref({
    show: false,
    userId: ''
})

const loading = ref(false)
const isProcessRecordCollapsed = ref(false)

const workOrder = ref({
    id: '',
    orderNo: '',
    processDefinitionId: '',
    processInstanceId: '',
    processDefinitionName: '',
    remark: '',
    status: '',
    createByName: '',
    createTime: '',
    updateTime: '',
    processInfo: {
        processInstance: {},
        handleButton: [],
        handleInfos: []
    }
})

const processDefinitionInfo = ref({})

// 切换流程记录收起/展开状态
const toggleProcessRecord = () => {
    isProcessRecordCollapsed.value = !isProcessRecordCollapsed.value
}

// 获取处理类型文本
const getHandleTypeText = (type) => {
    const types = {
        '0': '申请',
        '1': '通过',
        '2': '拒绝',
        '3': '转办',
        '8': '系统任务'
    }
    return types[type] || '处理'
}

// 获取标签类型
const getTagType = (type) => {
    const types = {
        '0': 'info',
        '1': 'success',
        '2': 'danger',
        '3': 'primary',
        '8': 'success'
    }
    return types[type] || 'info'
}

// 获取时间线类型
const getTimelineType = (type) => {
    const types = {
        '0': 'primary',
        '1': 'success',
        '2': 'danger',
        '3': 'warning',
        '8': 'success'
    }
    return types[type] || 'primary'
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        '0': '草稿',
        '1': '已提交'
    }
    return statusMap[status] || '未知'
}

// 获取状态标签类型
const getStatusTagType = (status) => {
    const types = {
        '0': 'info',
        // '1': 'warning',
        '1': 'success',
        // '3': 'danger'
    }
    return types[status] || 'info'
}

onMounted(() => {
    loading.value = true;
    switch (props.type) {
        case 'apply':
            workOrder.value.processDefinitionId = '' + props.processDefinitionId
            processDefinitionInfoApi(props.processDefinitionId)
            break
        case 'handle':
            workOrderInfoApi(props.workOrderId)
            break;
        case 'view':
            workOrderInfoApi(props.workOrderId)
            break;
        case 'draft':
            workOrderInfoApi(props.workOrderId)
            break;
        default:
            break
    }
})

const processDefinitionInfoApi = (processDefinitionId) => {
    http.result({
        url: '/processDefinition/info',
        method: 'POST',
        data: {
            id: processDefinitionId
        },
        success: (result) => {
            processDefinitionInfo.value = result.data
            loading.value = false;
        }
    })
}

const startApi = () => {
    http.result({
        url: '/workOrder/start',
        method: 'POST',
        data: workOrder.value,
        success: (result) => {
            alert(result.msg, 'success')
            emit('success')
        }
    })
}

const draftApi = () => {
    http.result({
        url: '/workOrder/draft',
        method: 'POST',
        data: workOrder.value,
        success: (result) => {
            alert(result.msg, 'success')
            emit('success')
        }
    })
}

const workOrderInfoApi = (workOrderId) => {
    http.result({
        url: '/workOrder/info',
        method: 'POST',
        data: {
            id: workOrderId
        },
        success: (result) => {
            workOrder.value = result.data;
            processDefinitionInfoApi(workOrder.value['processDefinitionId'])
        }
    })
}

const pass = () => {
    http.result({
        url: '/workOrder/pass',
        method: 'POST',
        data: {
            id: props.workOrderId
        },
        success: (result) => {
            alert(result.msg, 'success')
            emit('success')
        }
    })
}

const transfer = (userId) => {
    http.result({
        url: '/workOrder/transfer',
        method: 'POST',
        params: {
            userId: userId
        },
        data: {
            id: props.workOrderId
        },
        success: (result) => {
            alert(result.msg, 'success');
            transferDialog.value.show = false;
            emit('success')
        }
    })
}

const reject = () => {
    http.result({
        url: '/workOrder/reject',
        method: 'POST',
        data: {
            id: props.workOrderId
        },
        success: (result) => {
            alert(result.msg, 'success');
            emit('success')
        }
    })
}
</script>

<style scoped lang="scss">
.process-detail-container {
    padding: 20px;
    background-color: var(--el-bg-color);
    max-width: 1200px;
    margin: 0 auto;

    .card-header {
        display: flex;
        align-items: center;
        font-weight: 500;
        position: relative;
        cursor: pointer;

        .el-icon {
            margin-right: 8px;
            font-size: 18px;
        }

        .collapse-icon {
            position: absolute;
            right: 20px;
            transition: transform 0.3s ease;

            &.is-collapsed {
                transform: rotate(-90deg);
            }
        }
    }

    .process-info-card,
    .work-order-card {
        margin-bottom: 24px;
        border-radius: 8px;
        border: 1px solid var(--el-border-color-light);
        transition: all 0.3s ease;

        &:hover {
            box-shadow: var(--el-box-shadow-light);
        }

        :deep(.el-card__header) {
            padding: 12px 20px;
            border-bottom: 1px solid var(--el-border-color-light);
        }

        :deep(.el-card__body) {
            padding: 20px;
        }

        .info-item {
            display: flex;
            flex-direction: column;
            align-items: flex-start;

            .info-label {
                margin-bottom: 8px;
                color: var(--el-text-color-secondary);
                font-size: 14px;
            }

            .info-value {
                width: 100%;
                text-align: left;
                padding: 4px 12px;
                font-size: 14px;
                border-radius: 4px;
            }
        }
    }

    .timeline-card {
        margin: 10px 0;
        padding: 12px;
        border-radius: 6px;
        background-color: var(--el-bg-color-overlay);
        box-shadow: var(--el-box-shadow-light);

        .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .task-name {
                font-weight: 500;
                font-size: 15px;
            }
        }

        .timeline-content {
            .content-item {
                display: flex;
                margin-bottom: 8px;
                font-size: 14px;

                .item-label {
                    color: var(--el-text-color-secondary);
                    margin-right: 8px;
                    min-width: 40px;
                }

                .item-value {
                    color: var(--el-text-color-regular);
                }
            }
        }
    }

    .el-timeline {
        padding-left: 10px;

        :deep(.el-timeline-item__node) {
            background-color: var(--el-color-primary);
            width: 12px;
            height: 12px;
        }

        :deep(.el-timeline-item__timestamp) {
            color: var(--el-text-color-secondary);
            font-size: 13px;
            margin-bottom: 4px;
        }
    }

    .action-buttons {
        display: flex;
        justify-content: center;
        gap: 16px;
        padding: 24px 0;
        margin-top: 20px;

        .el-button {
            min-width: 120px;
            border-radius: 6px;
            transition: all 0.3s ease;

            &:hover {
                transform: translateY(-2px);
                box-shadow: var(--el-box-shadow-light);
            }

            .el-icon {
                margin-right: 6px;
            }
        }
    }
}

@media (max-width: 768px) {
    .process-detail-container {
        padding: 12px;

        .process-info-card,
        .work-order-card {
            margin-bottom: 16px;

            :deep(.el-card__body) {
                padding: 16px;
            }

            .el-col {
                margin-bottom: 16px;

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }

        .action-buttons {
            flex-wrap: wrap;
            gap: 12px;

            .el-button {
                width: 100%;
                margin: 0;
            }
        }
    }
}
</style>