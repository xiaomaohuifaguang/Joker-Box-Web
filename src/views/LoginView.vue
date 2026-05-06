<template>
    <div class="login-container">
        <!-- 动态背景元素 -->
        <div class="animated-bg">
            <div class="gradient-orb orb-1"></div>
            <div class="gradient-orb orb-2"></div>
            <div class="gradient-orb orb-3"></div>
            <div class="particles">
                <span v-for="n in 20" :key="n" class="particle"></span>
            </div>
        </div>

        <div class="login-card">
            <!-- 左侧宣传区域 -->
            <div class="login-card-left">
                <div class="left-content">
                    <div class="logo-section">
                        <div class="logo-icon">
                            <LogoIcon :size="64" />
                        </div>
                        <h1 class="brand-name">Joker Box</h1>
                        <p class="brand-slogan">救赎之道就在其中</p>
                    </div>
                    <div class="features">
                        <div class="feature-item">
                            <el-icon class="feature-icon">
                                <CircleCheck />
                            </el-icon>
                            <span>高效工作流程</span>
                        </div>
                        <div class="feature-item">
                            <el-icon class="feature-icon">
                                <Lock />
                            </el-icon>
                            <span>安全可靠的数据</span>
                        </div>
                        <div class="feature-item">
                            <el-icon class="feature-icon">
                                <Star />
                            </el-icon>
                            <span>智能化体验</span>
                        </div>
                    </div>
                </div>
                <div class="decorative-shapes">
                    <div class="shape shape-1"></div>
                    <div class="shape shape-2"></div>
                    <div class="shape shape-3"></div>
                </div>
            </div>

            <!-- 右侧登录表单区域 -->
            <div class="login-card-right">
                <!-- Home button -->
                <el-button @click="toHome" class="home-button" circle>
                    <el-icon>
                        <House />
                    </el-icon>
                </el-button>

                <!-- Card header -->
                <div class="card-header">
                    <div class="welcome-text">
                        <h2 class="login-title">欢迎回来</h2>
                        <p class="login-subtitle">请登录您的账号以继续</p>
                    </div>
                </div>

                <!-- Login form -->
                <div class="form-wrapper">
                    <div class="input-group">
                        <label class="input-label">账号</label>
                        <el-input v-model="loginInfo.username" size="large" placeholder="请输入账号" :prefix-icon="User"
                            class="input-field custom-input" autocomplete="new-password" clearable />
                    </div>
                    <div class="input-group">
                        <label class="input-label">密码</label>
                        <el-input v-model="loginInfo.password" type="password" size="large" placeholder="请输入密码"
                            :prefix-icon="Lock" class="input-field custom-input" autocomplete="new-password"
                            show-password />
                    </div>

                    <div class="form-options">
                        <el-checkbox v-model="rememberMe" class="remember-checkbox">记住我</el-checkbox>
                        <a href="#" class="forgot-link">忘记密码？</a>
                    </div>
                </div>

                <!-- Card footer -->
                <div class="card-footer">
                    <el-button type="primary" size="large" @click="login" class="login-button" :loading="isLoading">
                        <span v-if="!isLoading">登 录</span>
                        <span v-else>登录中...</span>
                    </el-button>

                    <div class="divider">
                        <span class="divider-text">或使用以下方式登录</span>
                    </div>

                    <div class="sso-buttons">
                        <el-button @click="ssoPath('github')" class="sso-button github-button">
                            <svg class="sso-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            GitHub
                        </el-button>
                        <el-button @click="ssoPath('gitee')" class="sso-button gitee-button">
                            <svg class="sso-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M512 1024q-104 0-199-40-92-39-163-110T40 711Q0 616 0 512t40-199Q79 221 150 150T313 40q95-40 199-40t199 40q92 39 163 110t110 163q40 95 40 199t-40 199q-39 92-110 163T711 984q-95 40-199 40z m259-569H480q-10 0-17.5 7.5T455 480v64q0 10 7.5 17.5T480 569h177q11 0 18.5 7.5T683 594v13q0 31-22.5 53.5T607 683H367q-11 0-18.5-7.5T341 657V417q0-31 22.5-53.5T417 341h354q11 0 18-7t7-18v-63q0-11-7-18t-18-7H417q-38 0-72.5 14T283 283q-27 27-41 61.5T228 417v354q0 11 7 18t18 7h373q46 0 85.5-22.5t62-62Q796 672 796 626V480q0-10-7-17.5t-18-7.5z">
                                </path>
                            </svg>
                            Gitee
                        </el-button>
                    </div>
                </div>

                <!-- Register link -->
                <div class="register-link">
                    <span>还没有账号？</span>
                    <router-link to="/register">立即注册</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { http, setToken, toPath, saveUserInfo, alert, CONSTANTS } from '@/utils';
import { User, Lock, House, CircleCheck, Star } from '@element-plus/icons-vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import LogoIcon from '@/components/icon/LogoIcon.vue';

const route = useRoute();
const path = ref('/');
const loginInfo = ref({ username: 'admin', password: '12345678' });
const ssoInfo = ref({ clientName: '', id: '' });
const rememberMe = ref(false);
const isLoading = ref(false);

onMounted(() => {
    loginVerify();
    path.value = route.query.redirect?.toString() || '/';
    if (route.query.clientName && route.query.id) {
        ssoInfo.value.clientName = route.query.clientName.toString();
        ssoInfo.value.id = route.query.id.toString();
        loginSSO();
    }
});

const loginVerify = () => {
    const token = localStorage.getItem(CONSTANTS.SYSTEM.TOKEN);
    if (token) {
        toPath('/');
    }
};

const login = async () => {
    if (!loginInfo.value.username || !loginInfo.value.password) {
        alert('请输入账号和密码', 'warning');
        return;
    }

    isLoading.value = true;
    loginVerify();
    try {
        const token = await http.post('/auth/getToken', loginInfo.value);
        setToken(token);
        getUserInfo();
    } finally {
        isLoading.value = false;
    }
};

const loginSSO = async () => {
    loginVerify();
    const token = await http.post('/auth/getTokenSSO', undefined, { params: ssoInfo.value });
    setToken(token);
    getUserInfo();
};

async function getUserInfo() {
    const data = await http.post('/auth/userInfo');
    saveUserInfo(data);
    toPath(path.value);
}

const ssoPath = (sys: string) => {
    window.location.href = `/joker-box/sso/oauth2/authorization/${sys}`;
};

const toHome = () => {
    toPath('/');
};
</script>

<style scoped>
.login-container {
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

    0%,
    100% {
        transform: translate(0, 0) scale(1);
    }

    25% {
        transform: translate(50px, -50px) scale(1.1);
    }

    50% {
        transform: translate(-30px, 30px) scale(0.9);
    }

    75% {
        transform: translate(30px, 50px) scale(1.05);
    }
}

/* 粒子效果 */
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

    0%,
    100% {
        transform: translateY(0) translateX(0);
        opacity: 0;
    }

    10% {
        opacity: 0.3;
    }

    90% {
        opacity: 0.3;
    }

    50% {
        transform: translateY(-100px) translateX(50px);
    }
}

/* 登录卡片 */
.login-card {
    width: 1000px;
    min-height: 600px;
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

/* 左侧区域 */
.login-card-left {
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

    0%,
    100% {
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

/* 装饰形状 */
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

    0%,
    100% {
        transform: translate(0, 0) rotate(0deg);
    }

    50% {
        transform: translate(20px, -20px) rotate(180deg);
    }
}

/* 右侧表单区域 */
.login-card-right {
    width: 420px;
    padding: 50px 45px;
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
    margin-bottom: 35px;
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

.login-title {
    font-size: 28px;
    color: var(--text-primary);
    font-weight: 700;
    margin-bottom: 8px;
}

.login-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 400;
}

/* 表单样式 */
.form-wrapper {
    flex: 1;
    animation: fade-in-up 0.5s ease-out 0.3s both;
}

.input-group {
    margin-bottom: 20px;
}

.input-label {
    display: block;
    font-size: 14px;
    color: var(--text-regular);
    font-weight: 500;
    margin-bottom: 8px;
}

.custom-input :deep(.el-input__wrapper) {
    border-radius: var(--radius-md);
    box-shadow: 0 0 0 1px var(--border-base) inset;
    padding: 0 15px;
    transition: all var(--duration-normal) var(--ease-out);
    background: var(--bg-input);
}

.custom-input :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px var(--brand-primary) inset;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px var(--brand-primary) inset;
}

.custom-input :deep(.el-input__inner) {
    height: 50px;
    font-size: 15px;
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    margin-bottom: 25px;
}

.remember-checkbox :deep(.el-checkbox__label) {
    font-size: 13px;
    color: var(--text-secondary);
}

.forgot-link {
    font-size: 13px;
    color: var(--text-link);
    text-decoration: none;
    transition: all var(--duration-normal) var(--ease-out);
}

.forgot-link:hover {
    color: var(--text-link-hover);
    text-decoration: underline;
}

/* 按钮样式 */
.card-footer {
    animation: fade-in-up 0.5s ease-out 0.4s both;
}

.login-button {
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

.login-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow-strong);
}

.login-button:active {
    transform: translateY(0);
}

.divider {
    margin: 30px 0;
    text-align: center;
    position: relative;
}

.divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-base), transparent);
}

.divider-text {
    display: inline-block;
    padding: 0 20px;
    background: var(--bg-container);
    color: var(--text-secondary);
    font-size: 13px;
    position: relative;
}

.sso-buttons {
    display: flex;
    gap: 15px;
}

.sso-button {
    flex: 1;
    height: 44px;
    font-size: 14px;
    border-radius: var(--radius-md);
    transition: all var(--duration-normal) var(--ease-out);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--border-base) !important;
    background: var(--bg-container) !important;
    color: var(--text-regular) !important;
}

.sso-icon {
    width: 20px;
    height: 20px;
}

.github-button:hover {
    background: #24292e !important;
    color: #fff !important;
    border-color: #24292e !important;
    transform: translateY(-2px);
}

.gitee-button:hover {
    background: #c71d23 !important;
    color: #fff !important;
    border-color: #c71d23 !important;
    transform: translateY(-2px);
}

/* 注册链接 */
.register-link {
    text-align: center;
    margin-top: 25px;
    font-size: 14px;
    color: var(--text-secondary);
    animation: fade-in-up 0.5s ease-out 0.5s both;
}

.register-link a {
    color: var(--brand-primary);
    text-decoration: none;
    font-weight: 600;
    margin-left: 5px;
    transition: all var(--duration-normal) var(--ease-out);
}

.register-link a:hover {
    color: var(--brand-primary-hover);
    text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 900px) {
    .login-card {
        width: 100%;
        max-width: 420px;
    }

    .login-card-left {
        display: none;
    }

    .login-card-right {
        width: 100%;
        padding: 40px 30px;
    }
}

@media (max-width: 480px) {
    .login-card {
        border-radius: 0;
        min-height: 100vh;
    }

    .login-card-right {
        padding: 30px 20px;
    }
}
</style>
