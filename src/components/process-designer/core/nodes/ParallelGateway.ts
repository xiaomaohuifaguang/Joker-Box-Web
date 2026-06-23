import LogicFlow, {
    h,
    GraphModel,
    PolygonNode,
    PolygonNodeModel,
} from '@logicflow/core'
import { genBpmnId } from '@logicflow/extension/lib/bpmn-elements/utils'
import { buildNodeStyle, buildTextStyle } from '../theme'

import NodeConfig = LogicFlow.NodeConfig

export class ParallelGatewayModel extends PolygonNodeModel {
    static extendKey = 'ParallelGatewayModel'

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

export class ParallelGatewayView extends PolygonNode {
    static extendKey = 'ParallelGatewayNode'

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
            // "+" 号:垂直线 + 水平线
            h('path', {
                d: 'M 25 13 L 25 37 M 13 25 L 37 25',
                stroke: style.stroke,
                'stroke-width': 2.8,
                'stroke-linecap': 'round',
                fill: 'none',
            }),
        )
    }
}

export const ParallelGateway = {
    type: 'bpmn:parallelGateway',
    view: ParallelGatewayView,
    model: ParallelGatewayModel,
}

export default ParallelGateway
