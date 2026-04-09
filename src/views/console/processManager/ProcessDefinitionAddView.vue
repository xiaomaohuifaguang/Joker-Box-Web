<template>
    <div class="bpmn-editor-container">
        <!-- 主编辑区域 -->
        <div class="editor-wrapper">
            <el-card shadow="never" class="designer-card">
                <!-- 流程设计器，负责绘制流程等 -->
                <MyProcessDesigner key="designer" v-model="info.xmlStr" :value="info.xmlStr" v-bind="controlForm"
                    ref="processDesigner" @init-finished="initModeler" :additionalModel="controlForm.additionalModel"
                    :model="model" @save="change" class="process-designer" style="height: 80vh;" />
            </el-card>

            <!-- 流程属性面板 -->
            <el-card shadow="never" class="panel-card">
                <!-- 流程属性器，负责编辑每个流程节点的属性 -->
                <MyProcessPenal v-if="modeler" key="penal" :bpmnModeler="modeler" :prefix="controlForm.prefix"
                    class="process-panel" :model="model" />
            </el-card>
        </div>

        <!-- 操作按钮区域 -->
        <div class="action-buttons">
            <el-button type="primary" @click="add" size="large" class="save-btn">
                <el-icon>
                    <Check />
                </el-icon>
                <span>保存</span>
            </el-button>
            <el-button @click="emit('success')" size="large" class="cancel-btn">
                <el-icon>
                    <Close />
                </el-icon>
                <span>取消</span>
            </el-button>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ref, shallowRef, onBeforeUnmount } from 'vue'
import { alert, http } from '@/utils'
import { Check, Close } from '@element-plus/icons-vue'
import { MyProcessDesigner, MyProcessPenal } from '@/components/bpmnProcessDesigner/package'
import CustomContentPadProvider from '@/components/bpmnProcessDesigner/package/designer/plugins/content-pad'
import CustomPaletteProvider from '@/components/bpmnProcessDesigner/package/designer/plugins/palette'
import { ProcessDefinition } from '@/entity/process'

defineOptions({ name: 'BpmModelEditor' })

const modeler = shallowRef()
const processDesigner = ref()
const model = ref<Object>()
const info = ref<ProcessDefinition>({
    id: '',
    processKey: '',
    processName: '',
    processDescription: '',
    version: '',
    status: '',
    createBy: '',
    createTime: '',
    updateTime: '',
    xmlStr: ''
})

const controlForm = ref({
    simulation: true,
    labelEditing: false,
    labelVisible: false,
    prefix: 'flowable',
    additionalModel: [CustomContentPadProvider, CustomPaletteProvider]
})

const emit = defineEmits(['success'])

//   /​**​ 初始化 modeler */
const initModeler = async (item: any) => {
    modeler.value = item
}

//   /​**​ 添加/修改模型 */
const change = async (bpmnXml: string) => {
    try {
        info.value.xmlStr = bpmnXml
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败', 'error')
    }
}

const add = () => {
    http.result({
        url: '/processDefinition/add',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            emit('success')
        }
    })
}

// 在组件卸载时清理
onBeforeUnmount(() => {
    modeler.value = null
    const w = window as any
    if (w.bpmnInstances) {
        w.bpmnInstances = null
    }
})
</script>

<style scoped lang="scss">
.bpmn-editor-container {
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);
    padding: 24px;
    min-height: calc(100vh - 80px);
}

.editor-wrapper {
    display: flex;
    flex: 1;
    gap: 20px;
    margin-bottom: 24px;
    height: calc(100% - 80px);
}

.designer-card {
    flex: 3;
    border-radius: 16px;
    border: 1px solid var(--el-border-color-lighter);
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    }

    :deep(.el-card__body) {
        padding: 0;
        height: 100%;
    }
}

.panel-card {
    flex: 1;
    border-radius: 16px;
    border: 1px solid var(--el-border-color-lighter);
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    }

    :deep(.el-card__body) {
        padding: 0;
        height: 100%;
    }
}

.process-designer {
    width: 100%;
    height: 100%;
}

.process-panel {
    width: 100%;
    height: 100%;
    overflow-y: auto;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 24px;
    padding: 24px 0;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
    border-radius: 0 0 16px 16px;
    margin: 0 -24px -24px;
    padding: 24px;

    .save-btn {
        min-width: 160px;
        height: 48px;
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

        .el-icon {
            margin-right: 8px;
            font-size: 18px;
        }
    }

    .cancel-btn {
        min-width: 160px;
        height: 48px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 15px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
            transform: translateY(-2px);
        }

        .el-icon {
            margin-right: 8px;
            font-size: 18px;
        }
    }
}

@media (max-width: 1200px) {
    .editor-wrapper {
        flex-direction: column;
        height: auto;
    }

    .designer-card,
    .panel-card {
        flex: none;
        min-height: 400px;
    }
}

@media (max-width: 768px) {
    .bpmn-editor-container {
        padding: 16px;
    }

    .action-buttons {
        flex-direction: column;
        margin: 0 -16px -16px;
        padding: 20px 16px;

        .save-btn,
        .cancel-btn {
            width: 100%;
            min-width: auto;
        }
    }
}
</style>