<template>
    <div class="content" id="js-drop-zone">
        <div class="message intro">
            <div class="note">
                Drop BPMN diagram from your desktop or <a id="js-create-diagram" href="#">create a new diagram</a> to
                get
                started.
            </div>
        </div>

        <div class="message error">
            <div class="note">
                <p>Ooops, we could not display the BPMN 2.0 diagram.</p>
                <div class="details">
                    <span>cause of the problem</span>
                    <pre></pre>
                </div>
            </div>
        </div>

        <div class="canvas" id="js-canvas"></div>
    </div>

    <ul class="buttons">
        <li>
            download
        </li>
        <li>
            <a id="js-download-diagram" title="download BPMN diagram">
                BPMN diagram
            </a>
        </li>
        <li>
            <a id="js-download-svg" title="download as SVG image">
                SVG image
            </a>
        </li>
    </ul>
</template>

<script setup>
import { onMounted } from 'vue';
import Modeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

import BpmnModeler from 'bpmn-js/lib/Modeler';

const diagramXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:process id="Process_1" isExecutable="false">
    <bpmn2:startEvent id="StartEvent_1" name="开始节点" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="412" y="240" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="409" y="283" width="43" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`;
// const modeler = new BpmnModeler()
onMounted(() => {
    const container = document.getElementById('js-drop-zone');
    const modeler = new BpmnModeler({
        container: '#js-canvas', // Ensure the canvas element exists
    });

    if (container) {
        function handleFileSelect(e) {
            e.stopPropagation();
            e.preventDefault();

            const files = e.dataTransfer.files;
            const file = files[0];
            const reader = new FileReader();

            reader.onload = function (e) {
                const xml = e.target.result;
                openDiagram(xml);
            };

            reader.readAsText(file);
        }

        function handleDragOver(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        }

        container.addEventListener('dragover', handleDragOver, false);
        container.addEventListener('drop', handleFileSelect, false);
    } else {
        console.error("The container element '#js-drop-zone' is not found in the DOM.");
    }

    function createNewDiagram() {
        openDiagram(diagramXML);
    }

    async function openDiagram(xml) {
        try {
            await modeler.importXML(xml);
            container.classList.remove('with-error');
            container.classList.add('with-diagram');
        } catch (err) {
            container.classList.remove('with-diagram');
            container.classList.add('with-error');
            container.querySelector('.error pre').textContent = err.message;
            console.error(err);
        }
    }

    document.getElementById('js-create-diagram').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        createNewDiagram();
    });

    const downloadLink = document.getElementById('js-download-diagram');
    const downloadSvgLink = document.getElementById('js-download-svg');

    function setEncoded(link, name, data) {
        const encodedData = encodeURIComponent(data);

        if (data) {
            link.classList.add('active');
            link.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData);
            link.setAttribute('download', name);
        } else {
            link.classList.remove('active');
        }
    }

    const exportArtifacts = debounce(async function () {
        try {
            const { svg } = await modeler.saveSVG();
            setEncoded(downloadSvgLink, 'diagram.svg', svg);
        } catch (err) {
            console.error('Error happened saving svg: ', err);
            setEncoded(downloadSvgLink, 'diagram.svg', null);
        }

        try {
            const { xml } = await modeler.saveXML({ format: true });
            setEncoded(downloadLink, 'diagram.bpmn', xml);
        } catch (err) {
            console.error('Error happened saving XML: ', err);
            setEncoded(downloadLink, 'diagram.bpmn', null);
        }
    }, 500);

    modeler.on('commandStack.changed', exportArtifacts);
});

function debounce(fn, timeout) {
    let timer;
    return function () {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(fn, timeout);
    };
}
</script>

<style>
/* Add your styles here */
* {
    box-sizing: border-box;
}

body,
html {

    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;

    font-size: 12px;

    height: 100%;
    padding: 0;
    margin: 0;
}

a:link {
    text-decoration: none;
}

.content,
.content>div {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.content>.message {
    text-align: center;
    display: table;

    font-size: 16px;
    color: #111;
}

.content>.message .note {
    vertical-align: middle;
    text-align: center;
    display: table-cell;
}

.content>.error .details {
    max-width: 500px;
    font-size: 12px;
    margin: 20px auto;
    text-align: left;
}

.content>.error pre {
    border: solid 1px #CCC;
    background: #EEE;
    padding: 10px;
}

.content:not(.with-error)>.error,
.content.with-error>.intro,
.content.with-diagram>.intro {
    display: none;
}


.content .canvas,
.content.with-error .canvas {
    visibility: hidden;
    height: 80vh;
    border: 1px #000 solid;
}

.content.with-diagram .canvas {
    visibility: visible;
}

.buttons {
    position: fixed;
    bottom: 20px;
    left: 20px;

    padding: 0;
    margin: 0;
    list-style: none;
}

.buttons>li {
    display: inline-block;
    margin-right: 10px;
}

.buttons>li>a {
    background: #DDD;
    border: solid 1px #666;
    display: inline-block;
    padding: 5px;
}

.buttons a {
    opacity: 0.3;
}

.buttons a.active {
    opacity: 1.0;
}
</style>