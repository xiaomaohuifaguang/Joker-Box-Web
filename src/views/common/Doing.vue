<template>
    <div class="container">
        <el-card class="card xy-center" @click="utils.toPath('#')">
            <div>敬请期待</div>
        </el-card>
        <!-- <iframe
            src="//player.bilibili.com/player.html?isOutside=true&aid=113458355899117&bvid=BV1Tcm6YHESv&cid=26699435144&p=1"
            scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="800"
            height="600"></iframe> -->
        <iframe style="width: 700px;height: 400px;"
            src="https://www.bilibili.com/blackboard/live/live-activity-player.html?cid=26135263&quality=0"
            frameborder="no" framespacing="0" scrolling="no" allow="autoplay; encrypted-media"
            allowfullscreen="true"></iframe>
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
    /* margin-top: 20vh; */
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
    display: flex;
    justify-content: center;
    padding-top: 20vh;
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