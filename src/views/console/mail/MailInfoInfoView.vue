<template>
    <div class="mail-detail-container">
        <div v-loading="loading" element-loading-text="加载中..." element-loading-background="rgba(255, 255, 255, 0.7)">
            <el-card class="mail-detail-card" shadow="hover">
                <template #header>
                    <div class="mail-header">
                        <el-icon class="mail-icon">
                            <Message />
                        </el-icon>
                        <span class="mail-title">{{ props.type === 'view' ? '邮件详情' : '编辑邮件' }}</span>
                    </div>
                </template>

                <el-form label-position="top" class="mail-form">
                    <el-row :gutter="24">
                        <el-col :xs="24" :sm="12" :md="8" :lg="8">
                            <el-form-item label="邮件ID" prop="id">
                                <el-input v-model="info.id" :disabled="props.type !== 'edit'" placeholder=""
                                    :prefix-icon="Document" />
                            </el-form-item>
                        </el-col>

                        <el-col :xs="24" :sm="12" :md="8" :lg="8">
                            <el-form-item label="收件人邮箱" prop="toMail">
                                <el-input v-model="info.toMail" :disabled="props.type !== 'edit'" placeholder=""
                                    :prefix-icon="Message" />
                            </el-form-item>
                        </el-col>

                        <el-col :xs="24" :sm="24" :md="8" :lg="8">
                            <el-form-item label="邮件主题" prop="subject">
                                <el-input v-model="info.subject" :disabled="props.type !== 'edit'" placeholder=""
                                    :prefix-icon="ChatLineRound" />
                            </el-form-item>
                        </el-col>

                        <el-col :xs="24" :sm="12" :md="8" :lg="8">
                            <el-form-item label="发送时间" prop="sendTime">
                                <el-date-picker v-model="info.sendTime" type="datetime" placeholder=""
                                    :disabled="props.type !== 'edit'" style="width: 100%" />
                            </el-form-item>
                        </el-col>

                        <el-col :span="24">
                            <el-form-item label="邮件变量" prop="variable">
                                <el-input v-model="info.variable" :disabled="props.type !== 'edit'" type="textarea"
                                    :autosize="{ minRows: 2, maxRows: 4 }" placeholder="" />
                            </el-form-item>
                        </el-col>

                        <el-col :span="24">
                            <el-form-item label="">
                                <div class="mail-preview" v-html="info.content"></div>
                            </el-form-item>
                        </el-col>

                        <el-col :span="24">
                            <el-form-item label="邮件内容" prop="content">
                                <el-input v-model="info.content" type="textarea" :autosize="{ minRows: 6, maxRows: 12 }"
                                    :disabled="props.type !== 'edit'" placeholder="" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>

                <el-divider class="mail-divider" />

                <div class="mail-actions" v-if="props.type === 'edit'">
                    <el-button type="primary" size="large" @click="save" class="save-button">
                        <el-icon>
                            <Check />
                        </el-icon>
                        <span>保存邮件</span>
                    </el-button>

                    <el-button type="info" size="large" @click="preview" class="preview-button">
                        <el-icon>
                            <View />
                        </el-icon>
                        <span>预览效果</span>
                    </el-button>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Check, Message, Document, ChatLineRound, View } from '@element-plus/icons-vue'
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

const queryInfo = () => {
    loading.value = true
    http.result({
        url: '/mailInfo/info',
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
        url: '/mailInfo/update',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            queryInfo()
        }
    })
}

const preview = () => {
    // 预览逻辑
    window.open('about:blank').document.write(info.value.content)
}

onMounted(() => {
    if (!props.id) return;
    queryInfo()
})
</script>

<style scoped lang="scss">
.mail-detail-container {
    padding: 20px;
    background-color: var(--el-bg-color-page);
}

.mail-detail-card {
    border-radius: 12px;

    :deep(.el-card__header) {
        border-bottom: 1px solid var(--el-border-color-light);
        padding: 18px 24px;
        // background: linear-gradient(135deg, #f5f7fa 0%, #e6e9f0 100%);
    }
}

.mail-header {
    display: flex;
    align-items: center;

    .mail-icon {
        font-size: 24px;
        color: var(--el-color-primary);
        margin-right: 12px;
    }

    .mail-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
    }
}

.mail-form {
    :deep(.el-form-item__label) {
        font-weight: 500;
        color: var(--el-text-color-regular);
        margin-bottom: 8px;
    }

    :deep(.el-input__inner) {
        height: 42px;
        line-height: 42px;
        border-radius: 8px;
    }

    :deep(.el-textarea__inner) {
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        line-height: 1.6;
    }
}

.mail-preview {
    padding: 16px;
    border: 1px dashed var(--el-border-color);
    border-radius: 8px;
    background-color: var(--el-bg-color);
    min-height: 200px;
}

.mail-divider {
    margin: 24px 0;
}

.mail-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;

    .save-button {
        width: 180px;
        height: 44px;
        font-size: 16px;
        font-weight: 500;
    }

    .preview-button {
        width: 180px;
        height: 44px;
        font-size: 16px;
        font-weight: 500;
    }
}

@media (max-width: 768px) {
    .mail-actions {
        flex-direction: column;
        align-items: center;

        .save-button,
        .preview-button {
            width: 100%;
        }
    }

    .mail-form {
        :deep(.el-col) {
            width: 100%;
            margin-bottom: 0;
        }
    }
}
</style>