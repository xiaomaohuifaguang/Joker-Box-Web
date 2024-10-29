<template>
    <div v-loading="loading">
        <el-row :gutter="20">
            <el-col :span="8">
                <el-form label-position="left" label-width="auto">
                    <el-form-item label="ID">
                        <el-input v-model="info.id" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="名称">
                        <el-input v-model="info.name" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-input v-model="info.createTime" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="更新时间">
                        <el-input v-model="info.updateTime" autocomplete="off" disabled />
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="16" v-if="apiPathTree.length > 0">
                <el-tabs style="height: 40vh;" :model-value="apiPathTree[0].server">
                    <el-tab-pane v-for="server in apiPathTree" :name="server.server" :label="server.server">
                        <el-tabs :model-value="apiPathTree[0].groups[0].groupName">
                            <el-tab-pane v-for="group in server.groups" :name="group.groupName"
                                :label="group.groupName">
                                <div>
                                    <el-row :gutter="20">
                                        <el-col :span="12" v-for="apiPath in group.apiPaths">
                                            <el-checkbox v-model="apiPath.roleBind"
                                                :disabled="props.id == '1' || props.type != 'edit'"
                                                v-show="apiPath.whiteList == '0'">
                                                {{ apiPath.name }}
                                            </el-checkbox>
                                            <el-checkbox :model-value='true' disabled v-show="apiPath.whiteList == '1'">
                                                {{ apiPath.name }}
                                            </el-checkbox>
                                        </el-col>
                                    </el-row>
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>
        <el-divider />
        <div style="display: flex;justify-content: center;" v-if="props.type == 'edit'">
            <el-button type="primary" plain @click="saveRole" size="large">保存</el-button>
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
    "id": '',
    "name": "",
    "deleted": "0",
    "createTime": "",
    "updateTime": ""
})

const apiPathTree = ref([])

const apiPathTreeTabs = ref({
    level_1: '',
    level_2: ''
})

const queryInfo = () => {
    loading.value = true
    http.result({
        url: '/role/info',
        method: 'POST',
        params: {
            roleId: props.id
        },
        success(result) {
            info.value = result.data
            queryApiTree()
            loading.value = false
        }
    })
}

const queryApiTree = () => {
    console.log(apiPathTreeTabs.value)
    http.result({
        url: '/role/apiPathTreeWithRole',
        method: 'POST',
        params: {
            roleId: props.id
        },
        success(result) {
            apiPathTree.value = result.data
            // apiPathTreeTabs.value.level_1 = apiPathTree.value[0].server
            // apiPathTreeTabs.value.level_2 = apiPathTree.value[0].groups[0].groupName
        }
    })
}

const saveRole = () => {
    loading.value = true
    http.result({
        url: '/role/save',
        method: 'POST',
        data: {
            role: info.value,
            apiPathTree: apiPathTree.value
        },
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