<template>
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
            <el-button @click="code_dialog = true; viewCode.value = lf.getGraphData(); viewCode.type = 'xml'">
                导出xml
            </el-button>
            <el-button @click="code_dialog = true; viewCode.value = lf.getGraphRawData(); viewCode.type = 'json'">
                输出json
            </el-button>
            <el-button @click="lf.clearData()">
                清空画布
            </el-button>
        </el-card>
        <el-row>
            <el-col :span="16">
                <div style="display: flex; justify-content: center;width: 100%;">
                    <div class="container" ref="container">
                        <el-drawer v-model="propsDrawer" title="属性面板" :append-to-body="true">
                            <CodeDisplay :code="nodeProperties" language="json" />
                        </el-drawer>
                    </div>
                </div>

            </el-col>
            <el-col :span="8">

            </el-col>
        </el-row>

        <el-dialog v-model="code_dialog">
            <CodeDisplay :code="viewCode.value" :language="viewCode.type" />
        </el-dialog>
    </div>


</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useDark } from '@vueuse/core'
import CodeDisplay from '@/components/media/CodeDisplay.vue';
import { LogicFlow, RectNode, RectNodeModel, h } from "@logicflow/core";
import "@logicflow/core/lib/style/index.css";
import '@logicflow/extension/lib/style/index.css'
import { Control, MiniMap, Menu, DndPanel, SelectionSelect, Snapshot, InsertNodeInPolyline, BpmnElement, BpmnAdapter, BpmnXmlAdapter, BPMNElements, BPMNBaseAdapter, BPMNAdapter } from "@logicflow/extension"
import { Dagre } from "@logicflow/layout";

LogicFlow.use(Control) // 控制面板
LogicFlow.use(MiniMap) // 小地图
LogicFlow.use(Menu) // 右键菜单
LogicFlow.use(DndPanel) // 拖拽面板
LogicFlow.use(SelectionSelect) // 选区
LogicFlow.use(Snapshot) // 导出图片
LogicFlow.use(InsertNodeInPolyline) // 边上插入节点
LogicFlow.use(Dagre); // 自动布局
// LogicFlow.use(BpmnElement) // BPMN
// LogicFlow.use(BpmnAdapter) // BPMN
// LogicFlow.use(BpmnXmlAdapter) // BPMN
LogicFlow.use(BPMNElements) // BPMN
// LogicFlow.use(BPMNBaseAdapter) // BPMN
LogicFlow.use(BPMNAdapter) // BPMN


const isDark = useDark()

// 容器引用
const container = ref(null);
// LogicFlow 实例
let lf = null;

const code_dialog = ref(false);
const viewCode = ref({
    value: "",
    type: ""
});

const propsDrawer = ref(false);
const nodeProperties = ref();

// 渲染数据
const renderData = ref({
    "nodes": [
        {
            "id": "Event_8fe5072",
            "type": "bpmn:startEvent",
            "x": 328,
            "y": 92,
            "properties": {
                "width": 36,
                "height": 36
            },
            "text": {
                "x": 328,
                "y": 132,
                "value": "开始"
            }
        },
        {
            "id": "Event_fa5921d",
            "type": "bpmn:endEvent",
            "x": 678,
            "y": 92,
            "properties": {
                "width": 36,
                "height": 36
            },
            "text": {
                "x": 678,
                "y": 132,
                "value": "结束"
            }
        }
    ],
    "edges": [
        {
            "id": "Flow_1fa3e21",
            "type": "bpmn:sequenceFlow",
            "properties": {
                "isDefaultFlow": false
            },
            "sourceNodeId": "Event_8fe5072",
            "targetNodeId": "Event_fa5921d",
            "sourceAnchorId": "Event_8fe5072_1",
            "targetAnchorId": "Event_fa5921d_3",
            "startPoint": {
                "x": 346,
                "y": 92
            },
            "endPoint": {
                "x": 660,
                "y": 92
            },
            "pointsList": [
                {
                    "x": 346,
                    "y": 92
                },
                {
                    "x": 660,
                    "y": 92
                }
            ]
        }
    ]
});

// 组件挂载后初始化 LogicFlow
onMounted(() => {
    if (container.value) {
        lf = new LogicFlow({
            container: container.value,
            grid: true,
        });
        lf.extension.dndPanel.setPatternItems([
            {
                label: '选区',
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAOVJREFUOBGtVMENwzAIjKP++2026ETdpv10iy7WFbqFyyW6GBywLCv5gI+Dw2Bluj1znuSjhb99Gkn6QILDY2imo60p8nsnc9bEo3+QJ+AKHfMdZHnl78wyTnyHZD53Zzx73MRSgYvnqgCUHj6gwdck7Zsp1VOrz0Uz8NbKunzAW+Gu4fYW28bUYutYlzSa7B84Fh7d1kjLwhcSdYAYrdkMQVpsBr5XgDGuXwQfQr0y9zwLda+DUYXLaGKdd2ZTtvbolaO87pdo24hP7ov16N0zArH1ur3iwJpXxm+v7oAJNR4JEP8DoAuSFEkYH7cAAAAASUVORK5CYII=',
                callback: () => {
                    lf.extension.selectionSelect.openSelectionSelect();
                    lf.once('selection:selected', () => {
                        lf.extension.selectionSelect.closeSelectionSelect();
                    });
                }
            },
            {
                type: 'bpmn:startEvent',
                label: '开始',
                text: '开始',
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAnBJREFUOBGdVL1rU1EcPfdGBddmaZLiEhdx1MHZQXApraCzQ7GKLgoRBxMfcRELuihWKcXFRcEWF8HBf0DdDCKYRZpnl7p0svLe9Zzbd29eQhTbC8nv+9zf130AT63jvooOGS8Vf9Nt5zxba7sXQwODfkWpkbjTQfCGUd9gIp3uuPP8bZ946g56dYQvnBg+b1HB8VIQmMFrazKcKSvFW2dQTxJnJdQ77urmXWOMBCmXM2Rke4S7UAW+/8ywwFoewmBps2tu7mbTdp8VMOkIRAkKfrVawalJTtIliclFbaOBqa0M2xImHeVIfd/nKAfVq/LGnPss5Kh00VEdSzfwnBXPUpmykNss4lUI9C1ga+8PNrBD5YeqRY2Zz8PhjooIbfJXjowvQJBqkmEkVnktWhwu2SM7SMx7Cj0N9IC0oQXRo8xwAGzQms+xrB/nNSUWVveI48ayrFGyC2+E2C+aWrZHXvOuz+CiV6iycWe1Rd1Q6+QUG07nb5SbPrL4426d+9E1axKjY3AoRrlEeSQo2Eu0T6BWAAr6COhTcWjRaYfKG5csnvytvUr/WY4rrPMB53Uo7jZRjXaG6/CFfNMaXEu75nG47X+oepU7PKJvvzGDY1YLSKHJrK7vFUwXKkaxwhCW3u+sDFMVrIju54RYYbFKpALZAo7sB6wcKyyrd+aBMryMT2gPyD6GsQoRFkGHr14TthZni9ck0z+Pnmee460mHXbRAypKNy3nuMdrWgVKj8YVV8E7PSzp1BZ9SJnJAsXdryw/h5ctboUVi4AFiCd+lQaYMw5z3LGTBKjLQOeUF35k89f58Vv/tGh+l+PE/wG0rgfIUbZK5AAAAABJRU5ErkJggg==',
            },
            {
                type: 'bpmn:userTask',
                label: '用户任务',
                text: '用户任务',
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
            },
            {
                type: 'bpmn:serviceTask',
                label: '系统任务',
                text: '系统任务',
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
            },
            {
                type: 'bpmn:exclusiveGateway',
                label: '条件判断',
                text: '条件判断',
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAAHeEJUAAAAABGdBTUEAALGPC/xhBQAAAvVJREFUOBGNVEFrE0EU/mY3bQoiFlOkaUJrQUQoWMGePLX24EH0IIoHKQiCV0G8iE1covgLiqA/QTzVm1JPogc9tIJYFaQtlhQxqYjSpunu+L7JvmUTU3AgmTfvffPNN++9WSA1DO182f6xwILzD5btfAoQmwL5KJEwiQyVbSVZ0IgRyV6PTpIJ81E5ZvqfHQR0HUOBHW4L5Et2kQ6Zf7iAOhTFAA8s0pEP7AXO1uAA52SbqGk6h/6J45LaLhO64ByfcUzM39V7ZiAdS2yCePPEIQYvTUHqM/n7dgQNfBKWPjpF4ISk8q3J4nB11qw6X8l+FsF3EhlkEMfrjIer3wJTLwS2aCNcj4DbGxXTw00JmAuO+Ni6bBxVUCvS5d9aa04+so4pHW5jLTywuXAL7jJ+D06sl82Sgl2JuVBQn498zkc2bGKxULHjCnSMadBKYDYYHAtsby1EQ5lNGrQd4Y3v4Zo0XdGEmDno46yCM9Tk+RiJmUYHS/aXHPNTcjxcbTFna000PFJHIVZ5lFRqRpJWk9/+QtlOUYJj9HG5pVFEU7zqIYDVsw2s+AJaD8wTd2umgSCCyUxgGsS1Y6TBwXQQTFuZaHcd8gAGioE90hlsY+wMcs30RduYtxanjMGal8H5dMW67dmT1JFtYUEe8LiQLRsPZ6IIc7A4J5tqco3T0pnv/4u0kyzrYUq7gASuEyI8VXKvB9Odytv6jS/PNaZBln0nioJG/AVQRZvApOdhjj3Jt8QC8Im09SafwdBdvIpztpxWxpeKCC+EsFdS8DCyuCn2munFpL7ctHKp+Xc5cMybeIyMAN33SPL3ZR9QV1XVwLyzHm6Iv0/yeUuUb7PPlZC4D4HZkeu6dpF4v9j9MreGtMbxMMRLIcjJic9yHi7WQ3yVKzZVWUr5UrViJvn1FfUlwe/KYVfYyWRLSGNu16hR01U9IacajXPei0wx/5BqgInvJN+MMNtNme7ReU9SBbgntovn0kKHpFg7UogZvaZiOue/q1SBo9ktHzQAAAAASUVORK5CYII=',
            },
            {
                type: 'bpmn:endEvent',
                label: '结束',
                text: '结束',
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAA1BJREFUOBFtVE1IVUEYPXOf+tq40Y3vPcmFIdSjIorWoRG0ERWUgnb5FwVhYQSl72oUoZAboxKNFtWiwKRN0M+jpfSzqJAQclHo001tKkjl3emc8V69igP3znzfnO/M9zcDcKT67azmjYWTwl9Vn7Vumeqzj1DVb6cleQY4oAVnIOPb+mKAGxQmKI5CWNJ2aLPatxWa3aB9K7/fB+/Z0jUF6TmMlFLQqrkECWQzOZxYGjTlOl8eeKaIY5yHnFn486xBustDjWT6dG7pmjHOJd+33t0iitTPkK6tEvjxq4h2MozQ6WFSX/LkDUGfFwfhEZj1Auz/U4pyAi5Sznd7uKzznXeVHlI/Aywmk6j7fsUsEuCGADrWARXXwjxWQsUbIupDHJI7kF5dRktg0eN81IbiZXiTESic50iwS+t1oJgL83jAiBupLDCQqwziaWSoAFSeIR3P5Xv5az00wyIn35QRYTwdSYbz8pH8fxUUAtxnFvYmEmgI0wYXUXcCCSpeEVpXlsRhBnCEATxWylL9+EKCAYhe1NGstUa6356kS9NVvt3DU2fd+Wtbm/+lSbylJqsqkSm9CRhvoJVlvKPvF1RKY/FcPn5j4UfIMLn8D4UYb54BNsilTDXKnF4CfTobA0FpoW/LSp306wkXM+XaOJhZaFkcNM82ASNAWMrhrUbRfmyeI1FvRBTpN06WKxa9BK0o2E4Pd3zfBBEwPsv9sQBnmLVbLEIZ/Xe9LYwJu/Er17W6HYVBc7vmuk0xUQ+pqxdom5Fnp55SiytXLPYoMXNM4u4SNSCFWnrVIzKG3EGyMXo6n/BQOe+bX3FClY4PwydVhthOZ9NnS+ntiLh0fxtlUJHAuGaFoVmttpVMeum0p3WEXbcll94l1wM/gZ0Ccczop77VvN2I7TlsZCsuXf1WHvWEhjO8DPtyOVg2/mvK9QqboEth+7pD6NUQC1HN/TwvydGBARi9MZSzLE4b8Ru3XhX2PBxf8E1er2A6516o0w4sIA+lwURhAON82Kwe2iDAC1Watq4XHaGQ7skLcFOtI5lDxuM2gZe6WFIotPAhbaeYlU4to5cuarF1QrcZ/lwrLaCJl66JBocYZnrNlvm2+MBCTmUymPrYZVbjdlr/BxlMjmNmNI3SAAAAAElFTkSuQmCC',
            },
        ])
        // 添加导航栏
        lf.extension.control.addItem({
            iconClass: "lf-control-miniMap",
            title: "",
            text: "导航",
            onMouseEnter: (lf, ev) => {
                const position = lf.getPointByClient(ev.x, ev.y);
                lf.extension.miniMap.show(
                    position.domOverlayPosition.x - 120,
                    position.domOverlayPosition.y + 35
                );
            },
            onClick: (lf, ev) => {
                const position = lf.getPointByClient(ev.x, ev.y);
                lf.extension.miniMap.show(
                    position.domOverlayPosition.x - 120,
                    position.domOverlayPosition.y + 35
                );
            }
        });

        lf.renderRawData(renderData.value);
        // console.log(lf.graphModel)

        lf.on('node:click,edge:click', (data) => {
            // console.log(data)
            const id = data.data.id
            nodeProperties.value = data.data
            // lf.updateText(id, '开始1');
            // lf.getNodeModelById(id).setProperties({
            //     disabled: true,
            //     scale: 2,
            // });
            // lf.getNodeModelById(id).setProperty({
            //     scale: 3,
            // });
            // console.log(data)
            propsDrawer.value = true;
        })

    }
    watch(
        isDark,
        () => {
            if (isDark.value) {
                lf.setTheme({}, 'dark')
            } else {
                lf.setTheme({}, 'default')
            }
        },
        {
            immediate: true,
        }
    )
});


</script>

<style scoped>
.container {
    width: 80%;
    height: 80vh;
}
</style>