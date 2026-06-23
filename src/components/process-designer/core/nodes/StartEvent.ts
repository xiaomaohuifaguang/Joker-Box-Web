import { CircleNode, CircleNodeModel } from '@logicflow/core'
import { genBpmnId } from '@logicflow/extension/lib/bpmn-elements/utils'
import { buildNodeStyle, buildTextStyle } from '../theme'

class StartEventModel extends CircleNodeModel {
  static extendKey = 'StartEventModel'

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
    // fix: 不能直接全部加，会导致下载后再次上传，位置错误。
    // data.text.y += 40;
    super(data, graphModel)
    // 如果 data 里没有传 text，或者你想强制覆盖，可以这样写：
    if (!this.text || !this.text.value) {
      this.text = {
        value: "开始",
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

  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules()
    const notAsTarget = {
      message: '起始节点不能作为边的终点',
      validate: () => false,
    }
    rules.push(notAsTarget)
    return rules
  }
}

class StartEventView extends CircleNode {
  static extendKey = 'StartEventNode'
}

export const StartEvent = {
  type: 'bpmn:startEvent',
  view: StartEventView,
  model: StartEventModel,
}

export { StartEventModel, StartEventView }
export default StartEvent
