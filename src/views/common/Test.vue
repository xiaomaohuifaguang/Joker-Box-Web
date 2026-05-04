<template>
    <div>
        <!-- <CodeDisplay :code="processInfo" language="json" /> -->
        <ProcessEditor :info="processInfo" @update:graphRawData="(data) => processInfo.rawData = data"
            @update:graphData="(data) => processInfo.xmlData = data" />
    </div>

</template>

<script setup lang='ts'>
import ProcessEditor from '@/components/process-designer/ProcessEditor.vue';
import { ref } from 'vue';
import CodeDisplay from '@/components/media/CodeDisplay.vue';


const processInfo = ref({
    id: '',
    processKey: '',
    processName: '',
    rawData: {},
    xmlData: ''
})
</script>

<style></style>