<template>
    <VueOfficeDocx :src='props.src' style="width:100%;height: 60vh;"></VueOfficeDocx>
</template>

<script setup lang='ts'>
import VueOfficeDocx from '@vue-office/docx'
//引入相关样式
import '@vue-office/docx/lib/index.css';

const props = defineProps({
    src: String,
    type: String,
});
</script>

<style></style>