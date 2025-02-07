<template>
    <div v-loading="loading" class="website-form-container">
        <el-row :gutter="20">
            <el-col :span="24">
                <el-form label-position="left" label-width="auto" class="website-form">
                    <el-form-item label="ID">
                        <el-input v-model="info.id" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="名称">
                        <el-input v-model="info.title" autocomplete="off" :disabled="props.type !== 'edit'" />
                    </el-form-item>
                    <el-form-item label="分组名称">
                        <el-input v-model="info.groupName" autocomplete="off" :disabled="props.type !== 'edit'" />
                    </el-form-item>
                    <el-form-item label="url">
                        <el-input v-model="info.url" autocomplete="off" :disabled="props.type !== 'edit'" />
                    </el-form-item>
                    <el-form-item label="简介">
                        <el-input v-model="info.description" type="textarea" autocomplete="off"
                            :disabled="props.type !== 'edit'" />
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-input v-model="info.createTime" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="更新时间">
                        <el-input v-model="info.updateTime" autocomplete="off" disabled />
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>

        <el-divider />

        <!-- Save Button: Visible only when type is 'edit' -->
        <div class="form-footer" v-if="props.type === 'edit'">
            <el-button type="primary" plain @click="save" size="large">保存</el-button>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const props = defineProps({
    id: String,
    type: String
})

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

const queryInfo = () => {
    loading.value = true
    http.result({
        url: '/website/info',
        method: 'POST',
        params: { id: props.id },
        success(result) {
            info.value = result.data
            loading.value = false
        }
    })
}

const save = () => {
    loading.value = true
    http.result({
        url: '/website/save',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            queryInfo()
        }
    })
}

onMounted(() => {
    if (props.id) queryInfo()
})
</script>

<style scoped>
.website-form-container {
    padding: 2rem;
    max-width: 900px;
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

@media (max-width: 768px) {
    .website-form-container {
        padding: 1rem;
    }
}
</style>
