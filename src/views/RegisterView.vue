<template>
    <div class="register-container">
        <el-card class="register-card">
            <!-- Home button -->
            <el-button @click="toHome" class="home-button" icon="house" circle></el-button>

            <!-- Card header -->
            <template #header>
                <div class="card-header">
                    <span class="register-title">
                        <Logo />
                    </span>
                </div>
            </template>

            <!-- Registration form -->
            <el-form :model="ruleForm" :rules="rules" ref="ruleFormRef" status-icon label-position="top"
                label-width="auto">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="ruleForm.username" size="large" placeholder="请输入4-18位英文字符或数字"
                        autocomplete="new-password" clearable />
                </el-form-item>

                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="ruleForm.nickname" size="large" placeholder="请输入您的昵称" autocomplete="new-password"
                        clearable />
                </el-form-item>

                <el-form-item label="密码" prop="password">
                    <el-input v-model="ruleForm.password" type="password" size="large" placeholder="请输入密码"
                        autocomplete="new-password" show-password />
                </el-form-item>

                <el-form-item label="确认密码" prop="passwordAgain">
                    <el-input v-model="ruleForm.passwordAgain" type="password" size="large" placeholder="请再次输入密码"
                        autocomplete="new-password" show-password />
                </el-form-item>

                <el-form-item label="邮箱" prop="mail">
                    <el-input v-model="ruleForm.mail" size="large" type="email" placeholder="请输入有效邮箱地址"
                        autocomplete="new-password" clearable />
                </el-form-item>

                <el-form-item label="验证码" prop="code">
                    <el-input v-model="ruleForm.code" size="large" placeholder="请输入6位验证码" autocomplete="new-password">
                        <template #append>
                            <el-button @click="sndCode" class="code-button" :disabled="sendButtonText !== '发送'">
                                {{ sendButtonText }}
                            </el-button>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>

            <!-- Card footer -->
            <template #footer>
                <div class="card-footer">
                    <el-button type="primary" size="large" @click="register(ruleFormRef)" class="register-button">
                        立即注册
                    </el-button>
                </div>
            </template>

            <!-- Login link -->
            <div class="login-link">
                <span>已有账号？</span>
                <router-link to="/login">立即登录</router-link>
            </div>
        </el-card>
    </div>
</template>

<script setup lang='ts'>
import { http, setToken, toPath, saveUserInfo, userInfo, alert } from '@/utils';
import { onMounted, ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus'
import Logo from '@/components/common/Logo.vue';

const route = useRoute()
const path = ref('/')

interface RuleForm {
    "username": string,
    "password": string,
    "passwordAgain": string,
    "nickname": string,
    "mail": string,
    "code": string,
    "inviteCode": string,
    "sex": string,
    "phone": number
}

const ruleForm = reactive<RuleForm>({
    "username": "",
    "password": "",
    "passwordAgain": "",
    "nickname": "",
    "mail": "",
    "code": "",
    "inviteCode": "",
    "sex": "未知",
    "phone": 0
})

const validatePass = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('请设置密码'))
    } else if (value.length < 6) {
        callback(new Error('密码长度不能少于6位'))
    } else {
        callback()
    }
}

const validatePass2 = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value !== ruleForm.password) {
        callback(new Error("两次密码不一致"))
    } else {
        callback()
    }
}

const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<RuleForm>>({
    username: [
        { required: true, message: '请填写用户名', trigger: 'blur' },
        { min: 4, max: 18, message: '长度4-18位', trigger: 'blur' },
    ],
    nickname: [
        { required: true, message: '请填写昵称', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { validator: validatePass, trigger: 'blur' }
    ],
    passwordAgain: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: validatePass2, trigger: 'blur' }
    ],
    mail: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { len: 6, message: '验证码为6位', trigger: 'blur' }
    ],
})

const sendButtonText = ref('发送')

onMounted(() => {
    path.value = route.query.redirect?.toString() || '/'
})

const sndCode = () => {
    if (!ruleForm.mail) {
        alert('请填写邮箱', 'warning')
        return
    }

    sendButtonText.value = '60'
    http.result({
        url: "/auth/mailCode",
        method: 'POST',
        params: { mail: ruleForm.mail },
        success(result) {
            if (result.code === 200) {
                alert('验证码已发送', 'success')
            }
        }
    })

    let countdown = 60
    const timerId = setInterval(() => {
        countdown--
        sendButtonText.value = countdown.toString()
        if (countdown <= 0) {
            sendButtonText.value = '发送'
            clearInterval(timerId)
        }
    }, 1000)
}

const register = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    try {
        await formEl.validate()
        http.result({
            url: "/auth/register",
            method: 'POST',
            data: ruleForm,
            success(result) {
                setToken(result.data)
                login()
            },
            error(error) {
                alert(error.msg, 'error')
            }
        })
    } catch {
        alert('请按要求填写表单', 'warning')
    }
}

const login = () => {
    http.result({
        url: "/auth/getToken",
        method: 'POST',
        data: {
            username: ruleForm.username,
            password: ruleForm.password
        },
        success(result) {
            setToken(result.data)
            getUserInfo()
        }
    })
}

async function getUserInfo() {
    http.result({
        url: '/auth/userInfo',
        method: 'POST',
        success(result) {
            saveUserInfo(result.data)
            toPath(path.value)
        }
    })
}

const toHome = () => {
    toPath('/')
}
</script>

<style scoped>
.register-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-size: cover;
    background-position: center;
}

.register-card {
    width: 450px;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    background: rgba(255, 255, 255, 0.95);
    position: relative;
}

.card-header {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.register-title {
    font-size: 24px;
    color: #303133;
    font-weight: 600;
}

.el-form-item {
    margin-bottom: 22px;
}

.el-form-item:last-child {
    margin-bottom: 0;
}

.el-input {
    border-radius: 8px;
}

.el-input__inner {
    height: 48px;
    font-size: 16px;
}

.card-footer {
    display: flex;
    justify-content: center;
    margin-top: 24px;
}

.register-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 8px;
    background: linear-gradient(to right, #409eff, #36a2eb);
    color: white;
    border: none;
    transition: all 0.3s ease;
}

.register-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.code-button {
    width: 100px;
    height: 100%;
    font-size: 14px;
    background: linear-gradient(to right, #739df3, #4691f5);
    color: white !important;
    border: none;
    border-radius: 0 8px 8px 0;
    transition: all 0.3s ease;
}

.code-button:hover {
    background: linear-gradient(to right, #4691f5, #739df3);
}

.code-button:disabled {
    background: #dcdfe6;
    cursor: not-allowed;
    color: #000 !important;
}

.home-button {
    position: absolute;
    top: 16px;
    left: 16px;
    font-size: 20px;
    background: transparent;
    border: none;
    color: #909399;
    transition: all 0.3s ease;
}

.home-button:hover {
    color: #409eff;
    transform: scale(1.1);
}

.login-link {
    position: absolute;
    bottom: 16px;
    right: 16px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    color: #606266;
}

.login-link a {
    color: #409eff;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
}

.login-link a:hover {
    color: #36a2eb;
    text-decoration: underline;
}
</style>