import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core'
import { genBpmnId } from '@logicflow/extension/lib/bpmn-elements/utils'
import { buildEdgeStyle } from '../theme'

function getEdgeText(edge: any): string {
    if (!edge.text) return ''
    return typeof edge.text === 'string' ? edge.text : edge.text.value || ''
}

export class SequenceFlowModel extends PolylineEdgeModel {
    static extendKey = 'SequenceFlowModel'

    constructor(data: any, graphModel: any) {
        if (!data.id) {
            data.id = `Flow_${genBpmnId()}`
        }
        if (!data.text) {
            const existingTexts = new Set(
                (graphModel?.edges || [])
                    .map((edge: any) => getEdgeText(edge))
                    .filter(Boolean)
            )
            let index = 1
            while (existingTexts.has(`连线${index}`)) {
                index++
            }
            data.text = `连线${index}`
        }
        super(data, graphModel)
    }

    /**
     * 覆盖默认描边/线宽/圆角 —— 默认中性灰,选中时主蓝加粗。
     * 注意:不要覆盖 getArrowStyle (offset/verticalLength 会和 BaseEdge.getArrow
     * 的方向计算冲突,拖拽中坐标未就绪时报 MNaN);箭头颜色通过基类继承 stroke 自动跟随。
     */
    getEdgeStyle() {
        const style = super.getEdgeStyle()
        return { ...style, ...buildEdgeStyle(this.isSelected) }
    }
}

export class SequenceFlowView extends PolylineEdge {
    static extendKey = 'SequenceFlowEdge'
}

export const SequenceFlow = {
    type: 'bpmn:sequenceFlow',
    view: SequenceFlowView,
    model: SequenceFlowModel,
}

export default SequenceFlow
