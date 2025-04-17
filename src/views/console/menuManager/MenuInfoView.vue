<template>
    <div class="menu-detail-container">
        <div v-loading="loading" element-loading-text="加载中..." element-loading-background="rgba(255, 255, 255, 0.7)">
            <el-row :gutter="24">
                <!-- 菜单基本信息 -->
                <el-col :xs="24" :sm="24" :md="8" :lg="8">
                    <el-card class="info-card" shadow="never">
                        <template #header>
                            <div class="card-header">
                                <span>菜单信息</span>
                            </div>
                        </template>

                        <el-form label-position="top">
                            <el-form-item label="路由路径">
                                <el-input v-model="info.path" :disabled="props.type !== 'edit'" />
                            </el-form-item>
                            <el-form-item label="菜单名称">
                                <el-input v-model="info.name" :disabled="props.type !== 'edit'" />
                            </el-form-item>
                            <el-form-item label="排序权重">
                                <el-input-number v-model="info.sort" :min="0" :max="999"
                                    :disabled="props.type !== 'edit'" controls-position="right" />
                            </el-form-item>
                            <el-form-item label="白名单状态">
                                <el-radio-group v-model="info.whiteList" :disabled="props.type !== 'edit'">
                                    <el-radio-button label="1">开启</el-radio-button>
                                    <el-radio-button label="0">关闭</el-radio-button>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item label="菜单图标">
                                <div class="icon-selector">
                                    <el-icon size="40" color="#409eff">
                                        <component :is="info.icon || 'Menu'" />
                                    </el-icon>
                                    <el-button v-if="props.type === 'edit'" type="primary" plain
                                        @click="dialogIcon.open = true">
                                        选择图标
                                    </el-button>
                                </div>
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

                <!-- API权限配置 -->
                <el-col :xs="24" :sm="24" :md="16" :lg="16">
                    <el-card class="api-permission-card" shadow="never">
                        <template #header>
                            <div class="card-header">
                                <span>API权限配置</span>
                            </div>
                        </template>

                        <div v-if="apiPathTree.length > 0">
                            <el-tabs v-model="activeServerTab" type="card" class="server-tabs">
                                <el-tab-pane v-for="server in apiPathTree" :key="server.server" :label="server.server"
                                    :name="server.server">
                                    <el-tabs v-model="activeGroupTab" type="card" class="group-tabs">
                                        <el-tab-pane v-for="group in server.groups" :key="group.groupName"
                                            :label="group.groupName" :name="group.groupName">
                                            <el-scrollbar height="400px">
                                                <el-checkbox-group v-model="apiPathSelection">
                                                    <div class="api-list">
                                                        <el-checkbox v-for="apiPath in group.apiPaths"
                                                            :key="apiPath.path" :label="apiPath.path"
                                                            :disabled="props.id === '1' || props.type !== 'edit' || apiPath.whiteList === '1'">
                                                            <span :class="{ 'whitelist-api': apiPath.whiteList === '1' }">
                                                                {{ apiPath.name }}
                                                                <el-tag v-if="apiPath.whiteList === '1'" size="small"
                                                                    type="success" effect="plain">
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
                    </el-card>
                </el-col>
            </el-row>

            <!-- 保存按钮 -->
            <div class="action-bar" v-if="props.type === 'edit'">
                <el-button type="primary" size="large" @click="save">
                    <el-icon>
                        <Check />
                    </el-icon>
                    <span>保存菜单配置</span>
                </el-button>
            </div>
        </div>

        <!-- 图标选择对话框 -->
        <el-dialog v-model="dialogIcon.open" title="选择菜单图标" width="800px" center destroy-on-close>
            <IconSelector v-model:name="info.icon" />
            <template #footer>
                <el-button @click="dialogIcon.open = false">取消</el-button>
                <el-button type="primary" @click="dialogIcon.open = false">确认</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { Check, Menu } from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
    id: String,
    type: String
})

const loading = ref(false)
const dialogIcon = ref({
    open: false,
    title: '图标选择'
})

const info = ref({
    id: '',
    parentId: '',
    path: '',
    name: '',
    createTime: '',
    updateTime: '',
    userId: '',
    icon: '',
    whiteList: '',
    sort: ''
})

const apiPathTree = ref([])
const activeServerTab = ref('')
const activeGroupTab = ref('')
const apiPathSelection = ref([])

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

const queryInfo = () => {
    if (!props.id) return;

    loading.value = true
    http.result({
        url: '/menu/info',
        method: 'POST',
        data: { id: props.id },
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
        params: { menuId: props.id },
        success(result) {
            apiPathTree.value = result.data
            if (apiPathTree.value.length > 0) {
                activeServerTab.value = apiPathTree.value[0].server
                if (apiPathTree.value[0].groups.length > 0) {
                    activeGroupTab.value = apiPathTree.value[0].groups[0].groupName
                }
            }
            initApiPathSelection()
        }
    })
}

const save = () => {
    loading.value = true
    updateApiPathRoleBind()

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
    if (!props.id) return;

    queryInfo()
    queryApiTree()
})
</script>

<style scoped lang="scss">
.menu-detail-container {
    padding: 20px;
    background-color: var(--el-bg-color-page);
}

.info-card,
.api-permission-card {
    margin-bottom: 20px;
    border-radius: 8px;

    :deep(.el-card__header) {
        border-bottom: 1px solid var(--el-border-color-light);
        padding: 16px 20px;
    }
}

.icon-selector {
    display: flex;
    align-items: center;
    gap: 16px;
}

.server-tabs,
.group-tabs {
    :deep(.el-tabs__header) {
        margin-bottom: 12px;
    }
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