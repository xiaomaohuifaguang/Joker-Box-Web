// ============================================================
// 动态表单 V2 —— 核心类型定义
// ============================================================

/** 字段类型（19 种） */
export type FormFieldType =
    | 'INPUT'
    | 'NUMBER'
    | 'SELECT'
    | 'MULTISELECT'
    | 'RADIO'
    | 'CHECKBOX'
    | 'DATE'
    | 'DATETIME'
    | 'TIME'
    | 'DATERANGE'
    | 'SWITCH'
    | 'TEXTAREA'
    | 'UPLOAD'
    | 'RATE'
    | 'SLIDER'
    | 'COLOR'
    | 'CASCADER'
    | 'MULTICASCADER'
    | 'TABLE'

/** 选项结构 */
export interface FormFieldOption {
    label: string
    value: string | number
    children?: FormFieldOption[]
    visible?: boolean
}

/** 表格列定义 */
export interface FormTableColumn {
    key: string
    title: string
}

/** 远程选项映射 */
export interface FormOptionMapping {
    listPath: string
    labelPath: string
    valuePath: string
    childrenPath?: string
}

/** 远程选项数据源 */
export interface FormOptionSource {
    type?: 'STATIC' | 'API'
    url?: string
    method?: 'GET' | 'POST'
    params?: Record<string, any>
    mapping?: FormOptionMapping
}

/** 字段定义 */
export interface FormField {
    fieldId: string
    title: string
    type: FormFieldType
    required?: '1' | '0'
    defaultValue?: any
    placeholder?: string
    options?: FormFieldOption[]
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
    patternTips?: string
    span?: number
    sort?: number
    groupId?: string
    props?: Record<string, any>
    columns?: FormTableColumn[]
    optionSource?: FormOptionSource
}

/** 字段分组 */
export interface FormFieldGroup {
    id: string
    name: string
    description?: string
    sort?: number
    collapsed?: '0' | '1'
    fields: FormField[]
}

/** 联动条件运算符 */
export type LinkageCondition =
    | 'EQ'
    | 'NE'
    | 'GT'
    | 'LT'
    | 'GE'
    | 'LE'
    | 'IN'
    | 'NOT_IN'
    | 'EMPTY'
    | 'NOT_EMPTY'
    | 'REGEX'

/** 联动动作类型 */
export type LinkageAction =
    | 'SHOW'
    | 'HIDE'
    | 'REQUIRED'
    | 'DISABLED'
    | 'ENABLED'
    | 'SET_PATTERN'
    | 'SET_SPAN'
    | 'OPTION'
    | 'VALUE'

/** 联动节点类型 */
export type LinkageNodeType = 'AND' | 'OR' | 'CONDITION'

/** 联动条件节点（树形结构）
 * 注意：单一接口，非 discriminated union
 * - AND/OR 节点：children 有值，trigger* 为 undefined
 * - CONDITION 节点：trigger* 有值，children 为 undefined
 */
export interface FormLinkageNode {
    id?: string
    nodeType: LinkageNodeType
    triggerFieldId?: string
    triggerCondition?: LinkageCondition
    triggerValue?: any
    sortOrder?: number
    children?: FormLinkageNode[]
}

/** 联动规则 */
export interface FormLinkageRule {
    id?: string
    name?: string
    targetFieldId: string
    actionType: LinkageAction
    actionValue?: any
    enable?: boolean
    sortOrder?: number
    conditionTree: FormLinkageNode[]
}

/** 字段运行时状态 */
export interface FieldRuntimeState {
    visible: boolean
    required: boolean
    disabled: boolean
    pattern?: string
    patternTips?: string
    span?: number
    options?: FormFieldOption[]
    value?: any
}

// ============================================================
// 常量与辅助函数
// ============================================================

export const VALID_FIELD_TYPES: FormFieldType[] = [
    'INPUT', 'NUMBER', 'SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX',
    'DATE', 'DATETIME', 'TIME', 'DATERANGE', 'SWITCH', 'TEXTAREA',
    'UPLOAD', 'RATE', 'SLIDER', 'COLOR', 'CASCADER', 'MULTICASCADER', 'TABLE',
]

export const OPTION_REQUIRED_TYPES: FormFieldType[] = [
    'SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'CASCADER', 'MULTICASCADER',
]

export const OPTION_SOURCE_FIELD_TYPES: FormFieldType[] = [
    'SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'CASCADER', 'MULTICASCADER',
]

export const VALID_LINKAGE_ACTIONS: LinkageAction[] = [
    'SHOW', 'HIDE', 'REQUIRED', 'DISABLED', 'ENABLED', 'SET_PATTERN', 'SET_SPAN', 'OPTION', 'VALUE',
]

export const VALID_LINKAGE_CONDITIONS: LinkageCondition[] = [
    'EQ', 'NE', 'GT', 'LT', 'GE', 'LE', 'IN', 'NOT_IN', 'EMPTY', 'NOT_EMPTY', 'REGEX',
]

export const FIELD_TYPE_OPTIONS: { label: string; value: FormFieldType }[] = [
    { label: '文本输入', value: 'INPUT' },
    { label: '数字输入', value: 'NUMBER' },
    { label: '下拉单选', value: 'SELECT' },
    { label: '下拉多选', value: 'MULTISELECT' },
    { label: '单选框', value: 'RADIO' },
    { label: '复选框', value: 'CHECKBOX' },
    { label: '日期', value: 'DATE' },
    { label: '日期时间', value: 'DATETIME' },
    { label: '时间', value: 'TIME' },
    { label: '日期区间', value: 'DATERANGE' },
    { label: '开关', value: 'SWITCH' },
    { label: '文本域', value: 'TEXTAREA' },
    { label: '文件上传', value: 'UPLOAD' },
    { label: '评分', value: 'RATE' },
    { label: '滑块', value: 'SLIDER' },
    { label: '颜色', value: 'COLOR' },
    { label: '级联单选', value: 'CASCADER' },
    { label: '级联多选', value: 'MULTICASCADER' },
    { label: '动态表格', value: 'TABLE' },
]

export const LINKAGE_CONDITION_OPTIONS: { label: string; value: LinkageCondition }[] = [
    { label: '等于', value: 'EQ' },
    { label: '不等于', value: 'NE' },
    { label: '大于', value: 'GT' },
    { label: '小于', value: 'LT' },
    { label: '大于等于', value: 'GE' },
    { label: '小于等于', value: 'LE' },
    { label: '包含', value: 'IN' },
    { label: '不包含', value: 'NOT_IN' },
    { label: '为空', value: 'EMPTY' },
    { label: '不为空', value: 'NOT_EMPTY' },
    { label: '正则匹配', value: 'REGEX' },
]

export const LINKAGE_ACTION_OPTIONS: { label: string; value: LinkageAction }[] = [
    { label: '显示', value: 'SHOW' },
    { label: '隐藏', value: 'HIDE' },
    { label: '设为必填', value: 'REQUIRED' },
    { label: '禁用', value: 'DISABLED' },
    { label: '启用', value: 'ENABLED' },
    { label: '修改正则', value: 'SET_PATTERN' },
    { label: '修改宽度', value: 'SET_SPAN' },
    { label: '修改选项', value: 'OPTION' },
    { label: '设置值', value: 'VALUE' },
]

/** 将分组展平为字段数组 */
export const flattenGroups = (groups: FormFieldGroup[]): FormField[] => {
    const list: FormField[] = []
    groups.forEach(g => {
        g.fields.forEach(f => {
            list.push({ ...f, groupId: f.groupId ?? g.id })
        })
    })
    return list
}

/** 从平铺字段按 groupId 构建分组 */
export const buildGroups = (fields: FormField[]): FormFieldGroup[] | undefined => {
    const map = new Map<string, { name: string; fields: FormField[]; sort: number }>()
    const noGroup: FormField[] = []
    fields.forEach(f => {
        if (f.groupId) {
            if (!map.has(f.groupId)) {
                map.set(f.groupId, { name: f.groupId, fields: [], sort: 0 })
            }
            map.get(f.groupId)!.fields.push(f)
        } else {
            noGroup.push(f)
        }
    })
    if (map.size === 0) return undefined
    const groups: FormFieldGroup[] = []
    map.forEach((item, id) => {
        groups.push({ id, name: item.name, fields: item.fields, sort: item.sort })
    })
    if (noGroup.length > 0) {
        groups.push({ id: '_default', name: '默认分组', fields: noGroup, sort: 9999 })
    }
    return groups.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
}

export const isApiOptionSource = (field: FormField): boolean => field.optionSource?.type === 'API'

export const supportsOptionSource = (fieldType: FormFieldType): boolean =>
    OPTION_SOURCE_FIELD_TYPES.includes(fieldType)

export const getDefaultCondition = (fieldType: FormFieldType): LinkageCondition => {
    if (fieldType === 'UPLOAD' || fieldType === 'TABLE') return 'EMPTY'
    return 'EQ'
}

export const getValidConditionsByFieldType = (fieldType: FormFieldType): LinkageCondition[] => {
    const numericOrDate: FormFieldType[] = ['NUMBER', 'SLIDER', 'RATE', 'DATE', 'DATETIME', 'TIME', 'DATERANGE']
    if (numericOrDate.includes(fieldType)) {
        return ['EQ', 'NE', 'GT', 'LT', 'GE', 'LE', 'EMPTY', 'NOT_EMPTY', 'IN', 'NOT_IN']
    }
    const textLike: FormFieldType[] = ['INPUT', 'TEXTAREA', 'COLOR']
    if (textLike.includes(fieldType)) {
        return ['EQ', 'NE', 'EMPTY', 'NOT_EMPTY', 'REGEX', 'IN', 'NOT_IN']
    }
    const optionLike: FormFieldType[] = ['SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'CASCADER', 'MULTICASCADER']
    if (optionLike.includes(fieldType)) {
        return ['EQ', 'NE', 'EMPTY', 'NOT_EMPTY', 'IN', 'NOT_IN']
    }
    if (fieldType === 'SWITCH') {
        return ['EQ', 'NE', 'EMPTY', 'NOT_EMPTY']
    }
    return ['EMPTY', 'NOT_EMPTY']
}

export const getValidActionsByFieldType = (fieldType: FormFieldType): LinkageAction[] => {
    const common: LinkageAction[] = ['SHOW', 'HIDE', 'REQUIRED', 'DISABLED', 'ENABLED', 'SET_SPAN']
    const withValue: LinkageAction[] = [...common, 'VALUE']
    if (fieldType === 'UPLOAD' || fieldType === 'TABLE') return common
    if (fieldType === 'INPUT' || fieldType === 'TEXTAREA') return [...withValue, 'SET_PATTERN']
    if (['SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'CASCADER', 'MULTICASCADER'].includes(fieldType)) {
        return [...withValue, 'OPTION']
    }
    return withValue
}

export const getActionParamDefault = (actionType: LinkageAction): any => {
    switch (actionType) {
        case 'REQUIRED':
        case 'DISABLED': return true
        case 'SET_PATTERN': return { pattern: '', patternTips: '' }
        case 'SET_SPAN': return { span: 24 }
        case 'OPTION': return []
        default: return undefined
    }
}

export const parseSwitchValue = (v: any): boolean => {
    if (v === true || v === 'true' || v === '1' || v === 1) return true
    if (v === false || v === 'false' || v === '0' || v === 0) return false
    return !!v
}
