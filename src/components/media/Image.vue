<template>
    <div style="text-align: center;">
        <el-image :src="fileUrl" />
    </div>

</template>

<script setup lang='ts'>
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