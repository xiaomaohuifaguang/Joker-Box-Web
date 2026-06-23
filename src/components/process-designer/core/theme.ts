/**
 * 流程图视觉主题 —— 集中管理画布上节点/边/文字的配色。
 *
 * 设计原则:
 *  - 默认白底 + 主题色描边 (BPMN 规范风格,避免画布过于花哨)
 *  - 选中态:描边加粗 + 浅 tint 填充 (主题色 alpha 10%)
 *  - 内部符号 (网关里的 X/+/O、UserTask 里的人像) 用同色 currentStroke,
 *    通过 view 层从 getNodeStyle() 读取,保证主题/选中态变化时一并跟随
 *
 * 与 Palette tile 的色板严格一致,确保拖入画布前后视觉连贯。
 */

export interface NodeTheme {
    /** 主色 —— 描边、内部符号、选中态填充 */
    color: string
    /** 选中态填充 —— 主色的浅 tint */
    selectedFill: string
    /** 默认描边宽度 */
    strokeWidth: number
    /** 选中态描边宽度 */
    selectedStrokeWidth: number
}

export const NODE_THEMES: Record<string, NodeTheme> = {
    'bpmn:startEvent': {
        color: '#52c41a',
        selectedFill: '#f6ffed',
        strokeWidth: 1.5,
        selectedStrokeWidth: 2.5,
    },
    'bpmn:endEvent': {
        color: '#f5222d',
        selectedFill: '#fff1f0',
        // 结束节点 BPMN 规范要求粗描边
        strokeWidth: 3,
        selectedStrokeWidth: 4,
    },
    'bpmn:userTask': {
        color: '#1677ff',
        selectedFill: '#ecf5ff',
        strokeWidth: 1.5,
        selectedStrokeWidth: 2.5,
    },
    'bpmn:exclusiveGateway': {
        color: '#fa8c16',
        selectedFill: '#fff7e6',
        strokeWidth: 1.5,
        selectedStrokeWidth: 2.5,
    },
    'bpmn:parallelGateway': {
        color: '#722ed1',
        selectedFill: '#f4ecff',
        strokeWidth: 1.5,
        selectedStrokeWidth: 2.5,
    },
    'bpmn:inclusiveGateway': {
        color: '#13c2c2',
        selectedFill: '#e6fffb',
        strokeWidth: 1.5,
        selectedStrokeWidth: 2.5,
    },
}

const FALLBACK: NodeTheme = {
    color: '#5f6368',
    selectedFill: '#f2f3f5',
    strokeWidth: 1.5,
    selectedStrokeWidth: 2.5,
}

/**
 * 根据节点类型 + 选中态,返回 LogicFlow 节点样式对象。
 * 节点 model 在 getNodeStyle() 里调用,从而把"白底彩边/选中态加粗"的规则集中在这里。
 */
export function buildNodeStyle(type: string, selected: boolean) {
    const theme = NODE_THEMES[type] || FALLBACK
    return {
        fill: selected ? theme.selectedFill : '#ffffff',
        stroke: theme.color,
        strokeWidth: selected ? theme.selectedStrokeWidth : theme.strokeWidth,
    }
}

/** 节点标签统一字号/字重,避免每个 model 文件各自抄一遍 */
export function buildTextStyle() {
    return {
        fontSize: 13,
        fontWeight: 500,
        color: '#303133',
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    }
}

/**
 * 连线主题色 —— 默认中性灰,选中态主蓝。
 * 走 model.getEdgeStyle 覆盖(安全),不要在 model 里覆盖 getArrowStyle 或
 * 在 setAttributes 里设 radius (会触发节点交点算法 NaN bug)。
 */
export const EDGE_THEME = {
    color: '#86909c',
    selectedColor: '#1677ff',
    strokeWidth: 1.6,
    selectedStrokeWidth: 2.2,
    /** 折线拐角圆角半径 —— 走 PolylineEdge.getEdge 的 properties.radius 路径 */
    cornerRadius: 6,
}

export function buildEdgeStyle(selected: boolean) {
    return {
        stroke: selected ? EDGE_THEME.selectedColor : EDGE_THEME.color,
        strokeWidth: selected ? EDGE_THEME.selectedStrokeWidth : EDGE_THEME.strokeWidth,
        radius: EDGE_THEME.cornerRadius,
    }
}
