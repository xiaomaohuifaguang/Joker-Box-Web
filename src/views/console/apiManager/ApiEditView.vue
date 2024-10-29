<template>
    <div v-loading="loading">
        <el-row :gutter="20">
            <el-col :span="24">
                <el-form label-position="left" label-width="auto">
                    <el-form-item label="服务">
                        <el-input v-model="info.server" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="api路径">
                        <el-input v-model="info.path" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="名称">
                        <el-input v-model="info.name" autocomplete="off" disabled />
                    </el-form-item>
                    <!-- <el-form-item label="白名单">
                        <el-input v-model="info.whiteListStr" autocomplete="off" disabled />
                    </el-form-item> -->
                    <el-form-item label="白名单">
                        <el-radio-group v-model="info.whiteList" :disabled="props.type != 'edit'">
                            <el-radio value="1" size="large">开启</el-radio>
                            <el-radio value="0" size="large">关闭</el-radio>
                        </el-radio-group>
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
        <div style="display: flex;justify-content: center;" v-if="props.type == 'edit'">
            <el-button type="primary" plain @click="saveApiPath" size="large">保存</el-button>
        </div>
    </div>

</template>

<script setup lang='ts'>
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const props = defineProps({
    server: String,
    path: String,
    type: String
})

const loading = ref(false)

const info = ref({
    "path": "/apiPath/info",
    "server": "joker-box",
    "whiteList": "0",
    "name": "api信息",
    "groupName": "api路径管理",
    "createTime": "2024-10-13 19:26:08",
    "updateTime": "2024-10-13 19:26:08",
    "roleBind": false,
    "whiteListStr": "否"
})

const queryInfo = () => {
    loading.value = true
    console.log(props.server)
    http.result({
        url: '/apiPath/info',
        method: 'POST',
        params: {
            server: props.server,
            path: props.path
        },
        success(result) {
            info.value = result.data
            loading.value = false
        }
    })
}

const saveApiPath = () => {
    loading.value = true
    http.result({
        url: '/apiPath/update',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            queryInfo()
        }
    })
}

onMounted(() => {
    if (props.server == '' || props.path == '') return;
    queryInfo()
})

</script>

<style scoped>
.el-col {
    margin-top: 1rem;
}
</style>