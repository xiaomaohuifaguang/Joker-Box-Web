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
    // height: calc(100vh - 60px);
    background-color: var(--el-bg-color-page);
    padding: 20px;
}

.editor-wrapper {
    display: flex;
    flex: 1;
    gap: 16px;
    margin-bottom: 20px;
    height: calc(100% - 72px);
}

.designer-card {
    flex: 3;
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    overflow: hidden;

    :deep(.el-card__body) {
        padding: 0;
        height: 100%;
    }
}

.panel-card {
    flex: 1;
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    overflow: hidden;

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
    gap: 20px;
    padding: 16px 0;
    border-top: 1px solid var(--el-border-color-light);

    .save-btn {
        padding: 0 32px;
        height: 40px;

        .el-icon {
            margin-right: 8px;
        }
    }

    .cancel-btn {
        padding: 0 32px;
        height: 40px;

        .el-icon {
            margin-right: 8px;
        }
    }
}

@media (max-width: 1200px) {
    .editor-wrapper {
        flex-direction: column;
    }

    .designer-card,
    .panel-card {
        flex: none;
        height: 50%;
    }
}
</style>