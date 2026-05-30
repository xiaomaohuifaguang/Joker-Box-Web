export interface FlowWarning {
  type: 'node' | 'edge' | 'process'
  nodeId?: string
  nodeName?: string
  message: string
}

export type FlowValidator = (node: any, lf: any) => FlowWarning[]
