<template>
    <div class="role-management-container">
        <div v-loading="loading" element-loading-text="加载中..." element-loading-background="rgba(255, 255, 255, 0.7)">
            <el-row :gutter="24">
                <!-- 角色基本信息 -->
                <el-col :xs="24" :sm="24" :md="8" :lg="8">
                    <el-card class="info-card" shadow="never">
                        <template #header>
                            <div class="card-header">
                                <span>角色信息</span>
                            </div>
                        </template>

                        <el-form label-position="top">
                            <el-form-item label="角色ID">
                                <el-input v-model="info.id" disabled />
                            </el-form-item>
                            <el-form-item label="角色名称">
                                <el-input v-model="info.name" :disabled="props.type !== 'edit'" />
                            </el-form-item>
                            <el-form-item label="管理员权限">
                                <el-radio-group v-model="info.admin" :disabled="props.type !== 'edit'">
                                    <el-radio-button label="1">是</el-radio-button>
                                    <el-radio-button label="0">否</el-radio-button>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item label="创建时间">
                                <el-input v-model="info.createTime" disabled />
                            </el-form-item>
                            <el-form-item label="更新时间">
                                <el-input v-model="info.updateTime" disabled />
                            </el-form-item>
                        </el-form>
                    </el-card>
                </el-col>

                <!-- 权限配置 -->
                <el-col :xs="24" :sm="24" :md="16" :lg="16">
                    <el-card class="permission-card" shadow="never">
                        <el-tabs v-model="activeTab" class="permission-tabs">
                            <!-- API权限配置 -->
                            <el-tab-pane label="API权限配置" name="api">
                                <div v-if="apiPathTree.length > 0" class="api-permission-container">
                                    <el-tabs v-model="apiServerTab" type="card" class="server-tabs">
                                        <el-tab-pane v-for="server in apiPathTree" :key="server.server"
                                            :label="server.server" :name="server.server">
                                            <el-tabs v-model="apiGroupTab" type="card" class="group-tabs">
                                                <el-tab-pane v-for="group in server.groups" :key="group.groupName"
                                                    :label="group.groupName" :name="group.groupName">
                                                    <el-scrollbar height="400px">
                                                        <el-checkbox-group v-model="apiPathSelection">
                                                            <div class="api-list">
                                                                <el-checkbox v-for="apiPath in group.apiPaths"
                                                                    :key="apiPath.path" :label="apiPath.path"
                                                                    :disabled="props.id === '1' || props.type !== 'edit' || apiPath.whiteList === '1'">
                                                                    <span
                                                                        :class="{ 'whitelist-api': apiPath.whiteList === '1' }">
                                                                        {{ apiPath.name }}
                                                                        <el-tag v-if="apiPath.whiteList === '1'"
                                                                            size="small" type="success" effect="plain">
                                                                            白名单
                                                                        </el-tag>
                                                                    </span>
                                                                </el-checkbox>
                                                            </div>
                                                        </el-checkbox-group>
                                                    </el-scrollbar>
                                                </el-tab-pane>
                                            </el-tabs>
                                        </el-tab-pane>
                                    </el-tabs>
                                </div>
                                <el-empty v-else description="暂无API权限配置" :image-size="100" />
                            </el-tab-pane>

                            <!-- 后台菜单权限 -->
                            <el-tab-pane label="后台菜单权限" name="consoleMenu">
                                <el-scrollbar>
                                    <el-cascader-panel style="height: 500px" v-model="consoleMenuChoose"
                                        :options="consoleMenuTree" :props="{
                                            children: 'children',
                                            label: 'name',
                                            value: 'id',
                                            multiple: true,
                                            emitPath: false,
                                            checkStrictly: true,
                                        }" :disabled="props.type !== 'edit'" />
                                </el-scrollbar>
                            </el-tab-pane>

                            <!-- 前台菜单权限 -->
                            <el-tab-pane label="前台菜单权限" name="indexMenu">
                                <el-scrollbar>
                                    <el-cascader-panel style="height: 500px" v-model="indexMenuChoose"
                                        :options="indexMenuTree" :props="{
                                            children: 'children',
                                            label: 'name',
                                            value: 'id',
                                            multiple: true,
                                            emitPath: false,
                                            checkStrictly: true,
                                        }" :disabled="props.type !== 'edit'" />
                                </el-scrollbar>
                            </el-tab-pane>
                        </el-tabs>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 保存按钮 -->
            <div class="action-bar" v-if="props.type === 'edit'">
                <el-button type="primary" size="large" @click="saveRole">
                    <el-icon>
                        <Check />
                    </el-icon>
                    <span>保存角色配置</span>
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
    id: String,
    type: String
})

const loading = ref(false)
const activeTab = ref('api')
const apiServerTab = ref('')
const apiGroupTab = ref('')
const apiPathSelection = ref([])

const info = ref({
    "id": '',
    "name": "",
    "deleted": "0",
    "createTime": "",
    "updateTime": "",
    "admin": ""
})

const apiPathTree = ref([])
const consoleMenuTree = ref([])
const consoleMenuChoose = ref([])
const indexMenuTree = ref([])
const indexMenuChoose = ref([])

// 初始化API权限选择
const initApiPathSelection = () => {
    apiPathSelection.value = []
    apiPathTree.value.forEach(server => {
        server.groups.forEach(group => {
            group.apiPaths.forEach(apiPath => {
                if (apiPath.roleBind) {
                    apiPathSelection.value.push(apiPath.path)
                }
            })
        })
    })
}

const queryInfo = () => {
    if (!props.id) return;

    loading.value = true
    http.result({
        url: '/role/info',
        method: 'POST',
        params: { roleId: props.id },
        success(result) {
            info.value = result.data
            queryApiTree()
            loading.value = false
        }
    })
}

const queryApiTree = () => {
    http.result({
        url: '/role/apiPathTreeWithRole',
        method: 'POST',
        params: { roleId: props.id },
        success(result) {
            apiPathTree.value = result.data
            if (apiPathTree.value.length > 0) {
                apiServerTab.value = apiPathTree.value[0].server
                if (apiPathTree.value[0].groups.length > 0) {
                    apiGroupTab.value = apiPathTree.value[0].groups[0].groupName
                }
            }
            initApiPathSelection()
        }
    })
}

const queryMenuTree = (menuType: string) => {
    http.result({
        url: '/menu/menuTreeAll',
        method: 'GET',
        params: { menuType },
        success(result) {
            if (menuType === "-1") {
                consoleMenuTree.value = result.data
            } else if (menuType === "-2") {
                indexMenuTree.value = result.data
            }
        }
    })
}

const queryMenuChoose = (menuType: string) => {
    http.result({
        url: '/menu/menuChoose',
        method: 'GET',
        params: {
            roleId: props.id,
            menuType
        },
        success(result) {
            if (menuType === "-1") {
                consoleMenuChoose.value = result.data
            } else if (menuType === "-2") {
                indexMenuChoose.value = result.data
            }
        }
    })
}

// 更新API权限绑定状态
const updateApiPathRoleBind = () => {
    apiPathTree.value.forEach(server => {
        server.groups.forEach(group => {
            group.apiPaths.forEach(apiPath => {
                apiPath.roleBind = apiPathSelection.value.includes(apiPath.path)
            })
        })
    })
}

const saveRole = () => {
    loading.value = true
    updateApiPathRoleBind()

    http.result({
        url: '/role/save',
        method: 'POST',
        data: {
            role: info.value,
            apiPathTree: apiPathTree.value,
            menuChoose: [...consoleMenuChoose.value, ...indexMenuChoose.value]
        },
        success(result) {
            alert(result.msg, 'success')
            queryInfo()
            loading.value = false
        }
    })
}

onMounted(() => {
    if (!props.id) return;

    queryInfo()
    queryMenuTree("-1")
    queryMenuChoose("-1")
    queryMenuTree("-2")
    queryMenuChoose("-2")
})
</script>

<style scoped lang="scss">
.role-management-container {
    padding: 20px;
    background-color: var(--el-bg-color-page);
}

.info-card,
.permission-card {
    margin-bottom: 20px;
    border-radius: 8px;

    :deep(.el-card__header) {
        border-bottom: 1px solid var(--el-border-color-light);
        padding: 16px 20px;
    }
}

.permission-tabs {
    :deep(.el-tabs__header) {
        margin-bottom: 16px;
    }
}

.server-tabs,
.group-tabs {
    :deep(.el-tabs__header) {
        margin-bottom: 12px;
    }
}

.api-permission-container {
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    padding: 10px;
}

.api-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;

    .el-checkbox {
        display: flex;
        align-items: center;
        margin-right: 0;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
            background-color: var(--el-fill-color-light);
        }
    }
}

.whitelist-api {
    color: var(--el-color-success);
}

.action-bar {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-light);
}

@media (max-width: 768px) {
    .api-list {
        grid-template-columns: 1fr;
    }
}
</style>