<template>
    <div class="login-container">
        <el-card class="login-card">
            <!-- Home button -->
            <el-button @click="toHome" class="home-button" icon="house" circle></el-button>

            <!-- Card header -->
            <template #header>
                <div class="card-header">
                    <span class="login-title">
                        <Logo />
                    </span>
                </div>
            </template>

            <!-- Login form -->
            <el-input v-model="loginInfo.username" size="large" placeholder="请输入账号" :prefix-icon="User"
                class="input-field" autocomplete="new-password" clearable />
            <el-input v-model="loginInfo.password" type="password" size="large" placeholder="请输入密码" :prefix-icon="Lock"
                class="input-field" autocomplete="new-password" show-password />

            <!-- Card footer -->
            <template #footer>
                <div class="card-footer">
                    <el-button type="primary" size="large" @click="login" class="login-button">
                        登 录
                    </el-button>

                    <div class="or-login">
                        <span>或使用以下账号直接登录：</span>
                    </div>

                    <div class="sso-buttons">
                        <el-button @click="ssoPath('github')" class="sso-button github-button">
                            <i class="iconfont icon-github"></i> GitHub
                        </el-button>
                        <el-button @click="ssoPath('gitee')" class="sso-button gitee-button">
                            <i class="iconfont icon-gitee"></i> Gitee
                        </el-button>
                    </div>
                </div>
            </template>

            <!-- Register link -->
            <div class="register-link">
                <span>没有账号？</span>
                <router-link to="/register">立即注册</router-link>
            </div>
        </el-card>
    </div>
</template>

<script setup lang='ts'>
import { http, setToken, toPath, saveUserInfo, alert, CONSTANTS } from '@/utils';
import { User, Lock } from '@element-plus/icons-vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Logo from '@/components/common/Logo.vue';

const route = useRoute();
const path = ref('/');
const loginInfo = ref({ username: 'admin', password: '12345678' });
const ssoInfo = ref({ clientName: '', id: '' });

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
            }
        },
        error(error) {
            alert(error.msg, 'error');
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
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-size: cover;
    background-position: center;
}

.login-card {
    width: 420px;
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

.login-title {
    font-size: 24px;
    color: #303133;
    font-weight: 600;
}

.input-field {
    margin-bottom: 20px;
    border-radius: 8px;
}

.input-field :deep(.el-input__inner) {
    height: 48px;
    font-size: 16px;
}

.card-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.login-button {
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

.login-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.or-login {
    margin: 20px 0;
    font-size: 14px;
    color: #909399;
    text-align: center;
    position: relative;
}

.or-login span {
    display: inline-block;
    padding: 0 10px;
    background: rgba(255, 255, 255, 0.95);
    position: relative;
    z-index: 1;
}

.or-login::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #dcdfe6;
    z-index: 0;
}

.sso-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    width: 100%;
}

.sso-button {
    flex: 1;
    height: 40px;
    font-size: 14px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.sso-button i {
    margin-right: 5px;
    font-size: 18px;
}

.github-button {
    background-color: #24292e;
    color: white;
    border: none;
}

.github-button:hover {
    background-color: #2d3338;
}

.gitee-button {
    background-color: #c71d23;
    color: white;
    border: none;
}

.gitee-button:hover {
    background-color: #d62e34;
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

.register-link {
    position: absolute;
    bottom: 16px;
    right: 16px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    color: #606266;
}

.register-link a {
    color: #409eff;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
}

.register-link a:hover {
    color: #36a2eb;
    text-decoration: underline;
}
</style>