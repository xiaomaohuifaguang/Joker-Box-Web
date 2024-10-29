<template>
    <div style="height: 100vh;" class="div-child-x-center div-child-y-center">
        <el-card style="width: 35%;">
            <template #header>
                <div class="div-child-x-center">
                    <span>Joker Box</span>
                </div>
            </template>
            <el-input v-model="loginInfo.username" size="large" placeholder="账号" :prefix-icon="User" />
            <el-input v-model="loginInfo.password" type="password" size="large" placeholder="密码" :prefix-icon="Lock"
                style="margin-top: 1rem;" />
            <template #footer>
                <div class="div-child-x-center">
                    <el-button type="primary" size="large" @click="login" plain style="width: 60%;">登录</el-button>
                </div>
                <!-- <a href="/register" style="margin-top: 1rem;display: flex;float: right;">去注册</a> -->
            </template>
        </el-card>

    </div>
</template>

<script setup lang='ts'>
import { http, setToken, toPath, saveUserInfo, userInfo, alert } from '@/utils';
import { User, Lock } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const path = ref('/')

const loginInfo = ref({
    username: '',
    password: ''
})

onMounted(() => {
    path.value = route.query.redirect != undefined ? route.query.redirect.toString() : path.value
})

const login = () => {
    http.result({
        url: "/auth/getToken",
        method: 'POST',
        data: loginInfo.value,
        success(result) {
            if (result.code == 200) {
                setToken(result.data)
                getUserInfo()
            } else {
                alert(result.msg, 'error')
            }
        },
        error(error) {
            alert(error.msg, 'error')
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




</script>

<style scoped>
.div-child-x-center {
    display: flex;
    justify-content: center;
}

.div-child-y-center {
    display: flex;
    align-items: center;
    /* 垂直居中 */
}

.el-input {
    height: 4rem;
    font-size: 2rem;
}
</style>