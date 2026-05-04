<template>
    <!-- 右侧属性面板 -->
    <div class="diagram-panel">
        <el-form label-position="top" :model="data" v-if="itemType != 'init' && data">
            <!-- 流程 -->
            <template v-if="itemType == 'process'">
                <el-form-item label="流程ID">
                    <el-input v-model="data.processKey" @input="syncProcessMeta" disabled />
                </el-form-item>
                <el-form-item label="流程名称">
                    <el-input v-model="data.processName" @input="syncProcessMeta" />
                </el-form-item>
                <el-form-item label="流程分类">
                    <el-input v-model="data.processCategory" @input="syncProcessMeta" />
                </el-form-item>
                <el-form-item label="流程描述">
                    <el-input v-model="data.processDescription" type="textarea" :rows="3" @input="syncProcessMeta"
                        placeholder="请输入流程描述（导出为 bpmn:documentation）" />
                </el-form-item>
            </template>
            <!-- 节点 -->
            <template v-if="itemType == 'node'">
                <el-form-item label="类型">
                    <el-select v-model="data.type" disabled>
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="名称">
                    <el-input :model-value="elementText" @update:model-value="updateElementText" />
                </el-form-item>
                <!-- 用户任务专属配置 -->
                <template v-if="data.type === 'bpmn:userTask'">
                    <el-form-item label="处理类型">
                        <el-select :model-value="data.properties?.approvalType"
                            @update:model-value="(v: any) => updateProperty('approvalType', v)" placeholder="请选择处理类型"
                            clearable style="width: 100%">
                            <el-option v-for="item in approvalTypeOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="候选人">
                        <el-select v-model="candidateUsersArray" multiple filterable remote reserve-keyword
                            :remote-method="searchUsers" :loading="userLoading" placeholder="请输入用户名/昵称搜索"
                            style="width: 100%">
                            <el-option v-for="item in userDisplayOptions" :key="item.id" :label="item.label"
                                :value="item.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="候选角色">
                        <el-select v-model="candidateRolesArray" multiple filterable remote reserve-keyword
                            :remote-method="searchRoles" :loading="roleLoading" placeholder="请输入角色名搜索"
                            style="width: 100%">
                            <el-option v-for="item in roleDisplayOptions" :key="item.id" :label="item.label"
                                :value="item.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="候选组">
                        <el-select v-model="candidateGroupsArray" multiple filterable allow-create default-first-option
                            placeholder="输入候选组后回车" style="width: 100%" />
                    </el-form-item>
                    <el-form-item label="候选部门">
                        <el-select v-model="candidateDeptsArray" multiple filterable remote reserve-keyword
                            :remote-method="searchOrgs" :loading="orgLoading" placeholder="请输入部门名搜索"
                            style="width: 100%">
                            <el-option v-for="item in orgDisplayOptions" :key="item.id" :label="item.label"
                                :value="item.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="通过率" v-if="data.properties?.approvalType === 1">
                        <el-input-number :model-value="data.properties?.passRate"
                            @update:model-value="(v: any) => updateProperty('passRate', v)" :min="0" :max="1" :step="0.1"
                            :precision="2" controls-position="right" style="width: 100%" />
                    </el-form-item>
                </template>
            </template>
            <!-- 连线 -->
            <template v-if="itemType == 'edge'">
                <el-form-item label="名称">
                    <el-input :model-value="elementText" @update:model-value="updateElementText" />
                </el-form-item>
            </template>
        </el-form>
        <!-- <CodeDisplay :code="data" language="json" v-if="data" />
        <CodeDisplay :code="lf.getGraphRawData()" language="json" v-if="lf && !data" /> -->
    </div>
</template>

<script setup lang='ts'>
import { computed, ref, watch } from 'vue';
import { http } from '@/utils';
import { setProcessMeta } from '../core/adapter/CatBPMNAdapter';

const props = defineProps<{
    lf: any,
    data: any,
    itemType: 'process' | 'node' | 'edge' | 'init'
}>()

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

const elementText = computed<string>(() => {
    const t = props.data?.text
    if (typeof t === 'string') return t
    return t?.value ?? ''
})

const updateElementText = (value: string) => {
    if (props.lf && props.data?.id) {
        props.lf.updateText(props.data.id, value)
    }
    if (props.data) {
        if (typeof props.data.text === 'object' && props.data.text !== null) {
            props.data.text.value = value
        } else {
            props.data.text = value
        }
    }
}

const updateProperty = (key: string, value: any) => {
    if (!props.data) return
    if (!props.data.properties) props.data.properties = {}
    props.data.properties[key] = value
    if (props.lf && props.data.id) {
        props.lf.setProperties(props.data.id, { ...props.data.properties })
    }
}

const makeArrayProp = (key: string) => computed<string[]>({
    get: () => {
        const v = props.data?.properties?.[key]
        return typeof v === 'string' && v ? v.split(',').filter(Boolean) : []
    },
    set: (val: string[]) => {
        updateProperty(key, val.join(','))
    }
})

const candidateUsersArray = makeArrayProp('candidateUsers')
const candidateRolesArray = makeArrayProp('candidateRoles')
const candidateGroupsArray = makeArrayProp('candidateGroups')
const candidateDeptsArray = makeArrayProp('candidateDepts')

type Option = { id: string, label: string }

const userCache = ref<Map<string, string>>(new Map())
const roleCache = ref<Map<string, string>>(new Map())
const orgCache = ref<Map<string, string>>(new Map())

const userOptions = ref<Option[]>([])
const roleOptions = ref<Option[]>([])
const orgOptions = ref<Option[]>([])

const userLoading = ref(false)
const roleLoading = ref(false)
const orgLoading = ref(false)

const mergeSelected = (opts: Option[], selected: string[], cache: Map<string, string>): Option[] => {
    const ids = new Set(opts.map(o => o.id))
    const merged = [...opts]
    for (const id of selected) {
        if (id && !ids.has(id)) {
            merged.push({ id, label: cache.get(id) ?? id })
        }
    }
    return merged
}

const userDisplayOptions = computed(() => mergeSelected(userOptions.value, candidateUsersArray.value, userCache.value))
const roleDisplayOptions = computed(() => mergeSelected(roleOptions.value, candidateRolesArray.value, roleCache.value))
const orgDisplayOptions = computed(() => mergeSelected(orgOptions.value, candidateDeptsArray.value, orgCache.value))

const searchUsers = async (query: string) => {
    userLoading.value = true
    try {
        const result = await http.post('/user/queryPage', { current: 1, size: 50, search: query || '' })
        const records: any[] = result?.records || []
        userOptions.value = records.map((u: any) => {
            const id = String(u.id)
            const label = u.nickname ? `${u.nickname}(${u.username})` : u.username
            userCache.value.set(id, label)
            return { id, label }
        })
    } finally {
        userLoading.value = false
    }
}

const searchRoles = async (query: string) => {
    roleLoading.value = true
    try {
        const result = await http.post('/role/queryPage', { current: 1, size: 50, search: query || '' })
        const records: any[] = result?.records || []
        roleOptions.value = records.map((r: any) => {
            const id = String(r.id)
            const label = r.name
            roleCache.value.set(id, label)
            return { id, label }
        })
    } finally {
        roleLoading.value = false
    }
}

const searchOrgs = async (query: string) => {
    orgLoading.value = true
    try {
        const result = await http.post('/org/queryPage', { current: 1, size: 50, search: query || '' })
        const records: any[] = result?.records || []
        orgOptions.value = records.map((o: any) => {
            const id = String(o.id)
            const label = o.name
            orgCache.value.set(id, label)
            return { id, label }
        })
    } finally {
        orgLoading.value = false
    }
}

watch(
    () => [props.itemType, props.data?.type],
    ([itemType, type]) => {
        if (itemType === 'node' && type === 'bpmn:userTask') {
            if (userOptions.value.length === 0) searchUsers('')
            if (roleOptions.value.length === 0) searchRoles('')
            if (orgOptions.value.length === 0) searchOrgs('')
        }
    },
    { immediate: true }
)

const syncProcessMeta = () => {
    if (!props.data) return
    setProcessMeta({
        '-id': props.data.processKey ?? '',
        '-name': props.data.processName ?? '',
        '-category': props.data.processCategory ?? '',
        'bpmn:documentation': props.data.processDescription ?? ''
    })
}
</script>

<style scoped>
.diagram-panel {
    padding-left: 1rem;
    padding-right: 1rem;
}
</style>
