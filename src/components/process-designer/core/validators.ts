import type { FlowWarning } from '../types/flow-validation'

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
