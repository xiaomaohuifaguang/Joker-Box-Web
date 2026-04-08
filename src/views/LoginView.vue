<template>
    <div class="login-container">
        <div class="login-card">
            <!-- 左侧留白区域 -->
            <div class="login-card-left">
                <!-- 这里可以添加您自定义的内容，如图片、宣传语等 -->
                <div class="left-content">
                    <h2>Joker Box</h2>
                    <p>救赎之道就在其中</p>
                    <!-- <img src="@/assets/img/joker-2.png" alt="登录插图" class="login-illustration"> -->
                </div>
            </div>

            <!-- 右侧登录表单区域 -->
            <div class="login-card-right">
                <!-- Home button -->
                <el-button @click="toHome" class="home-button" icon="house" circle></el-button>

                <!-- Card header -->
                <div class="card-header">
                    <span class="login-title">
                        <Logo />
                    </span>
                </div>

                <!-- Login form -->
                <el-input v-model="loginInfo.username" size="large" placeholder="请输入账号" :prefix-icon="User"
                    class="input-field" autocomplete="new-password" clearable />
                <el-input v-model="loginInfo.password" type="password" size="large" placeholder="请输入密码"
                    :prefix-icon="Lock" class="input-field" autocomplete="new-password" show-password />

                <!-- Card footer -->
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

                <!-- Register link -->
                <div class="register-link">
                    <span>没有账号？</span>
                    <router-link to="/register">立即注册</router-link>
                </div>
            </div>
        </div>
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
    padding: 20px;
}

.login-card {
    width: 900px;
    min-height: 550px;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 0.98);
    position: relative;
    display: flex;
    overflow: hidden;
}

.login-card-left {
    flex: 1;
    background: linear-gradient(135deg, #6e8efb, #a777e3);
    color: white;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.left-content {
    max-width: 400px;
    text-align: center;
}

.left-content h2 {
    font-size: 32px;
    margin-bottom: 15px;
    font-weight: 600;
}

.left-content p {
    font-size: 16px;
    opacity: 0.9;
    margin-bottom: 30px;
}

.login-illustration {
    width: 100%;
    max-width: 300px;
    margin-top: 30px;
}

.login-card-right {
    width: 400px;
    padding: 40px;
    position: relative;
}

.card-header {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
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
    padding-left: 40px;
}

.card-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
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
    background: white;
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

/* 响应式设计 */
@media (max-width: 768px) {
    .login-card {
        flex-direction: column;
        width: 90%;
    }

    .login-card-left {
        display: none;
    }

    .login-card-right {
        width: 100%;
    }
}
</style>