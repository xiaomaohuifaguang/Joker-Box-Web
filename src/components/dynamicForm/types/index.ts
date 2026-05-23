// 表单字段类型枚举
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

// 表单项选项
export interface FormFieldOption {
    label: string
    value: string | number
    children?: FormFieldOption[]
    visible?: boolean
}

export interface FormTableColumn {
    key: string
    title: string
}

// 表单项配置（DynamicFormField）
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
}

// 字段分组（DynamicFormFieldGroup）
export interface FormFieldGroup {
    id: string
    name: string
    description?: string
    sort?: number
    collapsed?: '0' | '1'
    fields: FormField[]
}

// 联动触发条件
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

// 联动动作
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

// 联动节点类型
export type LinkageNodeType = 'AND' | 'OR' | 'CONDITION'

// 联动条件节点（树形结构）
export interface FormLinkageNode {
    id?: string
    nodeType: LinkageNodeType
    triggerFieldId?: string
    triggerCondition?: LinkageCondition
    triggerValue?: any
    sortOrder?: number
    children?: FormLinkageNode[]
}

// 联动规则（DynamicFormLinkageRule）
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

// 兼容旧名称
export type FormLinkage = FormLinkageRule

/** 将 groups 扁平化为 formFields（保留 groupId） */
export const flattenGroups = (groups: FormFieldGroup[]): FormField[] => {
    const list: FormField[] = []
    groups.forEach(g => {
        g.fields.forEach(f => {
            list.push({ ...f, groupId: f.groupId ?? g.id })
        })
    })
    return list
}

/** 将 formFields 按 groupId 组装为 groups；无 groupId 时返回 undefined */
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

// 字段运行时状态（联动求值结果）
export interface FieldRuntimeState {
    visible: boolean
    required: boolean
    disabled: boolean
    pattern?: string
    patternTips?: string
    span?: number
    options?: FormFieldOption[] // OPTION 动作覆盖的选项
    value?: any // VALUE 动作建议的值
}

// 字段类型可选项（UI 用）
/** 有效的字段类型集合 */
export const VALID_FIELD_TYPES: FormFieldType[] = [
    'INPUT', 'NUMBER', 'SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX',
    'DATE', 'DATETIME', 'TIME', 'DATERANGE', 'SWITCH', 'TEXTAREA',
    'UPLOAD', 'RATE', 'SLIDER', 'COLOR', 'CASCADER', 'MULTICASCADER', 'TABLE',
]

/** 需要 options 的字段类型 */
export const OPTION_REQUIRED_TYPES: FormFieldType[] = [
    'SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'CASCADER', 'MULTICASCADER',
]

/** 有效的联动动作集合 */
export const VALID_LINKAGE_ACTIONS: LinkageAction[] = [
    'SHOW', 'HIDE', 'REQUIRED', 'DISABLED', 'ENABLED', 'SET_PATTERN', 'SET_SPAN', 'OPTION', 'VALUE',
]

/** 有效的联动条件运算符集合 */
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
    { label: '等于 (EQ)', value: 'EQ' },
    { label: '不等于 (NE)', value: 'NE' },
    { label: '大于 (GT)', value: 'GT' },
    { label: '小于 (LT)', value: 'LT' },
    { label: '大于等于 (GE)', value: 'GE' },
    { label: '小于等于 (LE)', value: 'LE' },
    { label: '包含 (IN)', value: 'IN' },
    { label: '不包含 (NOT_IN)', value: 'NOT_IN' },
    { label: '为空 (EMPTY)', value: 'EMPTY' },
    { label: '不为空 (NOT_EMPTY)', value: 'NOT_EMPTY' },
    { label: '正则 (REGEX)', value: 'REGEX' },
]

/** 根据字段类型返回联动条件的默认选项 */
export const getDefaultCondition = (fieldType: FormFieldType): LinkageCondition => {
    if (fieldType === 'UPLOAD') return 'EMPTY'
    if (fieldType === 'TABLE') return 'EMPTY'
    return 'EQ'
}

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

/** 根据字段类型返回可用的联动动作类型 */
export const getValidActionsByFieldType = (fieldType: FormFieldType): LinkageAction[] => {
    const common: LinkageAction[] = ['SHOW', 'HIDE', 'REQUIRED', 'DISABLED', 'ENABLED', 'SET_SPAN']
    const withValue: LinkageAction[] = [...common, 'VALUE']
    if (fieldType === 'UPLOAD') {
        return common
    }
    if (fieldType === 'TABLE') {
        return common
    }
    if (fieldType === 'INPUT' || fieldType === 'TEXTAREA') {
        return [...withValue, 'SET_PATTERN']
    }
    if (['SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'CASCADER', 'MULTICASCADER'].includes(fieldType)) {
        return [...withValue, 'OPTION']
    }
    return withValue
}

/** 根据动作类型返回默认的动作参数 */
export const getActionParamDefault = (actionType: LinkageAction): any => {
    switch (actionType) {
        case 'REQUIRED':
        case 'DISABLED':
            return true
        case 'SET_PATTERN':
            return { pattern: '', patternTips: '' }
        case 'SET_SPAN':
            return { span: 24 }
        case 'OPTION':
            return []
        case 'VALUE':
            return undefined
        default:
            return undefined
    }
}

/** 解析 SWITCH 类型值，兼容 boolean / string / number */
export const parseSwitchValue = (v: any): boolean => {
    if (v === true || v === 'true' || v === '1' || v === 1) return true
    if (v === false || v === 'false' || v === '0' || v === 0) return false
    return !!v
}
