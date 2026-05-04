<template>
    <div class="role-edit-page">
        <div v-loading="loading" element-loading-text="加载中...">
            <el-row :gutter="24">
                <el-col :xs="24" :sm="24" :md="8" :lg="8">
                    <div class="info-card">
                        <div class="card-header">
                            <div class="header-icon">
                                <el-icon>
                                    <User />
                                </el-icon>
                            </div>
                            <span class="header-title">角色信息</span>
                        </div>
                        <div class="card-body">
                            <el-form label-position="top" class="info-form">
                                <el-form-item label="角色ID">
                                    <el-input v-model="info.id" disabled>
                                        <template #prefix>
                                            <el-icon>
                                                <Key />
                                            </el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="角色名称">
                                    <el-input v-model="info.name" :disabled="props.type !== 'edit'">
                                        <template #prefix>
                                            <el-icon>
                                                <User />
                                            </el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="管理员权限">
                                    <el-radio-group v-model="info.admin" :disabled="props.type !== 'edit'"
                                        class="admin-radio">
                                        <el-radio-button value="1">是</el-radio-button>
                                        <el-radio-button value="0">否</el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                                <el-form-item label="创建时间">
                                    <el-input v-model="info.createTime" disabled>
                                        <template #prefix>
                                            <el-icon>
                                                <Clock />
                                            </el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="更新时间">
                                    <el-input v-model="info.updateTime" disabled>
                                        <template #prefix>
                                            <el-icon>
                                                <Timer />
                                            </el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                </el-col>

                <el-col :xs="24" :sm="24" :md="16" :lg="16">
                    <div class="permission-card">
                        <el-tabs v-model="activeTab" class="permission-tabs">
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
                                                                    :key="apiPath.path" :value="apiPath.path"
                                                                    :disabled="props.id === '1' || props.type !== 'edit' || apiPath.whiteList === '1'"
                                                                    class="api-checkbox">
                                                                    <span
                                                                        :class="{ 'whitelist-api': apiPath.whiteList === '1' }">
                                                                        {{ apiPath.name }}
                                                                        <el-tag v-if="apiPath.whiteList === '1'"
                                                                            size="small" type="success" effect="plain"
                                                                            class="whitelist-tag">
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

                            <el-tab-pane label="后台菜单权限" name="consoleMenu">
                                <div class="menu-permission-container">
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
                                </div>
                            </el-tab-pane>

                            <el-tab-pane label="前台菜单权限" name="indexMenu">
                                <div class="menu-permission-container">
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
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                </el-col>
            </el-row>

            <div class="action-bar" v-if="props.type === 'edit'">
                <el-button type="primary" size="large" @click="saveRole" :loading="loading">
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
import { Check, User, Key, Clock, Timer } from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const props = defineProps({
    id: String,
    type: String
})

const loading = ref(false)
const activeTab = ref('api')
const apiServerTab = ref('')
const apiGroupTab = ref('')
const apiPathSelection = ref<any[]>([])

const info = ref({
    "id": '',
    "name": "",
    "deleted": "0",
    "createTime": "",
    "updateTime": "",
    "admin": ""
})

const apiPathTree = ref<any[]>([])
const consoleMenuTree = ref<any[]>([])
const consoleMenuChoose = ref<any[]>([])
const indexMenuTree = ref<any[]>([])
const indexMenuChoose = ref<any[]>([])

const initApiPathSelection = () => {
    apiPathSelection.value = []
    apiPathTree.value.forEach((server: any) => {
        server.groups.forEach((group: any) => {
            group.apiPaths.forEach((apiPath: any) => {
                if (apiPath.roleBind) {
                    apiPathSelection.value.push(apiPath.path)
                }
            })
        })
    })
}

const queryInfo = async () => {
    if (!props.id) return;

    loading.value = true
    try {
        info.value = await http.post('/role/info', undefined, { params: { roleId: props.id } })
        queryApiTree()
    } finally {
        loading.value = false
    }
}

const queryApiTree = async () => {
    apiPathTree.value = await http.post('/role/apiPathTreeWithRole', undefined, { params: { roleId: props.id } })
    if (apiPathTree.value.length > 0) {
        apiServerTab.value = apiPathTree.value[0].server
        if (apiPathTree.value[0].groups.length > 0) {
            apiGroupTab.value = apiPathTree.value[0].groups[0].groupName
        }
    }
    initApiPathSelection()
}

const queryMenuTree = async (menuType: string) => {
    const result = await http.get('/menu/menuTreeAll', { params: { menuType } })
    if (menuType === "-1") {
        consoleMenuTree.value = result
    } else if (menuType === "-2") {
        indexMenuTree.value = result
    }
}

const queryMenuChoose = async (menuType: string) => {
    const result = await http.get('/menu/menuChoose', {
        params: {
            roleId: props.id,
            menuType
        }
    })
    if (menuType === "-1") {
        consoleMenuChoose.value = result
    } else if (menuType === "-2") {
        indexMenuChoose.value = result
    }
}

const updateApiPathRoleBind = () => {
    apiPathTree.value.forEach((server: any) => {
        server.groups.forEach((group: any) => {
            group.apiPaths.forEach((apiPath: any) => {
                apiPath.roleBind = apiPathSelection.value.includes(apiPath.path)
            })
        })
    })
}

const saveRole = async () => {
    loading.value = true
    updateApiPathRoleBind()

    try {
        const result = await http.post('/role/save', {
            role: info.value,
            apiPathTree: apiPathTree.value,
            menuChoose: [...consoleMenuChoose.value, ...indexMenuChoose.value]
        }, { raw: true })
        alert(result.msg, 'success')
        queryInfo()
    } finally {
        loading.value = false
    }
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
.role-edit-page {
    padding: 24px;
    background: var(--bg-page);

    .info-card,
    .permission-card {
        background: var(--bg-container);
        border-radius: 16px;
        padding: 24px;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border-light);
        margin-bottom: 24px;

        .card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-light);

            .header-icon {
                width: 42px;
                height: 42px;
                background: var(--brand-gradient);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;

                .el-icon {
                    font-size: 20px;
                    color: white;
                }
            }

            .header-title {
                font-size: 18px;
                font-weight: 600;
                color: var(--text-primary);
            }
        }

        .info-form {
            :deep(.el-form-item__label) {
                font-weight: 500;
                color: var(--text-regular);
                padding-bottom: 8px;
            }

            :deep(.el-input__wrapper) {
                border-radius: 10px;
            }

            .admin-radio {
                width: 100%;

                :deep(.el-radio-button) {
                    flex: 1;
                }
            }
        }
    }

    .permission-tabs {
        :deep(.el-tabs__header) {
            margin-bottom: 20px;
        }
    }

    .server-tabs,
    .group-tabs {
        :deep(.el-tabs__header) {
            margin-bottom: 16px;
        }
    }

    .api-permission-container {
        border: 1px solid var(--border-light);
        border-radius: 12px;
        padding: 16px;
    }

    .menu-permission-container {
        border: 1px solid var(--border-light);
        border-radius: 12px;
        overflow: hidden;
    }

    .api-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 12px;

        .api-checkbox {
            display: flex;
            align-items: center;
            margin-right: 0;
            padding: 10px 12px;
            border-radius: 8px;
            transition: all 0.3s;
            border: 1px solid var(--border-light);

            &:hover {
                background-color: var(--bg-overlay);
                border-color: var(--brand-primary);
            }

            .whitelist-api {
                color: var(--success);

                .whitelist-tag {
                    margin-left: 8px;
                }
            }
        }
    }

    .action-bar {
        display: flex;
        justify-content: center;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--border-light);

        .el-button {
            min-width: 200px;
            height: 48px;
            font-size: 16px;
            border-radius: 12px;
            background: var(--brand-gradient);
            border: none;
            transition: all 0.3s;

            &:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-glow-strong);
            }
        }
    }
}

@media (max-width: 768px) {
    .role-edit-page {
        padding: 16px;

        .api-list {
            grid-template-columns: 1fr;
        }
    }
}
</style>
