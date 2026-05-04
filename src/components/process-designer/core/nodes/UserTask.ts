import { h, RectNode, RectNodeModel, GraphModel } from '@logicflow/core'
import { genBpmnId } from '@logicflow/extension/lib/bpmn-elements/utils'

// 1. 在这里引入你的 SVG 文件 (假设文件名为 user-icon.svg)
// 注意：根据你的打包工具配置(vite/webpack)，这里导入的可能是一个字符串或者 url
import UserIconSvg from './icon/user-task.svg'

export class UserTaskModel extends RectNodeModel {
    static extendKey = 'UserTaskModel'

    constructor(data: any, graphModel: GraphModel) {
        if (!data.id) {
            data.id = `Activity_${genBpmnId()}`
        }
        super(data, graphModel)

        if (!this.text || !this.text.value) {
            this.text = {
                value: "用户任务",
                x: this.x,
                y: this.y
            };
        }

        // 设置默认样式
        this.style = {
            fill: '#E6F7FF', // 浅蓝色背景
            stroke: '#5F95FF',
            strokeWidth: 1,
            rx: 4,
            ry: 4,
        }
    }

    initNodeData(data: any) {
        super.initNodeData(data)
        const props = data.properties || {}

    }


}

export class UserTaskView extends RectNode {
    static extendKey = 'UserTaskNode'

    /**
     * 获取图标形状 - 使用 <image> 标签加载外部 SVG
     */
    getIconShape(): h.JSX.Element {
        const { model } = this.props
        const { x, y, width, height } = model

        // --- 布局配置 ---
        const iconSize = 20       // 图标宽高
        const padding = 8         // 图标距离边框的距离

        return h(
            'image',
            {
                // 核心：设置图片链接
                href: UserIconSvg,

                // 核心：计算位置 (左上角为基准)
                x: x - width / 2 + padding,
                y: y - height / 2 + padding,

                // 核心：设置宽高
                width: iconSize,
                height: iconSize,
            }
        )
    }

    getShape(): h.JSX.Element {
        const { model } = this.props
        const { x, y, width, height } = model
        const style = model.getNodeStyle()

        return h('g', {}, [
            // 1. 背景矩形
            h('rect', {
                ...style,
                x: x - width / 2,
                y: y - height / 2,
                rx: style.rx || 4,
                ry: style.ry || 4,
                width,
                height,
            }),
            // 2. 引入的 SVG 图片
            this.getIconShape(),
        ])
    }
}

export const UserTask = {
    type: 'bpmn:userTask',
    view: UserTaskView,
    model: UserTaskModel,
}

export default UserTask