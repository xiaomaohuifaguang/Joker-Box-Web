<template>
    <!-- 右侧属性面板 -->
    <div class="diagram-panel">
        <el-form label-position="top" :model="data" v-if="itemType != 'init' && data">
            <ProcessPropertyPanel v-if="itemType == 'process'" :lf="lf" :data="data" :readonly="readonly" @change="handleChange" />
            <template v-if="itemType == 'node'">
                <StartEventProperty v-if="data.type === 'bpmn:startEvent'" :lf="lf" :data="data" :readonly="readonly"
                    @change="handleChange" />
                <UserTaskProperty v-else-if="data.type === 'bpmn:userTask'" :lf="lf" :data="data" :readonly="readonly"
                    @change="handleChange" />
                <EndEventProperty v-else-if="data.type === 'bpmn:endEvent'" :lf="lf" :data="data" :readonly="readonly"
                    @change="handleChange" />
                <GatewayProperty v-else-if="data.type === 'bpmn:exclusiveGateway'" :lf="lf" :data="data" :readonly="readonly"
                    @change="handleChange" />
            </template>
            <EdgePropertyPanel v-if="itemType == 'edge'" :lf="lf" :data="data" :readonly="readonly" @change="handleChange" />
        </el-form>
    </div>
</template>

<script setup lang='ts'>
import ProcessPropertyPanel from './PropertyPanels/ProcessPropertyPanel.vue'
import StartEventProperty from './PropertyPanels/StartEventProperty.vue'
import UserTaskProperty from './PropertyPanels/UserTaskProperty.vue'
import EndEventProperty from './PropertyPanels/EndEventProperty.vue'
import GatewayProperty from './PropertyPanels/GatewayProperty.vue'
import EdgePropertyPanel from './PropertyPanels/EdgePropertyPanel.vue'

const props = defineProps<{
    lf: any,
    data: any,
    itemType: 'process' | 'node' | 'edge' | 'init',
    readonly?: boolean
}>()

const emit = defineEmits<{
    (e: 'change'): void
}>()

const handleChange = () => {
    emit('change')
}
</script>

<style scoped>
.diagram-panel {
    padding-left: 1rem;
    padding-right: 1rem;
}
</style>