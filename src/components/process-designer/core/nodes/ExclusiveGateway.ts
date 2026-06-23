import LogicFlow, {
    h,
    GraphModel,
    PolygonNode,
    PolygonNodeModel,
} from '@logicflow/core'
import { genBpmnId } from '@logicflow/extension/lib/bpmn-elements/utils'
import { buildNodeStyle, buildTextStyle } from '../theme'

import NodeConfig = LogicFlow.NodeConfig

export class ExclusiveGatewayModel extends PolygonNodeModel {
    static extendKey = 'ExclusiveGatewayModel'

    constructor(data: NodeConfig, graphModel: GraphModel) {
        if (!data.id) {
            data.id = `Gateway_${genBpmnId()}`
        }
        if (!data.text) {
            data.text = ''
        }
        if (data.text && typeof data.text === 'string') {
            data.text = {
                value: data.text,
                x: data.x,
                y: data.y + 40,
            }
        }
        super(data, graphModel)
        this.points = [
            [25, 0],
            [50, 25],
            [25, 50],
            [0, 25],
        ]
    }

    getNodeStyle() {
        const style = super.getNodeStyle()
        return { ...style, ...buildNodeStyle(this.type, this.isSelected) }
    }

    getTextStyle() {
        const style = super.getTextStyle()
        return { ...style, ...buildTextStyle() }
    }
}

export class ExclusiveGatewayView extends PolygonNode {
    static extendKey = 'ExclusiveGatewayNode'

    getShape(): h.JSX.Element {
        const { model } = this.props
        const { x, y, width, height, points } = model as PolygonNodeModel
        const style = model.getNodeStyle()
        return h(
            'g',
            {
                transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
            },
            // @ts-ignore
            h('polygon', {
                ...style,
                x,
                y,
                points,
            }),
            // X 标志 —— 颜色跟随主题色,确保选中/校验态变色时一并变化
            h('path', {
                d: 'M 16 16 L 34 34 M 34 16 L 16 34',
                stroke: style.stroke,
                'stroke-width': 2.8,
                'stroke-linecap': 'round',
                fill: 'none',
            }),
        )
    }
}

export const ExclusiveGateway = {
    type: 'bpmn:exclusiveGateway',
    view: ExclusiveGatewayView,
    model: ExclusiveGatewayModel,
}

export default ExclusiveGateway
