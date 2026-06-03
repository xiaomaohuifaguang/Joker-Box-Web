// ============================================================
// 动态表单 V2 —— 远程选项加载工具
// 职责：收集参数引用、解析参数、映射响应数据、加载远程选项
// ============================================================

import type { FormField, FormFieldOption, FormOptionMapping } from '../types'

// ============================================================
// 收集参数中的字段引用
// ============================================================

/**
 * 递归查找 params 中所有 {"$field": "fieldId"} 引用
 * @param params - 参数对象
 * @returns 引用的字段ID列表
 */
export function collectRemoteOptionParamRefs(params?: Record<string, any>): string[] {
  const refs: string[] = []

  function traverse(obj: any): void {
    if (obj === null || obj === undefined) return

    if (typeof obj === 'object' && !Array.isArray(obj)) {
      // 检查是否为 {$field: 'fieldId'} 引用
      if (Object.keys(obj).length === 1 && '$field' in obj && typeof obj.$field === 'string') {
        refs.push(obj.$field)
        return
      }
      // 递归遍历对象属性
      Object.values(obj).forEach(traverse)
    } else if (Array.isArray(obj)) {
      obj.forEach(traverse)
    }
  }

  if (params) traverse(params)
  return refs
}

// ============================================================
// 解析参数中的字段引用
// ============================================================

/**
 * 将 params 中的 $field 引用替换为 formData 中的实际值
 * @param params - 原始参数对象
 * @param formData - 表单数据
 * @returns 解析后的参数对象
 */
export function resolveRemoteOptionParams(
  params?: Record<string, any>,
  formData?: Record<string, any>,
): Record<string, any> | undefined {
  if (!params) return undefined
  if (!formData) return params

  function resolve(obj: any): any {
    if (obj === null || obj === undefined) return obj

    if (typeof obj === 'object' && !Array.isArray(obj)) {
      // 检查是否为 {$field: 'fieldId'} 引用
      if (Object.keys(obj).length === 1 && '$field' in obj && typeof obj.$field === 'string') {
        return formData[obj.$field]
      }
      // 递归解析对象属性
      const resolved: Record<string, any> = {}
      Object.entries(obj).forEach(([key, value]) => {
        resolved[key] = resolve(value)
      })
      return resolved
    } else if (Array.isArray(obj)) {
      return obj.map(resolve)
    }

    return obj
  }

  return resolve(params)
}

// ============================================================
// 映射远程选项数据
// ============================================================

function getPathValue(obj: any, path: string): any {
  if (!obj || !path) return undefined
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current === null || current === undefined) return undefined
    current = current[key]
  }
  return current
}

function mapSingleOption(item: any, mapping: FormOptionMapping): FormFieldOption | null {
  if (item === null || item === undefined) return null

  const label = getPathValue(item, mapping.labelPath)
  const value = getPathValue(item, mapping.valuePath)

  if (label === undefined || value === undefined) return null

  const option: FormFieldOption = {
    label: String(label),
    value: typeof value === 'number' ? value : String(value),
  }

  // 处理 children
  if (mapping.childrenPath) {
    const children = getPathValue(item, mapping.childrenPath)
    if (Array.isArray(children) && children.length > 0) {
      const mappedChildren = children
        .map((child: any) => mapSingleOption(child, mapping))
        .filter((opt): opt is FormFieldOption => opt !== null)
      if (mappedChildren.length > 0) {
        option.children = mappedChildren
      }
    }
  }

  return option
}

/**
 * 根据 listPath/labelPath/valuePath/childrenPath 映射响应数据
 * @param data - 原始响应数据
 * @param mapping - 选项映射配置
 * @returns 映射后的选项列表
 */
export function mapRemoteOptions(data: any, mapping: FormOptionMapping): FormFieldOption[] {
  if (data === null || data === undefined) return []

  let list: any[]
  if (mapping.listPath) {
    const rawList = getPathValue(data, mapping.listPath)
    list = Array.isArray(rawList) ? rawList : []
  } else {
    list = Array.isArray(data) ? data : []
  }

  return list
    .map((item) => mapSingleOption(item, mapping))
    .filter((opt): opt is FormFieldOption => opt !== null)
}

// ============================================================
// URL 校验
// ============================================================

/**
 * 校验是否为同源相对路径（以 / 开头，不以 // 开头）
 * @param url - URL字符串
 * @returns 是否为同源相对路径
 */
export function isSameOriginRelativeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  return url.startsWith('/') && !url.startsWith('//')
}

// ============================================================
// 远程选项加载
// ============================================================

/**
 * 异步加载远程选项
 * @param field - 字段定义
 * @param formData - 表单数据（用于解析参数引用）
 * @returns 选项列表
 */
export async function loadRemoteOptions(
  field: FormField,
  formData?: Record<string, any>,
): Promise<FormFieldOption[]> {
  const optionSource = field.optionSource
  if (!optionSource || optionSource.type !== 'API') {
    return field.options ?? []
  }

  const url = optionSource.url
  if (!url) {
    return field.options ?? []
  }

  const method = optionSource.method ?? 'GET'
  const params = resolveRemoteOptionParams(optionSource.params, formData)

  try {
    const { http } = await import('@/utils')
    const response = await http.request({
      url,
      method,
      ...(method === 'GET' ? { params } : { data: params }),
    })

    const data = response?.data ?? response

    if (optionSource.mapping) {
      return mapRemoteOptions(data, optionSource.mapping)
    }

    // 默认映射：假设返回的是 { label, value } 数组
    if (Array.isArray(data)) {
      return data
        .map((item: any) => {
          if (item === null || item === undefined) return null
          const label = item.label ?? item.name ?? item.title ?? String(item)
          const value = item.value ?? item.id ?? item.key ?? String(item)
          if (label === undefined || value === undefined) return null
          return {
            label: String(label),
            value: typeof value === 'number' ? value : String(value),
            children: item.children,
          } as FormFieldOption
        })
        .filter((opt): opt is FormFieldOption => opt !== null)
    }

    return field.options ?? []
  } catch (error) {
    console.error(`[loadRemoteOptions] 加载字段 "${field.fieldId}" 的远程选项失败:`, error)
    return field.options ?? []
  }
}

// ============================================================
// 开发环境测试
// ============================================================

if (import.meta.env.DEV) {
  console.assert(
    collectRemoteOptionParamRefs({ filter: { $field: 'category' } }).includes('category'),
  )
  console.assert(
    resolveRemoteOptionParams({ filter: { $field: 'cat' } }, { cat: 'electronics' })?.filter ===
      'electronics',
  )
  console.assert(isSameOriginRelativeUrl('/api/options') === true)
  console.assert(isSameOriginRelativeUrl('http://ex.com') === false)

  // 测试 mapRemoteOptions
  const mapped = mapRemoteOptions(
    {
      data: {
        list: [
          { name: 'Option A', code: 'a' },
          { name: 'Option B', code: 'b' },
        ],
      },
    },
    { listPath: 'data.list', labelPath: 'name', valuePath: 'code' },
  )
  console.assert(mapped.length === 2)
  console.assert(mapped[0].label === 'Option A')
  console.assert(mapped[0].value === 'a')

  console.log('remoteOptions.ts tests passed')
}
