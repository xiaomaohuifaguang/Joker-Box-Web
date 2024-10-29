<template>
    <div class="markdown-card">
        <div class="txt" style="white-space: pre-wrap;">{{ txtContent }}</div>
    </div>

</template>

<script setup lang='ts'>
import { ref } from 'vue';
import axios from 'axios';


const props = defineProps({
    src: String,
    type: String,
});
const txtContent = ref('');
axios.get(props.src, {
    responseType: 'text',
}).then(res => {
    txtContent.value = res.data;
}).catch(error => {
    console.error('Error fetching the TXT file:', error);
});

</script>

<style>
.markdown-card table {
    width: 100%;
    border-collapse: collapse;
}
</style>