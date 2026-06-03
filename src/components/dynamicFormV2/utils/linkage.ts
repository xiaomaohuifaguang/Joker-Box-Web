// ============================================================
// 动态表单 V2 —— 联动求值纯函数
// 职责：根据条件树和表单数据，计算字段的运行时状态
// ============================================================

import type {
  FormField,
  FormFieldType,
  FormLinkageNode,
  FormLinkageRule,
  FieldRuntimeState,
  LinkageCondition,
  LinkageAction,
} from '../types'
import { parseSwitchValue } from '../types'

// ============================================================
// 缓存
// ============================================================

export interface LinkageCache {
  conditionResults: Map<string, boolean>
  lastFormData: Map<string, any>
  lastStates: Map<string, FieldRuntimeState>
}

export function createLinkageCache(): LinkageCache {
  return {
    conditionResults: new Map<string, boolean>(),
    lastFormData: new Map<string, any>(),
    lastStates: new Map<string, FieldRuntimeState>(),
  }
}

// ============================================================
// 条件求值
// ============================================================

function isEmptyValue(v: any): boolean {
  return v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
}

function normalizeValue(v: any, fieldType: FormFieldType): any {
  if (fieldType === 'SWITCH') {
    return parseSwitchValue(v)
  }
  if (Array.isArray(v)) {
    return v.join(',')
  }
  return v
}

export function evaluateCondition(
  condition: LinkageCondition,
  fieldValue: any,
  triggerValue: any,
  fieldType: FormFieldType,
): boolean {
  const nv = normalizeValue(fieldValue, fieldType)

  switch (condition) {
    case 'EQ': {
      const a = nv === undefined || nv === null ? '' : String(nv)
      const b = triggerValue === undefined || triggerValue === null ? '' : String(triggerValue)
      return a === b
    }
    case 'NE': {
      const a = nv === undefined || nv === null ? '' : String(nv)
      const b = triggerValue === undefined || triggerValue === null ? '' : String(triggerValue)
      return a !== b
    }
    case 'GT': {
      const a = Number(nv)
      const b = Number(triggerValue)
      return !Number.isNaN(a) && !Number.isNaN(b) && a > b
    }
    case 'LT': {
      const a = Number(nv)
      const b = Number(triggerValue)
      return !Number.isNaN(a) && !Number.isNaN(b) && a < b
    }
    case 'GE': {
      const a = Number(nv)
      const b = Number(triggerValue)
      return !Number.isNaN(a) && !Number.isNaN(b) && a >= b
    }
    case 'LE': {
      const a = Number(nv)
      const b = Number(triggerValue)
      return !Number.isNaN(a) && !Number.isNaN(b) && a <= b
    }
    case 'IN': {
      if (triggerValue === undefined || triggerValue === null) return false
      const list = Array.isArray(triggerValue)
        ? triggerValue.map(String)
        : String(triggerValue).split(',').map(s => s.trim())
      const val = nv === undefined || nv === null ? '' : String(nv)
      return list.includes(val)
    }
    case 'NOT_IN': {
      if (triggerValue === undefined || triggerValue === null) return true
      const list = Array.isArray(triggerValue)
        ? triggerValue.map(String)
        : String(triggerValue).split(',').map(s => s.trim())
      const val = nv === undefined || nv === null ? '' : String(nv)
      return !list.includes(val)
    }
    case 'EMPTY':
      return isEmptyValue(fieldValue)
    case 'NOT_EMPTY':
      return !isEmptyValue(fieldValue)
    case 'REGEX': {
      if (fieldValue === undefined || fieldValue === null) return false
      try {
        const re = new RegExp(String(triggerValue))
        return re.test(String(fieldValue))
      } catch {
        return false
      }
    }
    default:
      return false
  }
}

// ============================================================
// 条件树求值
// ============================================================

function buildConditionKey(node: FormLinkageNode): string {
  return `${node.triggerFieldId}|${node.triggerCondition}|${JSON.stringify(node.triggerValue)}`
}

export function evaluateConditionTree(
  tree: FormLinkageNode[],
  formData: Record<string, any>,
  fields: FormField[],
  cache: LinkageCache,
): boolean {
  if (!tree || tree.length === 0) return true

  const fieldMap = new Map<string, FormField>()
  fields.forEach(f => fieldMap.set(f.fieldId, f))

  function evalNode(node: FormLinkageNode): boolean {
    if (node.nodeType === 'AND') {
      if (!node.children || node.children.length === 0) return true
      return node.children.every(evalNode)
    }
    if (node.nodeType === 'OR') {
      if (!node.children || node.children.length === 0) return true
      return node.children.some(evalNode)
    }
    if (node.nodeType === 'CONDITION') {
      const key = buildConditionKey(node)
      const cached = cache.conditionResults.get(key)
      if (cached !== undefined) return cached

      const field = fieldMap.get(node.triggerFieldId || '')
      const fieldValue = formData[node.triggerFieldId || '']
      const result = evaluateCondition(
        node.triggerCondition || 'EQ',
        fieldValue,
        node.triggerValue,
        field?.type || 'INPUT',
      )
      cache.conditionResults.set(key, result)
      return result
    }
    return true
  }

  return tree.every(evalNode)
}

// ============================================================
// 字段状态计算
// ============================================================

function createDefaultState(field: FormField): FieldRuntimeState {
  return {
    visible: true,
    required: field.required === '1',
    disabled: false,
    pattern: field.pattern,
    patternTips: field.patternTips,
    span: field.span ?? 24,
    options: field.options ? [...field.options] : undefined,
    value: field.defaultValue,
  }
}

function cloneState(state: FieldRuntimeState): FieldRuntimeState {
  return {
    visible: state.visible,
    required: state.required,
    disabled: state.disabled,
    pattern: state.pattern,
    patternTips: state.patternTips,
    span: state.span,
    options: state.options ? [...state.options] : undefined,
    value: state.value,
  }
}

interface StateWithValueActions extends FieldRuntimeState {
  _valueActions?: any[]
}

export function extractValueActions(states: Map<string, FieldRuntimeState>): Map<string, any[]> {
  const result = new Map<string, any[]>()
  states.forEach((state, fieldId) => {
    const s = state as StateWithValueActions
    if (s._valueActions && s._valueActions.length > 0) {
      result.set(fieldId, s._valueActions)
    }
  })
  return result
}

export function computeFieldStates(
  fields: FormField[],
  linkageRules: FormLinkageRule[],
  formData: Record<string, any>,
  cache: LinkageCache,
): Map<string, FieldRuntimeState> {
  const states = new Map<string, FieldRuntimeState>()

  // 初始化默认状态
  fields.forEach(field => {
    states.set(field.fieldId, createDefaultState(field))
  })

  // 清空缓存的条件结果（因为 formData 可能变化）
  cache.conditionResults.clear()

  // 按规则处理
  linkageRules.forEach(rule => {
    if (!rule.enable) return
    if (!rule.conditionTree || rule.conditionTree.length === 0) return

    const matched = evaluateConditionTree(rule.conditionTree, formData, fields, cache)
    if (!matched) return

    const state = states.get(rule.targetFieldId)
    if (!state) return

    const s = state as StateWithValueActions

    switch (rule.actionType) {
      case 'SHOW':
        s.visible = true
        break
      case 'HIDE':
        s.visible = false
        break
      case 'REQUIRED':
        s.required = true
        break
      case 'DISABLED':
        s.disabled = true
        break
      case 'ENABLED':
        s.disabled = false
        break
      case 'SET_PATTERN':
        if (rule.actionValue && typeof rule.actionValue === 'object') {
          s.pattern = rule.actionValue.pattern ?? s.pattern
          s.patternTips = rule.actionValue.patternTips ?? s.patternTips
        }
        break
      case 'SET_SPAN':
        if (rule.actionValue && typeof rule.actionValue === 'object') {
          s.span = rule.actionValue.span ?? s.span
        } else if (typeof rule.actionValue === 'number') {
          s.span = rule.actionValue
        }
        break
      case 'OPTION':
        if (Array.isArray(rule.actionValue)) {
          s.options = [...rule.actionValue]
        }
        break
      case 'VALUE':
        if (!s._valueActions) s._valueActions = []
        s._valueActions.push(rule.actionValue)
        break
    }
  })

  return states
}

// ============================================================
// 开发环境测试
// ============================================================

if (import.meta.env.DEV) {
  console.assert(evaluateCondition('EQ', 'hello', 'hello', 'INPUT') === true)
  console.assert(evaluateCondition('GT', 10, 5, 'NUMBER') === true)
  console.assert(evaluateCondition('EMPTY', '', '', 'INPUT') === true)
  console.assert(evaluateCondition('IN', 'a', ['a', 'b'], 'SELECT') === true)

  const fields = [
    { fieldId: 'name', title: 'Name', type: 'INPUT' as const },
    { fieldId: 'age', title: 'Age', type: 'NUMBER' as const },
  ]
  const tree: FormLinkageNode[] = [
    {
      nodeType: 'AND',
      children: [
        { nodeType: 'CONDITION', triggerFieldId: 'name', triggerCondition: 'EQ', triggerValue: 'admin' },
        { nodeType: 'CONDITION', triggerFieldId: 'age', triggerCondition: 'GT', triggerValue: 18 },
      ],
    },
  ]
  const cache = createLinkageCache()
  console.assert(evaluateConditionTree(tree, { name: 'admin', age: 20 }, fields, cache) === true)

  const rules: FormLinkageRule[] = [
    {
      targetFieldId: 'age',
      actionType: 'HIDE',
      enable: true,
      conditionTree: [
        { nodeType: 'CONDITION', triggerFieldId: 'name', triggerCondition: 'EQ', triggerValue: 'hide' },
      ],
    },
  ]
  const states = computeFieldStates(fields, rules, { name: 'hide' }, createLinkageCache())
  console.assert(states.get('age')?.visible === false)

  console.log('linkage.ts tests passed')
}
