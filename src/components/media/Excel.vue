<template>
    <VueOfficeExcel :src="fileUrl" style="width: 100%;height: 60vh;" />
</template>

<script setup lang='ts'>
import VueOfficeExcel from '@vue-office/excel';
import '@vue-office/excel/lib/index.css';
import { useFileFetch } from '@/utils/fileServer/fileFetch';
import { onMounted } from 'vue';


const props = defineProps({
    src: String,
    type: String,
});

const { fileUrl, fetchFile } = useFileFetch();

onMounted(() => {
    if (props.src) {
        fetchFile(props.src);  // 传递 src 参数请求文件
    }
});

</script>

<style></style>