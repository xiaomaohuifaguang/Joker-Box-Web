// src/components/process-designer/utils/gateway-condition.ts
import type { GatewayConditionSaveItem } from '../types/gateway-condition'

const GATEWAY_TYPES = ['bpmn:exclusiveGateway', 'bpmn:inclusiveGateway']

export function buildGatewayConditions(graphRawData: any): GatewayConditionSaveItem[] {
  const edges = graphRawData?.edges ?? []
  const nodes = graphRawData?.nodes ?? []

  return edges
    .filter((edge: any) => {
      const sourceNode = nodes.find((n: any) => n.id === edge.sourceNodeId)
      return sourceNode && GATEWAY_TYPES.includes(sourceNode.type)
    })
    .map((edge: any) => {
      const data = edge.properties?.gatewayCondition
      return {
        sequenceFlowId: edge.id,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        conditionType: data?.conditionType ?? null,
        isDefault: data?.isDefault ?? false,
        nativeExpression: data?.nativeExpression,
        ruleTree: data?.ruleTree,
      }
    })
}

export function applyGatewayConditions(graphRawData: any, gatewayConditions: any[]) {
  if (!gatewayConditions?.length) return

  const conditionMap = new Map(gatewayConditions.map((c) => [c.sequenceFlowId, c]))

  graphRawData.edges?.forEach((edge: any) => {
    const condition = conditionMap.get(edge.id)
    if (condition) {
      edge.properties = edge.properties || {}
      edge.properties.gatewayCondition = {
        conditionType: condition.conditionType,
        isDefault: condition.isDefault,
        nativeExpression: condition.nativeExpression,
        ruleTree: condition.ruleTree,
      }
    }
  })
}
