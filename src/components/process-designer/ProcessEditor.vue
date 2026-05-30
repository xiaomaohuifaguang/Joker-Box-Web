<template>
    <!-- 流程编辑器 -->

    <div>
        <el-row v-if="!readonly">
            <el-col :span="24">
                <Toolbar v-if="lf" :lf="lf" />
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="20">
                <div class="diagram" style="min-height: 75vh;">
                    <Palette class="diagram-palette" @dragInNode="dragInNode" v-if="!readonly" />
                    <div class="container" ref="container"></div>
                </div>
            </el-col>
            <el-col :span="4">
                <PropertyPanel class="diagram-panel" :lf="lf" :data="itemData" :itemType="itemType" :readonly="readonly"
                    :process-definition-id="info?.id" :node-config="nodeConfig"
                    @change="onPropertyChange" @update:node-config="onNodeConfigChange" />
            </el-col>
        </el-row>


    </div>
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue';
import { LogicFlow } from "@logicflow/core";
import "@logicflow/core/lib/style/index.css";
import '@logicflow/extension/lib/style/index.css'
import { Control, MiniMap, Menu, DndPanel, SelectionSelect, Snapshot, InsertNodeInPolyline, NodeResize, BpmnElement, BpmnAdapter, BpmnXmlAdapter, BPMNElements, BPMNBaseAdapter, BPMNAdapter } from "@logicflow/extension"
import { Dagre } from "@logicflow/layout";

import Toolbar from './components/Toolbar.vue';
import Palette from './components/Palette.vue';
import PropertyPanel from './components/PropertyPanel.vue';
import { registerCustomElement } from './core/index';
import CatBPMNAdapter, { setProcessMeta } from './core/adapter/CatBPMNAdapter';
import extraProps from './core/adapter/extraProps';
import testJson from './test.json';
import type { FlowValidator, FlowWarning } from './types/flow-validation'
import { validateGateway } from './components/PropertyPanels/GatewayProperty.vue'

LogicFlow.use(Control) // 控制面板
LogicFlow.use(MiniMap) // 小地图
LogicFlow.use(Menu) // 右键菜单
LogicFlow.use(DndPanel) // 拖拽面板
LogicFlow.use(SelectionSelect) // 选区
LogicFlow.use(Snapshot) // 导出图片
LogicFlow.use(InsertNodeInPolyline) // 边上插入节点
LogicFlow.use(Dagre); // 自动布局
// LogicFlow.use(NodeResize);
// LogicFlow.use(BpmnElement) // BPMN
// LogicFlow.use(BpmnAdapter) // BPMN
// LogicFlow.use(BpmnXmlAdapter) // BPMN
// LogicFlow.use(BPMNElements) // BPMN
// LogicFlow.use(BPMNBaseAdapter) // BPMN
// LogicFlow.use(BPMNAdapter)
LogicFlow.use(CatBPMNAdapter, extraProps)


const props = withDefaults(defineProps<{
    info?: {
        id?: string | number,
        processKey?: string,
        processName?: string,
        prcessCategory?: string
        processDescription?: string,
        rawData?: any
    },
    readonly?: boolean,
    nodeConfig?: {
        globalFormBinding: any,
        nodeFormBindings: any[],
        nodeFieldPermissions: any[]
    }
}>(), {
    info: () => ({
        rawData: () => ({ nodes: [], edges: [] })
    }),
    readonly: false,
    nodeConfig: () => ({
        globalFormBinding: null,
        nodeFormBindings: [],
        nodeFieldPermissions: []
    })
})

const emit = defineEmits<{
    (e: 'update:graphRawData', data: any): void,
    (e: 'update:graphData', data: any): void,
    (e: 'update:nodeConfig', data: any): void
}>()


// 容器引用
const container = ref(null);
// LogicFlow 实例
const lf = ref<LogicFlow>();
const renderData = ref(props.info.rawData);
const itemData = ref();
const itemType = ref<'process' | 'node' | 'edge' | 'init'>('init');

const validators: Record<string, FlowValidator> = {}

const registerValidator = (nodeType: string, validator: FlowValidator) => {
  validators[nodeType] = validator
}

const validateFlow = (): FlowWarning[] => {
  if (!lf.value) return []
  const warnings: FlowWarning[] = []
  const nodes = lf.value.graphModel?.nodes || []

  nodes.forEach((node: any) => {
    const validator = validators[node.type]
    if (validator) {
      try {
        const nodeWarnings = validator(node, lf.value)
        nodeWarnings.forEach(w => {
          warnings.push({
            ...w,
            nodeId: node.id,
            nodeName: node.text?.value || node.id,
          })
        })
      } catch (e) {
        console.error(`校验节点 ${node.id} 时出错:`, e)
      }
    }
  })

  return warnings
}

onMounted(async () => {

    if (container.value) {
        lf.value = new LogicFlow({
            container: container.value,
            edgeType: 'bpmn:sequenceFlow',
            grid: true,
            allowResize: true,  // 启用全局缩放
            allowRotate: true,   // 启用全局旋转,
        });
        registerCustomElement(lf.value);
        registerValidator('bpmn:exclusiveGateway', validateGateway)
        registerValidator('bpmn:inclusiveGateway', validateGateway)
        lf.value.renderRawData(renderData.value);
        lf.value.on('node:click', (event) => {
            itemData.value = event.data
            itemType.value = 'node'
        });

        lf.value.on('edge:click', (event) => {
            itemData.value = event.data
            itemType.value = 'edge'
        });
        lf.value.on('blank:click', (event) => {
            itemData.value = props.info
            itemType.value = 'process'
        })
        const GATEWAY_TYPES_WITH_DEFAULT = ['bpmn:exclusiveGateway', 'bpmn:inclusiveGateway']

        const cleanOrphanGatewayDefault = () => {
            if (!lf.value) return
            const edges = lf.value.graphModel?.edges || []
            const edgeIds = new Set(edges.map((edge: any) => edge.id))
            const nodes = lf.value.graphModel?.nodes || []
            nodes.forEach((node: any) => {
                if (GATEWAY_TYPES_WITH_DEFAULT.includes(node.type) && node.properties?.default) {
                    if (!edgeIds.has(node.properties.default)) {
                        lf.value!.deleteProperty(node.id, 'default')
                        if (itemType.value === 'node' && itemData.value?.id === node.id) {
                            const newProperties = { ...itemData.value.properties }
                            delete newProperties.default
                            itemData.value = { ...itemData.value, properties: newProperties }
                        }
                    }
                }
            })
        }
        lf.value.on('edge:delete', (event) => {
            const deletedEdgeId = event.data?.id
            if (!deletedEdgeId || !lf.value) return
            const nodes = lf.value.graphModel?.nodes || []
            nodes.forEach((node: any) => {
                if (GATEWAY_TYPES_WITH_DEFAULT.includes(node.type) && node.properties?.default === deletedEdgeId) {
                    lf.value!.deleteProperty(node.id, 'default')
                    if (itemType.value === 'node' && itemData.value?.id === node.id) {
                        const newProperties = { ...itemData.value.properties }
                        delete newProperties.default
                        itemData.value = { ...itemData.value, properties: newProperties }
                    }
                }
            })
        })
        lf.value.on('node:delete', (event: any) => {
            const deletedNodeId = event?.data?.id
            if (deletedNodeId && props.nodeConfig) {
                const newBindings = props.nodeConfig.nodeFormBindings.filter((b: any) => String(b.nodeId) !== String(deletedNodeId))
                const newPermissions = props.nodeConfig.nodeFieldPermissions.filter((p: any) => String(p.nodeId) !== String(deletedNodeId))
                emit('update:nodeConfig', {
                    ...props.nodeConfig,
                    nodeFormBindings: newBindings,
                    nodeFieldPermissions: newPermissions,
                })
            }
            cleanOrphanGatewayDefault()
        })
        emit('update:graphRawData', lf.value.getGraphRawData())
        emit('update:graphData', lf.value.getGraphData())
        let isCleaning = false
        lf.value.on('history:change', () => {
            if (!lf.value || isCleaning) return
            cleanOrphanGatewayDefault()
            emit('update:graphRawData', lf.value.getGraphRawData())
            emit('update:graphData', lf.value.getGraphData())
        })
        if (props.info && props.info.processKey && props.info.processName) {
            setProcessMeta({
                '-id': props.info.processKey,
                '-name': props.info.processName,
                '-category': props.info.prcessCategory || '',
                'bpmn:documentation': props.info.processDescription || '',
            });
        }

        if (props.info) {
            itemData.value = props.info;
            itemType.value = 'process';
        }

    }

})

const dragInNode = (type: any) => {
    if (lf.value) {
        lf.value.dnd.startDrag({
            type
        })
    }
}

const onPropertyChange = () => {
    if (lf.value) {
        emit('update:graphRawData', lf.value.getGraphRawData())
        emit('update:graphData', lf.value.getGraphData())
    }
}

const onNodeConfigChange = (data: any) => {
    emit('update:nodeConfig', data)
}

defineExpose({ validateFlow })

</script>

<style scoped>
.diagram {
    position: relative;
    width: 100%;
    height: 100%;
}

.diagram-palette {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 100;
    background: white;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.container {
    width: 100%;
    height: 100%;
    border: 1px solid #000;
}
</style>