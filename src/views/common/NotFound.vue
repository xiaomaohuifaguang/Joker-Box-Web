<template>
    <el-empty description="找不到页面">
        <template #image>
            <Tips404 />
        </template>
        <el-button type="primary" @click="toPath('/')">返回首页</el-button>
    </el-empty>
</template>

<script setup lang='ts'>
import Tips404 from '@/components/svg/Tips404.vue';
import { toPath } from '@/utils';
</script>

<style></style>