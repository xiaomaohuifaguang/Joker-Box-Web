import { http } from '@/utils'
import type { FormField, FormFieldOption, FormOptionMapping } from './types'

export interface RemoteOptionLoadResult {
    options: FormFieldOption[]
}

export const isSameOriginRelativeUrl = (url?: string): boolean => {
    if (!url) return false
    const value = url.trim()
    return value.startsWith('/') && !value.startsWith('//') && !/^https?:\/\//i.test(value)
}

const getByPath = (source: any, path: string): any => {
    if (path === '$') return source
    return path.split('.').filter(Boolean).reduce((current, key) => current?.[key], source)
}

const mapNode = (node: any, mapping: FormOptionMapping): FormFieldOption => {
    const label = getByPath(node, mapping.labelPath)
    const value = getByPath(node, mapping.valuePath)
    if (label === undefined || label === null || String(label).trim() === '') {
        throw new Error('远程选项 label 不能为空')
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
        throw new Error('远程选项 value 只能是字符串或数字')
    }
    const option: FormFieldOption = {
        label: String(label),
        value,
        visible: true,
    }
    if (mapping.childrenPath) {
        const children = getByPath(node, mapping.childrenPath)
        if (Array.isArray(children) && children.length > 0) {
            option.children = children.map(child => mapNode(child, mapping))
        }
    }
    return option
}

export const mapRemoteOptions = (response: any, mapping: FormOptionMapping): FormFieldOption[] => {
    const list = getByPath(response, mapping.listPath)
    if (!Array.isArray(list)) {
        throw new Error('远程选项 listPath 必须指向数组')
    }
    return list.map(item => mapNode(item, mapping))
}

const isFieldValueRef = (value: any): value is { $field: string } => (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof value.$field === 'string' &&
    value.$field.trim() !== ''
)

export const collectRemoteOptionParamRefs = (params: any): string[] => {
    const refs = new Set<string>()
    const walk = (value: any) => {
        if (!value || typeof value !== 'object') return
        if (isFieldValueRef(value)) {
            refs.add(value.$field)
            return
        }
        if (Array.isArray(value)) {
            value.forEach(walk)
            return
        }
        Object.values(value).forEach(walk)
    }
    walk(params)
    return Array.from(refs)
}

export const resolveRemoteOptionParams = (params: any, formData: Record<string, any>): any => {
    if (isFieldValueRef(params)) return formData?.[params.$field]
    if (Array.isArray(params)) return params.map(item => resolveRemoteOptionParams(item, formData))
    if (params && typeof params === 'object') {
        return Object.fromEntries(
            Object.entries(params).map(([key, value]) => [key, resolveRemoteOptionParams(value, formData)]),
        )
    }
    return params
}

export const loadRemoteOptions = async (field: FormField, formData: Record<string, any> = {}): Promise<RemoteOptionLoadResult> => {
    const source = field.optionSource
    if (source?.type !== 'API') {
        return { options: field.options || [] }
    }
    if (!isSameOriginRelativeUrl(source.url)) {
        throw new Error('远程选项 URL 只能是同源相对路径')
    }
    if (!source.mapping) {
        throw new Error('远程选项映射不能为空')
    }
    const method = source.method || 'GET'
    const params = resolveRemoteOptionParams(source.params || {}, formData)
    const data = method === 'GET'
        ? await http.get(source.url!, { params, silent: true })
        : await http.post(source.url!, params, { silent: true })
    return { options: mapRemoteOptions(data, source.mapping) }
}
