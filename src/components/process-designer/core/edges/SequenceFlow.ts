import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core'
import { genBpmnId } from '@logicflow/extension/lib/bpmn-elements/utils'

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
