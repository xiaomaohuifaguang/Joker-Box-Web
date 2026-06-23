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
import { Control, MiniMap, Menu, DndPanel, SelectionSelect, Snapshot, InsertNodeInPolyline } from "@logicflow/extension"
import { Dagre, ElkLayout } from "@logicflow/layout";

import Toolbar from './components/Toolbar.vue';
import Palette from './components/Palette.vue';
import PropertyPanel from './components/PropertyPanel.vue';
import { registerCustomElement } from './core/index';
import CatBPMNAdapter, { setProcessMeta } from './core/adapter/CatBPMNAdapter';
import extraProps from './core/adapter/extraProps';
import type { FlowValidator, FlowWarning } from './types/flow-validation'
import { validateGateway } from './core/validators'

LogicFlow.use(Control) // 控制面板
LogicFlow.use(MiniMap) // 小地图
LogicFlow.use(Menu) // 右键菜单
LogicFlow.use(DndPanel) // 拖拽面板
LogicFlow.use(SelectionSelect) // 选区
LogicFlow.use(Snapshot) // 导出图片
LogicFlow.use(InsertNodeInPolyline) // 边上插入节点
LogicFlow.use(Dagre); // 自动布局 (Dagre - 快速, 同步)
LogicFlow.use(ElkLayout); // 自动布局 (ELK - 高质量, 异步, 边交叉最少)
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
  const edges = lf.value.graphModel?.edges || []

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

  // Gateway condition validation: each outgoing edge must have a condition or a default path
  const gatewayNodes = nodes.filter((n: any) =>
    ['bpmn:exclusiveGateway', 'bpmn:inclusiveGateway'].includes(n.type)
  )

  for (const gw of gatewayNodes) {
    const outgoingEdges = edges.filter((e: any) => e.sourceNodeId === gw.id)
    const hasDefault = outgoingEdges.some(
      (e: any) => e.properties?.gatewayCondition?.isDefault
    )

    for (const edge of outgoingEdges) {
      const gc = edge.properties?.gatewayCondition
      const hasCondition = gc?.conditionType === 'NATIVE' || gc?.conditionType === 'CUSTOM'

      if (!hasCondition && !hasDefault) {
        warnings.push({
          type: 'edge',
          message: `网关 ${gw.text?.value || gw.id} 的出线 ${edge.text?.value || edge.id} 未配置条件且未设置默认走向`,
          nodeId: gw.id,
          nodeName: gw.text?.value || gw.id,
        })
      }
    }
  }

  return warnings
}

onMounted(async () => {

    if (container.value) {
        lf.value = new LogicFlow({
            container: container.value,
            edgeType: 'bpmn:sequenceFlow',
            grid: {
                size: 10,
                type: 'dot',
                config: { color: '#e4e7ed', thickness: 1.2 },
            },
            allowResize: true,  // 启用全局缩放
            allowRotate: true,   // 启用全局旋转,
        });
        // 画布级主题 —— 锚点、对齐线、旋转/调整控制点、连线默认配色
        // 节点本身的描边/填充走各自 model 的 getNodeStyle,见 ./core/theme.ts
        // 连线选中态颜色走 SequenceFlowModel.getEdgeStyle,见 ./core/edges/SequenceFlow.ts
        lf.value.setTheme({
            anchor: {
                stroke: '#1677ff',
                fill: '#ffffff',
                r: 4,
                hover: { fill: '#1677ff', fillOpacity: 0.2, stroke: '#1677ff', r: 10 },
            },
            anchorLine: { stroke: '#1677ff', strokeWidth: 1.4, strokeDasharray: '4,3' },
            snapline: { stroke: '#1677ff', strokeWidth: 1 },
            outline: {
                stroke: '#1677ff',
                strokeDasharray: '4,4',
                hover: { stroke: '#1677ff' },
            },
            rotateControl: { stroke: '#1677ff', fill: '#ffffff' },
            resizeControl: { stroke: '#1677ff', fill: '#ffffff' },
            // 连线相关 —— polyline 是默认描边色, arrow 是箭头几何, edgeText 是连线文字
            polyline: { strokeLinecap: 'round', strokeLinejoin: 'round' },
            arrow: {
                offset: 8,
                verticalLength: 4,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
            },
            edgeText: {
                fontSize: 12,
                color: '#606266',
                // EdgeTextTheme 必填字段 —— default 模式下其实不参与换行计算,给个足够大的值
                textWidth: 200,
                // 用 SVG <text> + 描边而不是 HTML foreignObject ——
                // overflowMode: 'ellipsis' 会走 renderHtmlText (<div>),SVG 的 stroke 对它无效。
                // 短文字 default 模式就够,真长文字让它自己换行也比省略号清楚。
                overflowMode: 'default',
                // 文字描边代替矩形底框 —— 框会占用空间让自动布局看起来很挤;
                // 白色 4px 描边给文字"开光",压在连线上仍清晰,且零占位。
                stroke: '#ffffff',
                strokeWidth: 4,
                // paintOrder camelCase 顶层 prop —— LogicFlow 的 Text.js 只透传非 object 字段,
                // 所以不能写在 style: {} 里。preact 会自动转成 paint-order SVG 属性。
                paintOrder: 'stroke fill',
                strokeLinejoin: 'round',
                // 显式关掉默认主题的白底 <rect>,避免和文字描边叠加
                background: {
                    fill: 'transparent',
                },
            },
            // 调整边端点的拖拽点
            edgeAdjust: {
                r: 5,
                fill: '#ffffff',
                stroke: '#1677ff',
                strokeWidth: 2,
            },
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
        })
        emit('update:graphRawData', lf.value.getGraphRawData())
        emit('update:graphData', lf.value.getGraphData())
        lf.value.on('history:change', () => {
            if (!lf.value) return
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
        // 如果当前选中的是 edge，刷新 itemData 以触发属性面板重新渲染
        //（Vue props 是 shallow 的，嵌套 properties 变化检测不到）
        if (itemType.value === 'edge' && itemData.value?.id) {
            const edge = lf.value.graphModel?.edges?.find((e: any) => e.id === itemData.value.id)
            if (edge) {
                itemData.value = { ...edge }
            }
        }
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
    top: 12px;
    left: 12px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    background: #fff;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    box-shadow: 0 6px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
}

.container {
    width: 100%;
    height: 100%;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    overflow: hidden;
    background: #fafbfc;
}
</style>