<template>
    <el-dialog v-model="visible" title="字段权限配置" width="700px" destroy-on-close :close-on-click-modal="false">
        <div v-loading="loading">
            <el-table :data="permissionList" style="width: 100%" size="small">
                <el-table-column prop="title" label="字段名称" min-width="180" />
                <el-table-column prop="type" label="类型" width="100">
                    <template #default="scope">
                        {{ getFieldTypeLabel(scope.row.type) }}
                    </template>
                </el-table-column>
                <el-table-column label="权限" width="160">
                    <template #default="scope">
                        <el-select v-model="scope.row.permission" placeholder="继承模板默认" clearable size="small"
                            style="width: 100%" :disabled="readonly">
                            <el-option v-for="opt in permissionOptions" :key="opt.value" :label="opt.label"
                                :value="opt.value" />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
            <el-empty v-if="permissionList.length === 0" description="暂无字段数据" />
        </div>
        <template #footer>
            <el-button @click="visible = false">关闭</el-button>
            <el-button type="primary" @click="savePermissions" :loading="saving" :disabled="readonly"
                v-if="!readonly">
                保存
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { http, alert } from '@/utils';
import { ref, watch, computed } from 'vue'
import { flattenGroups, type FormField, FIELD_TYPE_OPTIONS } from '@/components/dynamicForm/types'

const props = defineProps<{
    modelValue: boolean
    processDefinitionId?: string | number
    nodeId?: string
    formId?: string
    inheritMainForm?: string
    readonly?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'saved'): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
})

const loading = ref(false)
const saving = ref(false)
const permissionList = ref<(FormField & { permission: string | null })[]>([])

const permissionOptions = [
    { value: 'VISIBLE', label: '可见' },
    { value: 'READONLY', label: '只读' },
    { value: 'HIDDEN', label: '隐藏' },
    { value: 'EDITABLE', label: '可编辑' },
    { value: 'REQUIRED', label: '必填' },
]

const getFieldTypeLabel = (type: string) => {
    return FIELD_TYPE_OPTIONS.find(o => o.value === type)?.label || type
}

const getFormFields = async (formId: string): Promise<FormField[]> => {
    const data = await http.post('/dynamicForm/info', { id: formId })
    if (data?.groups && data.groups.length > 0) {
        return flattenGroups(data.groups)
    }
    return data?.formFields || []
}

const loadPermissions = async () => {
    if (!props.processDefinitionId || !props.nodeId || !props.formId) {
        permissionList.value = []
        return
    }
    loading.value = true
    try {
        // 1. 加载节点表单字段
        let allFields = await getFormFields(props.formId)

        // 2. 如果继承主表单，合并全局表单字段
        if (props.inheritMainForm === '1') {
            try {
                const globalForm = await http.post('/processDefinition/globalFormBinding', null, {
                    params: { processDefinitionId: props.processDefinitionId }
                })
                if (globalForm?.formId) {
                    const mainFields = await getFormFields(globalForm.formId)
                    // 合并，节点表单字段优先（去重）
                    const nodeFieldKeys = new Set(allFields.map(f => f.fieldId))
                    allFields = [...mainFields.filter(f => !nodeFieldKeys.has(f.fieldId)), ...allFields]
                }
            } catch { /* ignore */ }
        }

        // 3. 加载已配置权限
        let permMap: Record<string, string> = {}
        try {
            const permissions = await http.post('/processDefinition/nodeFieldPermissions', null, {
                params: { processDefinitionId: props.processDefinitionId, nodeId: props.nodeId }
            })
            permMap = Object.fromEntries((permissions || []).map((p: any) => [p.fieldKey, p.permission]))
        } catch { /* ignore */ }

        // 4. 组装表格数据
        permissionList.value = allFields.map(field => ({
            ...field,
            permission: permMap[field.fieldId] || null
        }))
    } finally {
        loading.value = false
    }
}

const savePermissions = async () => {
    if (!props.processDefinitionId || !props.nodeId) return
    saving.value = true
    try {
        const payload = permissionList.value
            .filter(p => p.permission)
            .map(p => ({ fieldKey: p.fieldId, permission: p.permission! }))

        await http.post('/processDefinition/saveNodeFieldPermissions', {
            processDefinitionId: props.processDefinitionId,
            nodeId: props.nodeId,
            permissions: payload
        })
        alert('字段权限保存成功', 'success')
        emit('saved')
        visible.value = false
    } finally {
        saving.value = false
    }
}

watch(
    () => [props.modelValue, props.formId, props.nodeId],
    ([v]) => {
        if (v && props.formId) {
            loadPermissions()
        }
    },
    { immediate: true }
)
</script>
