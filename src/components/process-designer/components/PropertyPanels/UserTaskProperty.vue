<template>
    <div class="property-panel-inner">
        <PropertyHeader type="bpmn:userTask" :id="data?.id" />

        <el-form label-position="top" :model="data">
            <!-- 基础信息 -->
            <PropertySection title="基础信息">
                <el-form-item label="名称">
                    <el-input :model-value="elementText" @update:model-value="doUpdateElementText" :disabled="readonly"
                        placeholder="请输入节点名称" />
                </el-form-item>
            </PropertySection>

            <!-- 任务分配 -->
            <PropertySection title="任务分配" :badge="candidateBadge" :hint="approvalTypeLabel">
                <el-form-item label="处理类型">
                    <el-select :model-value="data.properties?.approvalType"
                        @update:model-value="(v: any) => doUpdateProperty('approvalType', v)" placeholder="请选择处理类型"
                        clearable style="width: 100%" :disabled="readonly">
                        <el-option v-for="item in approvalTypeOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>

                <el-form-item label="通过率" v-if="data.properties?.approvalType === 1">
                    <el-input-number :model-value="data.properties?.passRate"
                        @update:model-value="(v: any) => doUpdateProperty('passRate', v)" :min="0" :max="1" :step="0.1"
                        :precision="2" controls-position="right" style="width: 100%" :disabled="readonly" />
                </el-form-item>

                <el-alert v-if="noCandidate" type="warning" :closable="false" show-icon
                    title="请至少配置一项候选人/角色/组/部门" style="margin-bottom: 12px" />

                <el-form-item label="候选人">
                    <el-select v-model="candidateUsersArray" multiple filterable remote reserve-keyword
                        :remote-method="searchUsers" :loading="userLoading" placeholder="请输入用户名/昵称搜索"
                        style="width: 100%" :disabled="readonly" :key="userSelectKey">
                        <el-option v-for="item in userDisplayOptions" :key="item.id" :label="item.label"
                            :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="候选角色">
                    <el-select v-model="candidateRolesArray" multiple filterable remote reserve-keyword
                        :remote-method="searchRoles" :loading="roleLoading" placeholder="请输入角色名搜索" style="width: 100%"
                        :disabled="readonly" :key="roleSelectKey">
                        <el-option v-for="item in roleDisplayOptions" :key="item.id" :label="item.label"
                            :value="item.id" />
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
                        <el-option v-for="item in orgDisplayOptions" :key="item.id" :label="item.label"
                            :value="item.id" />
                    </el-select>
                </el-form-item>
            </PropertySection>

            <!-- 处理按钮 -->
            <PropertySection title="处理按钮" :hint="actionButtonsHint">
                <el-checkbox-group :model-value="activeButtons" @update:model-value="onActionButtonsChange"
                    :disabled="readonly">
                    <el-checkbox v-for="item in actionButtonOptions" :key="item.value" :value="item.value"
                        :disabled="readonly || (item.value === 'back' && isPrevNodeStart)">
                        {{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
                <el-text v-if="isPrevNodeStart" type="info" size="small" tag="div"
                    style="margin-top: 6px; line-height: 1.4;">
                    上一节点为开始节点,不可启用"驳回"
                </el-text>
            </PropertySection>

            <!-- 驳回与回退 —— 启用 back 后才显示,且强制展开 -->
            <PropertySection v-if="showBackConfig" title="驳回与回退" :force-open="showBackConfig">
                <el-form-item label="驳回方式">
                    <el-select :model-value="data.properties?.backType"
                        @update:model-value="(v: any) => doUpdateProperty('backType', v)" placeholder="请选择驳回方式"
                        clearable style="width: 100%" :disabled="readonly">
                        <el-option v-for="item in backTypeOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="驳回节点" v-if="data.properties?.backType === 'specific'">
                    <el-select :model-value="data.properties?.backNodeId"
                        @update:model-value="(v: any) => doUpdateProperty('backNodeId', v)" placeholder="请选择驳回节点"
                        clearable style="width: 100%" :disabled="readonly">
                        <el-option v-for="item in prevNodeOptions" :key="item.id" :label="item.label" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="回退后任务分配策略">
                    <el-select :model-value="data.properties?.backAssigneePolicy"
                        @update:model-value="(v: any) => doUpdateProperty('backAssigneePolicy', v)"
                        placeholder="请选择回退后任务分配策略" clearable style="width: 100%" :disabled="readonly">
                        <el-option v-for="item in backAssigneePolicyOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
            </PropertySection>

            <!-- 表单与权限 -->
            <PropertySection title="表单与权限" :default-open="false" :badge="permissionBadge" :hint="formBindingHint">
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
                        <el-text v-if="permissionBadge" tag="span" size="small"
                            style="margin-left: 4px; color: var(--el-color-primary);">
                            · 已设置 {{ permissionBadge }} 项
                        </el-text>
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
import { ref, watch, computed } from 'vue'
import { useProperty } from './shared'
import { useNodeFormBinding } from '../../composables/useNodeFormBinding'
import { useGraphTraversal } from '../../composables/useGraphTraversal'
import { useUserSearchSelectors } from '../../composables/useUserSearchSelectors'
import { useActionButtons } from '../../composables/useActionButtons'
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

// ===== 图遍历(直接前驱 / 全部前驱 / 用户任务前驱选项) =====
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
    toggleButton: toggleActionButton,
    showBackConfig,
} = useActionButtons({
    getRaw: () => props.data?.properties?.actionButtons,
    setProperty: doUpdateProperty,
    isPrevNodeStart,
})

// el-checkbox-group 需要"当前选中"的数组,这里从 raw 解析;空字符串视为默认 ['pass']
const activeButtons = computed<string[]>(() => {
    const v = props.data?.properties?.actionButtons
    return typeof v === 'string' && v ? v.split(',').filter(Boolean) : ['pass']
})

const actionButtonOptions = [
    { value: 'pass', label: '通过' },
    { value: 'reject', label: '拒绝' },
    { value: 'back', label: '驳回' },
]

// 将 checkbox-group 的整体变化拆成单个 toggleButton 调用,
// 复用 useActionButtons 里"清空 back 配置"等副作用逻辑
function onActionButtonsChange(next: string[] | any) {
    const arr: string[] = Array.isArray(next) ? next : []
    const prev = activeButtons.value
    const added = arr.filter(v => !prev.includes(v))
    const removed = prev.filter(v => !arr.includes(v))
    added.forEach(toggleActionButton)
    removed.forEach(toggleActionButton)
}

const backTypeOptions = [
    { value: 'prev', label: '上一节点' },
    { value: 'specific', label: '驳回到指定节点' },
    { value: 'choose', label: '用户自选' },
]

const backAssigneePolicyOptions = [
    { value: 'auto', label: '智能默认:有上次办理人则派回,无则按配置重新分配' },
    { value: 'last_handler', label: '派给上次办理人' },
    { value: 'reassign', label: '按节点 candidate 配置重新分配' },
]

// ===== 副作用:进入驳回模式时默认分配策略;切换 approvalType 同步 passRate =====
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
const approvalTypeOptions = [
    { value: 1, label: '会签' },
    { value: 2, label: '或签' },
    { value: 3, label: '随机1人' },
    { value: 4, label: '认领' },
]

// ===== Section 角标/摘要 =====
const candidateBadge = computed(() => {
    const n =
        candidateUsersArray.value.length +
        candidateRolesArray.value.length +
        candidateGroupsArray.value.length +
        candidateDeptsArray.value.length
    return n > 0 ? String(n) : ''
})

const noCandidate = computed(() => candidateBadge.value === '')

const approvalTypeLabel = computed(() => {
    const t = props.data?.properties?.approvalType
    const found = approvalTypeOptions.find(o => o.value === t)
    return found ? found.label : ''
})

const actionButtonsHint = computed(() => {
    const labels = activeButtons.value
        .map(v => actionButtonOptions.find(o => o.value === v)?.label)
        .filter(Boolean) as string[]
    return labels.join(' / ')
})

const permissionBadge = computed(() => {
    const list = props.nodeConfig?.nodeFieldPermissions ?? []
    const mine = list.filter((p: any) => String(p.nodeId) === String(props.data?.id))
    return mine.length > 0 ? String(mine.length) : ''
})

const formBindingHint = computed(() => {
    if (nodeFormId.value) return '已绑定独立表单'
    if (inheritMainForm.value) return '继承主表单'
    return ''
})
</script>

<style scoped>
.property-panel-inner {
    display: flex;
    flex-direction: column;
}
</style>
