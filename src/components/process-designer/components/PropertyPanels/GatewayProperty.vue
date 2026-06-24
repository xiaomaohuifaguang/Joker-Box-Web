<template>
    <div class="property-panel-inner">
        <PropertyHeader :type="data?.type" :id="data?.id" />

        <el-form label-position="top" :model="data">
            <PropertySection title="基础信息">
                <el-form-item label="名称">
                    <el-input :model-value="elementText" @update:model-value="doUpdateElementText" :disabled="readonly"
                        placeholder="请输入节点名称" />
                </el-form-item>
            </PropertySection>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { useProperty } from './shared'
import PropertyHeader from './PropertyHeader.vue'
import PropertySection from './PropertySection.vue'

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
