<template>
    <div class="add-container">
        <el-card class="add-card" shadow="never">
            <template #header>
                <div class="card-header">
                    <span>添加MailInfo</span>
                </div>
            </template>

            <el-form label-position="top" class="add-form">
                <el-row :gutter="24">
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="邮件id" prop="id">
                            <el-input v-model="info.id" :placeholder="`请输入邮件id`" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="收件人邮箱" prop="to">
                            <el-input v-model="info.toMail" :placeholder="`请输入收件人邮箱`" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="主题" prop="subject">
                            <el-input v-model="info.subject" :placeholder="`请输入主题`" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="内容" prop="content">
                            <el-input v-model="info.content" :placeholder="`请输入内容`" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="变量" prop="variable">
                            <el-input v-model="info.variable" :placeholder="`请输入变量`" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="发送时间" prop="sendTime">
                            <el-input v-model="info.sendTime" :placeholder="`请输入发送时间`" clearable />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <el-divider class="form-divider" />

            <div class="action-bar">
                <el-button type="primary" size="large" @click="add" class="add-button">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    <span>确认添加</span>
                </el-button>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { ref } from 'vue';

const emit = defineEmits(['success']);

const info = ref({
    id: '',
    toMail: '',
    subject: '',
    content: '',
    variable: '',
    sendTime: '',
})

const add = () => {
    http.result({
        url: '/mailInfo/add',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            emit('success');
        }
    })
}
</script>

<style scoped lang="scss">
.add-container {
    padding: 20px;
    background-color: var(--el-bg-color-page);
}

.add-card {
    border-radius: 8px;

    :deep(.el-card__header) {
        border-bottom: 1px solid var(--el-border-color-light);
        padding: 16px 20px;

        .card-header {
            font-size: 18px;
            font-weight: 600;
            color: var(--el-text-color-primary);
        }
    }
}

.add-form {
    :deep(.el-form-item__label) {
        font-weight: 500;
        color: var(--el-text-color-regular);
        margin-bottom: 6px;
    }

    :deep(.el-input__inner) {
        height: 40px;
        line-height: 40px;
        border-radius: 8px;
    }
}

.form-divider {
    margin: 20px 0;
}

.action-bar {
    display: flex;
    justify-content: center;

    .add-button {
        width: 200px;
        height: 40px;
        font-size: 16px;
        font-weight: 500;
        border-radius: 8px;
    }
}

@media (max-width: 768px) {
    .add-form {
        :deep(.el-col) {
            width: 100%;
            margin-bottom: 0;
        }
    }

    .action-bar {
        .add-button {
            width: 100%;
        }
    }
}
</style>