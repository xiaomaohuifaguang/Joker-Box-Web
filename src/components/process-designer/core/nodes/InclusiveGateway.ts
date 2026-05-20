import LogicFlow, {
    h,
    GraphModel,
    PolygonNode,
    PolygonNodeModel,
} from '@logicflow/core'
import { genBpmnId } from '@logicflow/extension/lib/bpmn-elements/utils'

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
            // 同心圆（两个圆）
            h('circle', {
                cx: 25,
                cy: 25,
                r: 10,
                stroke: style.stroke || '#000',
                'stroke-width': 2,
                fill: 'none',
            }),
            h('circle', {
                cx: 25,
                cy: 25,
                r: 6,
                stroke: style.stroke || '#000',
                'stroke-width': 1.5,
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
