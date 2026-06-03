<template>
    <el-dialog v-model="visible" title="字段权限配置" width="820px" destroy-on-close :close-on-click-modal="false">
        <div v-loading="loading" class="permission-dialog-body">
            <template v-for="set in fieldSets" :key="set.source">
                <div class="field-set">
                    <div class="set-header">
                        <span class="set-title">{{ set.sourceLabel }}</span>
                    </div>
                    <div v-if="!readonly" class="batch-bar">
                        <el-dropdown size="small" split-button type="primary"
                            :disabled="!selectedMap[set.source]?.length"
                            @command="(cmd: string) => batchSet(set.source, cmd)">
                            批量设置
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="VISIBLE">可见</el-dropdown-item>
                                    <el-dropdown-item command="READONLY">只读</el-dropdown-item>
                                    <el-dropdown-item command="HIDDEN">隐藏</el-dropdown-item>
                                    <el-dropdown-item command="EDITABLE">可编辑</el-dropdown-item>
                                    <el-dropdown-item command="REQUIRED">必填</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        <el-button size="small" plain :disabled="!selectedMap[set.source]?.length"
                            @click="batchSet(set.source, null)">
                            清空所选
                        </el-button>
                        <el-text v-if="selectedMap[set.source]?.length" type="info" size="small">
                            已选 {{ selectedMap[set.source].length }} 项
                        </el-text>
                    </div>
                    <el-table :data="set.fields" style="width: 100%" size="small" border
                        @selection-change="(sel: PermissionField[]) => handleSelectionChange(set.source, sel)">
                        <el-table-column v-if="!readonly" type="selection" width="45" />
                        <el-table-column prop="groupName" label="分组" width="120" />
                        <el-table-column prop="title" label="字段名称" min-width="160" />
                        <el-table-column prop="type" label="类型" width="90">
                            <template #default="scope">
                                {{ getFieldTypeLabel(scope.row.type) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="权限" width="150">
                            <template #default="scope">
                                <el-select v-model="scope.row.permission" placeholder="继承模板默认" clearable size="small"
                                    style="width: 100%" :disabled="readonly">
                                    <el-option v-for="opt in permissionOptions" :key="opt.value" :label="opt.label"
                                        :value="opt.value" />
                                </el-select>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </template>
            <el-empty v-if="fieldSets.length === 0" description="暂无字段数据" />
        </div>
        <template #footer>
            <el-button @click="visible = false">关闭</el-button>
            <el-button type="primary" @click="savePermissions" :loading="saving" :disabled="readonly" v-if="!readonly">
                保存
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { http } from '@/utils';
import { ref, watch, computed } from 'vue'
import { type FormField, FIELD_TYPE_OPTIONS } from '@/components/dynamicForm/types'

interface PermissionField {
    fieldId: string
    title: string
    type: string
    permission: string | null
    groupName: string
}

interface FieldSet {
    source: 'node' | 'global'
    sourceLabel: string
    fields: PermissionField[]
}

const props = defineProps<{
    modelValue: boolean
    nodeConfig?: {
        globalFormBinding: any
        nodeFormBindings: any[]
        nodeFieldPermissions: any[]
    }
    nodeId?: string
    formId?: string
    formVersion?: string
    inheritMainForm?: string
    readonly?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'update:nodeConfig', data: any): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
})

const loading = ref(false)
const saving = ref(false)
const fieldSets = ref<FieldSet[]>([])
const selectedMap = ref<Record<string, PermissionField[]>>({})

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

const buildFieldsFromFormData = (data: any): PermissionField[] => {
    const fields: PermissionField[] = []

    // 未分组字段（放前面）
    if (data?.fields && data.fields.length > 0) {
        data.fields.forEach((f: FormField) => {
            fields.push({
                fieldId: f.fieldId,
                title: f.title,
                type: f.type,
                permission: null,
                groupName: '未分组'
            })
        })
    }

    // 分组字段
    if (data?.groups && data.groups.length > 0) {
        data.groups.forEach((g: any) => {
            const groupName = g.name || '未命名分组'
            g.fields?.forEach((f: FormField) => {
                fields.push({
                    fieldId: f.fieldId,
                    title: f.title,
                    type: f.type,
                    permission: null,
                    groupName
                })
            })
        })
    }

    return fields
}

const loadPermissions = async () => {
    if (!props.nodeId) {
        fieldSets.value = []
        selectedMap.value = {}
        return
    }

    const globalFormId = props.nodeConfig?.globalFormBinding?.formId
    const hasNodeForm = !!props.formId
    const hasGlobalForm = !!globalFormId && props.inheritMainForm === '1'

    if (!hasNodeForm && !hasGlobalForm) {
        fieldSets.value = []
        selectedMap.value = {}
        return
    }

    loading.value = true
    try {
        const sets: FieldSet[] = []
        const newSelected: Record<string, PermissionField[]> = {}

        // 从 nodeConfig 中读取已配置权限
        const permissions = props.nodeConfig?.nodeFieldPermissions || []
        const permMap: Record<string, string> = {}
        permissions
            .filter((p: any) => String(p.nodeId) === String(props.nodeId))
            .forEach((p: any) => {
                permMap[p.fieldKey] = p.permission
            })

        // 1. 加载节点表单字段
        if (hasNodeForm) {
            const data = await http.post('/dynamicForm/info', { id: props.formId, version: props.formVersion })
            const fields = buildFieldsFromFormData(data).map(f => ({
                ...f,
                permission: permMap[f.fieldId] || null
            }))
            if (fields.length > 0) {
                sets.push({ source: 'node', sourceLabel: '节点表单字段', fields })
                newSelected['node'] = []
            }
        }

        // 2. 加载全局表单字段
        if (hasGlobalForm) {
            const globalFormVersion = props.nodeConfig?.globalFormBinding?.formVersion
            const data = await http.post('/dynamicForm/info', { id: globalFormId, version: globalFormVersion })
            const fields = buildFieldsFromFormData(data).map(f => ({
                ...f,
                permission: permMap[f.fieldId] || null
            }))
            if (fields.length > 0) {
                sets.push({ source: 'global', sourceLabel: '全局表单字段（继承）', fields })
                newSelected['global'] = []
            }
        }

        fieldSets.value = sets
        selectedMap.value = newSelected
    } finally {
        loading.value = false
    }
}

const savePermissions = async () => {
    if (!props.nodeId || !props.nodeConfig) return
    saving.value = true
    try {
        const currentPerms: any[] = []
        fieldSets.value.forEach(set => {
            set.fields
                .filter(f => f.permission)
                .forEach(f => {
                    currentPerms.push({
                        nodeId: String(props.nodeId!),
                        fieldKey: f.fieldId,
                        permission: f.permission!
                    })
                })
        })

        const otherPerms = (props.nodeConfig.nodeFieldPermissions || [])
            .filter((p: any) => String(p.nodeId) !== String(props.nodeId))

        emit('update:nodeConfig', {
            ...props.nodeConfig,
            nodeFieldPermissions: [...otherPerms, ...currentPerms]
        })
        visible.value = false
    } finally {
        saving.value = false
    }
}

const handleSelectionChange = (source: string, selection: PermissionField[]) => {
    selectedMap.value[source] = selection
}

const batchSet = (source: 'node' | 'global', permission: string | null) => {
    const selected = selectedMap.value[source] || []
    selected.forEach(f => f.permission = permission)
}

watch(
    () => [props.modelValue, props.formId, props.formVersion, props.nodeId, props.inheritMainForm, props.nodeConfig?.globalFormBinding?.formId, props.nodeConfig?.globalFormBinding?.formVersion],
    ([v]) => {
        const globalFormId = props.nodeConfig?.globalFormBinding?.formId
        const hasGlobalForm = !!globalFormId && props.inheritMainForm === '1'
        if (v && (props.formId || hasGlobalForm)) {
            loadPermissions()
        }
    },
    { immediate: true }
)
</script>

<style scoped>
.permission-dialog-body {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 4px;
}

.field-set {
    margin-bottom: 24px;
}

.field-set:last-child {
    margin-bottom: 0;
}

.set-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding: 8px 12px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
}

.set-title {
    font-weight: 600;
    font-size: 14px;
    color: var(--el-text-color-primary);
}

.batch-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    padding-left: 4px;
}
</style>
