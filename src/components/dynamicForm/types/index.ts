import { ref } from "vue"

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

// 表单项选项类型
export interface FormFieldOption {
    label: string
    value: string | number
    children?: FormFieldOption[]
}

// 表单项配置
export interface FormField {
    fieldId: string // id
    title: string // 标题
    type: FormFieldType // 类型
    required?: boolean // 是否必填
    defaultValue?: any // 默认值
    placeholder?: string // 占位符
    options?: FormFieldOption[] // 选项
    minLength?: number // 最小长度
    maxLength?: number // 最大长度
    min?: number // 最小值/文本域行数
    max?: number // 最大值
    pattern?: RegExp | string // 正则表达式
    patternTips?: string // 正则提示
    span?: number // 宽度
}

// export const newFormField = ref({
//     fieldId: '',
//     title: '',
//     type: 'input' as FormFieldType,
//     required: false,
//     defaultValue: '',
//     placeholder: '',
//     options: [],
//     pattern: '',
//     span: 24
// } as FormField)