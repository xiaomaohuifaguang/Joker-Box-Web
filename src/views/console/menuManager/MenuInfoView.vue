<template>
    <div class="menu-info-page">
        <div v-loading="loading" element-loading-text="加载中...">
            <el-row :gutter="24">
                <!-- 菜单基本信息 -->
                <el-col :xs="24" :sm="24" :md="8" :lg="8">
                    <div class="info-card">
                        <div class="card-header">
                            <div class="header-icon">
                                <el-icon><Menu /></el-icon>
                            </div>
                            <span class="header-title">{{ props.type === 'view' ? '菜单详情' : '编辑菜单' }}</span>
                        </div>
                        <div class="card-body">
                            <el-form label-position="top" class="info-form">
                                <el-form-item label="路由路径">
                                    <el-input v-model="info.path" :disabled="props.type !== 'edit'">
                                        <template #prefix>
                                            <el-icon><Link /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="菜单名称">
                                    <el-input v-model="info.name" :disabled="props.type !== 'edit'">
                                        <template #prefix>
                                            <el-icon><Document /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="排序权重">
                                    <el-input-number
                                        v-model="info.sort"
                                        :min="0"
                                        :max="999"
                                        :disabled="props.type !== 'edit'"
                                        controls-position="right"
                                        style="width: 100%" />
                                </el-form-item>
                                <el-form-item label="白名单状态">
                                    <div class="whitelist-section">
                                        <el-radio-group v-model="info.whiteList" :disabled="props.type !== 'edit'">
                                            <el-radio-button value="1">
                                                <el-icon><Unlock /></el-icon>
                                                <span>开启</span>
                                            </el-radio-button>
                                            <el-radio-button value="0">
                                                <el-icon><Lock /></el-icon>
                                                <span>关闭</span>
                                            </el-radio-button>
                                        </el-radio-group>
                                        <el-tag v-if="info.whiteList === '1'" type="success" effect="light" class="status-tag">
                                            当前状态: 已开启
                                        </el-tag>
                                        <el-tag v-else type="info" effect="light" class="status-tag">
                                            当前状态: 已关闭
                                        </el-tag>
                                    </div>
                                </el-form-item>
                                <el-form-item label="菜单图标">
                                    <div class="icon-selector">
                                        <div class="icon-preview" :style="{ background: info.icon ? '#667eea' : '#909399' }">
                                            <el-icon :size="28" color="white">
                                                <component :is="info.icon || 'Menu'" />
                                            </el-icon>
                                        </div>
                                        <el-button v-if="props.type === 'edit'" type="primary" plain @click="dialogIcon.open = true">
                                            <el-icon><Grid /></el-icon>
                                            <span>选择图标</span>
                                        </el-button>
                                    </div>
                                </el-form-item>
                                <el-form-item label="创建时间">
                                    <el-input v-model="info.createTime" disabled>
                                        <template #prefix>
                                            <el-icon><Clock /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="更新时间">
                                    <el-input v-model="info.updateTime" disabled>
                                        <template #prefix>
                                            <el-icon><Timer /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                </el-col>

                <!-- API权限配置 -->
                <el-col :xs="24" :sm="24" :md="16" :lg="16">
                    <div class="permission-card">
                        <div class="card-header">
                            <div class="header-icon permission">
                                <el-icon><Connection /></el-icon>
                            </div>
                            <span class="header-title">API权限配置</span>
                        </div>
                        <div class="card-body">
                            <div v-if="apiPathTree.length > 0" class="api-permission-container">
                                <el-tabs v-model="activeServerTab" type="card" class="server-tabs">
                                    <el-tab-pane v-for="server in apiPathTree" :key="server.server" :label="server.server" :name="server.server">
                                        <el-tabs v-model="activeGroupTab" type="card" class="group-tabs">
                                            <el-tab-pane v-for="group in server.groups" :key="group.groupName" :label="group.groupName" :name="group.groupName">
                                                <el-scrollbar height="400px">
                                                    <el-checkbox-group v-model="apiPathSelection">
                                                        <div class="api-list">
                                                            <el-checkbox
                                                                v-for="apiPath in group.apiPaths"
                                                                :key="apiPath.path"
                                                                :value="apiPath.path"
                                                                :disabled="props.id === '1' || props.type !== 'edit' || apiPath.whiteList === '1'"
                                                                class="api-checkbox">
                                                                <span :class="{ 'whitelist-api': apiPath.whiteList === '1' }">
                                                                    {{ apiPath.name }}
                                                                    <el-tag v-if="apiPath.whiteList === '1'" size="small" type="success" effect="plain" class="whitelist-tag">
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
                        </div>
                    </div>
                </el-col>
            </el-row>

            <!-- 保存按钮 -->
            <div class="action-bar" v-if="props.type === 'edit'">
                <el-button type="primary" size="large" @click="save" :loading="loading">
                    <el-icon><Check /></el-icon>
                    <span>保存菜单配置</span>
                </el-button>
            </div>
        </div>

        <!-- 图标选择对话框 -->
        <el-dialog
            v-model="dialogIcon.open"
            title="选择菜单图标"
            width="800px"
            center
            destroy-on-close
            class="icon-dialog">
            <IconSelector v-model:name="info.icon" />
            <template #footer>
                <el-button @click="dialogIcon.open = false" size="large">取消</el-button>
                <el-button type="primary" @click="dialogIcon.open = false" size="large">确认</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {
    Check,
    Menu,
    Link,
    Document,
    Unlock,
    Lock,
    Grid,
    Clock,
    Timer,
    Connection
} from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

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
    sort: 0
})

const apiPathTree = ref<any[]>([])
const activeServerTab = ref('')
const activeGroupTab = ref('')
const apiPathSelection = ref<any[]>([])

// 初始化API权限选择
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

// 更新API权限绑定状态
const updateApiPathRoleBind = () => {
    apiPathTree.value.forEach((server: any) => {
        server.groups.forEach((group: any) => {
            group.apiPaths.forEach((apiPath: any) => {
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
.menu-info-page {
    padding: 24px;
    background: var(--el-bg-color-page);
    min-height: 400px;

    .info-card,
    .permission-card {
        background: var(--el-bg-color);
        border-radius: 16px;
        padding: 24px;
        box-shadow: var(--el-box-shadow-light);
        border: 1px solid var(--el-border-color-lighter);
        margin-bottom: 24px;

        .card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--el-border-color-lighter);

            .header-icon {
                width: 42px;
                height: 42px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;

                &:not(.permission) {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                &.permission {
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                }

                .el-icon {
                    font-size: 20px;
                    color: white;
                }
            }

            .header-title {
                font-size: 18px;
                font-weight: 600;
                color: var(--el-text-color-primary);
            }
        }

        .card-body {
            .info-form {
                :deep(.el-form-item__label) {
                    font-weight: 500;
                    color: var(--el-text-color-regular);
                    padding-bottom: 8px;
                }

                :deep(.el-input__wrapper) {
                    border-radius: 10px;
                }

                .whitelist-section {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;

                    .el-radio-group {
                        .el-radio-button {
                            .el-icon {
                                margin-right: 4px;
                            }
                        }
                    }

                    .status-tag {
                        font-size: 13px;
                    }
                }

                .icon-selector {
                    display: flex;
                    align-items: center;
                    gap: 16px;

                    .icon-preview {
                        width: 56px;
                        height: 56px;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s;

                        .el-icon {
                            color: white;
                        }
                    }
                }
            }

            .api-permission-container {
                border: 1px solid var(--el-border-color-lighter);
                border-radius: 12px;
                padding: 16px;

                .server-tabs,
                .group-tabs {
                    :deep(.el-tabs__header) {
                        margin-bottom: 12px;
                    }
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
                        border: 1px solid var(--el-border-color-lighter);

                        &:hover {
                            background-color: var(--el-fill-color-light);
                            border-color: var(--el-color-primary);
                        }

                        .whitelist-api {
                            color: var(--el-color-success);

                            .whitelist-tag {
                                margin-left: 8px;
                            }
                        }
                    }
                }
            }
        }
    }

    .action-bar {
        display: flex;
        justify-content: center;
        padding-top: 8px;

        .el-button {
            min-width: 200px;
            height: 48px;
            font-size: 16px;
            border-radius: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            transition: all 0.3s;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            }
        }
    }
}

.icon-dialog {
    :deep(.el-dialog__header) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0;
        padding: 20px 24px;

        .el-dialog__title {
            color: white;
            font-weight: 600;
        }

        .el-dialog__headerbtn .el-dialog__close {
            color: white;
        }
    }

    :deep(.el-dialog__body) {
        padding: 24px;
    }

    :deep(.el-dialog__footer) {
        padding: 16px 24px;
        border-top: 1px solid var(--el-border-color-lighter);
    }
}

@media (max-width: 768px) {
    .menu-info-page {
        padding: 16px;

        .info-card,
        .permission-card {
            padding: 16px;
        }

        .api-list {
            grid-template-columns: 1fr;
        }
    }
}
</style>
