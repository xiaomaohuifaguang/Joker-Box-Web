// ============================================================
// 动态表单 V2 —— 表单校验 Composable
// 职责：根据字段定义和运行时状态动态构建 Element Plus 表单规则
// ============================================================

import { computed, type Ref } from 'vue'
import type { FormField, FieldRuntimeState, FormFieldType } from '../types'

// Element Plus 表单规则类型（简化定义，避免引入 element-plus 类型依赖）
interface FormItemRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  pattern?: RegExp
  min?: number
  max?: number
  validator?: (rule: any, value: any, callback: (error?: Error) => void) => void
  type?: string
}

type FormRules = Record<string, FormItemRule[]>

export interface UseFormValidationReturn {
  /** 动态构建的 Element Plus 表单规则 */
  formRules: Ref<FormRules>
}

/** 选择类字段类型 */
const SELECT_LIKE_TYPES: FormFieldType[] = [
  'SELECT',
  'MULTISELECT',
  'RADIO',
  'CHECKBOX',
  'CASCADER',
  'MULTICASCADER',
]

/**
 * 表单校验规则构建
 * @param fields - 字段定义列表的响应式引用
 * @param runtimeStates - 字段运行时状态的响应式引用
 * @returns 表单校验规则
 */
export function useFormValidation(
  fields: Ref<FormField[]>,
  runtimeStates: Ref<Map<string, FieldRuntimeState>>,
): UseFormValidationReturn {
  const formRules = computed<FormRules>(() => {
    const rules: FormRules = {}

    fields.value.forEach((field) => {
      const state = runtimeStates.value.get(field.fieldId)

      // 隐藏字段不参与校验
      if (!state || state.visible === false) {
        return
      }

      const fieldRules: FormItemRule[] = []

      // required 规则
      if (state.required || field.required === '1') {
        const isSwitchOrSelect = field.type === 'SWITCH' || SELECT_LIKE_TYPES.includes(field.type)
        fieldRules.push({
          required: true,
          message: `请${isSwitchOrSelect ? '选择' : '输入'}${field.title}`,
          trigger: isSwitchOrSelect ? 'change' : 'blur',
        })
      }

      // pattern 规则
      if (state.pattern || field.pattern) {
        const patternStr = state.pattern || field.pattern
        if (patternStr) {
          try {
            fieldRules.push({
              pattern: new RegExp(patternStr),
              message: state.patternTips || field.patternTips || `${field.title}格式不正确`,
              trigger: 'blur',
            })
          } catch {
            console.warn(`[useFormValidation] 字段 "${field.fieldId}" 的正则表达式格式无效:`, patternStr)
          }
        }
      }

      // minLength / maxLength 规则（INPUT / TEXTAREA / UPLOAD）
      if (['INPUT', 'TEXTAREA', 'UPLOAD'].includes(field.type)) {
        const minLen = field.minLength
        const maxLen = field.maxLength
        if (minLen !== undefined || maxLen !== undefined) {
          const rule: FormItemRule = {
            trigger: 'blur',
          }
          if (minLen !== undefined) {
            rule.min = minLen
          }
          if (maxLen !== undefined) {
            rule.max = maxLen
          }
          if (minLen !== undefined && maxLen !== undefined) {
            rule.message = `${field.title}长度必须在 ${minLen} 到 ${maxLen} 之间`
          } else if (minLen !== undefined) {
            rule.message = `${field.title}长度不能少于 ${minLen}`
          } else {
            rule.message = `${field.title}长度不能超过 ${maxLen}`
          }
          fieldRules.push(rule)
        }
      }

      // NUMBER / SLIDER / RATE：自定义 validator 检查 min/max 数值范围
      if (['NUMBER', 'SLIDER', 'RATE'].includes(field.type)) {
        const minVal = field.min
        const maxVal = field.max
        if (minVal !== undefined || maxVal !== undefined) {
          fieldRules.push({
            validator: (_rule: any, value: any, callback: (error?: Error) => void) => {
              if (value === null || value === undefined || value === '') {
                callback()
                return
              }
              const num = Number(value)
              if (Number.isNaN(num)) {
                callback(new Error(`${field.title}必须是有效数字`))
                return
              }
              if (minVal !== undefined && num < minVal) {
                callback(new Error(`${field.title}不能小于 ${minVal}`))
                return
              }
              if (maxVal !== undefined && num > maxVal) {
                callback(new Error(`${field.title}不能大于 ${maxVal}`))
                return
              }
              callback()
            },
            trigger: 'blur',
          })
        }
      }

      // 选择类字段（MULTISELECT / CHECKBOX / MULTICASCADER）：自定义 validator 检查选择数 min/max
      if (['MULTISELECT', 'CHECKBOX', 'MULTICASCADER'].includes(field.type)) {
        const minCount = field.min
        const maxCount = field.max
        if (minCount !== undefined || maxCount !== undefined) {
          fieldRules.push({
            validator: (_rule: any, value: any, callback: (error?: Error) => void) => {
              const arr = Array.isArray(value) ? value : (value ? [value] : [])
              if (minCount !== undefined && arr.length < minCount) {
                callback(new Error(`${field.title}至少选择 ${minCount} 项`))
                return
              }
              if (maxCount !== undefined && arr.length > maxCount) {
                callback(new Error(`${field.title}最多选择 ${maxCount} 项`))
                return
              }
              callback()
            },
            trigger: 'change',
          })
        }
      }

      // TABLE：自定义 validator 检查行数 min/max
      if (field.type === 'TABLE') {
        const minRows = field.min
        const maxRows = field.max
        if (minRows !== undefined || maxRows !== undefined) {
          fieldRules.push({
            validator: (_rule: any, value: any, callback: (error?: Error) => void) => {
              const rows = Array.isArray(value) ? value : []
              if (minRows !== undefined && rows.length < minRows) {
                callback(new Error(`${field.title}至少需要 ${minRows} 行数据`))
                return
              }
              if (maxRows !== undefined && rows.length > maxRows) {
                callback(new Error(`${field.title}最多只能有 ${maxRows} 行数据`))
                return
              }
              callback()
            },
            trigger: 'change',
          })
        }
      }

      if (fieldRules.length > 0) {
        rules[field.fieldId] = fieldRules
      }
    })

    return rules
  })

  return {
    formRules,
  }
}
