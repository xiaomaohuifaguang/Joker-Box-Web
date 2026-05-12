<template>
    <el-form label-position="top" :model="data">
        <el-form-item label="名称">
            <el-input :model-value="elementText" @update:model-value="doUpdateElementText" :disabled="readonly" />
        </el-form-item>
        <el-form-item label="条件表达式" v-if="shouldShowCondition">
            <el-input v-model="condition" clearable placeholder="${approve}" :disabled="readonly" />
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProperty } from './shared'

const props = defineProps<{
    lf: any,
    data: any,
    readonly?: boolean
}>()

const emit = defineEmits<{
    (e: 'change'): void
}>()

const { elementText, doUpdateElementText, doUpdateProperty } = useProperty(props, emit)

const shouldShowCondition = computed(() => {
    if (!props.lf || !props.data?.sourceNodeId) return false
    const sourceNode = props.lf.graphModel?.nodes?.find((node: any) => node.id === props.data.sourceNodeId)
    if (sourceNode?.type !== 'bpmn:exclusiveGateway') return false
    if (sourceNode.properties?.default === props.data.id) return false
    return true
})

const condition = computed({
    get: () => props.data?.properties?.condition || '',
    set: (val) => doUpdateProperty('condition', val)
})
</script>
