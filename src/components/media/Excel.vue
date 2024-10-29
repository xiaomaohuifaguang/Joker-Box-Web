<template>
    <VueOfficeExcel :src="props.src" style="width: 100%;height: 60vh;" />
</template>

<script setup lang='ts'>
import VueOfficeExcel from '@vue-office/excel';
import '@vue-office/excel/lib/index.css';


const props = defineProps({
    src: String,
    type: String,
});




</script>

<style></style>