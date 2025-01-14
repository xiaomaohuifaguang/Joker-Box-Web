<template>
    <el-card body-style="text-align: center; padding: 2rem;">
        <template #header>
            <span style="font-size: 1.25rem; font-weight: bold;">修改密码</span>
        </template>
        <el-row justify="center">
            <el-col :span="12">
                <el-form label-position="left" label-width="auto" ref="ruleFormRef" :model="passwordInfo">
                    <!-- Old Password -->
                    <el-form-item label="原密码" prop="oldPassword" :rules="[
                        { required: true, message: '请输入原密码', trigger: ['blur'] },
                        { min: 8, max: 16, message: '长度8-16位', trigger: 'blur' }
                    ]">
                        <el-input v-model="passwordInfo.oldPassword" autocomplete="off" type="password"
                            placeholder="请输入原密码" />
                    </el-form-item>
                    <!-- New Password -->
                    <el-form-item label="新密码" prop="newPassword" :rules="[
                        { required: true, message: '请输入新密码', trigger: ['blur'] },
                        { min: 8, max: 16, message: '长度8-16位', trigger: 'blur' }
                    ]">
                        <el-input v-model="passwordInfo.newPassword" autocomplete="off" type="password"
                            placeholder="请输入新密码" />
                    </el-form-item>
                    <!-- Confirm New Password -->
                    <el-form-item label="再次确认" prop="newPasswordAgain" :rules="[
                        { required: true, message: '请再次确认密码', trigger: ['blur'] },
                        { min: 8, max: 16, message: '长度8-16位', trigger: 'blur' }
                    ]">
                        <el-input v-model="passwordInfo.newPasswordAgain" autocomplete="off" type="password"
                            placeholder="请再次确认新密码" />
                    </el-form-item>
                </el-form>
                <el-button type="primary" block size="large" @click="submitForm(ruleFormRef)" :loading="loading"
                    style="margin-top: 1rem;">
                    确认修改
                </el-button>
            </el-col>
        </el-row>
    </el-card>
</template>

<script setup lang='ts'>
import { alert, confirm, http, toPath } from '@/utils';
import { FormInstance } from 'element-plus';
import { ref } from 'vue';

const ruleFormRef = ref<FormInstance>()
const loading = ref(false)

const passwordInfo = ref({
    oldPassword: '',
    newPassword: '',
    newPasswordAgain: ''
})

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;

    loading.value = true; // Set loading state
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
                        confirm("", "密码修改成功", () => {
                            toPath('/')
                        }, () => {
                            toPath('/')
                        })
                    }
                }
            })
        } else {
            alert('请正确填写信息', 'error');
        }
    })
    loading.value = false; // Reset loading state
}
</script>

<style scoped>
.el-card {
    background-color: var(--el-bg-color, #ffffff);
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-regular);
}

.el-row {
    padding: 0 20px;
}

.el-form-item {
    margin-bottom: 1.5rem;
}

.el-input,
.el-button {
    border-radius: 6px;
}

.el-button {
    font-size: 1.1rem;
}

.el-input::placeholder {
    color: var(--el-text-color-placeholder, #bfbfbf);
}

.el-button {
    transition: background-color var(--el-transition-duration-fast);
}

.el-button:hover {
    background-color: var(--el-color-primary-light, #66b1ff);
}
</style>