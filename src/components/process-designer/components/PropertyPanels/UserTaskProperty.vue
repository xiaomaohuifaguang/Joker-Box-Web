<template>
    <el-form label-position="top" :model="data">
        <el-form-item label="ID">
            <el-input :model-value="data.id" disabled />
        </el-form-item>
        <el-form-item label="类型">
            <el-select v-model="data.type" disabled>
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
        </el-form-item>
        <el-form-item label="名称">
            <el-input :model-value="elementText" @update:model-value="doUpdateElementText" :disabled="readonly" />
        </el-form-item>
        <el-form-item label="处理类型">
            <el-select :model-value="data.properties?.approvalType"
                @update:model-value="(v: any) => doUpdateProperty('approvalType', v)" placeholder="请选择处理类型" clearable
                style="width: 100%" :disabled="readonly">
                <el-option v-for="item in approvalTypeOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
            </el-select>
        </el-form-item>
        <el-form-item label="候选人">
            <el-select v-model="candidateUsersArray" multiple filterable remote reserve-keyword
                :remote-method="searchUsers" :loading="userLoading" placeholder="请输入用户名/昵称搜索" style="width: 100%"
                :disabled="readonly" :key="userSelectKey">
                <el-option v-for="item in userDisplayOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
        </el-form-item>
        <el-form-item label="候选角色">
            <el-select v-model="candidateRolesArray" multiple filterable remote reserve-keyword
                :remote-method="searchRoles" :loading="roleLoading" placeholder="请输入角色名搜索" style="width: 100%"
                :disabled="readonly" :key="roleSelectKey">
                <el-option v-for="item in roleDisplayOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
        </el-form-item>
        <el-form-item label="候选组">
            <el-select v-model="candidateGroupsArray" multiple filterable allow-create default-first-option
                placeholder="输入候选组后回车" style="width: 100%" :disabled="readonly" />
        </el-form-item>
        <el-form-item label="候选部门">
            <el-select v-model="candidateDeptsArray" multiple filterable remote reserve-keyword
                :remote-method="searchOrgs" :loading="orgLoading" placeholder="请输入部门名搜索" style="width: 100%"
                :disabled="readonly" :key="orgSelectKey">
                <el-option v-for="item in orgDisplayOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
        </el-form-item>
        <el-form-item label="通过率" v-if="data.properties?.approvalType === 1">
            <el-input-number :model-value="data.properties?.passRate"
                @update:model-value="(v: any) => doUpdateProperty('passRate', v)" :min="0" :max="1" :step="0.1"
                :precision="2" controls-position="right" style="width: 100%" :disabled="readonly" />
        </el-form-item>
        <el-form-item label="处理按钮">
            <div class="action-btn-group">
                <template v-for="item in actionButtonOptions" :key="item.value">
                    <el-button
                        v-if="!(item.value === 'back' && isPrevNodeStart)"
                        :type="isActionButtonActive(item.value) ? 'primary' : 'default'" size="small"
                        @click="toggleActionButton(item.value)" :disabled="readonly">
                        {{ item.label }}
                    </el-button>
                </template>
            </div>
        </el-form-item>
        <template v-if="showBackConfig">
            <el-form-item label="驳回方式">
                <el-select :model-value="data.properties?.backType"
                    @update:model-value="(v: any) => doUpdateProperty('backType', v)" placeholder="请选择驳回方式" clearable
                    style="width: 100%" :disabled="readonly">
                    <el-option v-for="item in backTypeOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="驳回节点" v-if="data.properties?.backType === 'specific'">
                <el-select :model-value="data.properties?.backNodeId"
                    @update:model-value="(v: any) => doUpdateProperty('backNodeId', v)" placeholder="请选择驳回节点" clearable
                    style="width: 100%" :disabled="readonly">
                    <el-option v-for="item in prevNodeOptions" :key="item.id" :label="item.label" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="回退后任务分配策略">
                <el-select :model-value="data.properties?.backAssigneePolicy"
                    @update:model-value="(v: any) => doUpdateProperty('backAssigneePolicy', v)" placeholder="请选择回退后任务分配策略"
                    clearable style="width: 100%" :disabled="readonly">
                    <el-option v-for="item in backAssigneePolicyOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
            </el-form-item>
        </template>

        <!-- 节点表单绑定 -->
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
import { ref, watch } from 'vue'
import { useProperty } from './shared'
import { useNodeFormBinding } from '../../composables/useNodeFormBinding'
import { useGraphTraversal } from '../../composables/useGraphTraversal'
import { useUserSearchSelectors } from '../../composables/useUserSearchSelectors'
import { useActionButtons } from '../../composables/useActionButtons'
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

const { elementText, doUpdateElementText, doUpdateProperty, makeArrayProp } = useProperty(props, emit)

const candidateUsersArray = makeArrayProp('candidateUsers')
const candidateRolesArray = makeArrayProp('candidateRoles')
const candidateGroupsArray = makeArrayProp('candidateGroups')
const candidateDeptsArray = makeArrayProp('candidateDepts')

// ===== 节点表单绑定 =====
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

// ===== 图遍历（直接前驱 / 全部前驱 / 用户任务前驱选项） =====
const { isPrevNodeStart, prevUserTaskOptions: prevNodeOptions } = useGraphTraversal(
    () => props.lf,
    () => props.data?.id
)

// ===== 候选人/角色/部门远程搜索 =====
const {
    searchUsers, searchRoles, searchOrgs,
    userLoading, roleLoading, orgLoading,
    userSelectKey, roleSelectKey, orgSelectKey,
    userDisplayOptions, roleDisplayOptions, orgDisplayOptions,
} = useUserSearchSelectors(
    () => props.data,
    candidateUsersArray,
    candidateRolesArray,
    candidateDeptsArray
)

// ===== 处理按钮 =====
const {
    isActive: isActionButtonActive,
    toggleButton: toggleActionButton,
    showBackConfig,
} = useActionButtons({
    getRaw: () => props.data?.properties?.actionButtons,
    setProperty: doUpdateProperty,
    isPrevNodeStart,
})

const actionButtonOptions = [
    { value: 'pass', label: '通过' },
    { value: 'reject', label: '拒绝' },
    { value: 'back', label: '驳回' },
]

const backTypeOptions = [
    { value: 'prev', label: '上一节点' },
    { value: 'specific', label: '驳回到指定节点' },
    { value: 'choose', label: '用户自选' },
]

const backAssigneePolicyOptions = [
    { value: 'auto', label: '智能默认：有上次办理人则派回，无则按配置重新分配' },
    { value: 'last_handler', label: '派给上次办理人' },
    { value: 'reassign', label: '按节点 candidate 配置重新分配' },
]

// ===== 副作用：进入驳回模式时默认分配策略；切换 approvalType 同步 passRate =====
watch(
    showBackConfig,
    (newVal) => {
        if (!newVal) return
        const policy = props.data?.properties?.backAssigneePolicy
        if (policy === undefined || policy === null || policy === '') {
            doUpdateProperty('backAssigneePolicy', 'auto')
        }
    },
    { immediate: true }
)

watch(
    () => props.data?.properties?.approvalType,
    (newVal, oldVal) => {
        if (newVal === 1) {
            const passRate = props.data?.properties?.passRate
            if (passRate === undefined || passRate === null || passRate === '') {
                doUpdateProperty('passRate', 1)
            }
        } else if (oldVal === 1) {
            doUpdateProperty('passRate', '')
        }
    },
    { immediate: true }
)

// ===== 选项常量 =====
const options = [
    { value: 'bpmn:startEvent', label: '开始节点' },
    { value: 'bpmn:userTask', label: '用户任务' },
    { value: 'bpmn:endEvent', label: '结束节点' },
    { value: 'bpmn:exclusiveGateway', label: '排他网关' },
]

const approvalTypeOptions = [
    { value: 1, label: '会签' },
    { value: 2, label: '或签' },
    { value: 3, label: '随机1人' },
    { value: 4, label: '认领' },
]
</script>
