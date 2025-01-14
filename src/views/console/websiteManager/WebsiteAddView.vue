<template>
    <div v-loading="loading" class="website-form-container">
        <el-row :gutter="20">
            <el-col :span="24">
                <el-form label-position="left" label-width="auto" class="website-form">
                    <el-form-item label="名称">
                        <el-input v-model="info.title" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="分组名称">
                        <el-input v-model="info.groupName" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="url">
                        <el-input v-model="info.url" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="简介">
                        <el-input v-model="info.description" type="textarea" autocomplete="off" />
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>

        <el-divider />

        <div class="form-footer">
            <el-button type="primary" plain @click="add" size="large" style="width: 100%;">保存</el-button>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { alert, http } from '@/utils';
import { ref } from 'vue';

const loading = ref(false)
const info = ref({
    id: null,
    groupName: "",
    url: "",
    title: "",
    description: "",
    createTime: null,
    updateTime: null
})

const emit = defineEmits(['success']);

const add = () => {
    http.result({
        url: '/website/add',
        method: 'POST',
        data: info.value,
        success(result) {
            if (result.code == '200') {
                info.value = {
                    id: null,
                    groupName: "",
                    url: "",
                    title: "",
                    description: "",
                    createTime: null,
                    updateTime: null
                }
                alert('添加成功', 'success')
                emit('success');
            }
        }
    })
}
</script>

<style scoped>
.website-form-container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
}

.website-form .el-form-item {
    margin-bottom: 1.5rem;
}

.form-footer {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

.el-button {
    width: 100%;
    max-width: 200px;
}
</style>
