<template>
    <!-- 左侧元素面板 -->
    <div class="diagram-palette">
        <el-card>
            <el-icon :size="40" @mousedown="dragInNode('bpmn:startEvent')">
                <StartEventIcon />
            </el-icon>
        </el-card>
        <el-card>
            <el-icon :size="40" @mousedown="dragInNode('bpmn:userTask')">
                <UserTaskIcon />
            </el-icon>
        </el-card>
        <el-card>
            <el-icon :size="40" @mousedown="dragInNode('bpmn:exclusiveGateway')">
                <ExclusiveGatewayIcon />
            </el-icon>
        </el-card>
        <el-card>
            <el-icon :size="40" @mousedown="dragInNode('bpmn:endEvent')">
                <EndEventIcon />
            </el-icon>
        </el-card>
    </div>

</template>

<script setup lang='ts'>
import Joker from '@/components/icon/Joker.vue';
import StartEventIcon from './icon/StartEvent.vue';
import EndEventIcon from './icon/EndEvent.vue';
import UserTaskIcon from './icon/UserTask.vue';
import ExclusiveGatewayIcon from './icon/ExclusiveGateway.vue';


const emit = defineEmits(['dragInNode']);
const dragInNode = (type: any) => {
    emit('dragInNode', type)
}
</script>

<style scoped lang="scss"></style>
