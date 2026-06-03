// ============================================================
// 动态表单 V2 —— 字段运行时状态管理 Composable
// 职责：管理字段的可见性、排序、快速查找等运行时状态
// ============================================================

import { ref, computed, type Ref } from 'vue'
import type { FormField, FieldRuntimeState } from '../types'

export interface UseFieldStateReturn {
  /** 字段运行时状态映射：fieldId -> FieldRuntimeState */
  runtimeStates: Ref<Map<string, FieldRuntimeState>>
  /** 可见字段列表（已过滤隐藏字段并按 sort 排序） */
  visibleFields: Ref<FormField[]>
  /** 字段快速查找映射：fieldId -> FormField */
  fieldMap: Ref<Map<string, FormField>>
  /** 获取单个字段的运行时状态 */
  getFieldState: (fieldId: string) => FieldRuntimeState | undefined
  /** 设置单个字段的运行时状态 */
  setFieldState: (fieldId: string, state: Partial<FieldRuntimeState>) => void
  /** 批量设置运行时状态 */
  setRuntimeStates: (states: Map<string, FieldRuntimeState>) => void
}

/**
 * 字段运行时状态管理
 * @param fields - 字段定义列表的响应式引用
 * @returns 运行时状态管理 API
 */
export function useFieldState(fields: Ref<FormField[]>): UseFieldStateReturn {
  // 字段运行时状态映射
  const runtimeStates = ref<Map<string, FieldRuntimeState>>(new Map())

  // 字段快速查找映射
  const fieldMap = computed<Map<string, FormField>>(() => {
    const map = new Map<string, FormField>()
    fields.value.forEach((field) => {
      map.set(field.fieldId, field)
    })
    return map
  })

  // 可见字段列表（过滤隐藏字段并按 sort 排序）
  const visibleFields = computed<FormField[]>(() => {
    return fields.value
      .filter((field) => {
        const state = runtimeStates.value.get(field.fieldId)
        return state?.visible !== false
      })
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  })

  /**
   * 获取单个字段的运行时状态
   */
  function getFieldState(fieldId: string): FieldRuntimeState | undefined {
    return runtimeStates.value.get(fieldId)
  }

  /**
   * 设置单个字段的运行时状态（部分更新）
   */
  function setFieldState(fieldId: string, state: Partial<FieldRuntimeState>): void {
    const current = runtimeStates.value.get(fieldId)
    if (current) {
      runtimeStates.value.set(fieldId, { ...current, ...state })
    } else {
      runtimeStates.value.set(fieldId, {
        visible: true,
        required: false,
        disabled: false,
        ...state,
      })
    }
  }

  /**
   * 批量设置运行时状态（完全替换）
   */
  function setRuntimeStates(states: Map<string, FieldRuntimeState>): void {
    runtimeStates.value = new Map(states)
  }

  return {
    runtimeStates,
    visibleFields,
    fieldMap,
    getFieldState,
    setFieldState,
    setRuntimeStates,
  }
}
