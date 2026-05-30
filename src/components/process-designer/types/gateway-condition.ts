// src/components/process-designer/types/gateway-condition.ts

export type ConditionType = 'NATIVE' | 'CUSTOM' | null

export type NodeType = 'AND' | 'OR' | 'CONDITION'

export type Category =
  | 'FORM_FIELD'
  | 'HANDLER_DEPT'
  | 'HANDLER_ROLE'
  | 'PREV_HANDLER_DEPT'
  | 'PREV_HANDLER_ROLE'

export type Operator =
  | 'EQ' | 'NE' | 'GT' | 'LT' | 'GE' | 'LE'
  | 'IN' | 'NOT_IN' | 'EMPTY' | 'NOT_EMPTY' | 'REGEX'

export interface RuleTreeNode {
  nodeType: NodeType
  sort: number
  category?: Category
  fieldKey?: string
  operator?: Operator
  value?: string
  children?: RuleTreeNode[]
}

export interface GatewayConditionData {
  conditionType: ConditionType
  isDefault: boolean
  nativeExpression?: string
  ruleTree?: RuleTreeNode
}

export interface GatewayConditionSaveItem {
  sequenceFlowId: string
  sourceNodeId: string
  targetNodeId: string
  conditionType: ConditionType
  isDefault: boolean
  nativeExpression?: string
  ruleTree?: RuleTreeNode
}

export const CATEGORY_OPTIONS: { label: string; value: Category; fieldKey: string }[] = [
  { label: '表单字段', value: 'FORM_FIELD', fieldKey: '' },
  { label: '当前部门', value: 'HANDLER_DEPT', fieldKey: 'deptId' },
  { label: '当前角色', value: 'HANDLER_ROLE', fieldKey: 'roleId' },
  { label: '上一级部门', value: 'PREV_HANDLER_DEPT', fieldKey: 'deptId' },
  { label: '上一级角色', value: 'PREV_HANDLER_ROLE', fieldKey: 'roleId' },
]

export const OPERATOR_OPTIONS: { label: string; value: Operator }[] = [
  { label: '等于', value: 'EQ' },
  { label: '不等于', value: 'NE' },
  { label: '大于', value: 'GT' },
  { label: '小于', value: 'LT' },
  { label: '大于等于', value: 'GE' },
  { label: '小于等于', value: 'LE' },
  { label: '在列表中', value: 'IN' },
  { label: '不在列表中', value: 'NOT_IN' },
  { label: '为空', value: 'EMPTY' },
  { label: '不为空', value: 'NOT_EMPTY' },
  { label: '正则匹配', value: 'REGEX' },
]

export const VALUELESS_OPERATORS: Operator[] = ['EMPTY', 'NOT_EMPTY']
