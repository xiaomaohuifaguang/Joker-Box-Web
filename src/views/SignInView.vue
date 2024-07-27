<template>
    <div>
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="card bg-base-200 w-full max-w-sm shrink-0 shadow-2xl">
                    <div className="card-body">
                        <img src="/logo.svg" className="h-40 mb-1" />
                        <div className="form-control">
                            <label className="input input-bordered flex items-center gap-2">
                                账号
                                <input type="text" className="grow" placeholder="" v-model="regInfo.username" maxlength="20"/>
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="input input-bordered flex items-center gap-2">
                                密码
                                <input type="password" className="grow" placeholder="" v-model="regInfo.password" maxlength="20"
                                    autocomplete="new-password" />
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="input input-bordered flex items-center gap-2">
                                昵称
                                <input type="text" className="grow" placeholder="" v-model="regInfo.nickname" maxlength="20"/>
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="input input-bordered flex items-center gap-2">
                                邮箱
                                <input type="text" className="grow" placeholder="" v-model="regInfo.mail" maxlength="30"
                                    :disabled="codeBtnText != '发送'" />
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="input input-bordered flex items-center gap-2">
                                验证码
                                <input type="text" className="grow" placeholder="" v-model="regInfo.code" />
                                <button className="btn btn-xs btn-outline btn-success" @click="sendCode"
                                    :disabled="codeBtnText != '发送'">{{ codeBtnText }}</button>
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">邀请码</span>
                            </label>
                            <input type="text" placeholder="（选填）" className="input input-bordered"
                                v-model="regInfo.inviteCode" />
                        </div>
                        <div className="form-control mt-6">
                            <button className="btn btn-primary" @click="signin">注册</button>
                            <label className="label">
                                <RouterLink :to="{ path: 'login' }" className="label-text-alt link link-hover">去登录
                                </RouterLink>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold">现在开始注册吧</h1>
                    <div class="iframe_blbl">
                        <!-- <iframe class="iframe_blbl"
                            src="https://www.bilibili.com/blackboard/live/live-activity-player.html?cid=26179557&quality=0"
                            frameborder="no" framespacing="0" scrolling="no" allow="autoplay; encrypted-media"
                            allowfullscreen="true"></iframe> -->
                    </div>
                    <p className="py-6">
                        你可以开始注册了
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { http, getToken, alert, regTest } from '@/utils'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const regInfo = ref({
    "username": "",
    "password": "",
    "nickname":"",
    "mail": "",
    "code": "",
    "inviteCode": ""
})

const codeBtnText = ref('发送')


const signin = () => {
    const token = getToken();
    if (token && token != null) {
        router.push({
            path: '/'
        })
        return;
    }
    if(!regTest(regInfo.value.username,'account')){
        alert('账号格式不正确', 'warning');
        return;
    }
    if(!regTest(regInfo.value.password,'password')){
        alert('密码格式不正确', 'warning');
        return;
    }
    if(!regTest(regInfo.value.mail,'email')){
        alert('邮箱格式不正确', 'warning');
        return;
    }

    http.result({
        server: "AUTH",
        url: "/auth/register",
        method: "POST",
        data: regInfo.value,
        success: (result) => {
            if (result.code == 200) {
                alert("注册成功",'success')
                router.push({path:'/login'})
            }
        },
        error: (result) => {
            alert(result['msg'],'error')
        }
    })

}

const sendCode = () => {
    if (!regInfo.value.mail || regInfo.value.mail == '' || !regTest(regInfo.value.mail,'email')) {
        alert('邮箱格式不正确', 'warning');
        return;
    }
    requestCode()
}

const requestCode = () => {
    http.result({
        server: "AUTH",
        url: "/auth/mailCode",
        method: "POST",
        params: {
            mail: regInfo.value.mail
        },
        success: (result) => {
            if (result.code == 200) {
                alert('发送成功', 'success')
                codeBtnText.value = '60'
                let remainingSeconds = Number(codeBtnText.value);
                const intervalId = setInterval(() => {
                    if (remainingSeconds === 0) {
                        clearInterval(intervalId); // 停止定时器
                        codeBtnText.value = '发送'
                    } else {
                        remainingSeconds--; // 倒计时递减
                        codeBtnText.value = ' ' + (remainingSeconds < 10 ? '0' + String(remainingSeconds) : String(remainingSeconds));
                    }
                }, 1000);
            }
        }
    })
}



</script>

<style lang="scss" scoped>
.iframe_blbl {
    width: 800px;
    height: 600px;
    pointer-events: none;
}
</style>