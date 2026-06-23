import { h, RectNode, RectNodeModel, GraphModel } from '@logicflow/core'
import { genBpmnId } from '@logicflow/extension/lib/bpmn-elements/utils'
import { buildNodeStyle, buildTextStyle, NODE_THEMES } from '../theme'

export class UserTaskModel extends RectNodeModel {
    static extendKey = 'UserTaskModel'

    constructor(data: any, graphModel: GraphModel) {
        if (!data.id) {
            data.id = `Activity_${genBpmnId()}`
        }
        super(data, graphModel)

        if (!this.text || !this.text.value) {
            this.text = {
                value: "用户任务",
                x: this.x,
                y: this.y
            };
        }
    }

    setAttributes(): void {
        this.width = 110
        this.height = 60
        // 注意:不要在这里设 this.radius!
        // LogicFlow 的 PolylineEdgeModel.updateCrossPoints -> getClosestRadiusCenter
        // 在 radius !== 0 时会把 4 个圆角圆心当成"圆"算连线交点,
        // 当起点离圆心距离 > radius 时 Math.sqrt(负数) = NaN,导致整条边的 points
        // 变成 "NaN,NaN ..." → 文本背景 <rect> 抛 "y: NaN" 错。
        // 视觉圆角通过 getNodeStyle 返回的 rx/ry 解决(SVG 渲染层),不读 model.radius。
    }

    getNodeStyle() {
        const style = super.getNodeStyle()
        return {
            ...style,
            ...buildNodeStyle(this.type, this.isSelected),
            rx: 8,
            ry: 8,
        }
    }

    getTextStyle() {
        const style = super.getTextStyle()
        return { ...style, ...buildTextStyle() }
    }
}

export class UserTaskView extends RectNode {
    static extendKey = 'UserTaskNode'

    /**
     * 左上角的小型用户图标 (线性人形)。
     * 直接画 SVG path,避免引用外部 SVG 文件 —— 之前那张 user-task.svg 实际是张小熊像素图。
     * 颜色绑定到主题色,选中态不会失色。
     */
    private renderIcon(originX: number, originY: number, color: string) {
        const cx = originX + 8
        const cy = originY + 8
        return h('g', {}, [
            // 头
            h('circle', {
                cx,
                cy: cy - 2,
                r: 2.2,
                fill: 'none',
                stroke: color,
                'stroke-width': 1.3,
            }),
            // 肩 (上半弧)
            h('path', {
                d: `M ${cx - 4.5} ${cy + 6} A 4.5 4.5 0 0 1 ${cx + 4.5} ${cy + 6}`,
                fill: 'none',
                stroke: color,
                'stroke-width': 1.3,
                'stroke-linecap': 'round',
            }),
        ])
    }

    getShape(): h.JSX.Element {
        const { model } = this.props
        const { x, y, width, height } = model
        const style = model.getNodeStyle()
        const theme = NODE_THEMES[model.type]
        const accent = theme?.color || style.stroke

        const left = x - width / 2
        const top = y - height / 2

        return h('g', {}, [
            h('rect', {
                ...style,
                x: left,
                y: top,
                rx: style.rx ?? 8,
                ry: style.ry ?? 8,
                width,
                height,
            }),
            // 左上角小图标作为节点类型标识
            this.renderIcon(left + 6, top + 6, accent),
        ])
    }
}

export const UserTask = {
    type: 'bpmn:userTask',
    view: UserTaskView,
    model: UserTaskModel,
}

export default UserTask
