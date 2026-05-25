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
            <FormSelector v-model="globalFormId" :disabled="readonly" @change="onFormChange" />
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { setProcessMeta } from '../../core/adapter/CatBPMNAdapter'
import FormSelector from '../FormSelector.vue'

const props = defineProps<{
    lf: any,
    data: any,
    readonly?: boolean
    processDefinitionId?: string | number
    nodeConfig?: {
        globalFormBinding: any
        nodeFormBindings: any[]
        nodeFieldPermissions: any[]
    }
}>()

const emit = defineEmits<{
    (e: 'change'): void
    (e: 'update:nodeConfig', data: any): void
}>()

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

// 从 nodeConfig 中读取当前全局表单绑定
const globalFormBinding = computed(() => props.nodeConfig?.globalFormBinding)
const globalFormId = ref('')
const globalFormVersion = ref('')

const onFormChange = (form: { id: string; name: string; version: string } | null) => {
    globalFormVersion.value = form?.version ?? ''
    updateGlobalFormBinding()
}

const updateGlobalFormBinding = () => {
    if (!props.nodeConfig) return
    const binding = globalFormId.value
        ? { formId: globalFormId.value, formVersion: globalFormVersion.value }
        : null
    emit('update:nodeConfig', {
        ...props.nodeConfig,
        globalFormBinding: binding
    })
}

// 同步外部 nodeConfig 到本地状态
watch(
    () => globalFormBinding.value,
    (binding) => {
        globalFormId.value = binding?.formId || ''
        globalFormVersion.value = binding?.formVersion || ''
    },
    { immediate: true }
)
</script>
