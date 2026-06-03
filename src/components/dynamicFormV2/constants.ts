// ============================================================
// 动态表单 V2 —— 常量定义
// 包含字段类型映射、联动标签、表单状态、正则预设、默认配置等
// ============================================================

import type { FormFieldType, LinkageCondition, LinkageAction } from './types'

// ------------------------------------------------------------
// 1. 字段类型颜色映射
// ------------------------------------------------------------
export const FIELD_TYPE_COLORS: Record<FormFieldType, string> = {
    INPUT: '#3b82f6',
    NUMBER: '#06b6d4',
    SELECT: '#10b981',
    MULTISELECT: '#10b981',
    RADIO: '#8b5cf6',
    CHECKBOX: '#8b5cf6',
    DATE: '#f59e0b',
    DATETIME: '#f59e0b',
    TIME: '#f59e0b',
    DATERANGE: '#f59e0b',
    SWITCH: '#ec4899',
    TEXTAREA: '#3b82f6',
    UPLOAD: '#ef4444',
    RATE: '#f97316',
    SLIDER: '#06b6d4',
    COLOR: '#ec4899',
    CASCADER: '#10b981',
    MULTICASCADER: '#10b981',
    TABLE: '#6366f1',
} as const

// ------------------------------------------------------------
// 2. 字段类型图标映射（Element Plus 图标名）
// ------------------------------------------------------------
export const FIELD_TYPE_ICONS: Record<FormFieldType, string> = {
    INPUT: 'Edit',
    NUMBER: 'Sort',
    SELECT: 'ArrowDown',
    MULTISELECT: 'List',
    RADIO: 'CircleCheck',
    CHECKBOX: 'Check',
    DATE: 'Calendar',
    DATETIME: 'Clock',
    TIME: 'Timer',
    DATERANGE: 'Calendar',
    SWITCH: 'SwitchButton',
    TEXTAREA: 'Document',
    UPLOAD: 'Upload',
    RATE: 'Star',
    SLIDER: 'Sort',
    COLOR: 'Brush',
    CASCADER: 'Connection',
    MULTICASCADER: 'Connection',
    TABLE: 'Grid',
} as const

// ------------------------------------------------------------
// 3. 联动条件标签
// ------------------------------------------------------------
export const LINKAGE_CONDITION_LABELS: Record<LinkageCondition, string> = {
    EQ: '等于',
    NE: '不等于',
    GT: '大于',
    LT: '小于',
    GE: '大于等于',
    LE: '小于等于',
    IN: '包含',
    NOT_IN: '不包含',
    EMPTY: '为空',
    NOT_EMPTY: '不为空',
    REGEX: '正则匹配',
} as const

// ------------------------------------------------------------
// 4. 联动动作标签
// ------------------------------------------------------------
export const LINKAGE_ACTION_LABELS: Record<LinkageAction, string> = {
    SHOW: '显示',
    HIDE: '隐藏',
    REQUIRED: '设为必填',
    DISABLED: '禁用',
    ENABLED: '启用',
    SET_PATTERN: '修改正则',
    SET_SPAN: '修改宽度',
    OPTION: '修改选项',
    VALUE: '设置值',
} as const

// ------------------------------------------------------------
// 5. 表单状态常量
// ------------------------------------------------------------
export const FORM_STATUS = {
    DRAFT: '0',
    PUBLISHED: '1',
    STOPPED: '-1',
} as const

export type FormStatusValue = (typeof FORM_STATUS)[keyof typeof FORM_STATUS]

export const FORM_STATUS_LABELS: Record<FormStatusValue, string> = {
    [FORM_STATUS.DRAFT]: '草稿',
    [FORM_STATUS.PUBLISHED]: '已发布',
    [FORM_STATUS.STOPPED]: '已停用',
} as const

/** Element Plus Tag 类型 */
export const FORM_STATUS_TAG_TYPES: Record<FormStatusValue, 'info' | 'success' | 'danger'> = {
    [FORM_STATUS.DRAFT]: 'info',
    [FORM_STATUS.PUBLISHED]: 'success',
    [FORM_STATUS.STOPPED]: 'danger',
} as const

// ------------------------------------------------------------
// 6. 正则预设
// ------------------------------------------------------------
export interface PatternPreset {
    label: string
    pattern: string
    patternTips: string
}

export const PATTERN_PRESETS: PatternPreset[] = [
    {
        label: '手机号',
        pattern: '^1[3-9]\\d{9}$',
        patternTips: '请输入正确的手机号码',
    },
    {
        label: '邮箱',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        patternTips: '请输入正确的邮箱地址',
    },
    {
        label: '身份证号',
        pattern: '^(\\d{15}|\\d{17}[\\dXx])$',
        patternTips: '请输入正确的身份证号码',
    },
    {
        label: 'URL',
        pattern: '^(https?|ftp)://[^\\s/$.?#].[^\\s]*$',
        patternTips: '请输入正确的网址',
    },
    {
        label: '数字',
        pattern: '^-?\\d+(\\.\\d+)?$',
        patternTips: '请输入数字',
    },
    {
        label: '中文',
        pattern: '^[\\u4e00-\\u9fa5]+$',
        patternTips: '请输入中文',
    },
    {
        label: '英文',
        pattern: '^[a-zA-Z]+$',
        patternTips: '请输入英文字母',
    },
    {
        label: '邮政编码',
        pattern: '^\\d{6}$',
        patternTips: '请输入正确的邮政编码',
    },
] as const

// ------------------------------------------------------------
// 7. 默认字段配置
// ------------------------------------------------------------
export interface FieldDefaultConfig {
    span: number
    placeholder: string
}


export const DEFAULT_FIELD_CONFIG: Record<FormFieldType, FieldDefaultConfig> = {
    INPUT: { span: 24, placeholder: '请输入' },
    NUMBER: { span: 24, placeholder: '请输入数字' },
    SELECT: { span: 24, placeholder: '请选择' },
    MULTISELECT: { span: 24, placeholder: '请选择（可多选）' },
    RADIO: { span: 24, placeholder: '' },
    CHECKBOX: { span: 24, placeholder: '' },
    DATE: { span: 24, placeholder: '请选择日期' },
    DATETIME: { span: 24, placeholder: '请选择日期时间' },
    TIME: { span: 24, placeholder: '请选择时间' },
    DATERANGE: { span: 24, placeholder: '请选择日期范围' },
    SWITCH: { span: 24, placeholder: '' },
    TEXTAREA: { span: 24, placeholder: '请输入' },
    UPLOAD: { span: 24, placeholder: '请上传文件' },
    RATE: { span: 24, placeholder: '' },
    SLIDER: { span: 24, placeholder: '' },
    COLOR: { span: 24, placeholder: '请选择颜色' },
    CASCADER: { span: 24, placeholder: '请选择' },
    MULTICASCADER: { span: 24, placeholder: '请选择（可多选）' },
    TABLE: { span: 24, placeholder: '' },
} as const
