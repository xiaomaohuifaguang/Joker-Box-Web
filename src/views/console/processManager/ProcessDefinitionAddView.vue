<template>
    <div class="add-process-view">
        <div class="editor-area">
            <ProcessEditor :info="info" v-model:node-config="nodeConfig"
                @update:graphRawData="(data) => info.rawData = data"
                @update:graphData="(data) => info.xmlStr = data" />
        </div>
        <div class="action-bar">
            <div class="action-tip">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <span>请完成流程设计后点击右侧按钮确认添加</span>
            </div>
            <el-button type="primary" size="large" @click="add" class="confirm-button">
                <el-icon>
                    <Check />
                </el-icon>
                <span>确认添加</span>
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Check, InfoFilled } from '@element-plus/icons-vue'
import { alert, confirm, http } from '@/utils';
import { ElMessageBox } from 'element-plus'
import { ref } from 'vue';
import ProcessEditor from '@/components/process-designer/ProcessEditor.vue';
import { buildGatewayConditions } from '@/components/process-designer/utils/gateway-condition';

const emit = defineEmits(['success']);

const info = ref({
    id: '',
    processKey: 'Process_' + Math.random().toString(36).substring(2, 16),
    processName: '流程名称',
    processCategory: '',
    processDescription: '',
    version: '',
    status: '',
    createBy: '',
    createTime: '',
    updateTime: '',
    deleted: '',
    xmlStr: '',
    rawData: {},
})

const nodeConfig = ref({
    globalFormBinding: null as any,
    nodeFormBindings: [] as any[],
    nodeFieldPermissions: [] as any[],
})

const validateUserTasks = (rawData: any) => {
    if (!rawData?.nodes) return []
    return rawData.nodes
        .filter((node: any) => node.type === 'bpmn:userTask' && !node.properties?.approvalType)
        .map((node: any) => node.text?.value || node.id)
}

const doAdd = async () => {
    const payload = {
        ...info.value,
        globalFormBinding: nodeConfig.value.globalFormBinding,
        nodeFormBindings: nodeConfig.value.nodeFormBindings,
        nodeFieldPermissions: nodeConfig.value.nodeFieldPermissions,
        gatewayConditions: buildGatewayConditions(info.value.rawData),
    }
    const result = await http.post('/processDefinition/add', payload, { raw: true })
    alert(result.msg, 'success')
    emit('success');
}

const add = () => {
    const missingTasks = validateUserTasks(info.value.rawData)
    if (missingTasks.length > 0) {
        const taskList = missingTasks.map((name: string) => `「${name}」`).join('、')
        ElMessageBox.confirm(
            `以下用户任务未设置处理类型，请检查：\n${taskList}`,
            '校验提示',
            {
                confirmButtonText: '确认继续',
                cancelButtonText: '取消',
                closeOnClickModal: false,
                closeOnPressEscape: true,
                type: 'warning',
            }
        ).then(() => {
            doAdd()
        }).catch(() => {})
        return
    }
    confirm("提示", "确认添加？", async () => {
        doAdd()
    })
}
</script>

<style scoped lang="scss">
.add-process-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: var(--bg-page);
    overflow: hidden;

    .editor-area {
        flex: 1;
        min-height: 0;
        position: relative;
        overflow: hidden;
        background: var(--bg-container);

        :deep(> div) {
            height: 100%;
            display: flex;
            flex-direction: column;

            >.el-row:first-child {
                flex-shrink: 0;
            }

            >.el-row:last-child {
                flex: 1;
                min-height: 0;

                .el-col {
                    display: flex;
                    flex-direction: column;
                }

                .diagram {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-height: 0;
                }

                .container {
                    flex: 1;
                    min-height: 0;
                }

                .diagram-panel {
                    height: 100%;
                    overflow-y: auto;
                }
            }
        }
    }

    .action-bar {
        flex-shrink: 0;
        height: 72px;
        padding: 0 24px;
        background: var(--bg-container);
        border-top: 1px solid var(--border-light);
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
        z-index: 10;

        .action-tip {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: var(--text-secondary);

            .el-icon {
                font-size: 16px;
                color: var(--brand-primary);
            }
        }

        .confirm-button {
            min-width: 160px;
            height: 44px;
            background: var(--brand-gradient);
            border: none;
            font-weight: 500;
            font-size: 15px;
            transition: all 0.3s ease;

            &:hover {
                background: var(--brand-gradient-hover);
                transform: scale(1.005);
                box-shadow: var(--shadow-glow-strong);
            }

            &:active {
                transform: translateY(0);
            }

            .el-icon {
                margin-right: 4px;
            }
        }
    }
}

@media (max-width: 768px) {
    .add-process-view {
        .action-bar {
            padding: 0 16px;

            .action-tip {
                display: none;
            }

            .confirm-button {
                width: 100%;
            }
        }
    }
}
</style>
