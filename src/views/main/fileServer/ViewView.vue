<template>
    <div class="file-view-container">
        <Video :src="src" :type="props.contentType" v-if="type == 'video'" />
        <Image :src="src" :type="props.contentType" v-if="type == 'img'" />
        <Pdf :src="src" :type="props.contentType" v-if="type == 'pdf'" />
        <Markdown :src="src" :type="props.contentType" v-if="type == 'md'" />
        <Docx :src="src" :type="props.contentType" v-if="type == 'docx'" />
        <Excel :src="src" :type="props.contentType" v-if="type == 'xlsx'" />
        <Text :src="src" :type="props.contentType" v-if="type == 'txt'" />
        <el-result icon="warning" title="提示" :sub-title="'暂未实现在线预览' + src" v-if="type == 'default'">
        </el-result>
    </div>
</template>

<script setup lang='ts'>
import Video from '@/components/media/Video.vue';
import Image from '@/components/media/Image.vue';
import Pdf from '@/components/media/Pdf.vue';
import Markdown from '@/components/media/Markdown.vue';
import Docx from '@/components/media/Docx.vue';
import Excel from '@/components/media/Excel.vue';
import Text from '@/components/media/Text.vue';
import { CONSTANTS } from '@/utils';
import { onMounted, ref } from 'vue';
const props = defineProps({
    fileId: String,
    contentType: String,
    filename: {
        type: String,
        default: ''
    }
})
const type = ref('default')


const src = ref('')

onMounted(() => {
    src.value = CONSTANTS.HTTP.BASEURL + '/file/download?fileId=' + props.fileId
    switch (props.contentType) {
        case 'video/mp4': { type.value = 'video'; break; }
        case 'image/png': { type.value = 'img'; break; }
        case 'image/x-icon': { type.value = 'img'; break; }
        case 'image/jpeg': { type.value = 'img'; break; }
        case 'text/plain': { type.value = 'txt'; break; }
        case 'application/pdf': { type.value = 'pdf'; break; }
        // case 'application/msword': { type.value = 'doc'; break; }
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { type.value = 'docx'; break; }
        // case 'application/vnd.ms-excel': { type.value = 'xls'; break; }
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { type.value = 'xlsx'; break; }
        case 'application/octet-stream': {
            let name = props.filename
            name = name.substring(name.lastIndexOf('.') + 1, name.length)
            switch (name) {
                case 'md': { type.value = 'md'; break; }
                case 'sql': { type.value = 'txt'; break; }
            }
        }
    }
})

</script>

<style>
.file-view-container * {
    font-family: none;
}
</style>