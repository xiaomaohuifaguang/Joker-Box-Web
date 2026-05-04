import { CircleNode, CircleNodeModel, h } from '@logicflow/core'
import { genBpmnId } from '@logicflow/extension/lib/bpmn-elements/utils'

export class EndEventModel extends CircleNodeModel {
  static extendKey = 'EndEventModel'

  constructor(data: any, graphModel: any) {
    if (!data.id) {
      data.id = `Event_${genBpmnId()}`
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
    // 如果 data 里没有传 text，或者你想强制覆盖，可以这样写：
    if (!this.text || !this.text.value) {
      this.text = {
        value: "结束",
        x: this.x, // 保持文字位置与节点中心一致（可选）
        y: this.y
      };
    }
  }

  setAttributes(): void {
    this.r = 36
  }

  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules()
    const notAsSource = {
      message: '结束节点不能作为边的起点',
      validate: () => false,
    }
    rules.push(notAsSource)
    return rules
  }
}

export class EndEventView extends CircleNode {
  static extendKey = 'EndEventView'

  getAnchorStyle() {
    return {
      visibility: 'hidden',
    }
  }

  getShape(): h.JSX.Element {
    const { model } = this.props
    const style = model.getNodeStyle()
    const { x, y, r } = model as CircleNodeModel
    const outCircle = super.getShape()
    return h(
      'g',
      {},
      outCircle,
      h('circle', {
        ...style,
        cx: x,
        cy: y,
        r: r - 5,
      }),
    )
  }
}

export const EndEvent = {
  type: 'bpmn:endEvent',
  view: EndEventView,
  model: EndEventModel,
}

export default EndEvent