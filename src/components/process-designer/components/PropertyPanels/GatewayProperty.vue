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
        <!-- 默认路径配置已移至 EdgePropertyPanel 的"默认走向"模式 --
        <el-form-item label="默认路径" v-if="showDefaultFlow">
            <el-select v-model="defaultFlow" clearable placeholder="请选择默认路径" :disabled="readonly">
                <el-option v-for="item in outgoingEdges" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
            <div v-if="showDefaultFlowWarning" class="default-flow-warning">
                <el-icon><Warning /></el-icon>
                <span>存在未设条件的出边且未指定默认路径，流程可能在此处卡住</span>
            </div>
        </el-form-item>
        -->
    </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Warning } from '@element-plus/icons-vue'
import { useProperty } from './shared'
import { validateGateway } from '../../core/validators'

const props = defineProps<{
    lf: any,
    data: any,
    readonly?: boolean
}>()

const emit = defineEmits<{
    (e: 'change'): void
}>()

const { elementText, doUpdateElementText, doUpdateProperty } = useProperty(props, emit)

const options = [
    { value: 'bpmn:startEvent', label: '开始节点' },
    { value: 'bpmn:userTask', label: '用户任务' },
    { value: 'bpmn:endEvent', label: '结束节点' },
    { value: 'bpmn:exclusiveGateway', label: '排他网关' },
    { value: 'bpmn:parallelGateway', label: '并行网关' },
    { value: 'bpmn:inclusiveGateway', label: '包容网关' },
]

// 是否显示默认路径：排他网关和包容网关显示，并行网关不显示
const showDefaultFlow = computed(() =>
    props.data?.type === 'bpmn:exclusiveGateway' || props.data?.type === 'bpmn:inclusiveGateway'
)

const outgoingEdges = computed(() => {
    if (!props.lf || !props.data?.id) return []
    const edges = props.lf.graphModel?.edges || []
    const edgeIds = new Set(edges.map((edge: any) => edge.id))

    // 如果 default 指向的边已不存在，自动清除
    if (props.data?.properties?.default && !edgeIds.has(props.data.properties.default)) {
        props.lf.deleteProperty(props.data.id, 'default')
        emit('change')
    }

    return edges
        .filter((edge: any) => edge.sourceNodeId === props.data.id)
        .map((edge: any) => {
            const text = typeof edge.text === 'string' ? edge.text : edge.text?.value || ''
            return {
                id: edge.id,
                label: text ? `${text} (${edge.id})` : edge.id
            }
        })
})

const defaultFlow = computed({
    get: () => props.data?.properties?.default || '',
    set: (val) => {
        if (!val) {
            if (props.data?.properties?.default !== undefined) {
                // 清除旧的默认流向的 gatewayCondition
                const edges = props.lf?.graphModel?.edges || []
                const prevDefault = props.data.properties.default
                if (prevDefault) {
                    const prevEdge = edges.find((edge: any) => edge.id === prevDefault)
                    if (prevEdge) {
                        props.lf?.setProperties(prevDefault, {
                            ...prevEdge.properties,
                            isDefaultFlow: false,
                        })
                        props.lf?.deleteProperty(prevDefault, 'gatewayCondition')
                    }
                }
                delete props.data.properties.default
                if (props.lf && props.data?.id) {
                    props.lf.deleteProperty(props.data.id, 'default')
                }
                emit('change')
            }
        } else {
            const prevDefault = props.data?.properties?.default
            if (prevDefault !== val) {
                const edges = props.lf?.graphModel?.edges || []
                // 清除旧的默认流向
                if (prevDefault) {
                    const prevEdge = edges.find((edge: any) => edge.id === prevDefault)
                    if (prevEdge) {
                        props.lf?.setProperties(prevDefault, {
                            ...prevEdge.properties,
                            isDefaultFlow: false,
                        })
                        props.lf?.deleteProperty(prevDefault, 'gatewayCondition')
                    }
                }
                // 设置新的默认流向
                const newEdge = edges.find((edge: any) => edge.id === val)
                if (newEdge) {
                    props.lf?.setProperties(val, {
                        ...newEdge.properties,
                        isDefaultFlow: true,
                        gatewayCondition: { conditionType: null, isDefault: true },
                    })
                }
                doUpdateProperty('default', val)
            }
        }
    }
})

// 警告：存在未设条件的出边且未指定默认路径
const showDefaultFlowWarning = computed(() => {
    if (!showDefaultFlow.value) return false
    if (defaultFlow.value) return false
    const warnings = validateGateway(props.data, props.lf)
    return warnings.length > 0
})
</script>

<style scoped>
.default-flow-warning {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 6px;
    padding: 8px 10px;
    border-radius: 4px;
    background: var(--el-color-warning-light-9);
    color: var(--el-color-warning);
    font-size: 12px;
    line-height: 1.5;
}

.default-flow-warning .el-icon {
    flex-shrink: 0;
    margin-top: 1px;
}
</style>
