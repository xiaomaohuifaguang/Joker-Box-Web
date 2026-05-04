<template>
    <div class="add-form-container">
        <div class="form-header">
            <div class="header-icon">
                <el-icon><Plus /></el-icon>
            </div>
            <div class="header-content">
                <h3>添加表单</h3>
                <p>配置新表单的基本信息和字段</p>
            </div>
        </div>

        <div class="form-content">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="24" :md="6" :lg="6">
                    <el-form label-position="top" class="info-form">
                        <el-form-item label="表单名称" required>
                            <el-input
                                v-model="info.name"
                                :placeholder="`请输入表单名称`"
                                clearable
                                size="large">
                                <template #prefix>
                                    <el-icon><Document /></el-icon>
                                </template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="描述">
                            <el-input
                                v-model="info.description"
                                :placeholder="`请输入描述`"
                                clearable
                                type="textarea"
                                :rows="4"
                                size="large" />
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :xs="24" :sm="24" :md="18" :lg="18">
                    <div class="form-maker-wrapper">
                        <div class="form-maker-header">
                            <div class="header-icon small">
                                <el-icon><Setting /></el-icon>
                            </div>
                            <span class="header-title">表单字段配置</span>
                        </div>
                        <FormMaker
                            :form-fields="info.formFields"
                            @update:fields="info.formFields = $event;"
                            type="create"
                            v-model="formData" />
                    </div>
                </el-col>
            </el-row>
        </div>

        <div class="action-bar">
            <el-button type="primary" size="large" @click="add" class="save-button" :loading="loading">
                <el-icon><Check /></el-icon>
                <span>确认添加</span>
            </el-button>
            <el-button type="info" size="large" @click="emit('success')" class="cancel-button">
                <span>取消</span>
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Plus, Document, Setting, Check } from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { ref } from 'vue';
import FormMaker from '@/components/dynamicForm/FormMaker.vue';

const emit = defineEmits(['success']);
const loading = ref(false)

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

const formData = ref({})

const add = async () => {
    if (!info.value.name.trim()) {
        alert('请输入表单名称', 'warning')
        return
    }

    loading.value = true
    try {
        const result = await http.post('/dynamicForm/add', info.value, { raw: true })
        alert(result.msg, 'success')
        emit('success');
    } catch (e: any) {
        // error handled by interceptor
    } finally {
        loading.value = false
    }
}
</script>

<style scoped lang="scss">
.add-form-container {
    padding: 24px;
    background: var(--el-bg-color-page);
    min-height: 500px;

    .form-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 28px;

        .header-icon {
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            .el-icon {
                font-size: 26px;
                color: white;
            }
        }

        .header-content {
            flex: 1;

            h3 {
                margin: 0 0 6px 0;
                font-size: 20px;
                font-weight: 600;
                color: var(--el-text-color-primary);
            }

            p {
                margin: 0;
                font-size: 14px;
                color: var(--el-text-color-secondary);
            }
        }
    }

    .form-content {
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

        .form-maker-wrapper {
            background: var(--el-bg-color);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid var(--el-border-color-lighter);

            .form-maker-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;

                .header-icon {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    .el-icon {
                        font-size: 18px;
                        color: white;
                    }
                }

                .header-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--el-text-color-primary);
                }
            }
        }
    }

    .action-bar {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-top: 32px;
        padding-top: 20px;
        border-top: 1px solid var(--el-border-color-lighter);

        .save-button,
        .cancel-button {
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
    .add-form-container {
        padding: 16px;

        .form-header {
            flex-direction: column;
            text-align: center;
        }

        .action-bar {
            flex-direction: column;

            .save-button,
            .cancel-button {
                width: 100%;
            }
        }
    }
}
</style>
