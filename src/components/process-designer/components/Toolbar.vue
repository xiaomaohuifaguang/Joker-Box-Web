<template>
    <!-- 顶部工具栏 -->
    <div>
        <el-card>
            <!-- 自动布局 —— 主按钮走"高质量"档(ELK,边交叉最少),下拉可切方向/间距/算法 -->
            <el-dropdown split-button @click="runLayout()" trigger="click">
                <template #default>自动布局</template>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item disabled>算法</el-dropdown-item>
                        <el-dropdown-item @click="setEngine('elk')">
                            <el-icon v-if="engine === 'elk'"><Check /></el-icon>
                            <span :style="{ marginLeft: engine === 'elk' ? '0' : '16px' }">
                                高质量 (ELK,边交叉最少)
                            </span>
                        </el-dropdown-item>
                        <el-dropdown-item @click="setEngine('dagre')">
                            <el-icon v-if="engine === 'dagre'"><Check /></el-icon>
                            <span :style="{ marginLeft: engine === 'dagre' ? '0' : '16px' }">
                                快速 (Dagre)
                            </span>
                        </el-dropdown-item>

                        <el-dropdown-item disabled divided>方向</el-dropdown-item>
                        <el-dropdown-item @click="setDirection('LR')">
                            <el-icon v-if="direction === 'LR'"><Check /></el-icon>
                            <span :style="{ marginLeft: direction === 'LR' ? '0' : '16px' }">从左到右</span>
                        </el-dropdown-item>
                        <el-dropdown-item @click="setDirection('TB')">
                            <el-icon v-if="direction === 'TB'"><Check /></el-icon>
                            <span :style="{ marginLeft: direction === 'TB' ? '0' : '16px' }">从上到下</span>
                        </el-dropdown-item>

                        <el-dropdown-item disabled divided>间距</el-dropdown-item>
                        <el-dropdown-item v-for="d in DENSITIES" :key="d.key" @click="setDensity(d.key)">
                            <el-icon v-if="density === d.key"><Check /></el-icon>
                            <span :style="{ marginLeft: density === d.key ? '0' : '16px' }">
                                {{ d.label }}
                            </span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
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
import { ref, nextTick } from 'vue';
import { Check } from '@element-plus/icons-vue';
import CodeDisplay from '@/components/media/CodeDisplay.vue';

const props = defineProps<{
    lf: any
}>()

const code_dialog = ref(false);
const viewCode = ref({
    value: "",
    type: ""
});

// 布局引擎 —— ELK 异步、Brandes-Köpf 算法 + crossing minimization,边交叉最少;
// Dagre 同步、tight-tree/network-simplex,速度快但容易交叉。
type Engine = 'elk' | 'dagre'
const engine = ref<Engine>('elk')

// 布局方向 —— LR 横向 (流程图常见), TB 纵向 (审批流常见)
type Direction = 'LR' | 'TB'
const direction = ref<Direction>('LR')

// 间距档位 —— ELK 在标准档下已经够松,Dagre 偏紧,所以两个引擎共用同一套数字也合理
type DensityKey = 'compact' | 'normal' | 'loose'
interface Density {
    key: DensityKey
    label: string
    nodesep: number  // 同层节点间距
    ranksep: number  // 跨层级间距
}
const DENSITIES: Density[] = [
    { key: 'compact', label: '紧凑', nodesep: 60, ranksep: 100 },
    { key: 'normal', label: '标准', nodesep: 100, ranksep: 160 },
    { key: 'loose', label: '宽松', nodesep: 140, ranksep: 220 },
]
const density = ref<DensityKey>('normal')

function setEngine(e: Engine) {
    engine.value = e
    runLayout()
}
function setDirection(d: Direction) {
    direction.value = d
    runLayout()
}
function setDensity(k: DensityKey) {
    density.value = k
    runLayout()
}

async function runLayout() {
    const lf = props.lf
    if (!lf?.extension) return
    const d = DENSITIES.find(x => x.key === density.value)!

    if (engine.value === 'elk' && lf.extension.elkLayout) {
        // ELK 是异步的 —— 走 await 等布局完成再 fit
        await lf.extension.elkLayout.layout({
            rankdir: direction.value,
            nodesep: d.nodesep,
            ranksep: d.ranksep,
            edgesep: 20,
            marginx: 60,
            marginy: 60,
            // ELK 的"少交叉"杀手锏:layered + BRANDES_KOEPF 节点摆放,
            // 再开 LAYER_SWEEP 启发式 + 高强度迭代降低交叉
            elkOption: {
                'elk.algorithm': 'layered',
                'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
                'elk.layered.crossingMinimization.semiInteractive': 'true',
                // 节点摆放策略:Brandes-Köpf,以最小化边的弯折与交叉
                'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
                // 考虑用户给的节点顺序(同时优化交叉)
                'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
                // 边路由用正交,且尽量避开节点
                'elk.edgeRouting': 'ORTHOGONAL',
                // 提高迭代次数 —— 默认 4 轮,加到 24 轮能再减少 30%~50% 交叉
                'elk.layered.thoroughness': '24',
            },
        })
    } else if (lf.extension.dagre) {
        lf.extension.dagre.layout({
            rankdir: direction.value,
            align: 'UL',
            ranker: 'network-simplex',
            nodesep: d.nodesep,
            ranksep: d.ranksep,
            marginx: 60,
            marginy: 60,
        })
    }

    // 布局后下一帧再居中 + 适应视图 —— 此时新坐标已渲染,bbox 才是对的
    await nextTick()
    lf.translateCenter()
    lf.fitView(40, 40)
}
</script>

<style></style>
