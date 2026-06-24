<template>
    <!-- 顶部工具栏 —— 三段式:左编辑 / 中视图 / 右危险 -->
    <div class="diagram-toolbar">
        <!-- 左:编辑操作 (主) -->
        <div class="toolbar-section toolbar-section--left">
            <el-dropdown split-button type="primary" @click="runLayout()" trigger="click">
                <template #default>
                    <el-icon class="btn-icon">
                        <MagicStick />
                    </el-icon>
                    自动布局
                </template>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item disabled>算法</el-dropdown-item>
                        <el-dropdown-item @click="setEngine('elk')">
                            <el-icon v-if="engine === 'elk'">
                                <Check />
                            </el-icon>
                            <span :style="{ marginLeft: engine === 'elk' ? '0' : '16px' }">
                                高质量 (ELK,边交叉最少)
                            </span>
                        </el-dropdown-item>
                        <el-dropdown-item @click="setEngine('dagre')">
                            <el-icon v-if="engine === 'dagre'">
                                <Check />
                            </el-icon>
                            <span :style="{ marginLeft: engine === 'dagre' ? '0' : '16px' }">
                                快速 (Dagre)
                            </span>
                        </el-dropdown-item>

                        <el-dropdown-item disabled divided>方向</el-dropdown-item>
                        <el-dropdown-item @click="setDirection('LR')">
                            <el-icon v-if="direction === 'LR'">
                                <Check />
                            </el-icon>
                            <span :style="{ marginLeft: direction === 'LR' ? '0' : '16px' }">从左到右</span>
                        </el-dropdown-item>
                        <el-dropdown-item @click="setDirection('TB')">
                            <el-icon v-if="direction === 'TB'">
                                <Check />
                            </el-icon>
                            <span :style="{ marginLeft: direction === 'TB' ? '0' : '16px' }">从上到下</span>
                        </el-dropdown-item>

                        <el-dropdown-item disabled divided>间距</el-dropdown-item>
                        <el-dropdown-item v-for="d in DENSITIES" :key="d.key" @click="setDensity(d.key)">
                            <el-icon v-if="density === d.key">
                                <Check />
                            </el-icon>
                            <span :style="{ marginLeft: density === d.key ? '0' : '16px' }">
                                {{ d.label }}
                            </span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>

        <div class="toolbar-divider" />

        <!-- 中:视图/导出操作 (次要) -->
        <div class="toolbar-section toolbar-section--center">
            <el-tooltip content="缩放至适应视图" placement="bottom" :show-after="400">
                <el-button text @click="fitView">
                    <el-icon class="btn-icon">
                        <ScaleToOriginal />
                    </el-icon>
                    适配
                </el-button>
            </el-tooltip>
            <el-tooltip content="导出当前流程图为 PNG" placement="bottom" :show-after="400">
                <el-button text @click="lf.getSnapshot('流程图')">
                    <el-icon class="btn-icon">
                        <Camera />
                    </el-icon>
                    导出图片
                </el-button>
            </el-tooltip>

            <el-dropdown trigger="click">
                <el-button text>
                    <el-icon class="btn-icon">
                        <Document />
                    </el-icon>
                    查看代码
                    <el-icon class="btn-icon btn-icon--trailing">
                        <ArrowDown />
                    </el-icon>
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="viewCodeAs('xml')">
                            BPMN XML
                        </el-dropdown-item>
                        <el-dropdown-item @click="viewCodeAs('json')">
                            JSON (LogicFlow)
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>

        <!-- 右:危险操作 -->
        <div class="toolbar-section toolbar-section--right">
            <el-popconfirm title="确定要清空画布吗?此操作不可撤销。" confirm-button-text="清空" cancel-button-text="取消"
                confirm-button-type="danger" width="240" @confirm="lf.clearData()">
                <template #reference>
                    <el-button text class="btn-danger">
                        <el-icon class="btn-icon">
                            <Delete />
                        </el-icon>
                        清空画布
                    </el-button>
                </template>
            </el-popconfirm>
        </div>

        <el-dialog v-model="code_dialog" width="60%" top="6vh"
            :title="viewCode.type === 'xml' ? 'BPMN XML' : 'LogicFlow JSON'">
            <CodeDisplay :code="viewCode.value" :language="viewCode.type" />
        </el-dialog>
    </div>
</template>

<script setup lang='ts'>
import { ref, nextTick } from 'vue';
import {
    Check, MagicStick, Camera, Document, Delete, ArrowDown, ScaleToOriginal,
} from '@element-plus/icons-vue';
import CodeDisplay from '@/components/media/CodeDisplay.vue';

const props = defineProps<{
    lf: any
}>()

const code_dialog = ref(false);
const viewCode = ref({
    value: "",
    type: ""
});

function viewCodeAs(type: 'xml' | 'json') {
    viewCode.value = {
        value: type === 'xml' ? props.lf.getGraphData() : props.lf.getGraphRawData(),
        type,
    }
    code_dialog.value = true
}

function fitView() {
    if (!props.lf) return
    props.lf.translateCenter()
    props.lf.fitView(40, 40)
}

// ============ 自动布局 ============
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
            elkOption: {
                'elk.algorithm': 'layered',
                'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
                'elk.layered.crossingMinimization.semiInteractive': 'true',
                'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
                'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
                'elk.edgeRouting': 'ORTHOGONAL',
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

    await nextTick()
    lf.translateCenter()
    lf.fitView(40, 40)
}
</script>

<style scoped>
.diagram-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #ffffff;
    border-bottom: 1px solid var(--el-border-color-lighter);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    border-radius: 8px 8px 0 0;
}

.toolbar-section {
    display: flex;
    align-items: center;
    gap: 6px;
}

.toolbar-section--right {
    /* 危险操作贴右,且与中间留出"思考距离" */
    margin-left: auto;
}

.toolbar-divider {
    width: 1px;
    height: 18px;
    background: var(--el-border-color-lighter);
    margin: 0 4px;
}

/* 按钮内图标的对齐微调 —— Element 自带的 <el-button> 内 icon 默认行高有点高 */
.btn-icon {
    margin-right: 4px;
    font-size: 14px;
    vertical-align: -2px;
}

.btn-icon--trailing {
    margin-right: 0;
    margin-left: 2px;
    font-size: 12px;
    opacity: 0.7;
}

/* 危险按钮 —— text 模式默认是灰字,hover 时让红色显出来 */
.btn-danger {
    color: var(--el-text-color-regular);
    transition: color 0.15s ease, background-color 0.15s ease;
}

.btn-danger:hover {
    color: var(--el-color-danger);
    background-color: var(--el-color-danger-light-9);
}

/* split-button 内主按钮(自动布局)的图标颜色继承,不要变成主蓝色字 */
.diagram-toolbar :deep(.el-button--primary .btn-icon) {
    color: inherit;
}
</style>
