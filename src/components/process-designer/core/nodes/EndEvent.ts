import { CircleNode, CircleNodeModel, h } from '@logicflow/core'
import { genBpmnId } from '@logicflow/extension/lib/bpmn-elements/utils'
import { buildNodeStyle, buildTextStyle } from '../theme'

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
    if (!this.text || !this.text.value) {
      this.text = {
        value: "结束",
        x: this.x,
        y: this.y
      };
    }
  }

  setAttributes(): void {
    this.r = 22
  }

  getNodeStyle() {
    const style = super.getNodeStyle()
    return { ...style, ...buildNodeStyle(this.type, this.isSelected) }
  }

  getTextStyle() {
    const style = super.getTextStyle()
    return { ...style, ...buildTextStyle() }
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

  /**
   * BPMN 结束节点视觉规范:粗描边圆环。
   * 通过 model 的 getNodeStyle() 拿到 strokeWidth (3 / 4 选中态),
   * 不再用"嵌套小圆"的旧手法 —— 那种做法选中时内圆描边会与外圆不一致。
   */
  getShape(): h.JSX.Element {
    const { model } = this.props
    const style = model.getNodeStyle()
    const { x, y, r } = model as CircleNodeModel
    return h('circle', {
      ...style,
      cx: x,
      cy: y,
      r,
    })
  }
}

export const EndEvent = {
  type: 'bpmn:endEvent',
  view: EndEventView,
  model: EndEventModel,
}

export default EndEvent
