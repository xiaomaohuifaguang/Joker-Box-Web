<template>
    <el-form label-position="top" :model="data">
        <el-form-item label="名称">
            <el-input :model-value="elementText" @update:model-value="doUpdateElementText" :disabled="readonly" />
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { useProperty } from './shared'

const props = defineProps<{
    lf: any,
    data: any,
    readonly?: boolean
}>()

const emit = defineEmits<{
    (e: 'change'): void
}>()

const { elementText, doUpdateElementText } = useProperty(props, emit)
</script>
