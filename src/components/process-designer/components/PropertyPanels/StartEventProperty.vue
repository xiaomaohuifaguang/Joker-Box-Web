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
            <FormSelector v-model="nodeFormId" :disabled="readonly" @change="onNodeFormChange" />
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
            :form-id="nodeFormId" :inherit-main-form="inheritMainForm ? '1' : '0'" :readonly="readonly"
            @update:node-config="onPermissionUpdate" />
    </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProperty } from './shared'
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

const nodeFormId = ref('')
const nodeFormVersion = ref('')
const inheritMainForm = ref(false)
const showPermissionDialog = ref(false)

const onNodeFormChange = (form: { id: string; name: string; version: string } | null) => {
    nodeFormVersion.value = form?.version ?? ''
    updateNodeBinding()
}

const updateNodeBinding = () => {
    if (!props.nodeConfig || !props.data?.id) return
    const nodeId = String(props.data.id)
    const bindings = [...props.nodeConfig.nodeFormBindings]
    const idx = bindings.findIndex((b: any) => String(b.nodeId) === nodeId)
    const oldFormId = idx >= 0 ? bindings[idx].formId : ''
    const newFormId = nodeFormId.value

    let newPermissions = props.nodeConfig.nodeFieldPermissions
    if (oldFormId !== newFormId) {
        newPermissions = newPermissions.filter((p: any) => String(p.nodeId) !== nodeId)
    }

    const hasBinding = newFormId || inheritMainForm.value
    if (hasBinding) {
        const item = {
            formId: newFormId,
            formVersion: nodeFormVersion.value,
            nodeId: props.data.id,
            inheritMainForm: inheritMainForm.value ? '1' : '0',
        }
        if (idx >= 0) {
            bindings[idx] = item
        } else {
            bindings.push(item)
        }
    } else {
        if (idx >= 0) {
            bindings.splice(idx, 1)
        }
    }
    emit('update:nodeConfig', {
        ...props.nodeConfig,
        nodeFormBindings: bindings,
        nodeFieldPermissions: newPermissions,
    })
}

const onPermissionUpdate = (newConfig: any) => {
    emit('update:nodeConfig', newConfig)
}

const readNodeBinding = () => {
    if (!props.nodeConfig || !props.data?.id) {
        nodeFormId.value = ''
        nodeFormVersion.value = ''
        inheritMainForm.value = false
        return
    }
    const binding = props.nodeConfig.nodeFormBindings.find((b: any) => String(b.nodeId) === String(props.data.id))
    if (binding) {
        nodeFormId.value = binding.formId || ''
        nodeFormVersion.value = binding.formVersion || ''
        inheritMainForm.value = binding.inheritMainForm === '1'
    } else {
        nodeFormId.value = ''
        nodeFormVersion.value = ''
        inheritMainForm.value = false
    }
}

watch(
    () => props.data?.id,
    () => {
        readNodeBinding()
    },
    { immediate: true }
)

watch(
    () => props.nodeConfig,
    () => {
        readNodeBinding()
    },
    { deep: true }
)

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
