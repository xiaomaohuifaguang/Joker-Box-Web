<template>
    <div ref="videoContainer" class="video-container">
        <video ref="videoPlayer" class="video-js vjs-default-skin" controls preload="auto">
            <source :src="fileUrl" :type="props.type" />
        </video>
    </div>
</template>

<script setup lang="ts">
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { useFileFetch } from '@/utils/fileServer/fileFetch';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
    src: String,
    type: String,
});

const player = ref(null);
const videoPlayer = ref(null);
const { fileUrl, fetchFile } = useFileFetch();

// 获取文件
onMounted(() => {
    if (props.src) {
        fetchFile(props.src);  // 传递 src 参数请求文件
    }
});

// 当 fileUrl 更新时，重新初始化播放器
watch(fileUrl, (newFileUrl) => {
    if (newFileUrl && videoPlayer.value) {
        // 销毁旧的 player 实例（如果存在）
        if (player.value) {
            player.value.dispose();
        }
        // 初始化新的 player
        player.value = videojs(videoPlayer.value, {
            autoplay: false,
            controls: true,
            sources: [{ src: newFileUrl, type: props.type }],
        });
    }
});

// 销毁播放器实例
onBeforeUnmount(() => {
    if (player.value) {
        player.value.dispose();
    }
});
</script>

<style scoped>
.video-container {
    width: 100%;
    max-width: 100%;
    /* 容器最大宽度不超过100% */
    margin: 0 auto;
    display: flex;
    justify-content: center;
}

.video-js {
    width: 100%;
    /* 使视频宽度自适应容器 */
    height: 50vh;
    /* 保持视频纵横比 */
}
</style>