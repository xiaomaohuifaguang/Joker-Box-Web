// ============================================================
// 动态表单 V2 —— 模板校验函数
// 职责：校验表单模板（字段、联动规则、分组）的合法性
// ============================================================

import type {
  FormField,
  FormFieldType,
  FormLinkageRule,
  FormFieldGroup,
  FormFieldOption,
  FormTableColumn,
} from '../types'
import {
  VALID_FIELD_TYPES,
  OPTION_REQUIRED_TYPES,
  getValidActionsByFieldType,
  getValidConditionsByFieldType,
} from '../types'

// ============================================================
// 校验结果
// ============================================================

export interface TemplateCheckResult {
  ok: boolean
  errors: string[]
}

// ============================================================
// 校验器
// ============================================================

const FIELD_ID_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/

function addError(result: TemplateCheckResult, message: string): void {
  result.ok = false
  result.errors.push(message)
}

function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern)
    return true
  } catch {
    return false
  }
}

function isValidOptions(options?: FormFieldOption[]): boolean {
  if (!options || options.length === 0) return false
  return options.every(
    (opt) =>
      opt &&
      typeof opt.label === 'string' &&
      opt.label.trim() !== '' &&
      (typeof opt.value === 'string' || typeof opt.value === 'number'),
  )
}

export function validateTemplate(
  name: string,
  fields: FormField[],
  linkages: FormLinkageRule[],
  groups?: FormFieldGroup[],
  description?: string,
): TemplateCheckResult {
  const result: TemplateCheckResult = { ok: true, errors: [] }

  // 1. 基础信息校验
  if (!name || name.trim() === '') {
    addError(result, '模板名称不能为空')
  } else if (name.length > 64) {
    addError(result, '模板名称不能超过 64 个字符')
  }

  if (description && description.length > 512) {
    addError(result, '模板描述不能超过 512 个字符')
  }

  // 2. 字段校验
  const fieldIdSet = new Set<string>()
  const fieldMap = new Map<string, FormField>()

  if (!fields || fields.length === 0) {
    addError(result, '模板至少需要包含一个字段')
  } else {
    fields.forEach((field, index) => {
      const prefix = `字段[${index + 1}]`

      // 字段ID非空
      if (!field.fieldId || field.fieldId.trim() === '') {
        addError(result, `${prefix} 字段ID不能为空`)
      } else {
        // 字段ID格式
        if (!FIELD_ID_REGEX.test(field.fieldId)) {
          addError(result, `${prefix} 字段ID "${field.fieldId}" 格式不正确，必须以字母开头，仅包含字母、数字、下划线，长度1-32`)
        }
        // 字段ID唯一性
        if (fieldIdSet.has(field.fieldId)) {
          addError(result, `${prefix} 字段ID "${field.fieldId}" 重复`)
        } else {
          fieldIdSet.add(field.fieldId)
          fieldMap.set(field.fieldId, field)
        }
      }

      // 字段标题非空且≤32字符
      if (!field.title || field.title.trim() === '') {
        addError(result, `${prefix}(${field.fieldId || '?'}) 字段标题不能为空`)
      } else if (field.title.length > 32) {
        addError(result, `${prefix}(${field.fieldId || '?'}) 字段标题不能超过 32 个字符`)
      }

      // 字段类型有效
      if (!field.type || !VALID_FIELD_TYPES.includes(field.type)) {
        addError(result, `${prefix}(${field.fieldId || '?'}) 字段类型 "${field.type}" 无效`)
      }

      // span 在 1-24
      const span = field.span ?? 24
      if (span < 1 || span > 24) {
        addError(result, `${prefix}(${field.fieldId || '?'}) 字段宽度(span)必须在 1-24 之间`)
      }

      // 正则表达式格式正确
      if (field.pattern && !isValidRegex(field.pattern)) {
        addError(result, `${prefix}(${field.fieldId || '?'}) 正则表达式格式不正确`)
      }

      // 按类型校验
      if (field.type) {
        // NUMBER / SLIDER / RATE 的 min/max
        if (['NUMBER', 'SLIDER', 'RATE'].includes(field.type)) {
          if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
            addError(result, `${prefix}(${field.fieldId || '?'}) 最小值不能大于最大值`)
          }
        }

        // INPUT / TEXTAREA / UPLOAD 的 minLength/maxLength
        if (['INPUT', 'TEXTAREA', 'UPLOAD'].includes(field.type)) {
          if (
            field.minLength !== undefined &&
            field.maxLength !== undefined &&
            field.minLength > field.maxLength
          ) {
            addError(result, `${prefix}(${field.fieldId || '?'}) 最小长度不能大于最大长度`)
          }
        }

        // TABLE 至少一列
        if (field.type === 'TABLE') {
          if (!field.columns || field.columns.length === 0) {
            addError(result, `${prefix}(${field.fieldId || '?'}) 动态表格至少需要定义一列`)
          } else {
            field.columns.forEach((col: FormTableColumn, colIdx: number) => {
              if (!col.key || col.key.trim() === '') {
                addError(
                  result,
                  `${prefix}(${field.fieldId || '?'}) 表格列[${colIdx + 1}] 列key不能为空`,
                )
              }
              if (!col.title || col.title.trim() === '') {
                addError(
                  result,
                  `${prefix}(${field.fieldId || '?'}) 表格列[${colIdx + 1}] 列标题不能为空`,
                )
              }
            })
          }
        }

        // 选项类型必须有选项
        if (OPTION_REQUIRED_TYPES.includes(field.type)) {
          const hasStaticOptions = isValidOptions(field.options)
          const hasRemoteOptions = field.optionSource?.type === 'API' && field.optionSource?.url
          if (!hasStaticOptions && !hasRemoteOptions) {
            addError(
              result,
              `${prefix}(${field.fieldId || '?'}) ${field.type} 类型字段必须配置选项（静态选项或远程接口）`,
            )
          }
        }
      }
    })
  }

  // 3. 联动规则校验
  linkages.forEach((rule, index) => {
    const prefix = `联动规则[${index + 1}]`

    // 目标字段存在
    if (!rule.targetFieldId) {
      addError(result, `${prefix} 目标字段ID不能为空`)
    } else if (!fieldMap.has(rule.targetFieldId)) {
      addError(result, `${prefix} 目标字段 "${rule.targetFieldId}" 不存在`)
    }

    // 条件树非空
    if (!rule.conditionTree || rule.conditionTree.length === 0) {
      addError(result, `${prefix} 条件树不能为空`)
    } else {
      // 递归校验条件树中的触发字段
      function validateTreeNode(node: typeof rule.conditionTree[number], nodePath: string): void {
        if (node.nodeType === 'AND' || node.nodeType === 'OR') {
          if (node.children) {
            node.children.forEach((child, childIdx) => {
              validateTreeNode(child, `${nodePath}.children[${childIdx}]`)
            })
          }
        } else if (node.nodeType === 'CONDITION') {
          if (!node.triggerFieldId) {
            addError(result, `${prefix} ${nodePath} 触发字段ID不能为空`)
          } else if (!fieldMap.has(node.triggerFieldId)) {
            addError(result, `${prefix} ${nodePath} 触发字段 "${node.triggerFieldId}" 不存在`)
          } else {
            // 触发条件与字段类型兼容
            const triggerField = fieldMap.get(node.triggerFieldId)!
            const validConditions = getValidConditionsByFieldType(triggerField.type)
            if (node.triggerCondition && !validConditions.includes(node.triggerCondition)) {
              addError(
                result,
                `${prefix} ${nodePath} 条件 "${node.triggerCondition}" 不适用于字段类型 "${triggerField.type}"`,
              )
            }
          }
        }
      }
      rule.conditionTree.forEach((node, nodeIdx) => {
        validateTreeNode(node, `conditionTree[${nodeIdx}]`)
      })
    }

    // 动作与字段类型兼容
    if (rule.targetFieldId && fieldMap.has(rule.targetFieldId)) {
      const targetField = fieldMap.get(rule.targetFieldId)!
      const validActions = getValidActionsByFieldType(targetField.type)
      if (!validActions.includes(rule.actionType)) {
        addError(
          result,
          `${prefix} 动作 "${rule.actionType}" 不适用于字段类型 "${targetField.type}"`,
        )
      }
    }
  })

  // 4. 分组校验（可选）
  if (groups && groups.length > 0) {
    const groupIdSet = new Set<string>()
    groups.forEach((group, index) => {
      const prefix = `分组[${index + 1}]`
      if (!group.id || group.id.trim() === '') {
        addError(result, `${prefix} 分组ID不能为空`)
      } else if (groupIdSet.has(group.id)) {
        addError(result, `${prefix} 分组ID "${group.id}" 重复`)
      } else {
        groupIdSet.add(group.id)
      }
      if (!group.name || group.name.trim() === '') {
        addError(result, `${prefix}(${group.id || '?'}) 分组名称不能为空`)
      }
    })
  }

  return result
}

// ============================================================
// 开发环境测试
// ============================================================

if (import.meta.env.DEV) {
  const fields = [
    { fieldId: 'name', title: '姓名', type: 'INPUT' as FormFieldType, span: 12 },
    { fieldId: 'age', title: '年龄', type: 'NUMBER' as FormFieldType, span: 8 },
  ]
  console.assert(validateTemplate('测试', fields, []).ok === true)
  console.assert(validateTemplate('', fields, []).ok === false)
  console.assert(
    validateTemplate(
      'Test',
      [
        { fieldId: 'a', title: 'A', type: 'INPUT' as FormFieldType },
        { fieldId: 'a', title: 'B', type: 'INPUT' as FormFieldType },
      ],
      [],
    ).ok === false,
  )
  console.log('validation.ts tests passed')
}
