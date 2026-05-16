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
        </template>
    </el-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProperty, useSearchOptions } from './shared'

const props = defineProps<{
    lf: any,
    data: any,
    readonly?: boolean
}>()

const emit = defineEmits<{
    (e: 'change'): void
}>()

const { elementText, doUpdateElementText, doUpdateProperty, makeArrayProp } = useProperty(props, emit)

const candidateUsersArray = makeArrayProp('candidateUsers')
const candidateRolesArray = makeArrayProp('candidateRoles')
const candidateGroupsArray = makeArrayProp('candidateGroups')
const candidateDeptsArray = makeArrayProp('candidateDepts')

const userSelectKey = ref(0)
const roleSelectKey = ref(0)
const orgSelectKey = ref(0)

const actionButtonOptions = [
    { value: 'pass', label: '通过' },
    { value: 'reject', label: '拒绝' },
    { value: 'back', label: '驳回' }
]

const backTypeOptions = [
    { value: 'prev', label: '上一节点' },
    { value: 'specific', label: '驳回到指定节点' },
    { value: 'choose', label: '用户自选' }
]

const getActionButtons = (): string[] => {
    const v = props.data?.properties?.actionButtons
    return typeof v === 'string' && v ? v.split(',').filter(Boolean) : ['pass']
}

const isActionButtonActive = (value: string): boolean => {
    return getActionButtons().includes(value)
}

const toggleActionButton = (value: string) => {
    const arr = getActionButtons()
    let newArr: string[]
    if (arr.includes(value)) {
        newArr = arr.filter((item: string) => item !== value)
    } else {
        newArr = [...arr, value]
    }
    doUpdateProperty('actionButtons', newArr.join(','))
    if (!newArr.includes('back')) {
        doUpdateProperty('backType', '')
        doUpdateProperty('backNodeId', '')
    }
}

const showBackConfig = computed(() => isActionButtonActive('back'))

const getPrevNodes = (lf: any, currentNodeId: string) => {
    if (!lf || !currentNodeId) return []

    let nodes: any[] = []
    let edges: any[] = []

    // 优先从 graphModel 读取（实时数据），备选 getGraphData/getGraphRawData
    if (lf.graphModel) {
        const nodeMap = lf.graphModel.nodes
        const edgeMap = lf.graphModel.edges
        if (nodeMap && typeof nodeMap.values === 'function') {
            try {
                nodes = Array.from(nodeMap.values()).map((n: any) => ({
                    id: n.id,
                    text: n.text,
                    type: n.type,
                }))
            } catch (e) { /* ignore */ }
        }
        if (edgeMap && typeof edgeMap.values === 'function') {
            try {
                edges = Array.from(edgeMap.values()).map((e: any) => ({
                    sourceNodeId: e.sourceNodeId,
                    targetNodeId: e.targetNodeId
                }))
            } catch (e) { /* ignore */ }
        }
    }

    if (nodes.length === 0 && lf.getGraphData) {
        try {
            const graphData = lf.getGraphData()
            nodes = (graphData?.nodes || []).map((n: any) => ({ id: n.id, text: n.text, type: n.type }))
            edges = graphData?.edges || []
        } catch (e) {
            console.warn('getGraphData failed', e)
        }
    }

    if (nodes.length === 0 && lf.getGraphRawData) {
        try {
            const rawData = lf.getGraphRawData()
            nodes = (rawData?.nodes || []).map((n: any) => ({ id: n.id, text: n.text, type: n.type }))
            edges = rawData?.edges || []
        } catch (e) {
            console.warn('getGraphRawData failed', e)
        }
    }

    const prevMap = new Map<string, string[]>()
    for (const edge of edges) {
        const source = edge.sourceNodeId
        const target = edge.targetNodeId
        if (source && target) {
            if (!prevMap.has(target)) prevMap.set(target, [])
            prevMap.get(target)!.push(source)
        }
    }

    // 所有前置节点（用于指定节点选择）
    const visited = new Set<string>()
    const queue = [currentNodeId]
    while (queue.length > 0) {
        const curr = queue.shift()!
        if (visited.has(curr)) continue
        visited.add(curr)
        const prevs = prevMap.get(curr) || []
        for (const prev of prevs) {
            if (!visited.has(prev)) queue.push(prev)
        }
    }
    visited.delete(currentNodeId)

    return nodes
        .filter((n: any) => visited.has(n.id))
        .map((n: any) => ({
            id: n.id,
            label: typeof n.text === 'string' ? n.text : (n.text?.value || n.id),
            type: n.type,
        }))
}

const getDirectPrevNodes = (lf: any, currentNodeId: string) => {
    if (!lf || !currentNodeId) return []

    let nodes: any[] = []
    let edges: any[] = []

    if (lf.graphModel) {
        const nodeMap = lf.graphModel.nodes
        const edgeMap = lf.graphModel.edges
        if (nodeMap && typeof nodeMap.values === 'function') {
            try {
                nodes = Array.from(nodeMap.values()).map((n: any) => ({
                    id: n.id,
                    type: n.type,
                }))
            } catch (e) { /* ignore */ }
        }
        if (edgeMap && typeof edgeMap.values === 'function') {
            try {
                edges = Array.from(edgeMap.values()).map((e: any) => ({
                    sourceNodeId: e.sourceNodeId,
                    targetNodeId: e.targetNodeId,
                }))
            } catch (e) { /* ignore */ }
        }
    }

    if (nodes.length === 0 && lf.getGraphData) {
        try {
            const graphData = lf.getGraphData()
            nodes = (graphData?.nodes || []).map((n: any) => ({ id: n.id, type: n.type }))
            edges = graphData?.edges || []
        } catch (e) {
            console.warn('getGraphData failed', e)
        }
    }

    if (nodes.length === 0 && lf.getGraphRawData) {
        try {
            const rawData = lf.getGraphRawData()
            nodes = (rawData?.nodes || []).map((n: any) => ({ id: n.id, type: n.type }))
            edges = rawData?.edges || []
        } catch (e) {
            console.warn('getGraphRawData failed', e)
        }
    }

    const directPrevIds = new Set<string>()
    for (const edge of edges) {
        if (edge.targetNodeId === currentNodeId && edge.sourceNodeId) {
            directPrevIds.add(edge.sourceNodeId)
        }
    }

    return nodes.filter((n: any) => directPrevIds.has(n.id))
}

const isPrevNodeStart = computed(() => {
    if (!props.lf || !props.data?.id) return false
    const directPrevs = getDirectPrevNodes(props.lf, props.data.id)
    return directPrevs.some((n: any) => n.type === 'bpmn:startEvent')
})

const prevNodeOptions = computed(() => {
    if (!props.lf || !props.data?.id) return []
    const allPrevNodes = getPrevNodes(props.lf, props.data.id)
    return allPrevNodes.filter((n: any) => n.type === 'bpmn:userTask')
})

const {
    userCache, roleCache, orgCache,
    userOptions, roleOptions, orgOptions,
    userLoading, roleLoading, orgLoading,
    mergeSelected,
    searchUsers, searchRoles, searchOrgs,
    initUsersByIds, initRolesByIds, initOrgsByIds
} = useSearchOptions()

const userDisplayOptions = computed(() => mergeSelected(userOptions.value, candidateUsersArray.value, userCache.value))
const roleDisplayOptions = computed(() => mergeSelected(roleOptions.value, candidateRolesArray.value, roleCache.value))
const orgDisplayOptions = computed(() => mergeSelected(orgOptions.value, candidateDeptsArray.value, orgCache.value))

watch(
    () => props.data,
    async () => {
        if (candidateUsersArray.value.length > 0) {
            await initUsersByIds(candidateUsersArray.value)
            userSelectKey.value++
        }
        if (candidateRolesArray.value.length > 0) {
            await initRolesByIds(candidateRolesArray.value)
            roleSelectKey.value++
        }
        if (candidateDeptsArray.value.length > 0) {
            await initOrgsByIds(candidateDeptsArray.value)
            orgSelectKey.value++
        }
    },
    { immediate: true }
)

watch(
    () => isPrevNodeStart.value,
    (isStart) => {
        if (isStart && isActionButtonActive('back')) {
            const arr = getActionButtons().filter((item: string) => item !== 'back')
            doUpdateProperty('actionButtons', arr.join(','))
            doUpdateProperty('backType', '')
            doUpdateProperty('backNodeId', '')
        }
    }
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

const approvalTypeOptions = [
    { value: 1, label: '会签' },
    { value: 2, label: '或签' },
    { value: 3, label: '随机1人' },
    { value: 4, label: '认领' }
]
</script>
