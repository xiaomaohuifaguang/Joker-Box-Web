import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core'
import { genBpmnId } from '@logicflow/extension/lib/bpmn-elements/utils'

export class SequenceFlowModel extends PolylineEdgeModel {
    static extendKey = 'SequenceFlowModel'

    constructor(data: any, graphModel: any) {
        if (!data.id) {
            data.id = `Flow_${genBpmnId()}`
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
