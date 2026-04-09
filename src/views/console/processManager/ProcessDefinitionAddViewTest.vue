<template>
    <div class="process-editor-test-container">
        <el-row :gutter="20">
            <el-col :span="24">
                <el-row v-if="init">
                    <el-col :span="18">
                        <!-- 流程设计器，负责绘制流程等 -->
                        <MyProcessDesigner key="designer" v-model="info.xmlStr" :value="info.xmlStr"
                            v-bind="controlForm" ref="processDesigner" @init-finished="initModeler"
                            :additionalModel="controlForm.additionalModel" :model="model" @save="change"
                            :type="props.type" style="height: 80vh;" />
                    </el-col>
                    <el-col :span="6">
                        <!-- 流程属性器，负责编辑每个流程节点的属性 -->
                        <MyProcessPenal v-if="modeler" key="penal" :bpmnModeler="modeler" :prefix="controlForm.prefix"
                            class="process-panel" :model="model" :type="props.type" />
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
        <el-divider />
        <div class="action-buttons-wrapper">
            <el-button type="primary" plain @click="save" size="large">保存</el-button>
            <el-button type="primary" plain @click="emit('success')" size="large">取消</el-button>
        </div>
    </div>

</template>

<script setup lang='ts'>
import { alert, http } from '@/utils';
import { ref, provide, shallowRef, onBeforeUnmount, onMounted } from 'vue';

import { MyProcessDesigner, MyProcessPenal } from '@/components/bpmnProcessDesigner/package'
// 自定义元素选中时的弹出菜单（修改 默认任务 为 用户任务）
import CustomContentPadProvider from '@/components/bpmnProcessDesigner/package/designer/plugins/content-pad'
// 自定义左侧菜单（修改 默认任务 为 用户任务）
import CustomPaletteProvider from '@/components/bpmnProcessDesigner/package/designer/plugins/palette'
import { ProcessDefinition } from '@/entity/process';

defineOptions({ name: 'BpmModelEditor' })

// const xmlString = ref("")
const modeler = shallowRef()
const processDesigner = ref()
const controlForm = ref({
    simulation: true,
    labelEditing: false,
    labelVisible: false,
    prefix: 'flowable',
    // headerButtonSize: 'mini',
    additionalModel: [CustomContentPadProvider, CustomPaletteProvider]
    // additionalModel: []
})
const model = ref<Object>() // 流程模型的信息
/** 初始化 modeler */
const initModeler = async (item: any) => {
    //先初始化模型数据
    // model.value = modelData.value
    modeler.value = item
}

const props = defineProps({
    id: String,
    type: String
})

const init = ref(false)

/** 添加/修改模型 */
const change = async (bpmnXml: string) => {
    try {
        // xmlString.value = bpmnXml
        info.value.xmlStr = bpmnXml
        // emit('success', bpmnXml)
    } catch (error) {
        console.error('保存失败:', error)
        //   message.error('保存失败')
        alert('保存失败', 'error')
    }
}

// 在组件卸载时清理
onBeforeUnmount(() => {
    modeler.value = null
    // 清理全局实例
    const w = window as any
    if (w.bpmnInstances) {
        w.bpmnInstances = null
    }
})

const emit = defineEmits(['success']);

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


const save = () => {
    http.result({
        url: '/processDefinition/save',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            emit('success');
            // queryInfo()
        }
    })
}

const queryInfo = () => {
    console.log(props.id)
    http.result({
        url: '/processDefinition/info',
        method: 'POST',
        data: {
            id: props.id
        },
        success(result) {
            info.value = result.data
            init.value = true
        }
    })
}

onMounted(() => {
    init.value = false
    if (props.id !== '') {
        queryInfo()
    }

})

</script>

<style scoped lang="scss">
.process-editor-test-container {
    padding: 24px;
    background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);
    min-height: calc(100vh - 80px);
}

.el-row {
    margin-bottom: 24px;

    .el-col {
        &:first-child {
            border-radius: 16px 0 0 16px;
            overflow: hidden;
            border: 1px solid var(--el-border-color-lighter);
            border-right: none;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        &:last-child {
            border-radius: 0 16px 16px 0;
            overflow: hidden;
            border: 1px solid var(--el-border-color-lighter);
            border-left: none;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
    }
}

.el-divider {
    margin: 24px 0;
    border-color: var(--el-border-color-lighter);
}

.action-buttons-wrapper {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding-top: 8px;

    .el-button {
        min-width: 160px;
        height: 48px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 15px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
            transform: translateY(-2px);
        }

        &.el-button--primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);

            &:hover {
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
            }
        }
    }
}

@media (max-width: 1200px) {
    .el-row {
        .el-col {
            &:first-child,
            &:last-child {
                border-radius: 16px;
                border: 1px solid var(--el-border-color-lighter);
                margin-bottom: 20px;
            }
        }
    }
}

@media (max-width: 768px) {
    .process-editor-test-container {
        padding: 16px;
    }

    .action-buttons-wrapper {
        flex-direction: column;

        .el-button {
            width: 100%;
            min-width: auto;
        }
    }
}
</style>