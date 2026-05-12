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

// 表单项选项
export interface FormFieldOption {
    label: string
    value: string | number
    children?: FormFieldOption[]
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
}

// 字段类型可选项（UI 用）
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
