import type { FlowWarning } from '../types/flow-validation'
import type { GatewayConditionData } from '../types/gateway-condition'

/** 该边是否被标记为默认走向（单一真值：edge.gatewayCondition.isDefault） */
const isDefaultEdge = (edge: any): boolean =>
  edge?.properties?.gatewayCondition?.isDefault === true

/** 该边是否配置了有效条件（NATIVE 表达式非空 或 CUSTOM 规则非空，且不是默认走向） */
const hasCondition = (edge: any): boolean => {
  const gc: GatewayConditionData | undefined = edge?.properties?.gatewayCondition
  if (!gc || gc.isDefault) return false
  if (gc.conditionType === 'NATIVE') {
    return !!(gc.nativeExpression && gc.nativeExpression.trim())
  }
  if (gc.conditionType === 'CUSTOM') {
    const tree = gc.ruleTree?.[0]
    return !!tree?.children && tree.children.length > 0
  }
  return false
}

export const validateGateway = (node: any, lf: any): FlowWarning[] => {
  const warnings: FlowWarning[] = []
  if (!['bpmn:exclusiveGateway', 'bpmn:inclusiveGateway'].includes(node.type)) {
    return warnings
  }

  const edges = lf.graphModel?.edges || []
  const sourceEdges = edges.filter((e: any) => e.sourceNodeId === node.id)
  if (sourceEdges.length === 0) return warnings

  const defaultEdges = sourceEdges.filter((e: any) => isDefaultEdge(e))
  const conditionEdges = sourceEdges.filter((e: any) => !isDefaultEdge(e) && hasCondition(e))
  const blankEdges = sourceEdges.filter((e: any) => !isDefaultEdge(e) && !hasCondition(e))

  // 多条边都被设为默认走向
  if (defaultEdges.length > 1) {
    warnings.push({
      type: 'node',
      message: `存在 ${defaultEdges.length} 条默认走向出边，仅允许一条`,
    })
  }

  // 存在既没有条件、也不是默认走向的出边
  if (blankEdges.length > 0) {
    warnings.push({
      type: 'node',
      message:
        defaultEdges.length > 0
          ? `存在 ${blankEdges.length} 条未配置条件的出边`
          : '未设置默认走向，存在未配置条件的出边，流程可能在此处卡住',
    })
  }

  // 排他网关：仅一条出边时无需条件；多条出边时建议至少一条默认走向兜底
  if (
    node.type === 'bpmn:exclusiveGateway' &&
    sourceEdges.length > 1 &&
    defaultEdges.length === 0 &&
    conditionEdges.length === sourceEdges.length
  ) {
    warnings.push({
      type: 'node',
      message: '所有出边均配置了条件但缺少默认走向，所有条件都不满足时流程将卡住',
    })
  }

  return warnings
}
