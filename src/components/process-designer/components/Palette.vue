<template>
    <!-- 左侧元素面板 -->
    <div class="diagram-palette">
        <el-card @mousedown="dragInNode('bpmn:startEvent')">
            <el-icon :size="40">
                <Joker />
            </el-icon>
        </el-card>
        <el-card @mousedown="dragInNode('bpmn:userTask')">
            <el-icon :size="40">
                <Joker />
            </el-icon>
        </el-card>
        <el-card @mousedown="dragInNode('bpmn:endEvent')">
            <el-icon :size="40">
                <Joker />
            </el-icon>
        </el-card>
        <el-card @mousedown="dragInNode('bpmn:exclusiveGateway')">
            <el-icon :size="40">
                <Joker />
            </el-icon>
        </el-card>

    </div>

</template>

<script setup lang='ts'>
import Joker from '@/components/icon/Joker.vue';
const emit = defineEmits(['dragInNode']);
const dragInNode = (type: any) => {
    emit('dragInNode', type)
}
</script>

<style scoped></style>