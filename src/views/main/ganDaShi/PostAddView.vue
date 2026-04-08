<template>
    <el-input v-model="info.title" type="text" placeholder="请输入标题" :maxlength="50" class="post-title-input" />

    <TiptapEditor v-model="info.content" @textChange="(value) => { info.text = value }" class="post-content-editor" />

    <div class="post-action-buttons">
        <el-button @click="emit('success')" class="cancel-button">
            取消
        </el-button>
        <el-button type="primary" @click="push" class="submit-button">
            发帖
        </el-button>
    </div>
</template>

<script setup>
import TiptapEditor from '@/components/editor/TiptapEditor.vue';
import { alert, http } from '@/utils';
import { ref } from 'vue';

const emit = defineEmits(['success'])

const info = ref({
    id: '',
    title: '',
    content: '',
    text: '',
    createBy: '',
    createTime: '',
})

const push = () => {
    http.result({
        url: '/ganDaShiPost/add',
        method: 'POST',
        data: info.value,
        success(result) {
            alert('发帖成功', 'success')
            emit('success')
        }
    })
}
</script>

<style scoped>
.post-title-input {
    margin-bottom: 1.5rem;
}

.post-content-editor {
    margin-bottom: 1.5rem;
    min-height: 300px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 0.5rem;
}

.post-action-buttons {
    text-align: end;
    margin-top: 1.5rem;
}

.cancel-button {
    margin-right: 0.75rem;
}

.submit-button {
    min-width: 80px;
}
</style>