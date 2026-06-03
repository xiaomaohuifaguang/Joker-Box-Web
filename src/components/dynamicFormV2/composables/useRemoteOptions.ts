// ============================================================
// 动态表单 V2 —— 远程选项管理 Composable
// 职责：管理 API 选项源字段的远程选项加载、缓存、重试
// ============================================================

import { ref, watch, type Ref } from 'vue'
import type { FormField, FormFieldOption } from '../types'
import { isApiOptionSource, supportsOptionSource } from '../types'
import { loadRemoteOptions, collectRemoteOptionParamRefs } from '../utils/remoteOptions'

export interface UseRemoteOptionsReturn {
  /** 远程选项缓存：fieldId -> 选项列表 */
  remoteOptions: Ref<Record<string, FormFieldOption[]>>
  /** 选项加载状态：fieldId -> boolean */
  optionLoading: Ref<Record<string, boolean>>
  /** 选项加载错误：fieldId -> 错误信息 */
  optionErrors: Ref<Record<string, string>>
  /** 获取字段的选项（合并静态选项和远程选项） */
  getFieldOptions: (field: FormField) => FormFieldOption[] | undefined
  /** 为指定字段加载远程选项 */
  loadOptionsForField: (field: FormField) => Promise<void>
  /** 重试加载指定字段的远程选项 */
  retryLoadOptions: (fieldId: string) => Promise<void>
}

/**
 * 远程选项管理
 * @param fields - 字段定义列表的响应式引用
 * @param formData - 表单数据的响应式引用
 * @returns 远程选项管理 API
 */
export function useRemoteOptions(
  fields: Ref<FormField[]>,
  formData: Ref<Record<string, any>>,
): UseRemoteOptionsReturn {
  // 远程选项缓存
  const remoteOptions = ref<Record<string, FormFieldOption[]>>({})
  // 加载状态
  const optionLoading = ref<Record<string, boolean>>({})
  // 加载错误
  const optionErrors = ref<Record<string, string>>({})

  /**
   * 获取字段的选项（优先返回远程选项，否则返回静态选项）
   */
  function getFieldOptions(field: FormField): FormFieldOption[] | undefined {
    if (isApiOptionSource(field)) {
      return remoteOptions.value[field.fieldId]
    }
    return field.options
  }

  /**
   * 为指定字段加载远程选项
   */
  async function loadOptionsForField(field: FormField): Promise<void> {
    if (!supportsOptionSource(field.type) || !isApiOptionSource(field)) {
      return
    }

    const fieldId = field.fieldId

    // 避免重复加载
    if (optionLoading.value[fieldId]) {
      return
    }

    optionLoading.value[fieldId] = true
    optionErrors.value[fieldId] = ''

    try {
      const options = await loadRemoteOptions(field, formData.value)
      remoteOptions.value[field.fieldId] = options
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      optionErrors.value[fieldId] = message
      console.error(`[useRemoteOptions] 加载字段 "${fieldId}" 的远程选项失败:`, error)
    } finally {
      optionLoading.value[fieldId] = false
    }
  }

  /**
   * 重试加载指定字段的远程选项
   */
  async function retryLoadOptions(fieldId: string): Promise<void> {
    const field = fields.value.find((f) => f.fieldId === fieldId)
    if (!field) {
      console.warn(`[useRemoteOptions] 重试失败：字段 "${fieldId}" 不存在`)
      return
    }
    await loadOptionsForField(field)
  }

  // 监听 fields 变化，immediate: true
  // 对每个 API 选项源的字段，如果无依赖，立即加载
  watch(
    fields,
    (newFields) => {
      newFields.forEach((field) => {
        if (!supportsOptionSource(field.type) || !isApiOptionSource(field)) {
          return
        }
        const refs = collectRemoteOptionParamRefs(field.optionSource?.params)
        if (refs.length === 0) {
          loadOptionsForField(field)
        }
      })
    },
    { immediate: true },
  )

  // 监听 formData 变化（deep），对有依赖字段重新加载远程选项
  watch(
    formData,
    () => {
      fields.value.forEach((field) => {
        if (!supportsOptionSource(field.type) || !isApiOptionSource(field)) {
          return
        }
        const refs = collectRemoteOptionParamRefs(field.optionSource?.params)
        if (refs.length > 0) {
          loadOptionsForField(field)
        }
      })
    },
    { deep: true },
  )

  return {
    remoteOptions,
    optionLoading,
    optionErrors,
    getFieldOptions,
    loadOptionsForField,
    retryLoadOptions,
  }
}
