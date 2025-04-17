<template>
    <VueOfficeDocx :src='fileUrl' style="width:100%;height: 60vh;"></VueOfficeDocx>
</template>

<script setup lang='ts'>
import { useFileFetch } from '@/utils/fileServer/fileFetch';

import VueOfficeDocx from '@vue-office/docx'
//引入相关样式
import '@vue-office/docx/lib/index.css';

import axios from 'axios';
import { onMounted, ref } from 'vue';

const props = defineProps({
    src: String,
    type: String,
});


const { fileUrl, fetchFile } = useFileFetch();


// // 发送请求并携带 headers
// const fetchFile = async () => {
//     try {
//         const response = await axios.get(props.src, {
//             headers: {
//                 'Authorization': CONSTANTS.SYSTEM.TOKEN_TYPE + ' ' + getToken(),  // 自定义 header，如认证token
//             },
//             responseType: 'blob',  // 确保是文件类型
//         });

//         // 生成一个临时的 URL 并赋值给 fileUrl
//         const blob = response.data;
//         const url = URL.createObjectURL(blob);
//         fileUrl.value = url;
//     } catch (error) {
//         console.error('Error fetching file:', error);
//     }
// };

onMounted(() => {
    if (props.src) {
        fetchFile(props.src);  // 传递 src 参数请求文件
    }
});

</script>

<style></style>