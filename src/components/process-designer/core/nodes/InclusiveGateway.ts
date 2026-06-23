import LogicFlow, {
    h,
    GraphModel,
    PolygonNode,
    PolygonNodeModel,
} from '@logicflow/core'
import { genBpmnId } from '@logicflow/extension/lib/bpmn-elements/utils'
import { buildNodeStyle, buildTextStyle } from '../theme'

import NodeConfig = LogicFlow.NodeConfig

export class InclusiveGatewayModel extends PolygonNodeModel {
    static extendKey = 'InclusiveGatewayModel'

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

export class InclusiveGatewayView extends PolygonNode {
    static extendKey = 'InclusiveGatewayNode'

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
            // 单层圆环 —— BPMN 包容网关标准符号 (旧版的双层环看起来太密)
            h('circle', {
                cx: 25,
                cy: 25,
                r: 9,
                stroke: style.stroke,
                'stroke-width': 2.4,
                fill: 'none',
            }),
        )
    }
}

export const InclusiveGateway = {
    type: 'bpmn:inclusiveGateway',
    view: InclusiveGatewayView,
    model: InclusiveGatewayModel,
}

export default InclusiveGateway
