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
    </el-form>
</template>

<script setup lang="ts">
import { setProcessMeta } from '../../core/adapter/CatBPMNAdapter'

const props = defineProps<{
    lf: any,
    data: any,
    readonly?: boolean
}>()

const emit = defineEmits<{
    (e: 'change'): void
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
</script>
