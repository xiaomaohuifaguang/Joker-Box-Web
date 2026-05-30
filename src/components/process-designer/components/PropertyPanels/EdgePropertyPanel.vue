<template>
    <el-form label-position="top" :model="data">
        <el-form-item label="名称">
            <el-input :model-value="elementText" @update:model-value="doUpdateElementText" :disabled="readonly" />
        </el-form-item>
        <el-form-item label="条件表达式" v-if="shouldShowCondition">
            <el-input v-model="condition" clearable placeholder="${approve}" :disabled="readonly" />
        </el-form-item>

        <!-- 网关条件配置 -->
        <template v-if="isGatewayOutgoing">
            <el-divider />
            <div class="condition-section">
                <div class="section-label">条件配置</div>

                <!-- 模式切换 -->
                <div class="mode-pills">
                    <span
                        v-for="mode in conditionModes"
                        :key="mode.value"
                        class="mode-pill"
                        :class="{ active: conditionMode === mode.value }"
                        @click="setConditionMode(mode.value)"
                    >
                        {{ mode.label }}
                    </span>
                </div>

                <!-- NATIVE 模式 -->
                <template v-if="conditionMode === 'NATIVE'">
                    <el-form-item label="JUEL 表达式">
                        <el-input
                            v-model="nativeExpression"
                            placeholder="${amount > 10000}"
                            :disabled="readonly"
                            style="font-family: monospace"
                        />
                    </el-form-item>
                    <div class="var-hint">
                        <el-tag
                            v-for="v in availableVars"
                            :key="v"
                            size="small"
                            @click="insertVar(v)"
                        >
                            {{ v }}
                        </el-tag>
                    </div>
                </template>

                <!-- CUSTOM 模式 -->
                <template v-else-if="conditionMode === 'CUSTOM'">
                    <div class="condition-preview">
                        <ConditionSummary :rule-tree="gatewayCondition?.ruleTree" />
                    </div>
                    <el-button
                        type="primary"
                        size="small"
                        :disabled="readonly"
                        @click="openConditionDialog"
                    >
                        配置条件
                    </el-button>
                </template>

                <!-- 默认走向 -->
                <template v-else-if="conditionMode === 'DEFAULT'">
                    <el-alert
                        title="此连线已设为默认走向"
                        description="当所有其他条件都不满足时，流程将自动走此分支"
                        type="success"
                        :closable="false"
                        show-icon
                    />
                </template>
            </div>

            <!-- 弹窗 -->
            <GatewayConditionDialog
                v-model="dialogVisible"
                :edge-data="edgeData"
                :initial-data="gatewayCondition"
                :form-fields="formFields"
                :readonly="readonly"
                @confirm="onDialogConfirm"
            />
        </template>
    </el-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProperty } from './shared'
import ConditionSummary from '../ConditionSummary.vue'
import GatewayConditionDialog from '../GatewayConditionDialog.vue'
import type { GatewayConditionData } from '../../types/gateway-condition'

const props = defineProps<{
    lf: any,
    data: any,
    readonly?: boolean
}>()

const emit = defineEmits<{
    (e: 'change'): void
}>()

const { elementText, doUpdateElementText, doUpdateProperty } = useProperty(props, emit)

// 支持条件表达式的网关类型
const CONDITIONAL_GATEWAYS = ['bpmn:exclusiveGateway', 'bpmn:inclusiveGateway']

const shouldShowCondition = computed(() => {
    if (!props.lf || !props.data?.sourceNodeId) return false
    const sourceNode = props.lf.graphModel?.nodes?.find((node: any) => node.id === props.data.sourceNodeId)
    if (!CONDITIONAL_GATEWAYS.includes(sourceNode?.type)) return false
    if (sourceNode.properties?.default === props.data.id) return false
    return true
})

const condition = computed({
    get: () => props.data?.properties?.condition || '',
    set: (val) => doUpdateProperty('condition', val)
})

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
    { label: 'NATIVE', value: 'NATIVE' },
    { label: 'CUSTOM', value: 'CUSTOM' },
    { label: '默认走向', value: 'DEFAULT' },
]

function clearDefaultFlowOnEdge() {
    doUpdateProperty('isDefaultFlow', false)
    // 如果该 edge 是某个网关的默认路径，清除网关的 default 属性
    const sourceId = props.data.sourceNodeId
    if (sourceId && props.lf) {
        const gatewayNode = props.lf.getNodeModelById(sourceId)
        if (gatewayNode?.properties?.default === props.data.id) {
            props.lf.deleteProperty(sourceId, 'default')
        }
    }
}

function setConditionMode(mode: string) {
    if (mode === 'NATIVE') {
        clearDefaultFlowOnEdge()
        gatewayCondition.value = {
            conditionType: 'NATIVE',
            isDefault: false,
            nativeExpression: gatewayCondition.value?.nativeExpression ?? '',
        }
    } else if (mode === 'CUSTOM') {
        clearDefaultFlowOnEdge()
        gatewayCondition.value = {
            conditionType: 'CUSTOM',
            isDefault: false,
            ruleTree: gatewayCondition.value?.ruleTree ?? { nodeType: 'AND', sort: 0, children: [] },
        }
    } else if (mode === 'DEFAULT') {
        gatewayCondition.value = { conditionType: null, isDefault: true }
        doUpdateProperty('isDefaultFlow', true)
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
const formFields = ref<{ fieldId: string; title: string }[]>([])

const edgeData = computed(() => ({
    id: props.data.id,
    sourceNodeId: props.data.sourceNodeId,
    targetNodeId: props.data.targetNodeId,
}))

const builtinVars = [
    'formData',
    '__handler_dept',
    '__handler_role',
    '__prev_handler_dept',
    '__prev_handler_role',
]

const availableVars = computed(() => [...builtinVars])

function insertVar(variable: string) {
    const prefix = variable.startsWith('__') || variable === 'formData' ? '' : '${'
    const suffix = prefix ? '}' : ''
    nativeExpression.value = nativeExpression.value + prefix + variable + suffix
}

function openConditionDialog() {
    dialogVisible.value = true
}

function onDialogConfirm(data: GatewayConditionData) {
    gatewayCondition.value = data
    if (data.isDefault) {
        doUpdateProperty('isDefaultFlow', true)
    } else {
        clearDefaultFlowOnEdge()
    }
}
</script>
