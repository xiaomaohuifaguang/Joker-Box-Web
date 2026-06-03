// ============================================================
// 动态表单 V2 —— 工具函数集
// 提供字段/分组 ID 生成、默认对象创建、选项深拷贝、
// 条件树操作、文件大小格式化、文件类型识别等辅助功能
// ============================================================

import type { FormField, FormFieldGroup, FormFieldOption, FormFieldType } from '../types'

// ------------------------------------------------------------------
// ID 生成
// ------------------------------------------------------------------

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'

function randomId(prefix: string, existingIds: string[]): string {
    let id: string
    do {
        let suffix = ''
        for (let i = 0; i < 6; i++) {
            suffix += CHARS[Math.floor(Math.random() * CHARS.length)]
        }
        id = `${prefix}${suffix}`
    } while (existingIds.includes(id))
    return id
}

/** 生成唯一 fieldId（field_前缀 + 随机6字符） */
export function generateFieldId(existingIds: string[]): string {
    return randomId('field_', existingIds)
}

/** 生成唯一分组id（group_前缀 + 随机6字符） */
export function generateGroupId(existingIds: string[]): string {
    return randomId('group_', existingIds)
}

// ------------------------------------------------------------------
// 默认对象创建
// ------------------------------------------------------------------

/** 创建默认字段（自动生成id，默认标题"未命名字段"，required='0'，span=24，sort=0） */
export function createDefaultField(type: FormFieldType, existingIds: string[]): FormField {
    return {
        fieldId: generateFieldId(existingIds),
        title: '未命名字段',
        type,
        required: '0',
        span: 24,
        sort: 0,
    }
}

/** 创建默认分组（自动生成id，默认名称"未命名分组"，fields=[]） */
export function createDefaultGroup(existingIds: string[]): FormFieldGroup {
    return {
        id: generateGroupId(existingIds),
        name: '未命名分组',
        fields: [],
        sort: 0,
    }
}

// ------------------------------------------------------------------
// 选项深拷贝
// ------------------------------------------------------------------

/** 深拷贝选项（递归处理 children） */
export function cloneOptions(options?: FormFieldOption[]): FormFieldOption[] | undefined {
    if (!options || options.length === 0) return undefined
    return options.map(opt => ({
        label: opt.label,
        value: opt.value,
        visible: opt.visible,
        children: cloneOptions(opt.children),
    }))
}

// ------------------------------------------------------------------
// 条件树操作
// ------------------------------------------------------------------

interface ConditionNode {
    nodeType?: string
    triggerFieldId?: string
    children?: ConditionNode[]
    [key: string]: any
}

/** 收集条件树中所有 $field 引用（遍历 triggerFieldId） */
export function collectReferencedFieldIds(nodes: ConditionNode[]): string[] {
    const ids = new Set<string>()
    const walk = (list: ConditionNode[]) => {
        list.forEach(node => {
            if (node.triggerFieldId) {
                ids.add(node.triggerFieldId)
            }
            if (node.children && node.children.length > 0) {
                walk(node.children)
            }
        })
    }
    walk(nodes)
    return Array.from(ids)
}

/** 从条件树中移除引用指定字段的节点（AND/OR 节点在 children 为空时一并移除） */
export function removeFieldFromConditionTree(nodes: ConditionNode[], fieldId: string): ConditionNode[] {
    const result: ConditionNode[] = []
    for (const node of nodes) {
        if (node.nodeType === 'CONDITION') {
            if (node.triggerFieldId !== fieldId) {
                result.push(node)
            }
            continue
        }
        if (node.children && node.children.length > 0) {
            const filteredChildren = removeFieldFromConditionTree(node.children, fieldId)
            if (filteredChildren.length > 0) {
                result.push({
                    ...node,
                    children: filteredChildren,
                })
            }
        }
    }
    return result
}

// ------------------------------------------------------------------
// 文件工具
// ------------------------------------------------------------------

/** 格式化文件大小（B/KB/MB/GB） */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2))
    // 去掉末尾无意义的 .00
    const sizeStr = Number.isInteger(size) ? String(size) : size.toString()
    return `${sizeStr} ${units[i]}`
}

/** 根据扩展名映射到文件类型图标与颜色 */
const FILE_TYPE_MAP: Record<string, { icon: string; color: string }> = {
    // 图片
    png: { icon: 'Picture', color: '#409EFF' },
    jpg: { icon: 'Picture', color: '#409EFF' },
    jpeg: { icon: 'Picture', color: '#409EFF' },
    gif: { icon: 'Picture', color: '#409EFF' },
    bmp: { icon: 'Picture', color: '#409EFF' },
    webp: { icon: 'Picture', color: '#409EFF' },
    svg: { icon: 'Picture', color: '#409EFF' },
    // 文档
    pdf: { icon: 'Document', color: '#F56C6C' },
    doc: { icon: 'Document', color: '#409EFF' },
    docx: { icon: 'Document', color: '#409EFF' },
    txt: { icon: 'Document', color: '#909399' },
    rtf: { icon: 'Document', color: '#909399' },
    // 表格
    xls: { icon: 'Grid', color: '#67C23A' },
    xlsx: { icon: 'Grid', color: '#67C23A' },
    csv: { icon: 'Grid', color: '#67C23A' },
    // 演示
    ppt: { icon: 'DataLine', color: '#E6A23C' },
    pptx: { icon: 'DataLine', color: '#E6A23C' },
    // 压缩包
    zip: { icon: 'Box', color: '#909399' },
    rar: { icon: 'Box', color: '#909399' },
    '7z': { icon: 'Box', color: '#909399' },
    tar: { icon: 'Box', color: '#909399' },
    gz: { icon: 'Box', color: '#909399' },
    // 音视频
    mp3: { icon: 'Headset', color: '#409EFF' },
    wav: { icon: 'Headset', color: '#409EFF' },
    mp4: { icon: 'VideoPlay', color: '#409EFF' },
    avi: { icon: 'VideoPlay', color: '#409EFF' },
    mov: { icon: 'VideoPlay', color: '#409EFF' },
    // 代码/文本
    js: { icon: 'DocumentCopy', color: '#E6A23C' },
    ts: { icon: 'DocumentCopy', color: '#409EFF' },
    json: { icon: 'DocumentCopy', color: '#67C23A' },
    xml: { icon: 'DocumentCopy', color: '#67C23A' },
    html: { icon: 'DocumentCopy', color: '#F56C6C' },
    css: { icon: 'DocumentCopy', color: '#409EFF' },
    md: { icon: 'DocumentCopy', color: '#909399' },
}

const DEFAULT_FILE_TYPE = { icon: 'Document', color: '#909399' }

/** 根据文件名获取文件类型图标和颜色 */
export function getFileTypeInfo(filename: string): { icon: string; color: string } {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    return FILE_TYPE_MAP[ext] ?? DEFAULT_FILE_TYPE
}

// ------------------------------------------------------------------
// 开发环境简单断言测试
// ------------------------------------------------------------------

if (import.meta.env.DEV) {
    // 简单断言测试
    console.assert(generateFieldId([]).startsWith('field_'), 'generateFieldId prefix')
    console.assert(generateFieldId(['field_abc123']) !== 'field_abc123', 'generateFieldId unique')

    const field = createDefaultField('INPUT', [])
    console.assert(field.type === 'INPUT' && field.span === 24, 'createDefaultField')

    const tree = [
        {
            nodeType: 'AND',
            children: [
                { nodeType: 'CONDITION', triggerFieldId: 'f1' },
                { nodeType: 'CONDITION', triggerFieldId: 'f2' },
            ],
        },
        { nodeType: 'CONDITION', triggerFieldId: 'f3' },
    ]
    console.assert(collectReferencedFieldIds(tree).length === 3, 'collectReferencedFieldIds')

    console.assert(formatFileSize(1024) === '1 KB', 'formatFileSize')
    console.assert(getFileTypeInfo('test.png').icon === 'Picture', 'getFileTypeInfo')

    console.log('helpers.ts tests passed')
}
