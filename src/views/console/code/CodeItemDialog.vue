<template>
    <el-dialog v-model="visible" :title="type === 'add' ? '新增码项' : '编辑码项'" width="560px" append-to-body
        :close-on-click-modal="false" destroy-on-close @open="onOpen">
        <el-form label-position="top">
            <el-form-item v-if="table.tree === '1'" label="父级码项">
                <el-tree-select v-model="info.parentId" :data="parentTree" clearable check-strictly filterable
                    node-key="id" :props="{ label: 'label', children: 'children' }" placeholder="不选则为根节点"
                    style="width: 100%" />
            </el-form-item>
            <el-form-item label="显示文本">
                <el-input v-model="info.label" placeholder="请输入显示文本" maxlength="128" show-word-limit />
            </el-form-item>
            <el-form-item label="提交值">
                <el-input v-model="info.value" placeholder="请输入提交值" maxlength="128" show-word-limit />
            </el-form-item>
            <el-form-item label="排序">
                <el-input-number v-model="info.sort" :min="0" style="width: 100%" />
            </el-form-item>
            <el-form-item label="状态">
                <el-radio-group v-model="info.status">
                    <el-radio-button label="1">启用</el-radio-button>
                    <el-radio-button label="0">停用</el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="备注">
                <el-input v-model="info.remark" type="textarea" :rows="3" placeholder="可选" maxlength="256" show-word-limit />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { alert, http } from '@/utils'

interface CodeTable {
    id?: string
    tree: '0' | '1'
}

interface CodeItem {
    id?: string
    tableId: string
    parentId?: string | null
    label: string
    value: string
    sort?: number
    status: '0' | '1'
    remark?: string
    children?: CodeItem[]
}

interface CodeItemForm {
    id?: string
    parentId: string | null
    label: string
    value: string
    sort: number
    status: '0' | '1'
    remark: string
}

const props = defineProps<{
    modelValue: boolean
    table: CodeTable
    item?: CodeItem | null
    type: 'add' | 'edit'
    parentId?: string | null
    parentOptions: CodeItem[]
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
})
const saving = ref(false)
const info = ref<CodeItemForm>({ parentId: null, label: '', value: '', sort: 0, status: '1', remark: '' })

const parentTree = computed(() => buildTree(props.parentOptions))

const buildTree = (items: CodeItem[]): CodeItem[] => {
    const map = new Map<string, CodeItem>()
    const roots: CodeItem[] = []
    items.forEach(item => {
        if (item.id) map.set(item.id, { ...item, children: [] })
    })
    map.forEach(item => {
        if (item.parentId && map.has(item.parentId)) {
            map.get(item.parentId)!.children!.push(item)
        } else {
            roots.push(item)
        }
    })
    const clean = (list: CodeItem[]) => {
        list.sort((a, b) => (a.sort || 0) - (b.sort || 0))
        list.forEach(item => {
            if (item.children && item.children.length > 0) clean(item.children)
            else delete item.children
        })
    }
    clean(roots)
    return roots
}

const onOpen = () => {
    if (props.type === 'edit' && props.item) {
        info.value = {
            id: props.item.id,
            parentId: props.item.parentId || null,
            label: props.item.label || '',
            value: props.item.value || '',
            sort: props.item.sort || 0,
            status: props.item.status || '1',
            remark: props.item.remark || '',
        }
        return
    }
    info.value = {
        parentId: props.parentId || null,
        label: '',
        value: '',
        sort: 0,
        status: '1',
        remark: '',
    }
}

const isDescendant = (candidateParentId: string, itemId: string): boolean => {
    const childMap = new Map<string, string[]>()
    props.parentOptions.forEach(item => {
        if (!item.id || !item.parentId) return
        const list = childMap.get(item.parentId) || []
        list.push(item.id)
        childMap.set(item.parentId, list)
    })
    const stack = [...(childMap.get(itemId) || [])]
    while (stack.length > 0) {
        const current = stack.pop()!
        if (current === candidateParentId) return true
        stack.push(...(childMap.get(current) || []))
    }
    return false
}

const validate = () => {
    if (!info.value.label.trim()) {
        alert('请输入显示文本', 'warning')
        return false
    }
    if (info.value.label.trim().length > 128) {
        alert('显示文本不能超过128个字符', 'warning')
        return false
    }
    if (!info.value.value.trim()) {
        alert('请输入提交值', 'warning')
        return false
    }
    if (info.value.value.trim().length > 128) {
        alert('提交值不能超过128个字符', 'warning')
        return false
    }
    if (!info.value.status) {
        alert('请选择状态', 'warning')
        return false
    }
    if (props.table.tree === '1' && props.type === 'edit' && info.value.id && info.value.parentId) {
        if (info.value.parentId === info.value.id) {
            alert('不能选择自己作为父级码项', 'warning')
            return false
        }
        if (isDescendant(info.value.parentId, info.value.id)) {
            alert('不能选择子孙码项作为父级码项', 'warning')
            return false
        }
    }
    return true
}

const submit = async () => {
    if (!validate()) return
    saving.value = true
    try {
        const payload: Record<string, any> = {
            id: info.value.id,
            tableId: props.table.id,
            label: info.value.label.trim(),
            value: info.value.value.trim(),
            sort: Number(info.value.sort || 0),
            status: info.value.status,
            remark: info.value.remark.trim() || undefined,
        }
        if (props.table.tree === '1') {
            payload.parentId = info.value.parentId || null
        }
        if (props.type === 'add') {
            await http.post('/code-item/add', payload)
            alert('新增成功', 'success')
        } else {
            await http.post('/code-item/update', payload)
            alert('保存成功', 'success')
        }
        emit('success')
    } finally {
        saving.value = false
    }
}
</script>
