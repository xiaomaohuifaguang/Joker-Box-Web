<template>
    <div class="container xy-center">
        <el-card class="card xy-center" @click="utils.toPath('#')">
            敬请期待
        </el-card>
    </div>
</template>

<script setup lang='ts'>
import utils from '@/utils';

</script>

<style scoped>
.xy-center {
    display: flex;
    /* 垂直居中 */
    align-items: center;
    /* 水平居中 */
    justify-content: center;
}

.container {
    min-height: 100vh;
    /* background-image: url('/logo-1.png'); */
    /* 或者使用 100% 100% 来填充 */
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.container .card {
    width: 15rem;
    height: 10rem;
    cursor: pointer;
    margin: 5rem;
    font-size: 3rem;
    border-radius: 2rem;
}

.container .card:hover {
    background-color: var(--el-color-primary);
}
</style>