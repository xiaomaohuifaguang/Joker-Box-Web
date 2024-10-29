<template>
    <el-row>
        <el-col :span="24" :offset="0">
            <el-container style="min-height: 100vh;">
                <el-header class="padding-lr-0">
                    <Header />
                </el-header>
                <el-main class="padding-lr-0">
                    <RouterView />
                </el-main>
            </el-container>
        </el-col>
    </el-row>
    <Footer v-if="route.path != '/login' && route.path != '/register' && route.path != '/start'" />
</template>
<script setup lang='ts'>
import Header from '@/components/common/Header.vue';
import { useRoute } from 'vue-router';
const route = useRoute()
</script>

<style scoped>
.padding-lr-0 {
    padding-left: 0;
    padding-right: 0;
}
</style>