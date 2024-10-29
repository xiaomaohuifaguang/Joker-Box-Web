<template>
    <el-empty description="哥 你权限不足">
        <template #image>
            <Tips403 />
        </template>
        <el-button type="primary" @click="toPath('/')">返回首页</el-button>
    </el-empty>
</template>

<script setup lang='ts'>
import Tips403 from '@/components/svg/Tips403.vue';
import { toPath } from '@/utils';
</script>

<style></style>