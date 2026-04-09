<template>
    <div class="org-info-page" v-loading="loading" element-loading-text="加载中...">
        <div class="info-card">
            <div class="card-header">
                <div class="header-icon">
                    <el-icon><OfficeBuilding /></el-icon>
                </div>
                <span class="header-title">{{ props.type === 'view' ? '机构详情' : '编辑机构' }}</span>
            </div>
            <div class="card-body">
                <el-form label-position="top" class="info-form">
                    <el-row :gutter="20">
                        <el-col :xs="24" :sm="12">
                            <el-form-item label="机构ID">
                                <el-input v-model="info.id" disabled>
                                    <template #prefix>
                                        <el-icon><Key /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="12">
                            <el-form-item label="机构名称">
                                <el-input v-model="info.name" :disabled="props.type !== 'edit'">
                                    <template #prefix>
                                        <el-icon><OfficeBuilding /></el-icon>
                                    </template>
                                </el-input>
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
            <el-button type="primary" size="large" @click="save" :loading="loading">
                <el-icon><Check /></el-icon>
                <span>保存修改</span>
            </el-button>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { OfficeBuilding, Key, Clock, Timer, Check } from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const props = defineProps({
    id: String,
    type: String
})

const loading = ref(false)

const info = ref({
    id: '',
    parentId: '-1',
    parentName: '',
    name: '',
    deleted: '',
    createTime: '',
    updateTime: '',
})

const queryInfo = () => {
    if (!props.id) return

    loading.value = true
    http.result({
        url: '/org/info',
        method: 'POST',
        data: {
            id: props.id
        },
        success(result) {
            info.value = result.data
            loading.value = false
        },
        error() {
            loading.value = false
        }
    })
}

const save = () => {
    if (!info.value.name.trim()) {
        alert('请输入机构名称', 'warning')
        return
    }

    loading.value = true
    http.result({
        url: '/org/update',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            queryInfo()
        },
        error() {
            loading.value = false
        }
    })
}

onMounted(() => {
    if (props.id === '') return
    queryInfo()
})
</script>

<style scoped lang="scss">
.org-info-page {
    padding: 24px;
    background: var(--el-bg-color-page);
    min-height: 300px;

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

        .info-form {
            :deep(.el-form-item__label) {
                font-weight: 500;
                color: var(--el-text-color-regular);
                padding-bottom: 8px;
            }

            :deep(.el-input__wrapper) {
                border-radius: 10px;
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
    .org-info-page {
        padding: 16px;

        .info-card {
            padding: 16px;
        }
    }
}
</style>
