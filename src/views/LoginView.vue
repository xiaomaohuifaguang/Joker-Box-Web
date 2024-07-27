<template>
  <div>
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="card bg-base-200 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <img src="/logo.svg" className="h-40" />
            <div className="form-control">
              <label className="input input-bordered flex items-center gap-2">
                账号
                <input type="text" className="grow" placeholder="" v-model="loginInfo.username" />
              </label>
            </div>
            <div className="form-control">
              <label className="input input-bordered flex items-center gap-2">
                密码
                <input type="password" className="grow" placeholder="" v-model="loginInfo.password"
                  autocomplete="new-password" />
              </label>
              <div className="label">
                <span className="label-text-alt">忘记密码?</span>
                <span className="label-text-alt">邮箱验证登录?</span>
              </div>
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary" @click="login">登录</button>
              <label className="label">
                <RouterLink :to="{ path: 'signin' }" className="label-text-alt link link-hover">去注册</RouterLink>
              </label>
            </div>
          </div>
        </div>

        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">现在开始登录吧</h1>
          <div class="iframe_blbl">
            <!-- <iframe class="iframe_blbl"
              src="https://www.bilibili.com/blackboard/live/live-activity-player.html?cid=26179557&quality=0"
              frameborder="no" framespacing="0" scrolling="no" allow="autoplay; encrypted-media"
              allowfullscreen="true"></iframe> -->
          </div>
          <p className="py-6">
            你可以开始登录了
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { http, setToken, getToken } from '@/utils'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loginInfo = ref({
  "username": "",
  "password": "",
  "token": ""
})


const login = () => {
  const token = getToken();
  if (token && token != null) {
    router.push({
      name: 'login'
    })
    return;
  }

  http.result({
    server: "AUTH",
    url: "/auth/getToken",
    method: "POST",
    data: loginInfo.value,
    success: (result) => {
      if (result.code == 200) {
        setToken(result.data)
        router.push({
          path: '/'
        })
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