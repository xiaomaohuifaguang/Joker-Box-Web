<template>
    <el-form label-position="top" :model="data">
        <el-form-item label="流程ID">
            <el-input v-model="data.processKey" @input="syncProcessMeta" disabled />
        </el-form-item>
        <el-form-item label="流程名称">
            <el-input v-model="data.processName" @input="syncProcessMeta" :disabled="readonly" />
        </el-form-item>
        <el-form-item label="流程分类">
            <el-input v-model="data.processCategory" @input="syncProcessMeta" :disabled="readonly" />
        </el-form-item>
        <el-form-item label="流程描述">
            <el-input v-model="data.processDescription" type="textarea" :rows="3" @input="syncProcessMeta"
                placeholder="请输入流程描述（导出为 bpmn:documentation）" :disabled="readonly" />
        </el-form-item>

        <!-- 全局表单绑定 -->
        <el-divider />
        <el-form-item label="全局表单">
            <FormSelector v-model="globalFormId" :disabled="readonly || !processDefinitionId"
                @change="onFormChange" />
        </el-form-item>
        <el-form-item v-if="processDefinitionId && !readonly">
            <el-button type="primary" size="small" @click="saveGlobalFormBinding" :disabled="saving"
                :loading="saving">
                保存全局绑定
            </el-button>
        </el-form-item>
        <el-alert v-if="!processDefinitionId" title="请先保存流程后再配置全局表单" type="info" :closable="false"
            show-icon />
    </el-form>
</template>

<script setup lang="ts">
import { http, alert } from '@/utils';
import { ref, watch } from 'vue'
import { setProcessMeta } from '../../core/adapter/CatBPMNAdapter'
import FormSelector from '../FormSelector.vue'

const props = defineProps<{
    lf: any,
    data: any,
    readonly?: boolean
    processDefinitionId?: string | number
}>()

const emit = defineEmits<{
    (e: 'change'): void
}>()

const globalFormId = ref('')
const globalFormVersion = ref('')
const saving = ref(false)

const syncProcessMeta = () => {
    if (!props.data) return
    setProcessMeta({
        '-id': props.data.processKey ?? '',
        '-name': props.data.processName ?? '',
        '-category': props.data.processCategory ?? '',
        'bpmn:documentation': props.data.processDescription ?? ''
    })
    emit('change')
}

const onFormChange = (form: { id: string; name: string; version: string } | null) => {
    globalFormVersion.value = form?.version ?? ''
}

const queryGlobalFormBinding = async () => {
    if (!props.processDefinitionId) return
    try {
        const result = await http.post('/processDefinition/globalFormBinding', null, {
            params: { processDefinitionId: props.processDefinitionId }
        })
        if (result) {
            globalFormId.value = result.formId || ''
            globalFormVersion.value = result.formVersion || ''
        } else {
            globalFormId.value = ''
            globalFormVersion.value = ''
        }
    } catch {
        globalFormId.value = ''
        globalFormVersion.value = ''
    }
}

const saveGlobalFormBinding = async () => {
    if (!props.processDefinitionId) return
    saving.value = true
    try {
        await http.post('/processDefinition/saveGlobalFormBinding', {
            processDefinitionId: props.processDefinitionId,
            formId: globalFormId.value,
            formVersion: globalFormVersion.value,
        })
        alert('全局表单绑定保存成功', 'success')
    } finally {
        saving.value = false
    }
}

watch(
    () => props.processDefinitionId,
    () => {
        queryGlobalFormBinding()
    },
    { immediate: true }
)
</script>
