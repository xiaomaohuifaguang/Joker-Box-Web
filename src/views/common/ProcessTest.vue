<template>
    <div>
        <el-row>
            <el-col :span="4">
                <el-card>
                    <div id="process_properties"></div>
                </el-card>
            </el-col>
            <el-col :span="10">
                <el-card>
                    <div id="process_canvas"></div>
                </el-card>
            </el-col>
            <el-col :span="10">
                <CodeDisplay v-model:code="newXml" :language="codeLanguageType" />
            </el-col>

        </el-row>
        <el-row>
            <el-col :span="10" :offset="2">
                <!-- {{ newXml }} -->
                <!-- <CodeDisplay :code="newXml" :language="codeLanguageType" /> -->
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import BpmnJS from 'bpmn-js/lib/Modeler';

import '@bpmn-io/properties-panel/dist/assets/properties-panel.css'
import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    CamundaPlatformPropertiesProviderModule,
} from 'bpmn-js-properties-panel';


// import translationsJson from "@/assets/bpmn/zh";

// const translate = (key) => {
//     return translationsJson[key] || key; // 如果找不到翻译，返回原始文本
// };
import { customTranslate } from "@/assets/bpmn/translate";

import CodeDisplay from '@/components/media/CodeDisplay.vue';

import { initXml } from '@/assets/bpmn/default';

import BpmnColorPickerModule from 'bpmn-js-color-picker';

import 'bpmn-js-color-picker/colors/color-picker.css';

import GridLineModule from 'diagram-js-grid-bg'

// 引入描述文件
// import flowableModdleExtension from "@/assets/bpmn/extension-moddle/flowable";
// import CustomPropertiesProvider from '@/assets/bpmn/custom-moddle/CustomPropertiesProvider';

import magicPropertiesProviderModule from '@/assets/bpmn/modules/provider/magic'
import magicModdleDescriptor from '@/assets/bpmn/extension-moddle/magic';


import flowablePropertiesProviderModule from '@/assets/bpmn/modules/provider/flowable';
// import flowableModdleDescriptor from "@/assets/bpmn/extension-moddle/flowable";

import CamundaBpmnModdle from 'camunda-bpmn-moddle/resources/camunda.json'

import flowableModdleDescriptor from 'flowable-bpmn-moddle/resources/camunda.json'


var newXml = ref('')
var codeLanguageType = ref('xml')

let modeler = null

const modelerMaker = async () => {
    // BpmnJS is the BPMN modeler instance (for editing)z`
    modeler = new BpmnJS({
        container: '#process_canvas',
        propertiesPanel: {
            parent: '#process_properties'
        },
        additionalModules: [
            BpmnPropertiesPanelModule,
            BpmnPropertiesProviderModule,
            CamundaPlatformPropertiesProviderModule,
            // magicPropertiesProviderModule,
            // flowablePropertiesProviderModule,
            // {
            //     __init__: ['customPropertiesProvider'],
            //     customPropertiesProvider: ['type', CustomPropertiesProvider],
            // },
            {
                translate: ["value", customTranslate],
            }, {
                zoomScroll: ["value", ""]
            },
            BpmnColorPickerModule,
            GridLineModule,
        ],
        moddleExtensions: {
            // activiti: activitiModdleExtension, // 使用的哪个引擎就引入哪个，不需要两个都引入
            // flowable: flowableModdleExtension,
            // magic: magicModdleDescriptor,
            // flowable: flowableModdleDescriptor,
            camunda: CamundaBpmnModdle,
        },
        bpmnRenderer: {
            defaultStrokeColor: "#000",//线条 文字颜色
            defaultFillColor: "#fff",//图形填充颜色

        }
    });


    // Import the BPMN diagram as XML
    try {
        await modeler.importXML(initXml);
        modeler.get('canvas').zoom('fit-viewport');
        // var canvas = modeler.get('canvas');
        // canvas.addMarker('StartEvent_1', 'bpmn-js-active');
    } catch (err) {
        console.error('Failed to load BPMN diagram', err);
    }


    // Listen to command stack changes (e.g., user actions like undo/redo)
    modeler.on('commandStack.changed', async () => {
        const { xml } = await modeler.saveXML({ format: true });
        newXml.value = xml.toString()
    });

    // Listen to element changes (e.g., an element was modified)
    modeler.on('element.changed', async (event) => {
        const { xml } = await modeler.saveXML({ format: true });
        newXml.value = xml.toString()
    });

    modeler.on('element.click', (event) => {
        console.log(event.element.type)
    })

}

// // 根据所需类型进行转码并返回下载地址
// function setEncoded(type, filename = "diagram", data) {
//     const encodedData = encodeURIComponent(data);
//     return {
//         filename: `${filename}.${type}`,
//         href: `data:application/${type === "svg" ? "text/xml" : "bpmn20-xml"};charset=UTF-8,${encodedData}`,
//         data: data
//     };
// }

onMounted(() => {
    newXml.value = initXml
    modelerMaker();
})

</script>

<style scoped>
#process_canvas {
    width: 100%;
    height: 80vh;
    /* border: 1px solid #ccc;
    background: white;
    overflow: auto;
    background-image: linear-gradient(90deg,
            rgba(220, 220, 220, 0.5) 6%,
            transparent 0),
        linear-gradient(rgba(192, 192, 192, 0.5) 6%, transparent 0);
    background-size: 12px 12px;
    width: 100%;
    height: calc(100vh - 82px);
    -webkit-tap-highlight-color: rgba(255, 255, 255, 0); */
}
</style>
