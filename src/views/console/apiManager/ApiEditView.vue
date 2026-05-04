<template>
    <div class="api-edit-page" v-loading="loading" element-loading-text="加载中...">
        <div class="info-card">
            <div class="card-header">
                <div class="header-icon">
                    <el-icon><Connection /></el-icon>
                </div>
                <span class="header-title">{{ props.type === 'view' ? 'API详情' : '编辑API' }}</span>
            </div>
            <div class="card-body">
                <el-form label-position="top" class="api-form">
                    <el-row :gutter="20">
                        <el-col :xs="24" :sm="12">
                            <el-form-item label="服务名称">
                                <el-input v-model="info.server" disabled>
                                    <template #prefix>
                                        <el-icon><Monitor /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="12">
                            <el-form-item label="API路径">
                                <el-input v-model="info.path" disabled>
                                    <template #prefix>
                                        <el-icon><Link /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :xs="24" :sm="12">
                            <el-form-item label="API名称">
                                <el-input v-model="info.name" disabled>
                                    <template #prefix>
                                        <el-icon><Document /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="12">
                            <el-form-item label="分组名称">
                                <el-input v-model="info.groupName" disabled>
                                    <template #prefix>
                                        <el-icon><Folder /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :xs="24" :sm="12">
                            <el-form-item label="白名单">
                                <div class="whitelist-section">
                                    <el-radio-group v-model="info.whiteList" :disabled="props.type !== 'edit'">
                                        <el-radio-button value="1">
                                            <el-icon><Check /></el-icon>
                                            <span>开启</span>
                                        </el-radio-button>
                                        <el-radio-button value="0">
                                            <el-icon><Close /></el-icon>
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
                        </el-col>
                        <el-col :xs="24" :sm="12">
                            <el-form-item label="角色绑定">
                                <el-tag :type="info.roleBind ? 'success' : 'info'" effect="light" class="role-tag">
                                    <el-icon><User /></el-icon>
                                    <span>{{ info.roleBind ? '已绑定' : '未绑定' }}</span>
                                </el-tag>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :xs="24" :sm="12">
                            <el-form-item label="创建时间">
                                <el-input v-model="info.createTime" disabled>
                                    <template #prefix>
                                        <el-icon><Clock /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="12">
                            <el-form-item label="更新时间">
                                <el-input v-model="info.updateTime" disabled>
                                    <template #prefix>
                                        <el-icon><Timer /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </div>
        </div>

        <div class="action-bar" v-if="props.type === 'edit'">
            <el-button type="primary" size="large" @click="saveApiPath" :loading="loading">
                <el-icon><Check /></el-icon>
                <span>保存修改</span>
            </el-button>
        </div>
    </div>
</template>

<script setup lang='ts'>
import {
    Connection,
    Monitor,
    Link,
    Document,
    Folder,
    Check,
    Close,
    User,
    Clock,
    Timer
} from '@element-plus/icons-vue'
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

const queryInfo = async () => {
    if (!props.server || !props.path) return

    loading.value = true
    try {
        info.value = await http.post('/apiPath/info', undefined, {
            params: {
                server: props.server,
                path: props.path
            }
        })
    } finally {
        loading.value = false
    }
}

const saveApiPath = async () => {
    loading.value = true
    try {
        const result = await http.post('/apiPath/update', info.value, { raw: true })
        alert(result.msg, 'success')
        queryInfo()
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    if (props.server === '' || props.path === '') return
    queryInfo()
})
</script>

<style scoped lang="scss">
.api-edit-page {
    padding: 24px;
    background: var(--el-bg-color-page);
    min-height: 400px;

    .info-card {
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                color: var(--el-text-color-primary);
            }
        }

        .api-form {
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

            .role-tag {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                font-size: 14px;

                .el-icon {
                    font-size: 14px;
                }
            }
        }
    }

    .action-bar {
        display: flex;
        justify-content: center;
        padding-top: 8px;

        .el-button {
            min-width: 180px;
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

@media (max-width: 768px) {
    .api-edit-page {
        padding: 16px;

        .info-card {
            padding: 16px;
        }

        .whitelist-section {
            flex-direction: column;
            align-items: flex-start !important;
        }
    }
}
</style>
