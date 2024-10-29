<template>
    <div ref="videoContainer" class="video-container">
        <video ref="videoPlayer" class="video-js vjs-default-skin video-container" controls preload="auto"
            height="auto">
            <!-- 可以在这里插入source标签以指定你的视频源 -->
            <source :src="props.src" :type="props.type" />
        </video>
    </div>
</template>

<script setup lang='ts'>
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

import { ref, onMounted, onBeforeUnmount, onUpdated } from 'vue';

const props = defineProps({
    src: String,
    type: String,
})

const player = ref(null);
const videoPlayer = ref(null);


// onMounted(() => {
//     console.log('onMounted')
//     if (videoPlayer.value) {
//         player.value = videojs(videoPlayer.value, {
//             autoplay: false,
//             controls: true,
//             // sources: [{ src: 'https://vjs.zencdn.net/v/oceans.mp4', type: 'video/mp4' }],
//             sources: [{ src: props.src, type: 'video/mp4' }],
//         });
//     }
// });

// onUpdated(() => {
//     console.log(props.src)
//     player.value = videojs(videoPlayer.value, {
//         autoplay: false,
//         controls: true,
//         // sources: [{ src: 'https://vjs.zencdn.net/v/oceans.mp4', type: 'video/mp4' }],
//         sources: [{ src: props.src, type: 'video/mp4' }],
//     });
// })

onBeforeUnmount(() => {
    if (player.value) {
        player.value.dispose();
    }
});

</script>

<style scoped>
.video-container {
    width: 100%;
    margin: 0 auto;
}
</style>