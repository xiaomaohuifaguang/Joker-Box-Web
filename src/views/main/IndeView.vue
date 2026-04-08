<template>
    <el-row>
        <el-col :span="18" :offset="3">
            <el-carousel :interval="4000" type="card" height="25vh">
                <el-carousel-item v-for="item in carouselList" :key="item"
                    :style="{ backgroundImage: `url(${item.img})` }">
                    <h3 text="2xl" justify="center">
                        {{ item.title }}
                    </h3>
                </el-carousel-item>
            </el-carousel>
        </el-col>
    </el-row>
</template>

<script setup lang='ts'>
import { ref } from 'vue';

const carouselList = ref([
    {
        title: "欲买桂花同载酒，终不似，少年游",
        img: '/static/img/a02bb40cf193c8cd0b1abaa1940b9e4e538ce8b4136392c0e5e1c9d29bc1bc75.png',
    },
    {
        title: "休对故人思故国,且将新火试新茶。诗酒趁年华。",
        img: '/static/img/pexels-mhmtork-31643834.jpg',
    },
    {
        title: "须知少时凌云志，曾许人间第一流",
        img: '/static/img/pexels-damla-selen-demir-429137893-30818195.jpg',
    },
])
</script>

<style scoped>
.el-carousel__item {
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    color: white;
    /* 文字颜色改为白色，确保在深色背景上可见 */
}

.el-carousel__item h3 {
    opacity: 0.9;
    line-height: 25vh;
    /* 与轮播高度一致，垂直居中 */
    margin: 0;
    text-align: center;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    /* 文字阴影增强可读性 */
}

/* 移除默认的背景色覆盖 */
.el-carousel__item:nth-child(2n),
.el-carousel__item:nth-child(2n + 1) {
    background-color: transparent;
}
</style>