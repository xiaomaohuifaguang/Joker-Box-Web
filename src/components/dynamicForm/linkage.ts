import type {
    FieldRuntimeState,
    FormField,
    FormLinkageNode,
    FormLinkageRule,
    LinkageCondition,
} from './types'

const toNumber = (v: any): number => {
    if (v === null || v === undefined || v === '') return NaN
    const n = Number(v)
    return Number.isFinite(n) ? n : NaN
}

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
        case 'EQ':
            return String(fieldValue ?? '') === String(triggerValue ?? '')
        case 'NE':
            return String(fieldValue ?? '') !== String(triggerValue ?? '')
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
                return new RegExp(String(triggerValue)).test(String(fieldValue ?? ''))
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
                const sp = Number(rule.actionValue)
                if (!isNaN(sp) && sp >= 1 && sp <= 24) {
                    targetState.span = sp
                }
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

export const validateTemplate = (
    name: string,
    fields: FormField[],
    linkages: FormLinkageRule[] | undefined,
): TemplateCheckResult => {
    const errors: string[] = []
    if (!name || !name.trim()) errors.push('表单名称不能为空')
    if (!fields || fields.length === 0) errors.push('至少需要一个表单字段')

    const ids = new Set<string>()
    fields.forEach(f => {
        if (!f.fieldId || !f.fieldId.trim()) {
            errors.push(`存在空 fieldId 的字段: ${f.title || '(无标题)'}`)
        } else if (ids.has(f.fieldId)) {
            errors.push(`fieldId 重复: ${f.fieldId}`)
        } else {
            ids.add(f.fieldId)
        }
        if (!f.title || !f.title.trim()) {
            errors.push(`字段 ${f.fieldId} 缺少标题`)
        }
        if (['SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'CASCADER', 'MULTICASCADER']
            .includes(f.type) && (!f.options || f.options.length === 0)) {
            errors.push(`字段 ${f.title || f.fieldId} 缺少选项`)
        }
        if (typeof f.span === 'number' && (f.span < 1 || f.span > 24)) {
            errors.push(`字段 ${f.title || f.fieldId} 的 span 需在 1-24 之间`)
        }
        if (f.pattern) {
            try {
                new RegExp(f.pattern)
            } catch {
                errors.push(`字段 ${f.title || f.fieldId} 的正则表达式无效`)
            }
        }
    })

    // 递归校验 conditionTree
    const validateNode = (node: FormLinkageNode | undefined, ruleIdx: number, path: string): void => {
        if (!node) return
        if (node.nodeType === 'CONDITION') {
            if (!node.triggerFieldId || !ids.has(node.triggerFieldId)) {
                errors.push(`联动规则 #${ruleIdx + 1}${path} 的触发字段不存在`)
            }
            if (node.triggerFieldId && node.triggerFieldId === linkages?.[ruleIdx]?.targetFieldId) {
                errors.push(`联动规则 #${ruleIdx + 1}${path} 触发字段与目标字段相同`)
            }
        } else {
            const children = node.children || []
            children.forEach((child, i) => {
                validateNode(child, ruleIdx, `${path}.children[${i}]`)
            })
        }
    }

    ;(linkages || []).forEach((r, idx) => {
        if (!r.targetFieldId || !ids.has(r.targetFieldId)) {
            errors.push(`联动规则 #${idx + 1} 的目标字段不存在`)
        }
        if (r.conditionTree && r.conditionTree.length > 0) {
            validateNode(r.conditionTree[0], idx, '.conditionTree[0]')
        } else {
            errors.push(`联动规则 #${idx + 1} 缺少条件配置`)
        }
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
            const sp = Number(r.actionValue)
            if (isNaN(sp) || sp < 1 || sp > 24) {
                errors.push(`联动规则 #${idx + 1} 的 span 需在 1-24 之间`)
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
