<template>
    <div class="detail-form-container">
        <div v-loading="loading" element-loading-text="加载中...">
            <div class="content-wrapper">
                <el-row :gutter="20">
                    <el-col :xs="24" :sm="24" :md="6" :lg="6">
                        <div class="info-card">
                            <div class="card-header">
                                <div class="header-icon">
                                    <el-icon><Document /></el-icon>
                                </div>
                                <span class="header-title">{{ props.type === 'view' ? '表单详情' : '编辑表单' }}</span>
                            </div>
                            <div class="card-body">
                                <el-form label-position="top" class="detail-form">
                                    <el-form-item label="表单ID">
                                        <el-input v-model="info.id" disabled size="large">
                                            <template #prefix>
                                                <el-icon><Key /></el-icon>
                                            </template>
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item label="表单名称">
                                        <el-input
                                            v-model="info.name"
                                            :disabled="props.type !== 'edit'"
                                            size="large">
                                            <template #prefix>
                                                <el-icon><Document /></el-icon>
                                            </template>
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item label="描述">
                                        <el-input
                                            v-model="info.description"
                                            :disabled="props.type !== 'edit'"
                                            type="textarea"
                                            :rows="3"
                                            size="large" />
                                    </el-form-item>
                                    <el-form-item label="版本">
                                        <el-input v-model="info.version" disabled size="large">
                                            <template #prefix>
                                                <el-icon><Tickets /></el-icon>
                                            </template>
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item label="状态">
                                        <div class="status-section">
                                            <el-tag v-if="info.status == '1'" type="success" effect="light" class="status-tag">
                                                <el-icon><CircleCheck /></el-icon>
                                                <span>已发布</span>
                                            </el-tag>
                                            <el-tag v-else-if="info.status == '0'" type="warning" effect="light" class="status-tag">
                                                <el-icon><EditPen /></el-icon>
                                                <span>草稿</span>
                                            </el-tag>
                                            <el-tag v-else type="info" effect="light" class="status-tag">
                                                <el-icon><Close /></el-icon>
                                                <span>已停用</span>
                                            </el-tag>
                                        </div>
                                    </el-form-item>
                                    <el-form-item label="创建时间">
                                        <el-input v-model="info.createTime" disabled size="large">
                                            <template #prefix>
                                                <el-icon><Clock /></el-icon>
                                            </template>
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item label="更新时间">
                                        <el-input v-model="info.updateTime" disabled size="large">
                                            <template #prefix>
                                                <el-icon><Timer /></el-icon>
                                            </template>
                                        </el-input>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="18" :lg="18">
                        <div class="form-maker-card">
                            <div class="card-header">
                                <div class="header-icon">
                                    <el-icon><Setting /></el-icon>
                                </div>
                                <span class="header-title">表单字段配置</span>
                            </div>
                            <div class="card-body">
                                <FormMaker
                                    :form-fields="info.formFields"
                                    @update:fields="info.formFields = $event;"
                                    v-model="formData"
                                    :type="props.type == 'edit' ? 'create' : 'view'" />
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>

            <div class="action-bar">
                <el-button type="primary" size="large" @click="save" class="save-button" v-if="props.type === 'edit'" :loading="loading">
                    <el-icon><Check /></el-icon>
                    <span>保存修改</span>
                </el-button>
                <el-button type="info" size="large" @click="emit('success')" class="close-button">
                    <span>关闭</span>
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Document, Key, Tickets, CircleCheck, EditPen, Close, Clock, Timer, Setting, Check } from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';
import FormMaker from '@/components/dynamicForm/FormMaker.vue';

const emit = defineEmits(['success']);

const props = defineProps({
    id: Number,
    type: String
})

const loading = ref(false)
const formData = ref({})

const info = ref({
    id: -1,
    name: '',
    description: '',
    version: '',
    status: '',
    deleted: '',
    createBy: '',
    createTime: '',
    updateTime: '',
    formFields: []
})

const queryInfo = () => {
    loading.value = true
    http.result({
        url: '/dynamicForm/info',
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
        url: '/dynamicForm/update',
        method: 'POST',
        data: info.value,
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
})
</script>

<style scoped lang="scss">
.detail-form-container {
    padding: 24px;
    background: var(--el-bg-color-page);
    min-height: 500px;

    .content-wrapper {
        margin-bottom: 24px;
    }

    .info-card,
    .form-maker-card {
        background: var(--el-bg-color);
        border-radius: 16px;
        padding: 24px;
        box-shadow: var(--el-box-shadow-light);
        border: 1px solid var(--el-border-color-lighter);

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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

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
            .detail-form {
                :deep(.el-form-item__label) {
                    font-weight: 500;
                    color: var(--el-text-color-regular);
                    padding-bottom: 8px;
                }

                :deep(.el-input__wrapper) {
                    border-radius: 10px;
                }

                .status-section {
                    .status-tag {
                        display: flex;
                        align-items: center;
                        gap: 4px;

                        .el-icon {
                            font-size: 12px;
                        }
                    }
                }
            }
        }
    }

    .action-bar {
        display: flex;
        justify-content: center;
        gap: 16px;
        padding-top: 20px;
        border-top: 1px solid var(--el-border-color-lighter);

        .save-button,
        .close-button {
            min-width: 180px;
            height: 46px;
            font-size: 16px;
            font-weight: 500;
            border-radius: 12px;
        }

        .save-button {
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
    .detail-form-container {
        padding: 16px;

        .info-card,
        .form-maker-card {
            padding: 16px;
        }

        .action-bar {
            flex-direction: column;

            .save-button,
            .close-button {
                width: 100%;
            }
        }
    }
}
</style>
