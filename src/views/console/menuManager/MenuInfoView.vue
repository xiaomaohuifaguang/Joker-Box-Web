<template>
    <div v-loading="loading">
        <el-row :gutter="20">
            <el-col :span="8">
                <el-form label-position="left" label-width="auto">
                    <!-- <div style="text-align: center;margin-bottom: 1rem;">
                        <el-icon size="100" color="#409eff">
                            <component :is="info.icon" />
                        </el-icon>
                    </div> -->

                    <!-- <el-form-item label="id">
                        <el-input v-model="info.id" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="父级id 根路径 -1">
                        <el-input v-model="info.parentId" autocomplete="off" disabled />
                    </el-form-item> -->
                    <el-form-item label="路由">
                        <el-input v-model="info.path" autocomplete="off" :disabled="props.type != 'edit'" />
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
                    <!-- <el-form-item label="创建人">
                        <el-input v-model="info.userId" autocomplete="off" disabled />
                    </el-form-item> -->
                    <el-form-item label="图标">
                        <!-- <el-input v-model="info.icon" autocomplete="off" :disabled="props.type != 'edit'" /> -->
                        <el-icon size="50" color="#409eff">
                            <component :is="info.icon" />
                        </el-icon>
                        <el-button v-if="props.type == 'edit'"
                            @click="() => { dialogIcon.open = true }">选择图标</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="16">
                <el-tabs model-value="api配置">
                    <el-tab-pane name="api配置" label="api配置" v-if="apiPathTree.length > 0">
                        <el-tabs style="min-height: 40vh;" :model-value="apiPathTree[0].server">
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
                                                    <el-checkbox :model-value='true' disabled
                                                        v-show="apiPath.whiteList == '1'">
                                                        {{ apiPath.name }}
                                                    </el-checkbox>
                                                </el-col>
                                            </el-row>
                                        </div>
                                    </el-tab-pane>
                                </el-tabs>
                            </el-tab-pane>
                        </el-tabs>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>
        <el-divider />
        <div style="display: flex;justify-content: center;" v-if="props.type == 'edit'">
            <el-button type="primary" plain @click="save" size="large">保存</el-button>
        </div>
    </div>
    <el-dialog v-model="dialogIcon.open" :title="dialogIcon.title" width="800" center @closed="() => { }">
        <IconSelector v-model:name="info.icon" />
    </el-dialog>
</template>

<script setup lang='ts'>
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const props = defineProps({
    id: String,
    type: String
})

const dialogIcon = ref({
    open: false,
    title: '图标选择'
})


const loading = ref(false)


const info = ref({
    id: '',
    parentId: '',
    path: '',
    name: '',
    createTime: '',
    updateTime: '',
    userId: '',
    icon: '',
})

const apiPathTree = ref([])

const queryInfo = () => {
    loading.value = true
    http.result({
        url: '/menu/info',
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

const queryApiTree = () => {
    http.result({
        url: '/menu/apiPathTreeWithMenu',
        method: 'POST',
        params: {
            menuId: props.id
        },
        success(result) {
            apiPathTree.value = result.data
        }
    })
}



const save = () => {
    loading.value = true
    http.result({
        url: '/menu/save',
        method: 'POST',
        data: {
            menu: info.value,
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
    queryApiTree()
})

</script>

<style scoped>
.el-col {
    margin-top: 1rem;
}
</style>