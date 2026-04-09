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
                            <img src="@/assets/img/joker-1.png" alt="Logo" />
                        </div>
                        <h1 class="brand-name">Joker Box</h1>
                        <p class="brand-slogan">救赎之道就在其中</p>
                    </div>
                    <div class="features">
                        <div class="feature-item">
                            <el-icon class="feature-icon"><CircleCheck /></el-icon>
                            <span>高效工作流程</span>
                        </div>
                        <div class="feature-item">
                            <el-icon class="feature-icon"><Lock /></el-icon>
                            <span>安全可靠的数据</span>
                        </div>
                        <div class="feature-item">
                            <el-icon class="feature-icon"><Star /></el-icon>
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
                    <el-icon><House /></el-icon>
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
                        <el-input 
                            v-model="loginInfo.username" 
                            size="large" 
                            placeholder="请输入账号" 
                            :prefix-icon="User"
                            class="input-field custom-input" 
                            autocomplete="new-password" 
                            clearable />
                    </div>
                    <div class="input-group">
                        <label class="input-label">密码</label>
                        <el-input 
                            v-model="loginInfo.password" 
                            type="password" 
                            size="large" 
                            placeholder="请输入密码"
                            :prefix-icon="Lock" 
                            class="input-field custom-input" 
                            autocomplete="new-password" 
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
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                            GitHub
                        </el-button>
                        <el-button @click="ssoPath('gitee')" class="sso-button gitee-button">
                            <svg class="sso-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.593.593v1.482a.593.593 0 0 1-.593.593h-.592v7.111h.592a.593.593 0 0 1 .593.593v1.481a.593.593 0 0 1-.593.593h-2.37a.593.593 0 0 1-.592-.593v-1.481a.593.593 0 0 1 .593-.593h.592V7.408h-.592a.593.593 0 0 1-.593-.593V5.333a.593.593 0 0 1 .593-.593h2.37zm-4.741 0c.328 0 .593.266.593.593v1.482a.593.593 0 0 1-.593.593h-.592v7.111h.592a.593.593 0 0 1 .593.593v1.481a.593.593 0 0 1-.593.593h-2.37a.593.593 0 0 1-.592-.593v-1.481a.593.593 0 0 1 .593-.593h.592V7.408h-.592a.593.593 0 0 1-.593-.593V5.333a.593.593 0 0 1 .593-.593h2.37zm-4.741 0c.328 0 .593.266.593.593v4.148h1.185V5.926a.593.593 0 0 1 .593-.593h2.37a.593.593 0 0 1 .593.593v1.482a.593.593 0 0 1-.593.593h-.592v3.556h.592a.593.593 0 0 1 .593.593v1.481a.593.593 0 0 1-.593.593h-2.37a.593.593 0 0 1-.592-.593v-1.481a.593.593 0 0 1 .593-.593h.592V7.408h-.592a.593.593 0 0 1-.593-.593V5.333a.593.593 0 0 1 .593-.593h-2.37z"/>
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

const route = useRoute();
const path = ref('/');
const loginInfo = ref({ username: '', password: '' });
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

const login = () => {
    if (!loginInfo.value.username || !loginInfo.value.password) {
        alert('请输入账号和密码', 'warning');
        return;
    }
    
    isLoading.value = true;
    loginVerify();
    http.result({
        url: "/auth/getToken",
        method: 'POST',
        data: loginInfo.value,
        success(result) {
            if (result.code === 200) {
                setToken(result.data);
                getUserInfo();
            } else {
                alert(result.msg, 'error');
                isLoading.value = false;
            }
        },
        error(error) {
            alert(error.msg, 'error');
            isLoading.value = false;
        }
    });
};

const loginSSO = () => {
    loginVerify();
    http.result({
        url: "/auth/getTokenSSO",
        method: 'POST',
        params: ssoInfo.value,
        success(result) {
            if (result.code === 200) {
                setToken(result.data);
                getUserInfo();
            } else {
                alert(result.msg, 'error');
            }
        },
        error(error) {
            alert(error.msg, 'error');
        }
    });
};

async function getUserInfo() {
    http.result({
        url: '/auth/userInfo',
        method: 'POST',
        success(result) {
            saveUserInfo(result.data);
            toPath(path.value);
        }
    });
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
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    top: -100px;
    left: -100px;
    animation-delay: 0s;
}

.orb-2 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    bottom: -50px;
    right: -50px;
    animation-delay: -7s;
}

.orb-3 {
    width: 250px;
    height: 250px;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    top: 50%;
    left: 50%;
    animation-delay: -14s;
}

@keyframes float {
    0%, 100% {
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
    0%, 100% {
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
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    background: rgba(255, 255, 255, 0.95);
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
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
    border-radius: 24px;
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
    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%);
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
    border-radius: 12px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
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
    0%, 100% {
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
    background: transparent;
    border: 2px solid #e4e7ed;
    color: #909399;
    transition: all 0.3s ease;
}

.home-button:hover {
    color: #409eff;
    border-color: #409eff;
    transform: scale(1.1) rotate(5deg);
    background: rgba(64, 158, 255, 0.1);
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
    color: #303133;
    font-weight: 700;
    margin-bottom: 8px;
}

.login-subtitle {
    font-size: 14px;
    color: #909399;
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
    color: #606266;
    font-weight: 500;
    margin-bottom: 8px;
}

.custom-input :deep(.el-input__wrapper) {
    border-radius: 12px;
    box-shadow: 0 0 0 1px #dcdfe6 inset;
    padding: 0 15px;
    transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #409eff inset;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px #409eff inset;
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
    color: #606266;
}

.forgot-link {
    font-size: 13px;
    color: #409eff;
    text-decoration: none;
    transition: all 0.3s ease;
}

.forgot-link:hover {
    color: #66b1ff;
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
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    transition: all 0.3s ease;
    letter-spacing: 2px;
}

.login-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
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
    background: linear-gradient(90deg, transparent, #dcdfe6, transparent);
}

.divider-text {
    display: inline-block;
    padding: 0 20px;
    background: white;
    color: #909399;
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
    border-radius: 10px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid #e4e7ed;
    background: white;
    color: #606266;
}

.sso-icon {
    width: 20px;
    height: 20px;
}

.github-button:hover {
    background: #24292e;
    color: white;
    border-color: #24292e;
    transform: translateY(-2px);
}

.gitee-button:hover {
    background: #c71d23;
    color: white;
    border-color: #c71d23;
    transform: translateY(-2px);
}

/* 注册链接 */
.register-link {
    text-align: center;
    margin-top: 25px;
    font-size: 14px;
    color: #606266;
    animation: fade-in-up 0.5s ease-out 0.5s both;
}

.register-link a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    margin-left: 5px;
    transition: all 0.3s ease;
}

.register-link a:hover {
    color: #764ba2;
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
