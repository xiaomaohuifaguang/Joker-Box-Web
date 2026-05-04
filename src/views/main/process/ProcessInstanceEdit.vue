<template>
    <div v-loading="loading" class="process-detail-container">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon><DocumentChecked /></el-icon>
                    </div>
                    <div class="title-text">
                        <h1>{{ getPageTitle() }}</h1>
                        <p>查看和处理流程审批详情</p>
                    </div>
                </div>
                <div class="header-status" v-if="workOrder.status">
                    <el-tag :type="getStatusTagType(workOrder.status)" size="large" effect="dark">
                        {{ getStatusText(workOrder.status) }}
                    </el-tag>
                </div>
            </div>
        </div>

        <!-- 流程信息卡片 -->
        <div class="info-section">
            <div class="section-header">
                <div class="section-icon info">
                    <el-icon><Document /></el-icon>
                </div>
                <span class="section-title">流程信息</span>
            </div>
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-icon id">
                        <el-icon><Key /></el-icon>
                    </div>
                    <div class="info-content">
                        <span class="info-label">流程ID</span>
                        <span class="info-value">{{ processDefinitionInfo['id'] || '-' }}</span>
                    </div>
                </div>
                <div class="info-card">
                    <div class="info-icon key">
                        <el-icon><Connection /></el-icon>
                    </div>
                    <div class="info-content">
                        <span class="info-label">流程Key</span>
                        <span class="info-value">{{ processDefinitionInfo['processKey'] || '-' }}</span>
                    </div>
                </div>
                <div class="info-card">
                    <div class="info-icon name">
                        <el-icon><Collection /></el-icon>
                    </div>
                    <div class="info-content">
                        <span class="info-label">流程名称</span>
                        <span class="info-value">{{ processDefinitionInfo['processName'] || '-' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 流程处理记录卡片 -->
        <div class="timeline-section" v-if="workOrder.status == '1'">
            <div class="section-header clickable" @click="toggleProcessRecord">
                <div class="section-icon timeline">
                    <el-icon><Clock /></el-icon>
                </div>
                <span class="section-title">流程处理记录</span>
                <div class="section-actions">
                    <el-icon class="collapse-icon" :class="{ 'is-collapsed': isProcessRecordCollapsed }">
                        <ArrowDown />
                    </el-icon>
                </div>
            </div>
            <el-collapse-transition>
                <div v-show="!isProcessRecordCollapsed" class="timeline-content-wrapper">
                    <el-timeline v-if="workOrder.processInfo.handleInfos?.length">
                        <el-timeline-item 
                            v-for="(item, index) in workOrder.processInfo.handleInfos" 
                            :key="item.id"
                            :type="getTimelineType(item.handleType)" 
                            :timestamp="item.handleTime" 
                            placement="top">
                            <div class="timeline-card">
                                <div class="timeline-header">
                                    <div class="task-info">
                                        <div class="task-icon" :class="getTimelineIconClass(item.handleType)">
                                            <el-icon>
                                                <component :is="getTimelineIcon(item.handleType)" />
                                            </el-icon>
                                        </div>
                                        <span class="task-name">{{ item.taskName }}</span>
                                    </div>
                                    <el-tag :type="getTagType(item.handleType)" size="small" effect="light">
                                        {{ getHandleTypeText(item.handleType) }}
                                    </el-tag>
                                </div>
                                <div class="timeline-body">
                                    <div class="timeline-row">
                                        <span class="row-label">
                                            <el-icon><User /></el-icon>
                                            处理人
                                        </span>
                                        <span class="row-value">{{ item.handleUserName }}</span>
                                    </div>
                                    <div class="timeline-row" v-if="item.remark">
                                        <span class="row-label">
                                            <el-icon><ChatDotRound /></el-icon>
                                            备注
                                        </span>
                                        <span class="row-value remark">{{ item.remark }}</span>
                                    </div>
                                </div>
                            </div>
                        </el-timeline-item>
                    </el-timeline>
                    <div v-else class="empty-timeline">
                        <el-icon><InfoFilled /></el-icon>
                        <span>暂无处理记录</span>
                    </div>
                </div>
            </el-collapse-transition>
        </div>

        <!-- 工单信息卡片 -->
        <div class="workorder-section">
            <div class="section-header">
                <div class="section-icon workorder">
                    <el-icon><Tickets /></el-icon>
                </div>
                <span class="section-title">工单信息</span>
            </div>
            <div class="workorder-grid">
                <div class="workorder-item">
                    <span class="item-label">工单ID</span>
                    <span class="item-value">{{ workOrder.id || '-' }}</span>
                </div>
                <div class="workorder-item">
                    <span class="item-label">工单编号</span>
                    <span class="item-value">{{ workOrder.orderNo || '-' }}</span>
                </div>
                <div class="workorder-item">
                    <span class="item-label">状态</span>
                    <el-tag :type="getStatusTagType(workOrder.status)" size="small" effect="light">
                        {{ getStatusText(workOrder.status) }}
                    </el-tag>
                </div>
                <div class="workorder-item">
                    <span class="item-label">创建人</span>
                    <span class="item-value">{{ workOrder.createByName || '-' }}</span>
                </div>
                <div class="workorder-item">
                    <span class="item-label">创建时间</span>
                    <span class="item-value">{{ workOrder.createTime || '-' }}</span>
                </div>
                <div class="workorder-item">
                    <span class="item-label">更新时间</span>
                    <span class="item-value">{{ workOrder.updateTime || '-' }}</span>
                </div>
                <div class="workorder-item full-width">
                    <span class="item-label">备注</span>
                    <span class="item-value remark-text">{{ workOrder.remark || '无' }}</span>
                </div>
            </div>
        </div>

        <!-- 操作按钮区域 -->
        <div class="action-section">
            <template v-if="props.type == 'apply' || props.type == 'draft'">
                <el-button type="primary" @click="startApi" class="action-btn primary">
                    <el-icon><Promotion /></el-icon>
                    <span>发起流程</span>
                </el-button>
                <el-button type="warning" @click="draftApi" class="action-btn warning">
                    <el-icon><Document /></el-icon>
                    <span>保存草稿</span>
                </el-button>
                <el-button @click="emit('success')" class="action-btn">
                    <el-icon><Close /></el-icon>
                    <span>{{ props.type == 'apply' ? '关闭' : '取消' }}</span>
                </el-button>
            </template>

            <template v-if="props.type == 'handle'">
                <el-button type="success" @click="pass" v-if="workOrder['processInfo']['handleButton'].includes('1')" class="action-btn success">
                    <el-icon><CircleCheck /></el-icon>
                    <span>通过</span>
                </el-button>
                <el-button type="danger" @click="reject" v-if="workOrder['processInfo']['handleButton'].includes('2')" class="action-btn danger">
                    <el-icon><CircleClose /></el-icon>
                    <span>拒绝</span>
                </el-button>
                <el-button type="primary" @click="transferDialog.show = true" v-if="workOrder['processInfo']['handleButton'].includes('3')" class="action-btn primary">
                    <el-icon><Share /></el-icon>
                    <span>转办</span>
                </el-button>
                <el-button @click="emit('success')" class="action-btn">
                    <el-icon><ArrowLeft /></el-icon>
                    <span>返回</span>
                </el-button>
            </template>

            <template v-if="props.type != 'handle' && props.type != 'apply' && props.type != 'draft'">
                <el-button @click="emit('success')" class="action-btn">
                    <el-icon><Close /></el-icon>
                    <span>关闭</span>
                </el-button>
            </template>
        </div>

        <!-- 转办对话框 -->
        <el-dialog v-model="transferDialog.show" title="选择转办人" width="450px" center class="transfer-dialog" destroy-on-close>
            <div class="transfer-content">
                <div class="transfer-tip">
                    <el-icon><InfoFilled /></el-icon>
                    <span>请选择要转办给的用户</span>
                </div>
                <UserSelectorSingle @update:id="(newId) => { transferDialog.userId = newId }" />
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="transferDialog.show = false">取消</el-button>
                    <el-button type="primary" @click="transfer(transferDialog.userId)">确定转办</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { 
    Document, 
    Clock, 
    Tickets, 
    Promotion, 
    Close, 
    CircleCheck, 
    CircleClose, 
    Share, 
    ArrowLeft, 
    ArrowDown,
    DocumentChecked,
    Key,
    Connection,
    Collection,
    User,
    ChatDotRound,
    InfoFilled,
    Check,
    CloseBold,
    RefreshRight,
    Opportunity
} from '@element-plus/icons-vue'
import UserSelectorSingle from '@/components/common/user/UserSelectorSingle.vue';
import { alert, http } from '@/utils';
import { onMounted, ref, computed } from 'vue';

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

// 获取页面标题
const getPageTitle = () => {
    const titles = {
        'apply': '发起流程',
        'handle': '处理审批',
        'view': '查看详情',
        'draft': '编辑草稿'
    }
    return titles[props.type] || '流程详情'
}

// 切换流程记录收起/展开状态
const toggleProcessRecord = () => {
    isProcessRecordCollapsed.value = !isProcessRecordCollapsed.value
}

// 获取时间线图标
const getTimelineIcon = (type) => {
    const icons = {
        '0': Document,
        '1': Check,
        '2': CloseBold,
        '3': RefreshRight,
        '8': Opportunity
    }
    return icons[type] || Document
}

// 获取时间线图标样式类
const getTimelineIconClass = (type) => {
    const classes = {
        '0': 'apply',
        '1': 'pass',
        '2': 'reject',
        '3': 'transfer',
        '8': 'system'
    }
    return classes[type] || 'default'
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
        '1': 'success',
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

const processDefinitionInfoApi = async (processDefinitionId) => {
    processDefinitionInfo.value = await http.post('/processDefinition/info', {
        id: processDefinitionId
    })
    loading.value = false;
}

const startApi = async () => {
    const result = await http.post('/workOrder/start', workOrder.value, { raw: true })
    alert(result.msg, 'success')
    emit('success')
}

const draftApi = async () => {
    const result = await http.post('/workOrder/draft', workOrder.value, { raw: true })
    alert(result.msg, 'success')
    emit('success')
}

const workOrderInfoApi = async (workOrderId) => {
    workOrder.value = await http.post('/workOrder/info', {
        id: workOrderId
    })
    processDefinitionInfoApi(workOrder.value['processDefinitionId'])
}

const pass = async () => {
    const result = await http.post('/workOrder/pass', {
        id: props.workOrderId
    }, { raw: true })
    alert(result.msg, 'success')
    emit('success')
}

const transfer = async (userId) => {
    const result = await http.post('/workOrder/transfer', {
        id: props.workOrderId
    }, {
        params: {
            userId: userId
        },
        raw: true
    })
    alert(result.msg, 'success');
    transferDialog.value.show = false;
    emit('success')
}

const reject = async () => {
    const result = await http.post('/workOrder/reject', {
        id: props.workOrderId
    }, { raw: true })
    alert(result.msg, 'success');
    emit('success')
}
</script>

<style scoped lang="scss">
.process-detail-container {
    padding: 32px;
    background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-elevated) 100%);
    min-height: 100%;
    max-width: 1400px;
    margin: 0 auto;

    // 页面头部
    .page-header {
        margin-bottom: 28px;
        background: var(--brand-gradient);
        border-radius: 20px;
        padding: 36px;
        color: var(--text-on-brand);
        box-shadow: var(--shadow-glow-strong);
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
            border-radius: 50%;
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
            position: relative;
            z-index: 1;
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 24px;

            .title-icon {
                width: 72px;
                height: 72px;
                background: rgba(255, 255, 255, 0.25);
                border-radius: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(12px);
                box-shadow: var(--shadow-lg);

                .el-icon {
                    font-size: 36px;
                }
            }

            .title-text {
                h1 {
                    margin: 0 0 8px 0;
                    font-size: 30px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                p {
                    margin: 0;
                    opacity: 0.92;
                    font-size: 16px;
                }
            }
        }

        .header-status {
            :deep(.el-tag) {
                font-size: 15px;
                padding: 10px 20px;
                border-radius: 24px;
                border: none;
                font-weight: 600;
                backdrop-filter: blur(10px);
                box-shadow: var(--shadow-md);
            }
        }
    }

    // 区块通用样式
    .info-section,
    .timeline-section,
    .workorder-section {
        background: var(--bg-container);
        border-radius: 16px;
        margin-bottom: 28px;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-light);
        overflow: hidden;
        transition: all 0.3s ease;

        &:hover {
            box-shadow: var(--shadow-lg);
        }
    }

    .section-header {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 24px 28px;
        border-bottom: 1px solid var(--border-light);
        background: linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-container) 100%);

        &.clickable {
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                background: linear-gradient(180deg, var(--bg-overlay) 0%, var(--bg-container) 100%);
            }
        }

        .section-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-md);

            &.info {
                background: var(--brand-gradient);
                color: var(--text-on-brand);
            }

            &.timeline {
                background: var(--data-grad-6);
                color: var(--text-on-brand);
            }

            &.workorder {
                background: var(--data-grad-3);
                color: var(--text-on-brand);
            }

            .el-icon {
                font-size: 22px;
            }
        }

        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            flex: 1;
        }

        .section-actions {
            .collapse-icon {
                font-size: 20px;
                color: var(--text-secondary);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                padding: 8px;
                border-radius: 8px;

                &:hover {
                    background: var(--bg-overlay);
                }

                &.is-collapsed {
                    transform: rotate(-90deg);
                }
            }
        }
    }

    // 流程信息网格
    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        padding: 28px;

        .info-card {
            display: flex;
            align-items: center;
            gap: 18px;
            padding: 24px;
            background: linear-gradient(135deg, var(--bg-overlay) 0%, var(--bg-container) 100%);
            border-radius: 16px;
            border: 1px solid var(--border-light);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;

            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            &:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-lg);
                border-color: var(--brand-primary-light);

                &::before {
                    opacity: 1;
                }
            }

            .info-icon {
                width: 56px;
                height: 56px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                box-shadow: var(--shadow-md);

                &.id {
                    background: var(--brand-gradient);
                    color: var(--text-on-brand);
                }

                &.key {
                    background: var(--data-grad-6);
                    color: var(--text-on-brand);
                }

                &.name {
                    background: var(--data-grad-3);
                    color: var(--text-on-brand);
                }

                .el-icon {
                    font-size: 28px;
                }
            }

            .info-content {
                display: flex;
                flex-direction: column;
                gap: 6px;
                min-width: 0;

                .info-label {
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .info-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text-primary);
                    word-break: break-all;
                }
            }
        }
    }

    // 时间线区域
    .timeline-content-wrapper {
        padding: 28px;

        .el-timeline {
            padding-left: 12px;

            :deep(.el-timeline-item__node) {
                width: 16px;
                height: 16px;
                box-shadow: var(--shadow-sm);
            }

            :deep(.el-timeline-item__timestamp) {
                color: var(--text-secondary);
                font-size: 13px;
                margin-bottom: 12px;
                font-weight: 500;
            }

            :deep(.el-timeline-item__tail) {
                border-left: 2px solid var(--border-light);
            }
        }

        .timeline-card {
            background: linear-gradient(135deg, var(--bg-overlay) 0%, var(--bg-container) 100%);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid var(--border-light);
            box-shadow: var(--shadow-sm);
            transition: all 0.3s ease;

            &:hover {
                box-shadow: var(--shadow-md);
                border-color: var(--border-base);
            }

            .timeline-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid var(--border-light);

                .task-info {
                    display: flex;
                    align-items: center;
                    gap: 14px;

                    .task-icon {
                        width: 40px;
                        height: 40px;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: var(--shadow-sm);

                        &.apply {
                            background: var(--info-bg);
                            color: var(--info);
                        }

                        &.pass {
                            background: var(--success-bg);
                            color: var(--success);
                        }

                        &.reject {
                            background: var(--danger-bg);
                            color: var(--danger);
                        }

                        &.transfer {
                            background: var(--bg-overlay);
                            color: var(--brand-primary);
                        }

                        &.system {
                            background: var(--warning-bg);
                            color: var(--warning);
                        }

                        .el-icon {
                            font-size: 20px;
                        }
                    }

                    .task-name {
                        font-weight: 700;
                        font-size: 16px;
                        color: var(--text-primary);
                    }
                }
            }

            .timeline-body {
                .timeline-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    margin-bottom: 10px;

                    &:last-child {
                        margin-bottom: 0;
                    }

                    .row-label {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 14px;
                        color: var(--text-secondary);
                        min-width: 80px;
                        flex-shrink: 0;
                        font-weight: 500;

                        .el-icon {
                            font-size: 16px;
                        }
                    }

                    .row-value {
                        font-size: 15px;
                        color: var(--text-regular);
                        flex: 1;
                        line-height: 1.6;

                        &.remark {
                            background: var(--bg-container);
                            padding: 12px 16px;
                            border-radius: 10px;
                            border-left: 4px solid var(--brand-primary);
                            box-shadow: var(--shadow-sm);
                        }
                    }
                }
            }
        }

        .empty-timeline {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 64px 48px;
            color: var(--text-secondary);
            gap: 16px;

            .el-icon {
                font-size: 64px;
                opacity: 0.4;
            }

            span {
                font-size: 15px;
                font-weight: 500;
            }
        }
    }

    // 工单信息网格
    .workorder-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 24px;
        padding: 28px;

        .workorder-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 20px;
            background: linear-gradient(135deg, var(--bg-overlay) 0%, var(--bg-container) 100%);
            border-radius: 14px;
            border: 1px solid var(--border-light);
            transition: all 0.3s ease;

            &:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
                border-color: var(--border-base);
            }

            &.full-width {
                grid-column: 1 / -1;
            }

            .item-label {
                font-size: 12px;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.8px;
                font-weight: 600;
            }

            .item-value {
                font-size: 15px;
                font-weight: 600;
                color: var(--text-primary);

                &.remark-text {
                    line-height: 1.7;
                    color: var(--text-regular);
                    font-weight: 400;
                }
            }
        }
    }

    // 操作按钮区域
    .action-section {
        display: flex;
        justify-content: center;
        gap: 20px;
        padding: 36px 28px;
        flex-wrap: wrap;
        background: var(--bg-container);
        border-radius: 16px;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-light);

        .action-btn {
            min-width: 160px;
            height: 50px;
            border-radius: 14px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            letter-spacing: 0.3px;

            &:hover {
                transform: translateY(-3px);
                box-shadow: var(--shadow-lg);
            }

            &:active {
                transform: translateY(-1px);
            }

            .el-icon {
                margin-right: 8px;
                font-size: 18px;
            }

            &.primary {
                background: var(--brand-gradient);
                border: none;
                box-shadow: var(--shadow-md);

                &:hover {
                    box-shadow: var(--shadow-lg);
                }
            }

            &.success {
                background: var(--data-grad-4);
                border: none;
                box-shadow: var(--shadow-md);

                &:hover {
                    box-shadow: var(--shadow-lg);
                }
            }

            &.danger {
                background: var(--danger-bg);
                border: none;
                box-shadow: var(--shadow-md);

                &:hover {
                    box-shadow: var(--shadow-lg);
                }
            }

            &.warning {
                background: var(--data-grad-6);
                border: none;
                box-shadow: 0 4px 12px rgba(240, 147, 251, 0.25);

                &:hover {
                    box-shadow: 0 8px 24px rgba(240, 147, 251, 0.4);
                }
            }
        }
    }
}

// 转办对话框样式
.transfer-dialog {
    :deep(.el-dialog__header) {
        background: var(--brand-gradient);
        margin: 0;
        padding: 24px 28px;

        .el-dialog__title {
            color: var(--text-on-brand);
            font-weight: 700;
            font-size: 18px;
        }

        .el-dialog__headerbtn .el-dialog__close {
            color: var(--text-on-brand);
            font-size: 20px;
            transition: all 0.3s ease;

            &:hover {
                transform: rotate(90deg);
            }
        }
    }

    :deep(.el-dialog__body) {
        padding: 28px;
    }

    .transfer-content {
        .transfer-tip {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 16px 20px;
            background: linear-gradient(135deg, var(--bg-overlay) 0%, var(--bg-overlay) 100%);
            border-radius: 12px;
            margin-bottom: 24px;
            color: var(--brand-primary);
            font-size: 15px;
            font-weight: 500;

            .el-icon {
                font-size: 20px;
            }
        }
    }

    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        padding-top: 8px;
    }
}

// 响应式适配
@media (max-width: 1200px) {
    .process-detail-container {
        padding: 24px;

        .info-grid,
        .workorder-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
}

@media (max-width: 768px) {
    .process-detail-container {
        padding: 16px;

        .page-header {
            padding: 28px 24px;
            border-radius: 16px;

            .header-content {
                flex-direction: column;
                text-align: center;
            }

            .header-title {
                flex-direction: column;
                gap: 16px;

                .title-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;

                    .el-icon {
                        font-size: 32px;
                    }
                }

                .title-text {
                    h1 {
                        font-size: 24px;
                    }

                    p {
                        font-size: 14px;
                    }
                }
            }
        }

        .info-grid,
        .workorder-grid {
            grid-template-columns: 1fr;
            padding: 20px;
            gap: 16px;
        }

        .timeline-content-wrapper {
            padding: 20px;
        }

        .action-section {
            flex-direction: column;
            padding: 28px 20px;

            .action-btn {
                width: 100%;
                min-width: auto;
            }
        }

        .section-header {
            padding: 20px;
        }
    }
}
</style>
