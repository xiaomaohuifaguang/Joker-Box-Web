<template>
    <div class="password-change-container">
        <el-card shadow="hover" class="password-card">
            <template #header>
                <div class="card-header">
                    <el-icon class="header-icon">
                        <Lock />
                    </el-icon>
                    <span class="header-title">修改密码</span>
                </div>
            </template>

            <div class="form-container">
                <el-form ref="ruleFormRef" :model="passwordInfo" label-position="top" :rules="rules"
                    @submit.prevent="submitForm(ruleFormRef)" status-icon>

                    <!-- Old Password -->
                    <el-form-item label="原密码" prop="oldPassword">
                        <el-input v-model="passwordInfo.oldPassword" type="password" placeholder="请输入当前使用的密码"
                            show-password clearable :prefix-icon="Lock" size="large">
                        </el-input>
                    </el-form-item>

                    <!-- New Password -->
                    <el-form-item label="新密码" prop="newPassword">
                        <el-input v-model="passwordInfo.newPassword" type="password" placeholder="8-16位字符，建议包含字母、数字和符号"
                            show-password clearable :prefix-icon="Key" size="large">
                        </el-input>
                        <div class="password-strength" v-if="passwordInfo.newPassword">
                            <div class="strength-bar" :class="getPasswordStrengthClass"></div>
                            <span class="strength-text">{{ getPasswordStrengthText }}</span>
                        </div>
                    </el-form-item>

                    <!-- Confirm New Password -->
                    <el-form-item label="确认新密码" prop="newPasswordAgain">
                        <el-input v-model="passwordInfo.newPasswordAgain" type="password" placeholder="请再次输入新密码"
                            show-password clearable :prefix-icon="CircleCheck" size="large">
                        </el-input>
                    </el-form-item>

                    <el-form-item class="submit-item">
                        <el-button type="primary" native-type="submit" size="large" :loading="loading" round
                            class="submit-btn">
                            <template #loading>
                                <span class="loading-text">正在提交...</span>
                            </template>
                            <template #default>
                                <el-icon class="submit-icon">
                                    <Check />
                                </el-icon>
                                <span>确认修改</span>
                            </template>
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { alert, confirm, http, toPath } from '@/utils';
import { FormInstance, FormRules } from 'element-plus';
import { ref, computed } from 'vue';
import { Lock, Key, CircleCheck, Check } from '@element-plus/icons-vue';

const ruleFormRef = ref<FormInstance>();
const loading = ref(false);

const passwordInfo = ref({
    oldPassword: '',
    newPassword: '',
    newPasswordAgain: ''
});

const validatePasswordAgain = (rule: any, value: string, callback: any) => {
    if (value !== passwordInfo.value.newPassword) {
        callback(new Error('两次输入的密码不一致'));
    } else {
        callback();
    }
};

const rules = ref<FormRules>({
    oldPassword: [
        { required: true, message: '请输入原密码', trigger: 'blur' },
        { min: 8, max: 16, message: '密码长度应为8-16位', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 8, max: 16, message: '密码长度应为8-16位', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value === passwordInfo.value.oldPassword) {
                    callback(new Error('新密码不能与原密码相同'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ],
    newPasswordAgain: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        { validator: validatePasswordAgain, trigger: 'blur' }
    ]
});

// 计算密码强度
const getPasswordStrengthClass = computed(() => {
    const password = passwordInfo.value.newPassword;
    if (!password) return '';

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (password.length < 8) return 'strength-weak';

    const strength = (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);

    switch (strength) {
        case 1: return 'strength-weak';
        case 2: return 'strength-medium';
        case 3: return 'strength-strong';
        default: return 'strength-weak';
    }
});

const getPasswordStrengthText = computed(() => {
    const password = passwordInfo.value.newPassword;
    if (!password) return '';

    if (password.length < 8) return '密码太短';

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    const strength = (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);

    switch (strength) {
        case 1: return '弱';
        case 2: return '中等';
        case 3: return '强';
        default: return '弱';
    }
});

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;

    try {
        loading.value = true;
        await formEl.validate((valid, fields) => {
            if (valid) {
                http.result({
                    url: '/auth/changePassword',
                    method: 'POST',
                    params: {
                        oldPassword: passwordInfo.value.oldPassword,
                        newPassword: passwordInfo.value.newPassword
                    },
                    success(result) {
                        if (result.code == '200') {
                            confirm("密码修改成功", "请使用新密码重新登录", () => {
                                toPath('/');
                            }, () => {
                                toPath('/');
                            });
                        }
                    }
                });
            }
        });
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.password-change-container {
    display: flex;
    justify-content: center;
    align-items: center;
    /* min-height: calc(100vh - 60px); */
    min-height: 60vh;
    padding: 2rem;
    background-color: var(--el-bg-color-page);
}

.password-card {
    width: 100%;
    max-width: 500px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--el-box-shadow-light);
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 0;
}

.header-icon {
    font-size: 1.5rem;
    margin-right: 0.75rem;
    color: var(--el-color-primary);
}

.header-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--el-text-color-primary);
}

.form-container {
    padding: 0 1.5rem 1.5rem;
}

:deep(.el-form-item__label) {
    font-weight: 500;
    color: var(--el-text-color-regular);
    margin-bottom: 0.5rem;
}

:deep(.el-input__wrapper) {
    border-radius: 8px;
    padding: 0.75rem 1rem;
}

:deep(.el-input__prefix) {
    display: flex;
    align-items: center;
    margin-right: 0.5rem;
}

.submit-item {
    margin-top: 2rem;
}

.submit-btn {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 1px;
    transition: all 0.3s ease;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.submit-icon {
    margin-right: 0.5rem;
}

.loading-text {
    margin-left: 0.5rem;
}

.password-strength {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
}

.strength-bar {
    height: 4px;
    border-radius: 2px;
    margin-right: 0.75rem;
    flex-grow: 1;
    transition: all 0.3s ease;
}

.strength-weak {
    background-color: var(--el-color-error);
    width: 33%;
}

.strength-medium {
    background-color: var(--el-color-warning);
    width: 66%;
}

.strength-strong {
    background-color: var(--el-color-success);
    width: 100%;
}

.strength-text {
    font-size: 0.75rem;
    color: var(--el-text-color-secondary);
    min-width: 40px;
}

@media (max-width: 768px) {
    .password-change-container {
        padding: 1rem;
    }

    .form-container {
        padding: 0 0.5rem 1rem;
    }
}
</style>