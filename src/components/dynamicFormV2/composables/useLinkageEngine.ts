// ============================================================
// 动态表单 V2 —— 联动引擎 Composable（核心改进）
// 职责：根据联动规则计算字段运行时状态，支持批量 VALUE 动作
// 关键设计：
//   1. 实例级缓存（createLinkageCache）避免重复计算
//   2. VALUE 动作使用批量队列 + nextTick 批量应用
//   3. 应用期间 isApplyingValues = true，避免触发二次计算
// ============================================================

import { ref, watch, nextTick, type Ref } from 'vue'
import type { FormField, FormLinkageRule, FieldRuntimeState } from '../types'
import {
  computeFieldStates,
  createLinkageCache,
  extractValueActions,
} from '../utils/linkage'
import type { LinkageCache } from '../utils/linkage'

export interface UseLinkageEngineReturn {
  /** 字段运行时状态映射 */
  runtimeStates: Ref<Map<string, FieldRuntimeState>>
  /** 重新计算联动状态 */
  compute: () => void
  /** 是否正在批量应用 VALUE 动作 */
  isApplyingValues: Ref<boolean>
}

/**
 * 联动引擎
 * @param fields - 字段定义列表的响应式引用
 * @param linkageRules - 联动规则列表的响应式引用
 * @param formData - 表单数据的响应式引用
 * @param emitValueUpdate - 批量 VALUE 动作更新回调
 * @returns 联动引擎 API
 */
export function useLinkageEngine(
  fields: Ref<FormField[]>,
  linkageRules: Ref<FormLinkageRule[]>,
  formData: Ref<Record<string, any>>,
  emitValueUpdate?: (updates: Record<string, any>) => void,
): UseLinkageEngineReturn {
  // 实例级缓存
  const cache: LinkageCache = createLinkageCache()

  // 字段运行时状态
  const runtimeStates = ref<Map<string, FieldRuntimeState>>(new Map())

  // 是否正在批量应用 VALUE 动作
  const isApplyingValues = ref(false)

  // VALUE 动作批量队列
  const pendingValueActions = new Map<string, any>()
  let flushScheduled = false

  /**
   * 批量应用 VALUE 动作
   */
  async function flushValueActions(): Promise<void> {
    if (pendingValueActions.size === 0) {
      flushScheduled = false
      return
    }

    const updates: Record<string, any> = {}
    pendingValueActions.forEach((value, fieldId) => {
      updates[fieldId] = value
    })
    pendingValueActions.clear()
    flushScheduled = false

    if (emitValueUpdate && Object.keys(updates).length > 0) {
      isApplyingValues.value = true
      emitValueUpdate(updates)
      // 等待 nextTick 确保表单数据已更新
      await nextTick()
      isApplyingValues.value = false
    }
  }

  /**
   * 调度批量应用 VALUE 动作
   */
  function scheduleFlush(): void {
    if (flushScheduled) return
    flushScheduled = true
    nextTick(() => {
      flushValueActions()
    })
  }

  /**
   * 重新计算联动状态
   */
  function compute(): void {
    const states = computeFieldStates(
      fields.value,
      linkageRules.value,
      formData.value,
      cache,
    )

    // 提取 VALUE 动作并加入批量队列
    const valueActions = extractValueActions(states)
    valueActions.forEach((actions, fieldId) => {
      // 取最后一个 VALUE 动作作为最终值
      if (actions.length > 0) {
        pendingValueActions.set(fieldId, actions[actions.length - 1])
      }
    })

    // 从状态中移除 VALUE 动作标记，避免污染状态
    states.forEach((state) => {
      const s = state as FieldRuntimeState & { _valueActions?: any[] }
      delete s._valueActions
    })

    runtimeStates.value = states

    // 如果有 VALUE 动作，调度批量应用
    if (pendingValueActions.size > 0) {
      scheduleFlush()
    }
  }

  // 监听表单数据变化（deep, immediate）
  watch(
    formData,
    () => {
      // 如果正在批量应用 VALUE 动作，跳过计算以避免循环
      if (isApplyingValues.value) {
        return
      }
      compute()
    },
    { deep: true, immediate: true },
  )

  // 监听 fields 和 linkageRules 变化也触发计算
  watch(
    [fields, linkageRules],
    () => {
      compute()
    },
    { deep: true },
  )

  return {
    runtimeStates,
    compute,
    isApplyingValues,
  }
}
