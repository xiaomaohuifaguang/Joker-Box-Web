<template>
    <!-- 右侧属性面板 -->
    <div class="diagram-panel">
        <div v-if="itemType === 'init' || !data" class="diagram-panel__empty">
            <div class="diagram-panel__empty-icon">⛶</div>
            <div class="diagram-panel__empty-title">未选中任何元素</div>
            <div class="diagram-panel__empty-hint">点击画布上的节点或连线<br>查看与编辑其属性</div>
        </div>
        <div v-else class="diagram-panel__body">
            <ProcessPropertyPanel v-if="itemType == 'process'" :lf="lf" :data="data" :readonly="readonly"
                :process-definition-id="processDefinitionId" :node-config="nodeConfig"
                @change="handleChange" @update:node-config="onNodeConfigChange" />
            <template v-if="itemType == 'node'">
                <StartEventProperty v-if="data.type === 'bpmn:startEvent'" :key="`start-${data?.id}`" :lf="lf"
                    :data="data" :readonly="readonly" :process-definition-id="processDefinitionId"
                    :node-config="nodeConfig" @change="handleChange" @update:node-config="onNodeConfigChange" />
                <UserTaskProperty v-else-if="data.type === 'bpmn:userTask'" :key="`user-${data?.id}`" :lf="lf"
                    :data="data" :readonly="readonly" :process-definition-id="processDefinitionId"
                    :node-config="nodeConfig" @change="handleChange" @update:node-config="onNodeConfigChange" />
                <EndEventProperty v-else-if="data.type === 'bpmn:endEvent'" :key="`end-${data?.id}`" :lf="lf"
                    :data="data" :readonly="readonly" @change="handleChange" />
                <GatewayProperty
                    v-else-if="['bpmn:exclusiveGateway', 'bpmn:parallelGateway', 'bpmn:inclusiveGateway'].includes(data.type)"
                    :key="`gw-${data?.id}`" :lf="lf" :data="data" :readonly="readonly" @change="handleChange" />
            </template>
            <EdgePropertyPanel v-if="itemType == 'edge'" :key="`edge-${data?.id}`" :lf="lf" :data="data"
                :readonly="readonly" :node-config="nodeConfig" @change="handleChange" />
        </div>
    </div>
</template>

<script setup lang='ts'>
import ProcessPropertyPanel from './PropertyPanels/ProcessPropertyPanel.vue'
import StartEventProperty from './PropertyPanels/StartEventProperty.vue'
import UserTaskProperty from './PropertyPanels/UserTaskProperty.vue'
import EndEventProperty from './PropertyPanels/EndEventProperty.vue'
import GatewayProperty from './PropertyPanels/GatewayProperty.vue'
import EdgePropertyPanel from './PropertyPanels/EdgePropertyPanel.vue'

const props = defineProps<{
    lf: any,
    data: any,
    itemType: 'process' | 'node' | 'edge' | 'init',
    readonly?: boolean,
    processDefinitionId?: string | number,
    nodeConfig?: {
        globalFormBinding: any,
        nodeFormBindings: any[],
        nodeFieldPermissions: any[]
    }
}>()

const emit = defineEmits<{
    (e: 'change'): void
    (e: 'update:nodeConfig', data: any): void
}>()

const handleChange = () => {
    emit('change')
}

const onNodeConfigChange = (data: any) => {
    emit('update:nodeConfig', data)
}
</script>

<style scoped>
.diagram-panel {
    /* 让面板有自己的滚动条,长面板不会顶到外层 footer */
    height: 100%;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fff;
}

.diagram-panel__body {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px 24px;
    /* 自定义细滚动条 */
    scrollbar-width: thin;
    scrollbar-color: var(--el-border-color) transparent;
}

.diagram-panel__body::-webkit-scrollbar {
    width: 6px;
}

.diagram-panel__body::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 3px;
}

.diagram-panel__body::-webkit-scrollbar-thumb:hover {
    background: var(--el-border-color-dark);
}

/* 空状态 —— 没选中任何元素时显示提示 */
.diagram-panel__empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
    text-align: center;
    color: var(--el-text-color-placeholder);
}

.diagram-panel__empty-icon {
    font-size: 48px;
    line-height: 1;
    opacity: 0.4;
    margin-bottom: 12px;
}

.diagram-panel__empty-title {
    font-size: 14px;
    color: var(--el-text-color-regular);
    margin-bottom: 6px;
}

.diagram-panel__empty-hint {
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-placeholder);
}
</style>
