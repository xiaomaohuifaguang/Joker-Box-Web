/**
 * 节点/元素的视觉元数据 —— 标签、图标、配色。
 * 由 Property 面板的 Header 和小徽标共用,与 Palette 的 hover 配色保持一致。
 */

export interface NodeMeta {
    label: string
    color: string
    /** 浅色 tint —— 给 header 背景 / 徽标背景用 */
    tint: string
}

const NODE_META: Record<string, NodeMeta> = {
    'bpmn:startEvent': { label: '开始节点', color: '#52c41a', tint: '#f6ffed' },
    'bpmn:endEvent': { label: '结束节点', color: '#f5222d', tint: '#fff1f0' },
    'bpmn:userTask': { label: '用户任务', color: '#1677ff', tint: '#ecf5ff' },
    'bpmn:exclusiveGateway': { label: '排他网关', color: '#fa8c16', tint: '#fff7e6' },
    'bpmn:parallelGateway': { label: '并行网关', color: '#722ed1', tint: '#f4ecff' },
    'bpmn:inclusiveGateway': { label: '包容网关', color: '#13c2c2', tint: '#e6fffb' },
    'bpmn:sequenceFlow': { label: '连线', color: '#86909c', tint: '#f5f7fa' },
    process: { label: '流程', color: '#1677ff', tint: '#ecf5ff' },
}

export function getNodeMeta(type: string | undefined, fallbackLabel = '元素'): NodeMeta {
    if (type && NODE_META[type]) return NODE_META[type]
    return { label: fallbackLabel, color: '#5f6368', tint: '#f2f3f5' }
}
