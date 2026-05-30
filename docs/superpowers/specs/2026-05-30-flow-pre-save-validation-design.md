# 流程保存前警告确认设计文档

## 背景与目标

当前流程设计器在保存时只有简单的用户任务校验（`validateUserTasks`）。随着业务复杂度增加，需要在保存前对流程进行更全面的检查，并在有警告时弹出确认框让用户确认。

**核心需求：**
- 保存前自动收集所有警告
- 以确认框形式列出警告，用户可取消或继续保存
- 架构可扩展，后续新增节点类型的校验无需改动核心逻辑

## 需求摘要

- 在 `ProcessDefinitionInfoView.vue` 的保存按钮点击时，先执行流程校验
- 校验逻辑分散在各 PropertyPanel 中，由 `ProcessEditor.vue` 统一收集
- 如有警告，弹出 `ElMessageBox.confirm` 列出所有警告
- 用户点击"确认保存"才执行真正的保存，点击"返回修改"则关闭弹窗

## 架构设计（分布式校验）

### 核心原则

**谁配置谁校验** — 每个节点类型的校验逻辑写在对应的 PropertyPanel 中，与 UI 配置代码高内聚。

### 数据类型

```ts
// src/components/process-designer/types/flow-validation.ts
export interface FlowWarning {
  type: 'node' | 'edge' | 'process'
  nodeId?: string
  nodeName?: string
  message: string
}

export type FlowValidator = (node: any, lf: any) => FlowWarning[]
```

### ProcessEditor.vue — 校验器注册中心

```ts
const validators: Record<string, FlowValidator> = {}

export const registerValidator = (nodeType: string, validator: FlowValidator) => {
  validators[nodeType] = validator
}

const validateFlow = (): FlowWarning[] => {
  if (!lf.value) return []
  const warnings: FlowWarning[] = []
  const nodes = lf.value.graphModel?.nodes || []

  nodes.forEach((node: any) => {
    const validator = validators[node.type]
    if (validator) {
      const nodeWarnings = validator(node, lf.value)
      nodeWarnings.forEach(w => {
        warnings.push({
          ...w,
          nodeId: node.id,
          nodeName: node.text?.value || node.id,
        })
      })
    }
  })

  return warnings
}

defineExpose({ validateFlow })
```

### GatewayProperty.vue — 导出校验函数

```ts
export const validateGateway = (node: any, lf: any): FlowWarning[] => {
  const warnings: FlowWarning[] = []
  if (!['bpmn:exclusiveGateway', 'bpmn:inclusiveGateway'].includes(node.type)) {
    return warnings
  }

  const defaultFlow = node.properties?.default
  if (!defaultFlow) {
    const edges = lf.graphModel?.edges || []
    const sourceEdges = edges.filter((e: any) => e.sourceNodeId === node.id)
    const hasUnconditional = sourceEdges.some((e: any) => !e.properties?.condition)
    if (hasUnconditional) {
      warnings.push({
        type: 'node',
        message: '未设置默认路径，存在无条件出边',
      })
    }
  }
  return warnings
}
```

### ProcessEditor 初始化时注册

```ts
import { validateGateway } from './components/PropertyPanels/GatewayProperty.vue'

registerValidator('bpmn:exclusiveGateway', validateGateway)
registerValidator('bpmn:inclusiveGateway', validateGateway)
```

### ProcessDefinitionInfoView.vue — 保存拦截

```ts
const processEditorRef = ref<InstanceType<typeof ProcessEditor> | null>(null)

const save = () => {
  const warnings = processEditorRef.value?.validateFlow() || []

  if (warnings.length > 0) {
    const warningList = warnings
      .map(w => `• 节点「${w.nodeName}」：${w.message}`)
      .join('\n')

    ElMessageBox.confirm(
      `流程存在 ${warnings.length} 个警告：\n\n${warningList}\n\n建议修复后再保存，避免流程运行时卡住。`,
      '流程存在警告',
      {
        confirmButtonText: '确认保存',
        cancelButtonText: '返回修改',
        type: 'warning',
      }
    ).then(() => doSave()).catch(() => {})
    return
  }

  // 原有校验（用户任务未设置处理类型）
  const missingTasks = validateUserTasks(info.value.rawData)
  if (missingTasks.length > 0) {
    // ... 原有逻辑不变
    return
  }

  confirm('提示', '确认保存？', async () => doSave())
}
```

## 扩展性设计

后续新增节点类型的校验，只需两步：

1. **在对应的 PropertyPanel 中导出校验函数：**

```ts
// UserTaskProperty.vue
export const validateUserTask = (node: any, lf: any): FlowWarning[] => {
  const warnings: FlowWarning[] = []
  if (!node.properties?.candidate) {
    warnings.push({ type: 'node', message: '未配置候选人' })
  }
  return warnings
}
```

2. **在 ProcessEditor 中注册：**

```ts
import { validateUserTask } from './components/PropertyPanels/UserTaskProperty.vue'
registerValidator('bpmn:userTask', validateUserTask)
```

无需修改 `ProcessDefinitionInfoView.vue` 或核心校验逻辑。

## 确认框 UI

```
┌─────────────────────────────────────────┐
│  ⚠️ 流程存在警告                        │
├─────────────────────────────────────────┤
│                                         │
│  流程存在 2 个警告：                    │
│                                         │
│  • 节点「审批网关」(排他网关)：          │
│    未设置默认路径，存在无条件出边       │
│  • 节点「分支判断」(包容网关)：          │
│    未设置默认路径，存在无条件出边       │
│                                         │
│  建议修复后再保存，避免流程运行时卡住。 │
│                                         │
├─────────────────────────────────────────┤
│      [  返回修改  ]  [  确认保存  ]     │
└─────────────────────────────────────────┘
```

## 错误处理

- `validateFlow()` 中任意单个节点的校验函数抛异常，不应阻断其他节点的校验
- 使用 `try/catch` 包裹每个 validator 调用，异常时记录到控制台但不中断流程

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/process-designer/types/flow-validation.ts` | 新建 | FlowWarning / FlowValidator 类型定义 |
| `src/components/process-designer/ProcessEditor.vue` | 修改 | 添加 `registerValidator`、`validateFlow`、`defineExpose` |
| `src/components/process-designer/components/PropertyPanels/GatewayProperty.vue` | 修改 | 导出 `validateGateway` 函数 |
| `src/views/console/processManager/ProcessDefinitionInfoView.vue` | 修改 | 保存前调用 `validateFlow`，有警告则弹确认框 |

## 后续扩展（V2）

- **用户任务校验** — 未配置候选人/处理人
- **孤立节点校验** — 没有入边或出边的节点
- **循环依赖校验** — 流程存在无法到达终点的循环
- **空条件校验** — 有条件表达式的边但表达式为空
