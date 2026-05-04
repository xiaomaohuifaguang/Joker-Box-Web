<template>
    <div class="mail-detail-container">
        <div v-loading="loading" element-loading-text="加载中...">
            <div class="content-wrapper">
                <div class="form-header">
                    <div class="header-icon">
                        <el-icon><Message /></el-icon>
                    </div>
                    <div class="header-content">
                        <h3>{{ props.type === 'view' ? '邮件详情' : '编辑邮件' }}</h3>
                        <p>{{ props.type === 'view' ? '查看邮件详细信息' : '修改邮件信息' }}</p>
                    </div>
                </div>

                <el-form label-position="top" class="mail-form">
                    <el-row :gutter="24">
                        <el-col :xs="24" :sm="12" :md="8" :lg="8">
                            <el-form-item label="邮件ID" prop="id">
                                <el-input
                                    v-model="info.id"
                                    :disabled="props.type !== 'edit'"
                                    size="large">
                                    <template #prefix>
                                        <el-icon><Document /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>

                        <el-col :xs="24" :sm="12" :md="8" :lg="8">
                            <el-form-item label="收件人邮箱" prop="toMail">
                                <el-input
                                    v-model="info.toMail"
                                    :disabled="props.type !== 'edit'"
                                    size="large">
                                    <template #prefix>
                                        <el-icon><Message /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>

                        <el-col :xs="24" :sm="24" :md="8" :lg="8">
                            <el-form-item label="邮件主题" prop="subject">
                                <el-input
                                    v-model="info.subject"
                                    :disabled="props.type !== 'edit'"
                                    size="large">
                                    <template #prefix>
                                        <el-icon><ChatLineRound /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>

                        <el-col :xs="24" :sm="12" :md="8" :lg="8">
                            <el-form-item label="发送时间" prop="sendTime">
                                <el-date-picker
                                    v-model="info.sendTime"
                                    type="datetime"
                                    :disabled="props.type !== 'edit'"
                                    size="large"
                                    style="width: 100%" />
                            </el-form-item>
                        </el-col>

                        <el-col :xs="24" :sm="12" :md="8" :lg="8">
                        </el-col>

                        <el-col :xs="24" :sm="12" :md="8" :lg="8">
                        </el-col>

                        <el-col :span="24">
                            <el-form-item label="邮件变量" prop="variable">
                                <el-input
                                    v-model="info.variable"
                                    :disabled="props.type !== 'edit'"
                                    type="textarea"
                                    :autosize="{ minRows: 2, maxRows: 4 }"
                                    size="large" />
                            </el-form-item>
                        </el-col>

                        <el-col :span="24">
                            <el-form-item label="邮件内容预览">
                                <div class="mail-preview" v-html="info.content"></div>
                            </el-form-item>
                        </el-col>

                        <el-col :span="24">
                            <el-form-item label="邮件内容" prop="content">
                                <el-input
                                    v-model="info.content"
                                    type="textarea"
                                    :autosize="{ minRows: 6, maxRows: 12 }"
                                    :disabled="props.type !== 'edit'"
                                    size="large" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>

                <div class="form-footer" v-if="props.type === 'edit'">
                    <el-button type="primary" size="large" @click="save" class="save-button">
                        <el-icon><Check /></el-icon>
                        <span>保存邮件</span>
                    </el-button>
                    <el-button type="info" size="large" @click="preview" class="preview-button">
                        <el-icon><View /></el-icon>
                        <span>预览效果</span>
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    Check,
    Message,
    Document,
    ChatLineRound,
    View
} from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const props = defineProps({
    id: String,
    type: String
})

const loading = ref(false)

const info = ref({
    id: '',
    toMail: '',
    subject: '',
    content: '',
    variable: '',
    sendTime: '',
})

const queryInfo = async () => {
    loading.value = true
    info.value = await http.post('/mailInfo/info', { id: props.id })
    loading.value = false
}

const save = async () => {
    loading.value = true
    const result = await http.post('/mailInfo/update', info.value, { raw: true })
    alert(result.msg, 'success')
    await queryInfo()
    loading.value = false
}

const preview = () => {
    window.open('about:blank').document.write(info.value.content)
}

onMounted(() => {
    if (!props.id) return;
    queryInfo()
})
</script>

<style scoped lang="scss">
.mail-detail-container {
    padding: 24px;
    background: var(--el-bg-color-page);

    .content-wrapper {
        max-width: 900px;
        margin: 0 auto;
    }

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

    .mail-form {
        :deep(.el-form-item__label) {
            font-weight: 500;
            color: var(--el-text-color-regular);
            padding-bottom: 8px;
        }

        :deep(.el-input__wrapper) {
            border-radius: 10px;
        }

        :deep(.el-textarea__inner) {
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            line-height: 1.6;
        }
    }

    .mail-preview {
        padding: 20px;
        border: 1px dashed var(--el-border-color);
        border-radius: 12px;
        background: var(--el-bg-color);
        min-height: 180px;
    }

    .form-footer {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--el-border-color-lighter);

        .save-button,
        .preview-button {
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
    .mail-detail-container {
        padding: 16px;

        .form-header {
            flex-direction: column;
            text-align: center;
        }

        .form-footer {
            flex-direction: column;

            .save-button,
            .preview-button {
                width: 100%;
            }
        }
    }
}
</style>
