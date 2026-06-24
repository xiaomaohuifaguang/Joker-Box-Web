<template>
    <div class="property-panel-inner">
        <PropertyHeader type="bpmn:startEvent" :id="data?.id" />

        <el-form label-position="top" :model="data">
            <PropertySection title="基础信息">
                <el-form-item label="名称">
                    <el-input :model-value="elementText" @update:model-value="doUpdateElementText" :disabled="readonly"
                        placeholder="请输入节点名称" />
                </el-form-item>
            </PropertySection>

            <PropertySection title="表单与权限" :default-open="false" :hint="formBindingHint">
                <el-form-item label="绑定表单">
                    <FormSelector v-model="nodeFormId" v-model:model-version="nodeFormVersion" :disabled="readonly"
                        @change="onNodeFormChange" />
                </el-form-item>
                <el-form-item>
                    <el-checkbox v-model="inheritMainForm"
                        :disabled="readonly || !nodeConfig?.globalFormBinding?.formId" @change="updateNodeBinding">
                        继承主表单字段
                    </el-checkbox>
                    <el-text v-if="!nodeConfig?.globalFormBinding?.formId" type="info" size="small"
                        style="margin-left: 8px;" tag="span">
                        未配置全局表单
                    </el-text>
                </el-form-item>
                <el-form-item
                    v-if="!readonly && (nodeFormId || (inheritMainForm && nodeConfig?.globalFormBinding?.formId))">
                    <el-button type="default" size="small" @click="showPermissionDialog = true">
                        配置字段权限
                    </el-button>
                </el-form-item>
            </PropertySection>
        </el-form>

        <FieldPermissionDialog v-model="showPermissionDialog" :node-config="nodeConfig" :node-id="data?.id"
            :form-id="nodeFormId" :form-version="nodeFormVersion" :inherit-main-form="inheritMainForm ? '1' : '0'"
            :readonly="readonly" @update:node-config="onPermissionUpdate" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProperty } from './shared'
import { useNodeFormBinding } from '../../composables/useNodeFormBinding'
import FormSelector from '../FormSelector.vue'
import FieldPermissionDialog from '../FieldPermissionDialog.vue'
import PropertyHeader from './PropertyHeader.vue'
import PropertySection from './PropertySection.vue'

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

const { elementText, doUpdateElementText } = useProperty(props, emit)

const showPermissionDialog = ref(false)

const {
    nodeFormId,
    nodeFormVersion,
    inheritMainForm,
    onNodeFormChange,
    updateNodeBinding,
} = useNodeFormBinding({
    getNodeId: () => props.data?.id,
    getNodeConfig: () => props.nodeConfig,
    emitUpdate: (config) => emit('update:nodeConfig', config),
})

const onPermissionUpdate = (newConfig: any) => {
    emit('update:nodeConfig', newConfig)
}

const formBindingHint = computed(() => {
    if (nodeFormId.value) return '已绑定独立表单'
    if (inheritMainForm.value) return '继承主表单'
    return ''
})
</script>
