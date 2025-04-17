<template>
    <div v-loading="loading">
        <el-row :gutter="20">
            <el-col :span="24">
                <el-form label-position="left" label-width="auto">
                    <el-form-item label="流程id">
                        <el-input v-model="info.id" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="流程定义key">
                        <el-input v-model="info.processKey" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="流程定义名称">
                        <el-input v-model="info.processName" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="流程描述">
                        <el-input v-model="info.processDescription" autocomplete="off"
                            :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="使用版本">
                        <el-input v-model="info.version" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="流程状态">
                        <el-input v-model="info.status" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="创建人userid">
                        <el-input v-model="info.createUserId" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-input v-model="info.createTime" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="更新时间">
                        <el-input v-model="info.updateTime" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="逻辑删除">
                        <el-input v-model="info.deleted" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-divider />
        <div style="display: flex;justify-content: center;" v-if="props.type == 'edit'">
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
    id: '',
    processKey: '',
    processName: '',
    processDescription: '',
    version: '',
    status: '',
    createUserId: '',
    createTime: '',
    updateTime: '',
    deleted: '',
})

const queryInfo = () => {
    loading.value = true
    console.log(props.id)
    http.result({
        url: '/processDefinition/info',
        method: 'POST',
        data: {
            id: props.id
        },
        success(result) {
            info.value = result.data
            loading.value = false
        }
    })
}

const save = () => {
    loading.value = true
    http.result({
        url: '/processDefinition/update',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            queryInfo()
        }
    })
}

onMounted(() => {
    if (props.id == '') return;
    queryInfo()
})

</script>

<style scoped>
.el-col {
    margin-top: 1rem;
}
</style>