<template>
    <div class="property-panel-inner">
        <PropertyHeader type="bpmn:sequenceFlow" :id="data?.id"
            :label-override="isGatewayOutgoing ? '连线 · 网关出边' : '连线'" />

        <el-form label-position="top" :model="data">
            <PropertySection title="基础信息">
                <el-form-item label="名称">
                    <el-input :model-value="elementText" @update:model-value="doUpdateElementText" :disabled="readonly"
                        placeholder="请输入连线名称" />
                </el-form-item>
            </PropertySection>

            <!-- 网关条件配置 -->
            <PropertySection v-if="isGatewayOutgoing" title="条件配置" :hint="conditionModeLabel">
                <!-- 模式切换 -->
                <div class="mode-pills">
                    <span v-for="mode in conditionModes" :key="mode.value" class="mode-pill"
                        :class="{ active: conditionMode === mode.value }" @click="setConditionMode(mode.value)">
                        {{ mode.label }}
                    </span>
                </div>

                <!-- NATIVE 模式 -->
                <template v-if="conditionMode === 'NATIVE'">
                    <NativeConditionEditor v-model="nativeExpression" :form-field-ids="formFieldIds"
                        :readonly="readonly" />
                </template>

                <!-- CUSTOM 模式 -->
                <template v-else-if="conditionMode === 'CUSTOM'">
                    <div class="condition-preview">
                        <ConditionSummary :rule-tree="gatewayCondition?.ruleTree" />
                    </div>
                    <el-button type="primary" size="small" :disabled="readonly" @click="openConditionDialog">
                        配置条件
                    </el-button>
                </template>

                <!-- 默认走向 -->
                <template v-else-if="conditionMode === 'DEFAULT'">
                    <el-alert title="此连线已设为默认走向" description="当所有其他条件都不满足时,流程将自动走此分支" type="success" :closable="false"
                        show-icon />
                </template>
            </PropertySection>
        </el-form>

        <!-- 弹窗 -->
        <GatewayConditionDialog v-if="isGatewayOutgoing" v-model="dialogVisible" :edge-data="edgeData"
            :initial-data="gatewayCondition" :fields="fields" :readonly="readonly" @confirm="onDialogConfirm" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProperty } from './shared'
import { http } from '@/utils'
import ConditionSummary from '../ConditionSummary.vue'
import GatewayConditionDialog from '../GatewayConditionDialog.vue'
import NativeConditionEditor from '../condition-editors/NativeConditionEditor.vue'
import PropertyHeader from './PropertyHeader.vue'
import PropertySection from './PropertySection.vue'
import type { GatewayConditionData } from '../../types/gateway-condition'

const props = defineProps<{
    lf: any,
    data: any,
    readonly?: boolean,
    nodeConfig?: {
        globalFormBinding: any,
        nodeFormBindings: any[],
        nodeFieldPermissions: any[]
    }
}>()

const emit = defineEmits<{
    (e: 'change'): void
}>()

const { elementText, doUpdateElementText, doUpdateProperty } = useProperty(props, emit)

// ============ 网关条件配置 ============

const isGatewayOutgoing = computed(() => {
    const sourceId = props.data.sourceNodeId
    if (!sourceId || !props.lf) return false
    const node = props.lf.getNodeModelById(sourceId)
    if (!node) return false
    return ['bpmn:exclusiveGateway', 'bpmn:inclusiveGateway'].includes(node.type)
})

const gatewayCondition = computed<GatewayConditionData | undefined>({
    get: () => props.data.properties?.gatewayCondition,
    set: (v) => doUpdateProperty('gatewayCondition', v),
})

const conditionMode = computed(() => {
    const gc = gatewayCondition.value
    if (gc?.isDefault) return 'DEFAULT'
    if (gc?.conditionType === 'NATIVE') return 'NATIVE'
    if (gc?.conditionType === 'CUSTOM') return 'CUSTOM'
    return 'CUSTOM'
})

const conditionModes = [
    { label: '传统表达式', value: 'NATIVE' },
    { label: '自定义配置', value: 'CUSTOM' },
    { label: '默认走向', value: 'DEFAULT' },
]

const conditionModeLabel = computed(() => {
    const m = conditionModes.find(x => x.value === conditionMode.value)
    return m?.label ?? ''
})

function setConditionMode(mode: string) {
    if (mode === 'NATIVE') {
        gatewayCondition.value = {
            conditionType: 'NATIVE',
            isDefault: false,
            nativeExpression: gatewayCondition.value?.nativeExpression ?? '',
        }
    } else if (mode === 'CUSTOM') {
        gatewayCondition.value = {
            conditionType: 'CUSTOM',
            isDefault: false,
            ruleTree: gatewayCondition.value?.ruleTree ?? [{ nodeType: 'AND', sort: 0, children: [] }],
        }
    } else if (mode === 'DEFAULT') {
        gatewayCondition.value = { conditionType: null, isDefault: true }
    }
}

const nativeExpression = computed({
    get: () => gatewayCondition.value?.nativeExpression ?? '',
    set: (v) => {
        gatewayCondition.value = {
            ...(gatewayCondition.value ?? {}),
            conditionType: 'NATIVE',
            isDefault: false,
            nativeExpression: v,
        }
    },
})

const dialogVisible = ref(false)
const fields = ref<{ fieldId: string; title: string; groupName: string }[]>([])
const formFieldIds = computed(() => fields.value.map((f) => f.fieldId))

const edgeData = computed(() => ({
    id: props.data.id,
    sourceNodeId: props.data.sourceNodeId,
    targetNodeId: props.data.targetNodeId,
}))

const loadFormFields = async () => {
    const globalForm = props.nodeConfig?.globalFormBinding
    if (!globalForm?.formId) {
        fields.value = []
        return
    }
    try {
        const data = await http.post('/dynamicForm/info', {
            id: globalForm.formId,
            version: globalForm.formVersion,
        })
        const list: { fieldId: string; title: string; groupName: string }[] = []
        if (data?.fields?.length) {
            data.fields.forEach((f: any) => {
                list.push({ fieldId: f.fieldId, title: f.title, groupName: '未分组' })
            })
        }
        if (data?.groups?.length) {
            data.groups.forEach((g: any) => {
                const groupName = g.name || '未命名分组'
                g.fields?.forEach((f: any) => {
                    list.push({ fieldId: f.fieldId, title: f.title, groupName })
                })
            })
        }
        fields.value = list
    } catch (e) {
        fields.value = []
    }
}

watch(
    () => [conditionMode.value, props.nodeConfig?.globalFormBinding?.formId, props.nodeConfig?.globalFormBinding?.formVersion],
    ([mode]) => {
        if (mode === 'NATIVE' || mode === 'CUSTOM') {
            loadFormFields()
        }
    },
    { immediate: true }
)

function openConditionDialog() {
    loadFormFields()
    dialogVisible.value = true
}

function onDialogConfirm(data: GatewayConditionData) {
    gatewayCondition.value = data
}
</script>

<style scoped>
.mode-pills {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
}

.mode-pill {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    border: 1px solid var(--el-border-color);
    transition: all 0.2s;
    user-select: none;
}

.mode-pill:hover {
    background: var(--el-fill-color);
}

.mode-pill.active {
    background: var(--el-color-primary);
    color: #fff;
    border-color: var(--el-color-primary);
    font-weight: 600;
}

.condition-preview {
    margin-bottom: 10px;
    padding: 8px 10px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    min-height: 32px;
}
</style>
