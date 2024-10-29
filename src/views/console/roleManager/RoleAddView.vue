<template>
    <el-input v-model="roleName" autocomplete="off" size="large">
        <template #prepend>名称</template>
    </el-input>
    <div style="display: flex;justify-content: center;margin-top: 1rem;">
        <el-button type="primary" plain @click="addRole" size="large" style="width: 100%;">保存</el-button>
    </div>
</template>

<script setup lang='ts'>
import { alert, http } from '@/utils';
import { ref } from 'vue';

const loading = ref(false)
const roleName = ref('')

const emit = defineEmits(['success']);

const addRole = () => {
    http.result({
        url: '/role/add',
        method: 'POST',
        params: {
            roleName: roleName.value
        },
        success(result) {
            if (result.code = '200') {
                roleName.value = ''
                alert('添加成功', 'success')
                emit('success');
            }
        }
    })
}


</script>

<style></style>