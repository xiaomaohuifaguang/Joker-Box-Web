<template>
    <el-dialog v-model="visible" title="管理码项" width="86%" top="5vh" :close-on-click-modal="false" destroy-on-close
        @open="queryItems">
        <div v-if="table" class="item-manager">
            <div class="table-summary">
                <div>
                    <div class="summary-title">{{ table.name }}</div>
                    <div class="summary-code">{{ table.code }}</div>
                </div>
                <div class="summary-tags">
                    <el-tag :type="table.tree === '1' ? 'success' : 'info'">{{ table.tree === '1' ? '树形' : '平铺' }}</el-tag>
                    <el-tag :type="table.status === '1' ? 'success' : 'danger'">{{ table.status === '1' ? '启用' : '停用' }}</el-tag>
                </div>
            </div>

            <div class="item-toolbar">
                <el-input v-model="queryParam.label" placeholder="显示文本" clearable @keyup.enter="queryItems" />
                <el-input v-model="queryParam.value" placeholder="提交值" clearable @keyup.enter="queryItems" />
                <el-select v-model="queryParam.status" placeholder="状态" clearable>
                    <el-option label="启用" value="1" />
                    <el-option label="停用" value="0" />
                </el-select>
                <el-button type="primary" @click="queryItems">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
                <el-button type="success" @click="openAddDialog(null)">新增码项</el-button>
            </div>

            <el-table v-loading="loading" :data="displayItems" stripe row-key="id" style="width: 100%"
                :tree-props="{ children: 'children' }" default-expand-all>
                <el-table-column prop="label" label="显示文本" min-width="180" show-overflow-tooltip />
                <el-table-column prop="value" label="提交值" min-width="160" show-overflow-tooltip />
                <el-table-column prop="sort" label="排序" width="90" align="center" />
                <el-table-column prop="status" label="状态" width="90" align="center">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '1' ? 'success' : 'danger'" effect="light">
                            {{ row.status === '1' ? '启用' : '停用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
                <el-table-column prop="createTime" label="创建时间" width="170" show-overflow-tooltip />
                <el-table-column prop="updateTime" label="更新时间" width="170" show-overflow-tooltip />
                <el-table-column label="操作" fixed="right" width="210" align="center">
                    <template #default="{ row }">
                        <el-button v-if="table.tree === '1'" type="success" link size="small" @click="openAddDialog(row.id)">子级</el-button>
                        <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
                        <el-button type="danger" link size="small" @click="confirmDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <CodeItemDialog v-model="itemDialog.open" :table="table" :type="itemDialog.type" :item="itemDialog.item"
                :parent-id="itemDialog.parentId" :parent-options="allItems" @success="onItemSaved" />
        </div>
        <template #footer>
            <el-button type="primary" @click="visible = false">关闭</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { alert, confirm, http } from '@/utils'
import CodeItemDialog from './CodeItemDialog.vue'

interface CodeTable {
    id?: string
    code: string
    name: string
    tree: '0' | '1'
    status: '0' | '1'
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
    createTime?: string
    updateTime?: string
    children?: CodeItem[]
}

const props = defineProps<{
    modelValue: boolean
    table: CodeTable | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
})
const loading = ref(false)
const allItems = ref<CodeItem[]>([])
const queryParam = ref({ label: '', value: '', status: '' })
const itemDialog = ref<{ open: boolean; type: 'add' | 'edit'; item: CodeItem | null; parentId: string | null }>({
    open: false,
    type: 'add',
    item: null,
    parentId: null,
})

const displayItems = computed(() => props.table?.tree === '1' ? buildTree(allItems.value) : allItems.value)

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
    const sortItems = (list: CodeItem[]) => {
        list.sort((a, b) => (a.sort || 0) - (b.sort || 0))
        list.forEach(item => {
            if (item.children && item.children.length > 0) sortItems(item.children)
            else delete item.children
        })
    }
    sortItems(roots)
    return roots
}

const queryItems = async () => {
    if (!props.table?.id) return
    loading.value = true
    try {
        const result: any = await http.post('/code-item/list', {
            tableId: props.table.id,
            label: queryParam.value.label || undefined,
            value: queryParam.value.value || undefined,
            status: queryParam.value.status || undefined,
        })
        allItems.value = Array.isArray(result) ? result : []
    } finally {
        loading.value = false
    }
}

const resetQuery = () => {
    queryParam.value = { label: '', value: '', status: '' }
    queryItems()
}

const openAddDialog = (parentId: string | null) => {
    itemDialog.value = { open: true, type: 'add', item: null, parentId }
}

const openEditDialog = (item: CodeItem) => {
    itemDialog.value = { open: true, type: 'edit', item, parentId: item.parentId || null }
}

const onItemSaved = () => {
    itemDialog.value.open = false
    queryItems()
}

const confirmDelete = (item: CodeItem) => {
    const message = props.table?.tree === '1' ? '确定删除该码项及其所有子孙码项吗？' : '确定删除该码项吗？'
    confirm('提示', message, async () => {
        await http.post('/code-item/delete', undefined, { params: { id: item.id } })
        alert('删除成功', 'success')
        queryItems()
    })
}
</script>

<style scoped lang="scss">
.item-manager {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.table-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    background: var(--el-fill-color-lighter);
}

.summary-title {
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 700;
}

.summary-code {
    margin-top: 4px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
}

.summary-tags,
.item-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
}

.item-toolbar {
    flex-wrap: wrap;

    .el-input,
    .el-select {
        width: 180px;
    }
}
</style>
