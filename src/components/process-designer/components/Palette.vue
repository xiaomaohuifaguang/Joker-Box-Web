<template>
    <!-- 左侧元素面板 -->
    <div class="diagram-palette">
        <div class="palette-group">
            <div class="palette-group__title">事件</div>
            <div class="palette-row">
                <el-tooltip content="开始节点" placement="right" :show-after="250" :hide-after="0">
                    <div class="palette-tile palette-tile--start" @mousedown="dragInNode('bpmn:startEvent')">
                        <el-icon :size="22">
                            <StartEventIcon />
                        </el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="结束节点" placement="right" :show-after="250" :hide-after="0">
                    <div class="palette-tile palette-tile--end" @mousedown="dragInNode('bpmn:endEvent')">
                        <el-icon :size="22">
                            <EndEventIcon />
                        </el-icon>
                    </div>
                </el-tooltip>
            </div>
        </div>

        <div class="palette-divider"></div>

        <div class="palette-group">
            <div class="palette-group__title">任务</div>
            <div class="palette-row">
                <el-tooltip content="用户任务" placement="right" :show-after="250" :hide-after="0">
                    <div class="palette-tile palette-tile--user" @mousedown="dragInNode('bpmn:userTask')">
                        <el-icon :size="22">
                            <UserTaskIcon />
                        </el-icon>
                    </div>
                </el-tooltip>
            </div>
        </div>

        <div class="palette-divider"></div>

        <div class="palette-group">
            <div class="palette-group__title">网关</div>
            <div class="palette-row">
                <el-tooltip content="排他网关 (XOR)" placement="right" :show-after="250" :hide-after="0">
                    <div class="palette-tile palette-tile--exclusive"
                        @mousedown="dragInNode('bpmn:exclusiveGateway')">
                        <el-icon :size="22">
                            <ExclusiveGatewayIcon />
                        </el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="并行网关 (AND)" placement="right" :show-after="250" :hide-after="0">
                    <div class="palette-tile palette-tile--parallel" @mousedown="dragInNode('bpmn:parallelGateway')">
                        <el-icon :size="22">
                            <ParallelGatewayIcon />
                        </el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="包容网关 (OR)" placement="right" :show-after="250" :hide-after="0">
                    <div class="palette-tile palette-tile--inclusive"
                        @mousedown="dragInNode('bpmn:inclusiveGateway')">
                        <el-icon :size="22">
                            <InclusiveGatewayIcon />
                        </el-icon>
                    </div>
                </el-tooltip>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import StartEventIcon from './icon/StartEvent.vue';
import EndEventIcon from './icon/EndEvent.vue';
import UserTaskIcon from './icon/UserTask.vue';
import ExclusiveGatewayIcon from './icon/ExclusiveGateway.vue';
import ParallelGatewayIcon from './icon/ParallelGateway.vue';
import InclusiveGatewayIcon from './icon/InclusiveGateway.vue';


const emit = defineEmits(['dragInNode']);
const dragInNode = (type: any) => {
    emit('dragInNode', type)
}
</script>

<style scoped lang="scss">
.palette-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.palette-group__title {
    font-size: 11px;
    line-height: 1;
    color: var(--el-text-color-secondary);
    letter-spacing: 1px;
    padding-left: 2px;
    user-select: none;
}

.palette-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.palette-divider {
    height: 1px;
    background: var(--el-border-color-lighter);
    margin: 2px 0;
}

.palette-tile {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-regular);
    cursor: grab;
    transition: background-color .15s ease, color .15s ease, transform .15s ease, box-shadow .15s ease;

    &:hover {
        background: var(--tile-tint, var(--el-color-primary-light-9));
        color: var(--tile-color, var(--el-color-primary));
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, .08);
    }

    &:active {
        cursor: grabbing;
        transform: scale(.94);
        box-shadow: none;
    }
}

/* 语义化配色 —— hover 时显形,静态保持中性 */
.palette-tile--start {
    --tile-color: #52c41a;
    --tile-tint: #f0f9eb;
}

.palette-tile--end {
    --tile-color: #f5222d;
    --tile-tint: #fef0f0;
}

.palette-tile--user {
    --tile-color: #1677ff;
    --tile-tint: #ecf5ff;
}

.palette-tile--exclusive {
    --tile-color: #fa8c16;
    --tile-tint: #fff7e6;
}

.palette-tile--parallel {
    --tile-color: #722ed1;
    --tile-tint: #f4ecff;
}

.palette-tile--inclusive {
    --tile-color: #13c2c2;
    --tile-tint: #e6fffb;
}
</style>
