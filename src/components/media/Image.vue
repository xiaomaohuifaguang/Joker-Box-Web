<template>
    <div style="text-align: center;">
        <el-image :src="src" />
    </div>

</template>

<script setup lang='ts'>
const props = defineProps({
    src: String,
    type: String,
})
</script>

<style></style>