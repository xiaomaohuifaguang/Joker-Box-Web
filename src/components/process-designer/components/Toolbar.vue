<template>
    <!-- 顶部工具栏 -->
    <div>
        <el-card>
            <el-button @click="lf.extension.dagre.layout({
                rankdir: 'LR',   // 从上到下的布局方向
                align: 'UL',     // 上左对齐
                nodesep: 60,     // 节点间距
                ranksep: 70      // 层级间距
            })">
                自动布局
            </el-button>
            <el-button @click="lf.getSnapshot('流程图')">
                导出图片
            </el-button>
            <el-button @click=" code_dialog = true; viewCode.value = lf.getGraphData(); viewCode.type = 'xml'">
                查看xml
            </el-button>
            <el-button @click=" code_dialog = true; viewCode.value = lf.getGraphRawData(); viewCode.type = 'json'">
                查看json
            </el-button>
            <el-button @click=" lf.clearData()">
                清空画布
            </el-button>
        </el-card>
        <el-dialog v-model="code_dialog">
            <CodeDisplay :code="viewCode.value" :language="viewCode.type" />
        </el-dialog>
    </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import CodeDisplay from '@/components/media/CodeDisplay.vue';

const props = defineProps<{
    lf: any
}>()

const code_dialog = ref(false);
const viewCode = ref({
    value: "",
    type: ""
});

</script>

<style></style>