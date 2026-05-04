<template>
    <div class="add-process-view">
        <div class="editor-area">
            <ProcessEditor :info="info" @update:graphRawData="(data) => info.rawData = data"
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
import { ref } from 'vue';
import ProcessEditor from '@/components/process-designer/ProcessEditor.vue';

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

const add = () => {
    confirm("提示", "确认添加？", () => {
        http.result({
            url: '/processDefinition/add',
            method: 'POST',
            data: info.value,
            success(result) {
                alert(result.msg, 'success')
                emit('success');
            }
        })
    })

}
</script>

<style scoped lang="scss">
.add-process-view {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 64px);
    width: 100%;
    background: var(--el-bg-color-page);
    overflow: hidden;

    .editor-area {
        flex: 1;
        min-height: 0;
        position: relative;
        overflow: auto;
        background: var(--el-bg-color);

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
                    height: 100%;
                }

                .diagram,
                .container {
                    height: 100% !important;
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
        background: var(--el-bg-color);
        border-top: 1px solid var(--el-border-color-lighter);
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
            color: var(--el-text-color-secondary);

            .el-icon {
                font-size: 16px;
                color: #667eea;
            }
        }

        .confirm-button {
            min-width: 160px;
            height: 44px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            font-weight: 500;
            font-size: 15px;
            transition: all 0.3s ease;

            &:hover {
                background: linear-gradient(135deg, #5a6fd8 0%, #6a4292 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 14px rgba(102, 126, 234, 0.45);
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
