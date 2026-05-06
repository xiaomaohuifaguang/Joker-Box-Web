<template>
    <div class="add-process-view" v-loading="loading" element-loading-text="加载中...">
        <div class="editor-area">
            <ProcessEditor v-if="loaded" :key="reloadKey" :info="info" :readonly="type === 'view'"
                @update:graphRawData="(data: any) => info.rawData = data"
                @update:graphData="(data: any) => info.xmlStr = data" />
            <div v-else class="editor-placeholder">
                <el-icon class="placeholder-icon">
                    <Document />
                </el-icon>
                <span>正在加载流程数据...</span>
            </div>
        </div>
        <div class="action-bar">
            <div class="action-tip" :class="{ readonly: type === 'view' }">
                <el-icon>
                    <InfoFilled v-if="type === 'edit'" />
                    <View v-else />
                </el-icon>
                <span v-if="type === 'edit'">请完成流程设计后点击右侧按钮确认保存</span>
                <span v-else>当前为只读预览模式，无法编辑</span>
            </div>
            <el-button type="primary" size="large" @click="save" class="confirm-button" v-if="type === 'edit'"
                :disabled="!loaded">
                <el-icon>
                    <Check />
                </el-icon>
                <span>确认保存</span>
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Document, Check, InfoFilled, View } from '@element-plus/icons-vue'
import { alert, confirm, http } from '@/utils';
import { onMounted, ref } from 'vue';
import ProcessEditor from '@/components/process-designer/ProcessEditor.vue';


const props = defineProps({
    id: { type: [String, Number], default: '' },
    type: { type: String, default: '' }
})

const loading = ref(false)
const loaded = ref(false)
const reloadKey = ref(0)

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

const queryInfo = async () => {
    loading.value = true
    loaded.value = false
    info.value = await http.post('/processDefinition/info', { id: props.id })
    loading.value = false
    loaded.value = true
    reloadKey.value++
}

const save = () => {
    confirm("提示", "确认保存？", async () => {
        loading.value = true
        const result = await http.post('/processDefinition/save', info.value, { raw: true })
        alert(result.msg, 'success')
        queryInfo()
    })

}

onMounted(() => {
    if (!props.id) return;
    queryInfo()
})
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

        .editor-placeholder {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: var(--text-secondary);
            font-size: 14px;

            .placeholder-icon {
                font-size: 40px;
                color: var(--brand-primary);
                opacity: 0.6;
            }
        }

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

            &.readonly {
                color: var(--text-placeholder);

                .el-icon {
                    color: var(--text-secondary);
                }
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
                transform: translateY(-1px);
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
