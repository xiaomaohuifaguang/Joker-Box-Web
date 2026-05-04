<template>
    <div class="mail-add-container">
        <div v-loading="loading" element-loading-text="加载中...">
            <div class="content-wrapper">
                <div class="form-header">
                    <div class="header-icon">
                        <el-icon><Plus /></el-icon>
                    </div>
                    <div class="header-content">
                        <h3>添加邮件</h3>
                        <p>添加新的邮件记录</p>
                    </div>
                </div>

                <el-form label-position="top" class="mail-form">
                    <el-form-item label="邮件ID" prop="id">
                        <el-input
                            v-model="info.id"
                            placeholder="请输入邮件ID"
                            clearable
                            size="large">
                            <template #prefix>
                                <el-icon><Document /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="收件人邮箱" prop="to">
                        <el-input
                            v-model="info.toMail"
                            placeholder="请输入收件人邮箱"
                            clearable
                            size="large">
                            <template #prefix>
                                <el-icon><Message /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="主题" prop="subject">
                        <el-input
                            v-model="info.subject"
                            placeholder="请输入主题"
                            clearable
                            size="large">
                            <template #prefix>
                                <el-icon><ChatLineRound /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="内容" prop="content">
                        <el-input
                            v-model="info.content"
                            placeholder="请输入内容"
                            clearable
                            type="textarea"
                            :rows="4"
                            size="large" />
                    </el-form-item>
                    <el-form-item label="变量" prop="variable">
                        <el-input
                            v-model="info.variable"
                            placeholder="请输入变量"
                            clearable
                            size="large">
                            <template #prefix>
                                <el-icon><Setting /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="发送时间" prop="sendTime">
                        <el-date-picker
                            v-model="info.sendTime"
                            type="datetime"
                            placeholder="请选择发送时间"
                            size="large"
                            style="width: 100%" />
                    </el-form-item>
                </el-form>
            </div>

            <div class="form-footer">
                <el-button type="primary" size="large" @click="add" class="add-button">
                    <el-icon><Check /></el-icon>
                    <span>确认添加</span>
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    Plus,
    Document,
    Message,
    ChatLineRound,
    Setting,
    Check
} from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { ref } from 'vue';

const emit = defineEmits(['success']);

const loading = ref(false)
const info = ref({
    id: '',
    toMail: '',
    subject: '',
    content: '',
    variable: '',
    sendTime: '',
})

const add = async () => {
    if (!info.value.id.trim()) {
        alert('请输入邮件ID', 'warning')
        return
    }

    if (!info.value.toMail.trim()) {
        alert('请输入收件人邮箱', 'warning')
        return
    }

    if (!info.value.subject.trim()) {
        alert('请输入主题', 'warning')
        return
    }

    loading.value = true
    try {
        const result = await http.post('/mailInfo/add', info.value, { raw: true })
        alert(result.msg, 'success')
        emit('success');
    } finally {
        loading.value = false
    }
}
</script>

<style scoped lang="scss">
.mail-add-container {
    padding: 24px;
    background: var(--bg-page);

    .content-wrapper {
        max-width: 800px;
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
            background: var(--brand-gradient);
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
                color: var(--text-primary);
            }

            p {
                margin: 0;
                font-size: 14px;
                color: var(--text-secondary);
            }
        }
    }

    .mail-form {
        :deep(.el-form-item__label) {
            font-weight: 500;
            color: var(--text-regular);
            padding-bottom: 8px;
        }

        :deep(.el-input__wrapper) {
            border-radius: 10px;
        }

        :deep(.el-textarea__inner) {
            border-radius: 10px;
        }
    }

    .form-footer {
        display: flex;
        justify-content: center;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--border-light);

        .add-button {
            min-width: 200px;
            height: 46px;
            font-size: 16px;
            font-weight: 500;
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
    .mail-add-container {
        padding: 16px;

        .form-header {
            flex-direction: column;
            text-align: center;
        }

        .form-footer {
            .add-button {
                width: 100%;
            }
        }
    }
}
</style>
