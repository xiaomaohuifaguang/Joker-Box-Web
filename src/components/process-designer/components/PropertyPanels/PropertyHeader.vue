<template>
    <!-- Property 面板顶部 Header —— 节点徽标 + 中文名 + ID -->
    <div class="property-header" :style="{ '--accent': meta.color, '--accent-tint': meta.tint }">
        <div class="property-header__badge">
            <component :is="iconComponent" v-if="iconComponent" />
            <span v-else class="property-header__dot" />
        </div>
        <div class="property-header__main">
            <div class="property-header__title">{{ meta.label }}</div>
            <div v-if="id" class="property-header__id" :title="id">{{ id }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getNodeMeta } from './nodeMeta'
import StartEventIcon from '../icon/StartEvent.vue'
import EndEventIcon from '../icon/EndEvent.vue'
import UserTaskIcon from '../icon/UserTask.vue'
import ExclusiveGatewayIcon from '../icon/ExclusiveGateway.vue'
import ParallelGatewayIcon from '../icon/ParallelGateway.vue'
import InclusiveGatewayIcon from '../icon/InclusiveGateway.vue'

const props = defineProps<{
    type?: string
    id?: string
    /** 覆盖默认标签 —— 用于"连线 (条件)"这种带后缀的场景 */
    labelOverride?: string
}>()

const ICONS: Record<string, any> = {
    'bpmn:startEvent': StartEventIcon,
    'bpmn:endEvent': EndEventIcon,
    'bpmn:userTask': UserTaskIcon,
    'bpmn:exclusiveGateway': ExclusiveGatewayIcon,
    'bpmn:parallelGateway': ParallelGatewayIcon,
    'bpmn:inclusiveGateway': InclusiveGatewayIcon,
}

const iconComponent = computed(() => (props.type ? ICONS[props.type] : null))
const meta = computed(() => {
    const m = getNodeMeta(props.type)
    return props.labelOverride ? { ...m, label: props.labelOverride } : m
})
</script>

<style scoped>
.property-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 4px 14px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

.property-header__badge {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--accent-tint);
    color: var(--accent);
    font-size: 18px;
}

.property-header__badge :deep(svg) {
    width: 1em;
    height: 1em;
}

.property-header__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
}

.property-header__main {
    flex: 1;
    min-width: 0;
}

.property-header__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.2;
}

.property-header__id {
    margin-top: 3px;
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
