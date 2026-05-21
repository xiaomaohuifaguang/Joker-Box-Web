import type {
    FieldRuntimeState,
    FormField,
    FormFieldGroup,
    FormLinkageNode,
    FormLinkageRule,
    LinkageCondition,
} from './types'
import {
    getValidActionsByFieldType,
    OPTION_REQUIRED_TYPES,
    VALID_FIELD_TYPES,
    VALID_LINKAGE_ACTIONS,
    VALID_LINKAGE_CONDITIONS,
} from './types'

const toNumber = (v: any): number => {
    if (v === null || v === undefined || v === '') return NaN
    const n = Number(v)
    return Number.isFinite(n) ? n : NaN
}

/** 判断值是否为空：null/undefined、空字符串、空数组均视为空；0/false 不为空 */
const isEmpty = (v: any): boolean => {
    if (v === null || v === undefined) return true
    if (typeof v === 'string') return v.trim() === ''
    if (Array.isArray(v)) return v.length === 0
    return false
}

const evalCondition = (
    fieldValue: any,
    condition: LinkageCondition,
    triggerValue: any,
): boolean => {
    switch (condition) {
        case 'EQ': {
            if (Array.isArray(fieldValue) && Array.isArray(triggerValue)) {
                return JSON.stringify(fieldValue) === JSON.stringify(triggerValue)
            }
            if (Array.isArray(fieldValue)) {
                const fieldStr = fieldValue.map(String).join(',')
                if (fieldStr === String(triggerValue ?? '')) return true
                return fieldValue.length === 1 && String(fieldValue[0]) === String(triggerValue ?? '')
            }
            if (Array.isArray(triggerValue)) {
                const triggerStr = triggerValue.map(String).join(',')
                if (triggerStr === String(fieldValue ?? '')) return true
                return triggerValue.length === 1 && String(triggerValue[0]) === String(fieldValue ?? '')
            }
            return String(fieldValue ?? '') === String(triggerValue ?? '')
        }
        case 'NE': {
            if (Array.isArray(fieldValue) && Array.isArray(triggerValue)) {
                return JSON.stringify(fieldValue) !== JSON.stringify(triggerValue)
            }
            if (Array.isArray(fieldValue)) {
                const fieldStr = fieldValue.map(String).join(',')
                if (fieldStr === String(triggerValue ?? '')) return false
                return fieldValue.length !== 1 || String(fieldValue[0]) !== String(triggerValue ?? '')
            }
            if (Array.isArray(triggerValue)) {
                const triggerStr = triggerValue.map(String).join(',')
                if (triggerStr === String(fieldValue ?? '')) return false
                return triggerValue.length !== 1 || String(triggerValue[0]) !== String(fieldValue ?? '')
            }
            return String(fieldValue ?? '') !== String(triggerValue ?? '')
        }
        case 'GT': {
            const a = toNumber(fieldValue), b = toNumber(triggerValue)
            return !isNaN(a) && !isNaN(b) && a > b
        }
        case 'LT': {
            const a = toNumber(fieldValue), b = toNumber(triggerValue)
            return !isNaN(a) && !isNaN(b) && a < b
        }
        case 'GE': {
            const a = toNumber(fieldValue), b = toNumber(triggerValue)
            return !isNaN(a) && !isNaN(b) && a >= b
        }
        case 'LE': {
            const a = toNumber(fieldValue), b = toNumber(triggerValue)
            return !isNaN(a) && !isNaN(b) && a <= b
        }
        case 'IN': {
            let list: any[] = []
            if (Array.isArray(triggerValue)) list = triggerValue
            else if (typeof triggerValue === 'string') list = triggerValue.split(',').map(s => s.trim())
            else if (triggerValue !== null && triggerValue !== undefined) list = [triggerValue]
            if (Array.isArray(fieldValue)) {
                return fieldValue.some(v => list.map(String).includes(String(v)))
            }
            return list.map(String).includes(String(fieldValue ?? ''))
        }
        case 'NOT_IN': {
            let list: any[] = []
            if (Array.isArray(triggerValue)) list = triggerValue
            else if (typeof triggerValue === 'string') list = triggerValue.split(',').map(s => s.trim())
            else if (triggerValue !== null && triggerValue !== undefined) list = [triggerValue]
            if (Array.isArray(fieldValue)) {
                return !fieldValue.some(v => list.map(String).includes(String(v)))
            }
            return !list.map(String).includes(String(fieldValue ?? ''))
        }
        case 'EMPTY':
            return isEmpty(fieldValue)
        case 'NOT_EMPTY':
            return !isEmpty(fieldValue)
        case 'REGEX': {
            if (triggerValue === null || triggerValue === undefined) return false
            try {
                const regex = new RegExp(String(triggerValue))
                const strValue = String(fieldValue ?? '')
                const match = regex.exec(strValue)
                return match !== null && match[0].length === strValue.length
            } catch {
                return false
            }
        }
        default:
            return false
    }
}

// 递归求值条件树
const evalConditionTree = (
    node: FormLinkageNode | undefined,
    formData: Record<string, any>,
): boolean => {
    if (!node) return false
    if (node.nodeType === 'CONDITION') {
        if (!node.triggerFieldId || !node.triggerCondition) return false
        return evalCondition(
            formData[node.triggerFieldId],
            node.triggerCondition,
            node.triggerValue,
        )
    }
    if (node.nodeType === 'AND') {
        const children = node.children || []
        if (children.length === 0) return true
        return children.every(child => evalConditionTree(child, formData))
    }
    if (node.nodeType === 'OR') {
        const children = node.children || []
        if (children.length === 0) return false
        return children.some(child => evalConditionTree(child, formData))
    }
    return false
}

// 求每个字段的运行时状态：visible / required / disabled
export const computeFieldStates = (
    fields: FormField[],
    linkages: FormLinkageRule[] | undefined,
    formData: Record<string, any>,
): Record<string, FieldRuntimeState> => {
    const states: Record<string, FieldRuntimeState> = {}
    fields.forEach(f => {
        states[f.fieldId] = {
            visible: true,
            required: f.required === '1',
            disabled: false,
            options: f.options?.filter(opt => opt.visible !== false) || f.options,
        }
    })

    if (!linkages || linkages.length === 0) return states

    const sorted = [...linkages].sort((a, b) => {
        const ao = a.sortOrder ?? 0
        const bo = b.sortOrder ?? 0
        return ao - bo
    })

    sorted.forEach(rule => {
        if (rule.enable === false) return
        const targetState = states[rule.targetFieldId]
        if (!targetState) return
        const triggered = evalConditionTree(rule.conditionTree?.[0], formData)
        if (!triggered) return
        switch (rule.actionType) {
            case 'SHOW':
                targetState.visible = true
                break
            case 'HIDE':
                targetState.visible = false
                break
            case 'REQUIRED': {
                const val = rule.actionValue
                targetState.required = val === undefined || val === null ? true : !!val
                break
            }
            case 'DISABLED': {
                const val = rule.actionValue
                targetState.disabled = val === undefined || val === null ? true : !!val
                break
            }
            case 'ENABLED':
                targetState.disabled = false
                break
            case 'SET_PATTERN': {
                const av = rule.actionValue
                if (av && typeof av === 'object') {
                    targetState.pattern = av.pattern || undefined
                    targetState.patternTips = av.patternTips || undefined
                } else if (typeof av === 'string') {
                    targetState.pattern = av || undefined
                }
                break
            }
            case 'SET_SPAN': {
                let sp: number | undefined
                if (rule.actionValue && typeof rule.actionValue === 'object' && !Array.isArray(rule.actionValue)) {
                    sp = Number((rule.actionValue as Record<string, any>).span)
                } else {
                    sp = Number(rule.actionValue)
                }
                if (!isNaN(sp) && sp >= 1 && sp <= 24) {
                    targetState.span = sp
                }
                break
            }
            case 'OPTION': {
                const av = rule.actionValue
                if (Array.isArray(av)) {
                    const values = av.map(item => typeof item === 'string' ? item : item.value).filter(Boolean)
                    const originalOptions = fields.find(f => f.fieldId === rule.targetFieldId)?.options || []
                    // 递归过滤选项树：父节点不在列表中则整个分支丢弃
                    const filterTree = (opts: typeof originalOptions): typeof originalOptions => {
                        return opts
                            .filter(opt => values.includes(String(opt.value)))
                            .map(opt => {
                                const filtered = { ...opt }
                                if (opt.children && opt.children.length > 0) {
                                    filtered.children = filterTree(opt.children)
                                }
                                return filtered
                            })
                    }
                    targetState.options = filterTree(originalOptions)
                }
                break
            }
            case 'VALUE': {
                targetState.value = rule.actionValue
                break
            }
        }
    })

    return states
}

// 模板预校验：发布/保存前
export interface TemplateCheckResult {
    ok: boolean
    errors: string[]
}

/**
 * 完整表单校验（保存时用）
 * @param name 表单名称
 * @param fields 字段列表（平铺，含 groupId）
 * @param linkages 联动规则
 * @param groups 分组列表（可选）
 * @param description 表单描述（可选）
 */
export const validateTemplate = (
    name: string,
    fields: FormField[],
    linkages: FormLinkageRule[] | undefined,
    groups?: FormFieldGroup[],
    description?: string,
): TemplateCheckResult => {
    const errors: string[] = []

    // ===== Step 1: 基础信息校验 =====
    if (!name || !name.trim()) {
        errors.push('表单名称不能为空')
    } else if (name.trim().length > 64) {
        errors.push('表单名称长度不能超过64字符')
    }
    if (description != null && description.length > 500) {
        errors.push('表单描述长度不能超过500字符')
    }

    // ===== Step 2: 分组校验 =====
    if (groups && groups.length > 0) {
        const groupIds = new Set<string>()
        groups.forEach(g => {
            if (!g.id || !g.id.trim()) {
                errors.push('分组ID不能为空')
            } else if (groupIds.has(g.id)) {
                errors.push(`分组ID重复: ${g.id}`)
            } else {
                groupIds.add(g.id)
            }
            if (!g.name || !g.name.trim()) {
                errors.push(`分组 "${g.id || '(无ID)'}" 名称不能为空`)
            } else if (g.name.trim().length > 32) {
                errors.push(`分组 "${g.name}" 名称长度不能超过32字符`)
            }
            if (g.collapsed !== undefined && g.collapsed !== '0' && g.collapsed !== '1') {
                errors.push(`分组 "${g.name || g.id}" 折叠状态只能是 0（展开）或 1（折叠）`)
            }
            if (!g.fields || g.fields.length === 0) {
                errors.push(`分组 "${g.name || g.id}" 至少需要包含一个字段`)
            }
        })
    }

    // ===== Step 3: 字段通用校验 =====
    if (!fields || fields.length === 0) {
        errors.push('至少需要一个表单字段')
        return { ok: false, errors }
    }

    const ids = new Set<string>()
    const fieldIdToType = new Map<string, string>()

    fields.forEach(f => {
        // fieldId
        if (!f.fieldId || !f.fieldId.trim()) {
            errors.push(`存在空 fieldId 的字段: ${f.title || '(无标题)'}`)
        } else {
            if (!/^[a-zA-Z][a-zA-Z0-9_]{0,31}$/.test(f.fieldId)) {
                errors.push(`字段ID "${f.fieldId}" 格式错误：以字母开头，仅含字母数字下划线，最长32字符`)
            }
            if (ids.has(f.fieldId)) {
                errors.push(`字段ID重复: ${f.fieldId}`)
            } else {
                ids.add(f.fieldId)
            }
            fieldIdToType.set(f.fieldId, f.type)
        }

        // title
        if (!f.title || !f.title.trim()) {
            errors.push(`字段 ${f.fieldId || '(无ID)'} 缺少标题`)
        } else if (f.title.trim().length > 32) {
            errors.push(`字段 "${f.title}" 标题长度不能超过32字符`)
        }

        // type
        if (!VALID_FIELD_TYPES.includes(f.type)) {
            errors.push(`字段 "${f.title || f.fieldId}" 类型无效: ${f.type}`)
        }

        // required
        if (f.required !== undefined && f.required !== '1' && f.required !== '0') {
            errors.push(`字段 "${f.title || f.fieldId}" 必填标识只能是 1（必填）或 0（选填）`)
        }

        // span
        if (typeof f.span === 'number' && (!Number.isFinite(f.span) || f.span < 1 || f.span > 24)) {
            errors.push(`字段 "${f.title || f.fieldId}" 的 span 需在 1-24 之间`)
        }

        // placeholder
        if (f.placeholder != null && f.placeholder.length > 128) {
            errors.push(`字段 "${f.title || f.fieldId}" 占位提示长度不能超过128字符`)
        }

        // pattern
        if (f.pattern) {
            try {
                new RegExp(f.pattern)
            } catch {
                errors.push(`字段 "${f.title || f.fieldId}" 的正则表达式无效`)
            }
        }

        // patternTips
        if (f.patternTips != null && f.patternTips.length > 64) {
            errors.push(`字段 "${f.title || f.fieldId}" 正则提示长度不能超过64字符`)
        }

        // ===== Step 3.1: 按类型差异化校验 =====
        // options 必填检查
        if (OPTION_REQUIRED_TYPES.includes(f.type) && (!f.options || f.options.length === 0)) {
            errors.push(`字段 "${f.title || f.fieldId}" 缺少选项`)
        }

        // options 结构校验
        if (f.options && f.options.length > 0) {
            const validateOption = (opt: any, depth: number, path: string) => {
                if (depth > 10) {
                    errors.push(`字段 "${f.title || f.fieldId}" 级联选项嵌套层级不能超过10层`)
                    return
                }
                if (opt.label == null || String(opt.label).trim() === '') {
                    errors.push(`字段 "${f.title || f.fieldId}" 选项${path}标签不能为空`)
                }
                const val = opt.value
                const valType = typeof val
                if (val === undefined || val === null) {
                    errors.push(`字段 "${f.title || f.fieldId}" 选项${path}值不能为空`)
                } else if (valType !== 'string' && valType !== 'number' && valType !== 'boolean') {
                    errors.push(`字段 "${f.title || f.fieldId}" 选项${path}值类型无效，只能是字符串/数字/布尔`)
                } else if (String(val).trim() === '') {
                    errors.push(`字段 "${f.title || f.fieldId}" 选项${path}值不能为空`)
                }
                if (opt.children && Array.isArray(opt.children)) {
                    opt.children.forEach((child: any, i: number) => {
                        validateOption(child, depth + 1, `${path}.children[${i}]`)
                    })
                }
            }
            f.options.forEach((opt, i) => validateOption(opt, 1, `[${i}]`))
        }

        // NUMBER min/max
        if (f.type === 'NUMBER') {
            if (f.min != null && f.max != null && f.max < f.min) {
                errors.push(`字段 "${f.title || f.fieldId}" 最大值不能小于最小值`)
            }
            if (f.defaultValue != null) {
                const n = Number(f.defaultValue)
                if (!Number.isFinite(n) || String(f.defaultValue).trim() === '') {
                    errors.push(`字段 "${f.title || f.fieldId}" 默认值必须是数字`)
                }
            }
        }

        // INPUT/TEXTAREA minLength/maxLength
        if (['INPUT', 'TEXTAREA'].includes(f.type)) {
            if (f.minLength != null && f.maxLength != null && f.maxLength < f.minLength) {
                errors.push(`字段 "${f.title || f.fieldId}" 最大长度不能小于最小长度`)
            }
        }

        // CHECKBOX min/max
        if (f.type === 'CHECKBOX') {
            if (f.min != null && f.min < 0) {
                errors.push(`字段 "${f.title || f.fieldId}" 最少勾选数不能为负数`)
            }
            if (f.min != null && f.max != null && f.max < f.min) {
                errors.push(`字段 "${f.title || f.fieldId}" 最多勾选数不能小于最少勾选数`)
            }
        }

        // TEXTAREA min/max 行数
        if (f.type === 'TEXTAREA') {
            if (f.min != null && f.min < 1) {
                errors.push(`字段 "${f.title || f.fieldId}" 最小行数不能小于1`)
            }
            if (f.min != null && f.max != null && f.max < f.min) {
                errors.push(`字段 "${f.title || f.fieldId}" 最大行数不能小于最小行数`)
            }
        }

        // SLIDER min/max
        if (f.type === 'SLIDER') {
            if (f.min != null && f.max != null && f.max <= f.min) {
                errors.push(`字段 "${f.title || f.fieldId}" 最大值必须大于最小值`)
            }
        }

        // RATE max
        if (f.type === 'RATE') {
            if (f.max != null && f.max < 1) {
                errors.push(`字段 "${f.title || f.fieldId}" 最大分值不能小于1`)
            }
            if (f.defaultValue != null) {
                const maxVal = f.max ?? 5
                const dv = Number(f.defaultValue)
                if (!Number.isFinite(dv) || dv < 0 || dv > maxVal) {
                    errors.push(`字段 "${f.title || f.fieldId}" 默认值超出评分范围`)
                }
            }
        }

        // UPLOAD maxLength
        if (f.type === 'UPLOAD') {
            if (f.maxLength != null && f.maxLength < 1) {
                errors.push(`字段 "${f.title || f.fieldId}" 最多上传数量不能小于1`)
            }
        }

        // DATERANGE defaultValue
        if (f.type === 'DATERANGE') {
            if (f.defaultValue != null && !Array.isArray(f.defaultValue)) {
                errors.push(`字段 "${f.title || f.fieldId}" 日期区间默认值应为数组`)
            }
        }
    })

    // ===== Step 4: 联动规则校验 =====
    const validateNode = (node: FormLinkageNode | undefined, ruleIdx: number, path: string): void => {
        if (!node) return
        if (node.nodeType === 'CONDITION') {
            if (!node.triggerFieldId) {
                errors.push(`联动规则 #${ruleIdx + 1}${path} 缺少触发字段`)
            } else {
                if (!ids.has(node.triggerFieldId)) {
                    errors.push(`联动规则 #${ruleIdx + 1}${path} 的触发字段 "${node.triggerFieldId}" 不存在`)
                }
                if (node.triggerFieldId === linkages?.[ruleIdx]?.targetFieldId) {
                    errors.push(`联动规则 #${ruleIdx + 1}${path} 触发字段与目标字段相同`)
                }
            }
            if (!node.triggerCondition) {
                errors.push(`联动规则 #${ruleIdx + 1}${path} 缺少条件运算符`)
            } else if (!VALID_LINKAGE_CONDITIONS.includes(node.triggerCondition)) {
                errors.push(`联动规则 #${ruleIdx + 1}${path} 条件运算符无效: ${node.triggerCondition}`)
            }
            // REGEX 条件值校验
            if (node.triggerCondition === 'REGEX' && node.triggerValue !== undefined && node.triggerValue !== null && String(node.triggerValue) !== '') {
                try {
                    new RegExp(String(node.triggerValue))
                } catch {
                    errors.push(`联动规则 #${ruleIdx + 1}${path} 正则表达式无效`)
                }
            }
        } else if (node.nodeType === 'AND' || node.nodeType === 'OR') {
            const children = node.children || []
            if (children.length === 0) {
                errors.push(`联动规则 #${ruleIdx + 1}${path} 逻辑节点缺少子节点`)
            }
            children.forEach((child, i) => {
                validateNode(child, ruleIdx, `${path}.children[${i}]`)
            })
        } else {
            errors.push(`联动规则 #${ruleIdx + 1}${path} 节点类型无效: ${node.nodeType}`)
        }
    }

    ;(linkages || []).forEach((r, idx) => {
        // targetFieldId
        if (!r.targetFieldId) {
            errors.push(`联动规则 #${idx + 1} 缺少目标字段`)
        } else if (!ids.has(r.targetFieldId)) {
            errors.push(`联动规则 #${idx + 1} 的目标字段 "${r.targetFieldId}" 不存在`)
        }

        // actionType
        if (!r.actionType) {
            errors.push(`联动规则 #${idx + 1} 缺少动作类型`)
        } else if (!VALID_LINKAGE_ACTIONS.includes(r.actionType)) {
            errors.push(`联动规则 #${idx + 1} 动作类型无效: ${r.actionType}`)
        }

        // conditionTree
        if (!r.conditionTree || r.conditionTree.length === 0) {
            errors.push(`联动规则 #${idx + 1} 缺少条件配置`)
        } else {
            const root = r.conditionTree[0]
            if (!root) {
                errors.push(`联动规则 #${idx + 1} 条件树根节点不能为空`)
            } else if (root.nodeType !== 'AND' && root.nodeType !== 'OR') {
                errors.push(`联动规则 #${idx + 1} 条件树根节点必须是 AND 或 OR`)
            }
            validateNode(root, idx, '.conditionTree[0]')
        }

        // actionValue 校验
        if (r.actionType === 'SET_PATTERN' && r.actionValue) {
            const pat = typeof r.actionValue === 'object' ? r.actionValue.pattern : r.actionValue
            if (pat) {
                try {
                    new RegExp(String(pat))
                } catch {
                    errors.push(`联动规则 #${idx + 1} 的正则表达式无效`)
                }
            }
        }
        if (r.actionType === 'SET_SPAN' && r.actionValue !== undefined && r.actionValue !== null) {
            let sp: number
            if (typeof r.actionValue === 'object' && !Array.isArray(r.actionValue)) {
                sp = Number((r.actionValue as Record<string, any>).span)
            } else {
                sp = Number(r.actionValue)
            }
            if (isNaN(sp) || sp < 1 || sp > 24) {
                errors.push(`联动规则 #${idx + 1} 的 span 需在 1-24 之间`)
            }
        }

        // OPTION actionValue 校验（值字符串数组）
        if (r.actionType === 'OPTION') {
            if (!Array.isArray(r.actionValue)) {
                errors.push(`联动规则 #${idx + 1} 的选项必须是数组`)
            } else {
                (r.actionValue as any[]).forEach((val, valIdx) => {
                    if (val === undefined || val === null || String(val).trim() === '') {
                        errors.push(`联动规则 #${idx + 1} 选项值[${valIdx}] 不能为空`)
                    }
                })
            }
        }

        // VALUE actionValue 类型校验
        if (r.actionType === 'VALUE' && r.actionValue !== undefined && r.actionValue !== null) {
            const targetType = fieldIdToType.get(r.targetFieldId)
            if (targetType) {
                const v = r.actionValue
                const isArrayType = ['CHECKBOX', 'MULTISELECT', 'MULTICASCADER', 'DATERANGE'].includes(targetType)
                const isNumberType = ['NUMBER', 'SLIDER', 'RATE'].includes(targetType)
                if (isArrayType && !Array.isArray(v)) {
                    errors.push(`联动规则 #${idx + 1} 目标字段类型 "${targetType}" 的值应为数组`)
                }
                if (isNumberType && typeof v !== 'number') {
                    errors.push(`联动规则 #${idx + 1} 目标字段类型 "${targetType}" 的值应为数字`)
                }
                if (targetType === 'SWITCH' && typeof v !== 'boolean') {
                    errors.push(`联动规则 #${idx + 1} 目标字段类型 "SWITCH" 的值应为布尔值`)
                }
            }
        }

        // 动作兼容性校验
        if (r.targetFieldId && r.actionType && ids.has(r.targetFieldId)) {
            const targetType = fieldIdToType.get(r.targetFieldId)
            if (targetType) {
                const valid = getValidActionsByFieldType(targetType as any)
                if (!valid.includes(r.actionType)) {
                    errors.push(`联动规则 #${idx + 1} 动作 "${r.actionType}" 不支持目标字段类型 "${targetType}"`)
                }
            }
        }
    })

    return { ok: errors.length === 0, errors }
}

// 清理 conditionTree 中引用指定字段的节点
export const cleanConditionTree = (
    nodes: FormLinkageNode[] | undefined,
    fieldId: string,
): FormLinkageNode[] => {
    if (!nodes || nodes.length === 0) return []
    return nodes
        .map(node => {
            if (node.nodeType === 'CONDITION') {
                if (node.triggerFieldId === fieldId) return null
                return node
            }
            const children = cleanConditionTree(node.children, fieldId)
            if (children.length === 0) return null
            return { ...node, children }
        })
        .filter((n): n is FormLinkageNode => n !== null)
}
