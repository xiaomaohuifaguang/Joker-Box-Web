<template>
    <div class="register-container">
        <!-- 动态背景元素 -->
        <div class="animated-bg">
            <div class="gradient-orb orb-1"></div>
            <div class="gradient-orb orb-2"></div>
            <div class="gradient-orb orb-3"></div>
            <div class="particles">
                <span v-for="n in 20" :key="n" class="particle"></span>
            </div>
        </div>

        <div class="register-card">
            <!-- 左侧宣传区域 -->
            <div class="register-card-left">
                <div class="left-content">
                    <div class="logo-section">
                        <div class="logo-icon">
                            <LogoIcon :size="64" />
                        </div>
                        <h1 class="brand-name">Joker Box</h1>
                        <p class="brand-slogan">开启您的智能之旅</p>
                    </div>
                    <div class="features">
                        <div class="feature-item">
                            <el-icon class="feature-icon"><User /></el-icon>
                            <span>创建专属账号</span>
                        </div>
                        <div class="feature-item">
                            <el-icon class="feature-icon"><Lock /></el-icon>
                            <span>安全的数据保护</span>
                        </div>
                        <div class="feature-item">
                            <el-icon class="feature-icon"><Opportunity /></el-icon>
                            <span>畅享全部功能</span>
                        </div>
                    </div>
                </div>
                <div class="decorative-shapes">
                    <div class="shape shape-1"></div>
                    <div class="shape shape-2"></div>
                    <div class="shape shape-3"></div>
                </div>
            </div>

            <!-- 右侧注册表单区域 -->
            <div class="register-card-right">
                <!-- Home button -->
                <el-button @click="toHome" class="home-button" circle>
                    <el-icon><House /></el-icon>
                </el-button>

                <!-- Card header -->
                <div class="card-header">
                    <div class="welcome-text">
                        <h2 class="register-title">创建账号</h2>
                        <p class="register-subtitle">填写以下信息开始您的旅程</p>
                    </div>
                </div>

                <!-- Registration form -->
                <el-form :model="ruleForm" :rules="rules" ref="ruleFormRef" status-icon class="register-form">
                    <div class="form-row">
                        <div class="form-col">
                            <el-form-item prop="username" class="custom-form-item">
                                <template #label>
                                    <span class="field-label">
                                        <el-icon><User /></el-icon>
                                        用户名
                                    </span>
                                </template>
                                <el-input
                                    v-model="ruleForm.username"
                                    size="large"
                                    placeholder="4-18位英文字符或数字"
                                    autocomplete="new-password"
                                    clearable
                                    class="custom-input" />
                            </el-form-item>
                        </div>
                        <div class="form-col">
                            <el-form-item prop="nickname" class="custom-form-item">
                                <template #label>
                                    <span class="field-label">
                                        <el-icon><Avatar /></el-icon>
                                        昵称
                                    </span>
                                </template>
                                <el-input
                                    v-model="ruleForm.nickname"
                                    size="large"
                                    placeholder="请输入您的昵称"
                                    autocomplete="new-password"
                                    clearable
                                    class="custom-input" />
                            </el-form-item>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-col">
                            <el-form-item prop="password" class="custom-form-item">
                                <template #label>
                                    <span class="field-label">
                                        <el-icon><Lock /></el-icon>
                                        密码
                                    </span>
                                </template>
                                <el-input
                                    v-model="ruleForm.password"
                                    type="password"
                                    size="large"
                                    placeholder="至少6位字符"
                                    autocomplete="new-password"
                                    show-password
                                    class="custom-input" />
                            </el-form-item>
                        </div>
                        <div class="form-col">
                            <el-form-item prop="passwordAgain" class="custom-form-item">
                                <template #label>
                                    <span class="field-label">
                                        <el-icon><Key /></el-icon>
                                        确认密码
                                    </span>
                                </template>
                                <el-input
                                    v-model="ruleForm.passwordAgain"
                                    type="password"
                                    size="large"
                                    placeholder="再次输入密码"
                                    autocomplete="new-password"
                                    show-password
                                    class="custom-input" />
                            </el-form-item>
                        </div>
                    </div>

                    <el-form-item prop="mail" class="custom-form-item">
                        <template #label>
                            <span class="field-label">
                                <el-icon><Message /></el-icon>
                                邮箱
                            </span>
                        </template>
                        <el-input
                            v-model="ruleForm.mail"
                            size="large"
                            type="email"
                            placeholder="请输入有效邮箱地址"
                            autocomplete="new-password"
                            clearable
                            class="custom-input" />
                    </el-form-item>

                    <el-form-item prop="code" class="custom-form-item">
                        <template #label>
                            <span class="field-label">
                                <el-icon><CircleCheck /></el-icon>
                                验证码
                            </span>
                        </template>
                        <div class="code-input-group">
                            <el-input
                                v-model="ruleForm.code"
                                size="large"
                                placeholder="请输入6位验证码"
                                autocomplete="new-password"
                                maxlength="6"
                                class="custom-input code-input" />
                            <el-button
                                @click="sndCode"
                                class="code-button"
                                :disabled="sendButtonText !== '发送'"
                                :loading="isSendingCode">
                                <el-icon v-if="sendButtonText === '发送'"><Promotion /></el-icon>
                                <span>{{ sendButtonText === '发送' ? '获取验证码' : sendButtonText + 's' }}</span>
                            </el-button>
                        </div>
                    </el-form-item>
                </el-form>

                <!-- Agreement checkbox -->
                <div class="agreement-section">
                    <el-checkbox v-model="agreedToTerms" class="agreement-checkbox">
                        <span class="agreement-text">
                            我已阅读并同意
                            <a href="#" class="agreement-link">服务条款</a>
                            和
                            <a href="#" class="agreement-link">隐私政策</a>
                        </span>
                    </el-checkbox>
                </div>

                <!-- Card footer -->
                <div class="card-footer">
                    <el-button
                        type="primary"
                        size="large"
                        @click="register(ruleFormRef)"
                        class="register-button"
                        :loading="isRegistering"
                        :disabled="!agreedToTerms">
                        <span v-if="!isRegistering">立即注册</span>
                        <span v-else>注册中...</span>
                    </el-button>
                </div>

                <!-- Login link -->
                <div class="login-link">
                    <span>已有账号？</span>
                    <router-link to="/login">立即登录</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { http, setToken, toPath, saveUserInfo, alert } from '@/utils';
import { onMounted, ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus'
import { House, User, Lock, Message, CircleCheck, Avatar, Key, Opportunity, Promotion } from '@element-plus/icons-vue';
import LogoIcon from '@/components/icon/LogoIcon.vue';

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

const agreedToTerms = ref(false)
const isRegistering = ref(false)
const isSendingCode = ref(false)

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

const sndCode = async () => {
    if (!ruleForm.mail) {
        alert('请填写邮箱', 'warning')
        return
    }

    isSendingCode.value = true
    try {
        await http.post('/auth/mailCode', undefined, { params: { mail: ruleForm.mail } })
        alert('验证码已发送', 'success')
        startCountdown()
    } finally {
        isSendingCode.value = false
    }
}

const startCountdown = () => {
    let countdown = 60
    sendButtonText.value = countdown.toString()
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

    if (!agreedToTerms.value) {
        alert('请阅读并同意服务条款和隐私政策', 'warning')
        return
    }

    try {
        await formEl.validate()
        isRegistering.value = true
        try {
            const token = await http.post('/auth/register', ruleForm)
            setToken(token)
            login()
        } finally {
            isRegistering.value = false
        }
    } catch {
        alert('请按要求填写表单', 'warning')
    }
}

const login = async () => {
    const token = await http.post('/auth/getToken', {
        username: ruleForm.username,
        password: ruleForm.password
    })
    setToken(token)
    getUserInfo()
}

async function getUserInfo() {
    const data = await http.post('/auth/userInfo')
    saveUserInfo(data)
    toPath(path.value)
}

const toHome = () => {
    toPath('/')
}
</script>

<style scoped>
.register-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--auth-bg);
    position: relative;
    overflow: hidden;
    padding: 20px;
}

/* 动态背景 */
.animated-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;
}

.gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.5;
    animation: float 20s infinite ease-in-out;
}

.orb-1 {
    width: 400px;
    height: 400px;
    background: var(--brand-gradient);
    top: -100px;
    left: -100px;
    animation-delay: 0s;
}

.orb-2 {
    width: 300px;
    height: 300px;
    background: var(--data-grad-2);
    bottom: -50px;
    right: -50px;
    animation-delay: -7s;
}

.orb-3 {
    width: 250px;
    height: 250px;
    background: var(--data-grad-3);
    top: 50%;
    left: 50%;
    animation-delay: -14s;
}

@keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(50px, -50px) scale(1.1); }
    50% { transform: translate(-30px, 30px) scale(0.9); }
    75% { transform: translate(30px, 50px) scale(1.05); }
}

.particles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    animation: particle-float 15s infinite;
}

.particle:nth-child(1) { left: 10%; top: 20%; animation-delay: 0s; }
.particle:nth-child(2) { left: 20%; top: 80%; animation-delay: 1s; }
.particle:nth-child(3) { left: 30%; top: 40%; animation-delay: 2s; }
.particle:nth-child(4) { left: 40%; top: 60%; animation-delay: 3s; }
.particle:nth-child(5) { left: 50%; top: 10%; animation-delay: 4s; }
.particle:nth-child(6) { left: 60%; top: 90%; animation-delay: 5s; }
.particle:nth-child(7) { left: 70%; top: 30%; animation-delay: 6s; }
.particle:nth-child(8) { left: 80%; top: 70%; animation-delay: 7s; }
.particle:nth-child(9) { left: 90%; top: 50%; animation-delay: 8s; }
.particle:nth-child(10) { left: 15%; top: 50%; animation-delay: 9s; }
.particle:nth-child(11) { left: 25%; top: 15%; animation-delay: 10s; }
.particle:nth-child(12) { left: 35%; top: 85%; animation-delay: 11s; }
.particle:nth-child(13) { left: 45%; top: 35%; animation-delay: 12s; }
.particle:nth-child(14) { left: 55%; top: 75%; animation-delay: 13s; }
.particle:nth-child(15) { left: 65%; top: 25%; animation-delay: 14s; }
.particle:nth-child(16) { left: 75%; top: 65%; animation-delay: 0.5s; }
.particle:nth-child(17) { left: 85%; top: 45%; animation-delay: 1.5s; }
.particle:nth-child(18) { left: 5%; top: 55%; animation-delay: 2.5s; }
.particle:nth-child(19) { left: 95%; top: 35%; animation-delay: 3.5s; }
.particle:nth-child(20) { left: 50%; top: 95%; animation-delay: 4.5s; }

@keyframes particle-float {
    0%, 100% {
        transform: translateY(0) translateX(0);
        opacity: 0;
    }
    10% { opacity: 0.3; }
    90% { opacity: 0.3; }
    50% { transform: translateY(-100px) translateX(50px); }
}

/* 注册卡片 */
.register-card {
    width: 1000px;
    min-height: 650px;
    border-radius: var(--radius-xl);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    background: var(--bg-container);
    position: relative;
    display: flex;
    overflow: hidden;
    backdrop-filter: blur(20px);
    animation: card-appear 0.6s ease-out;
}

@keyframes card-appear {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.register-card-left {
    flex: 1;
    background: var(--brand-gradient);
    color: #fff;
    padding: 60px 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.left-content {
    position: relative;
    z-index: 2;
}

.logo-section {
    text-align: center;
    margin-bottom: 50px;
}

.logo-icon {
    width: 100px;
    height: 100px;
    margin: 0 auto 20px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    animation: logo-pulse 3s infinite ease-in-out;
}

.logo-icon img {
    width: 70px;
    height: 70px;
    object-fit: contain;
}

@keyframes logo-pulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
    }
}

.brand-name {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 10px;
    letter-spacing: 2px;
    background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.brand-slogan {
    font-size: 16px;
    opacity: 0.9;
    font-weight: 300;
    letter-spacing: 1px;
}

.features {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    backdrop-filter: blur(10px);
    transition: all var(--duration-normal) var(--ease-out);
}

.feature-item:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(5px);
}

.feature-icon {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.9);
}

.feature-item span {
    font-size: 15px;
    font-weight: 500;
}

.decorative-shapes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;
}

.shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
}

.shape-1 {
    width: 200px;
    height: 200px;
    top: -50px;
    right: -50px;
    animation: shape-float 8s infinite ease-in-out;
}

.shape-2 {
    width: 150px;
    height: 150px;
    bottom: 100px;
    left: -30px;
    animation: shape-float 10s infinite ease-in-out reverse;
}

.shape-3 {
    width: 100px;
    height: 100px;
    bottom: -20px;
    right: 100px;
    animation: shape-float 6s infinite ease-in-out;
}

@keyframes shape-float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(20px, -20px) rotate(180deg); }
}

/* 右侧表单区域 */
.register-card-right {
    width: 520px;
    padding: 40px 45px;
    position: relative;
    display: flex;
    flex-direction: column;
}

.home-button {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 40px;
    height: 40px;
    font-size: 18px;
    background: transparent !important;
    border: 2px solid var(--border-base) !important;
    color: var(--text-secondary) !important;
    transition: all var(--duration-normal) var(--ease-out);
}

.home-button:hover {
    color: var(--brand-primary) !important;
    border-color: var(--brand-primary) !important;
    transform: scale(1.1) rotate(5deg);
    background: var(--bg-overlay) !important;
}

.card-header {
    text-align: center;
    margin-bottom: 25px;
    margin-top: 20px;
}

.welcome-text {
    animation: fade-in-up 0.5s ease-out 0.2s both;
}

@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.register-title {
    font-size: 28px;
    color: var(--text-primary);
    font-weight: 700;
    margin-bottom: 8px;
}

.register-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 400;
}

/* 表单样式 */
.register-form {
    flex: 1;
    animation: fade-in-up 0.5s ease-out 0.3s both;
}

.form-row {
    display: flex;
    gap: 15px;
    margin-bottom: 5px;
}

.form-col {
    flex: 1;
}

.custom-form-item {
    margin-bottom: 20px;
    position: relative;
}

.custom-form-item :deep(.el-form-item__label) {
    padding-bottom: 2px;
    width: 100px;
    text-align: left;
    display: block;
    line-height: 1;
    margin-bottom: 0;
}

.custom-form-item :deep(.el-form-item__content) {
    margin-top: 2px;
}

.field-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 600;
    transition: all var(--duration-normal) var(--ease-out);
    width: 100%;
    box-sizing: border-box;
    min-height: 20px;
}

.field-label .el-icon {
    font-size: 18px;
    color: var(--brand-primary);
    transition: all var(--duration-normal) var(--ease-out);
}

.custom-form-item:focus-within .field-label .el-icon {
    color: var(--brand-secondary);
    transform: scale(1.1);
}

.custom-input :deep(.el-input__wrapper) {
    border-radius: var(--radius-lg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--border-base) inset;
    padding: 0 20px;
    transition: all var(--duration-normal) var(--ease-out);
    background: var(--bg-input);
}

.custom-input :deep(.el-input__wrapper:hover) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--brand-primary) inset;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 6px 16px var(--bg-overlay-strong), 0 0 0 2px var(--brand-primary) inset;
    transform: translateY(-2px);
}

.custom-input :deep(.el-input__inner) {
    height: 50px;
    font-size: 15px;
    color: var(--text-primary);
    font-weight: 400;
}

/* 表单验证反馈 */
.custom-form-item :deep(.el-form-item__error) {
    font-size: 12px;
    color: var(--danger);
    margin-top: 6px;
    animation: shake 0.5s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
}

.custom-form-item:focus-within .field-label {
    color: var(--brand-primary);
    transform: translateY(-2px);
}

.code-input-group {
    display: flex;
    gap: 12px;
}

.code-input {
    flex: 1;
}

.code-button {
    width: 130px;
    height: 46px;
    font-size: 14px;
    border-radius: var(--radius-md);
    background: var(--brand-gradient);
    color: var(--text-on-brand);
    border: none;
    transition: all var(--duration-normal) var(--ease-out);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.code-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow-strong);
}

.code-button:disabled {
    background: var(--bg-input);
    color: var(--text-disabled);
    cursor: not-allowed;
}

.agreement-section {
    margin: 15px 0 20px;
    animation: fade-in-up 0.5s ease-out 0.4s both;
}

.agreement-checkbox :deep(.el-checkbox__label) {
    font-size: 13px;
    color: var(--text-secondary);
}

.agreement-text {
    font-size: 13px;
}

.agreement-link {
    color: var(--brand-primary);
    text-decoration: none;
    font-weight: 500;
    transition: all var(--duration-normal) var(--ease-out);
}

.agreement-link:hover {
    color: var(--brand-primary-hover);
    text-decoration: underline;
}

.card-footer {
    animation: fade-in-up 0.5s ease-out 0.5s both;
}

.register-button {
    width: 100%;
    height: 52px;
    font-size: 16px;
    font-weight: 600;
    border-radius: var(--radius-md);
    background: var(--brand-gradient) !important;
    border: none;
    transition: all var(--duration-normal) var(--ease-out);
    letter-spacing: 2px;
    color: var(--text-on-brand) !important;
}

.register-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow-strong);
}

.register-button:active:not(:disabled) {
    transform: translateY(0);
}

.register-button:disabled {
    background: var(--bg-input) !important;
    color: var(--text-disabled) !important;
    cursor: not-allowed;
}

.login-link {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: var(--text-secondary);
    animation: fade-in-up 0.5s ease-out 0.6s both;
}

.login-link a {
    color: var(--brand-primary);
    text-decoration: none;
    font-weight: 600;
    margin-left: 5px;
    transition: all var(--duration-normal) var(--ease-out);
}

.login-link a:hover {
    color: var(--brand-primary-hover);
    text-decoration: underline;
}

@media (max-width: 900px) {
    .register-card {
        width: 100%;
        max-width: 520px;
    }

    .register-card-left {
        display: none;
    }

    .register-card-right {
        width: 100%;
        padding: 40px 30px;
    }

    .form-row {
        flex-direction: column;
        gap: 0;
    }
}

@media (max-width: 480px) {
    .register-card {
        border-radius: 0;
        min-height: 100vh;
    }

    .register-card-right {
        padding: 30px 20px;
    }

    .code-input-group {
        flex-direction: column;
    }

    .code-button {
        width: 100%;
    }
}
</style>
