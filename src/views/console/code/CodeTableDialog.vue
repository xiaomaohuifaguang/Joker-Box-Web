<template>
    <el-dialog v-model="visible" :title="type === 'add' ? '新增码表' : '编辑码表'" width="560px" :close-on-click-modal="false"
        destroy-on-close @open="onOpen">
        <el-form label-position="top" v-loading="loading">
            <el-form-item label="码表编码">
                <el-input v-model="info.code" placeholder="例如 project_type" :disabled="type === 'edit'" maxlength="64" show-word-limit />
            </el-form-item>
            <el-form-item label="码表名称">
                <el-input v-model="info.name" placeholder="请输入码表名称" maxlength="64" show-word-limit />
            </el-form-item>
            <el-form-item label="是否树形">
                <el-radio-group v-model="info.tree" :disabled="type === 'edit'">
                    <el-radio-button label="0">平铺码表</el-radio-button>
                    <el-radio-button label="1">树形码表</el-radio-button>
                </el-radio-group>
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

interface CodeTableForm {
    id?: string
    code: string
    name: string
    tree: '0' | '1'
    status: '0' | '1'
    remark?: string
}

const props = defineProps<{
    modelValue: boolean
    id?: string
    type: 'add' | 'edit'
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
})
const loading = ref(false)
const saving = ref(false)
const info = ref<CodeTableForm>({ code: '', name: '', tree: '0', status: '1', remark: '' })

const reset = () => {
    info.value = { code: '', name: '', tree: '0', status: '1', remark: '' }
}

const onOpen = async () => {
    reset()
    if (props.type !== 'edit' || !props.id) return
    loading.value = true
    try {
        const data: any = await http.post('/code-table/detail', undefined, { params: { id: props.id } })
        info.value = {
            id: data.id,
            code: data.code || '',
            name: data.name || '',
            tree: data.tree || '0',
            status: data.status || '1',
            remark: data.remark || '',
        }
    } finally {
        loading.value = false
    }
}

const validate = () => {
    if (!info.value.code.trim()) {
        alert('请输入码表编码', 'warning')
        return false
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_.-]{0,63}$/.test(info.value.code)) {
        alert('码表编码必须以字母开头，且只能包含字母、数字、下划线、中划线、点，最长64位', 'warning')
        return false
    }
    if (!info.value.name.trim()) {
        alert('请输入码表名称', 'warning')
        return false
    }
    if (!info.value.tree) {
        alert('请选择码表类型', 'warning')
        return false
    }
    if (!info.value.status) {
        alert('请选择状态', 'warning')
        return false
    }
    return true
}

const submit = async () => {
    if (!validate()) return
    saving.value = true
    try {
        const payload = {
            id: info.value.id,
            code: info.value.code.trim(),
            name: info.value.name.trim(),
            tree: info.value.tree,
            status: info.value.status,
            remark: info.value.remark?.trim() || undefined,
        }
        if (props.type === 'add') {
            await http.post('/code-table/add', payload)
            alert('新增成功', 'success')
        } else {
            await http.post('/code-table/update', payload)
            alert('保存成功', 'success')
        }
        emit('success')
    } finally {
        saving.value = false
    }
}
</script>
