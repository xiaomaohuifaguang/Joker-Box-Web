<template>
    <el-form label-position="top" :model="data">
        <el-form-item label="类型">
            <el-select v-model="data.type" disabled>
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
        </el-form-item>
        <el-form-item label="名称">
            <el-input :model-value="elementText" @update:model-value="doUpdateElementText" :disabled="readonly" />
        </el-form-item>

        <!-- 开始节点表单绑定 -->
        <el-divider />
        <el-form-item label="绑定表单">
            <FormSelector v-model="nodeFormId" v-model:model-version="nodeFormVersion" :disabled="readonly" @change="onNodeFormChange" />
        </el-form-item>
        <el-form-item>
            <el-checkbox v-model="inheritMainForm" :disabled="readonly || !nodeConfig?.globalFormBinding?.formId"
                @change="updateNodeBinding">
                继承主表单字段
            </el-checkbox>
            <el-text v-if="!nodeConfig?.globalFormBinding?.formId" type="info" size="small" style="margin-left: 8px;"
                tag="span">
                未配置全局表单
            </el-text>
        </el-form-item>
        <el-form-item v-if="!readonly && (nodeFormId || (inheritMainForm && nodeConfig?.globalFormBinding?.formId))">
            <el-button type="default" size="small" @click="showPermissionDialog = true">
                配置字段权限
            </el-button>
        </el-form-item>

        <FieldPermissionDialog v-model="showPermissionDialog" :node-config="nodeConfig" :node-id="data?.id"
            :form-id="nodeFormId" :form-version="nodeFormVersion" :inherit-main-form="inheritMainForm ? '1' : '0'" :readonly="readonly"
            @update:node-config="onPermissionUpdate" />
    </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProperty } from './shared'
import { useNodeFormBinding } from '../../composables/useNodeFormBinding'
import FormSelector from '../FormSelector.vue'
import FieldPermissionDialog from '../FieldPermissionDialog.vue'

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

const options = [
    {
        value: 'bpmn:startEvent',
        label: '开始节点',
    },
    {
        value: 'bpmn:userTask',
        label: '用户任务',
    },
    {
        value: 'bpmn:endEvent',
        label: '结束节点',
    }, {
        value: 'bpmn:exclusiveGateway',
        label: '排他网关',
    }
]
</script>
