<template>
    <div class="mr-5">
        <div class="dropdown dropdown-end">
            <div tabIndex="0" role="button" class="btn btn-ghost btn-circle avatar">
                <div class="avatar">
                    <div class="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img alt="avatar" :src="userInfo.avatar" />
                    </div>
                </div>
            </div>
            <ul tabIndex="0"
                class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg">
                <div class="w-full py-2 px-3">
                    <div class="text-center font-bold text-sm mb-2">{{ userInfo.name }}</div>
                    <div class="divider my-2"></div>
                </div>
                <li>
                    <RouterLink :to="{ path: '/' }" class="justify-end">主页</RouterLink>
                </li>
                <li>
                    <RouterLink :to="{ path: '/my' }" class="justify-end">我的</RouterLink>
                </li>
                <li>
                    <RouterLink :to="{ path: '/my/settings' }" class="justify-end">设置</RouterLink>
                </li>
                <li>
                    <RouterLink :to="{ path: '/console' }" class="justify-end">控制台</RouterLink>
                </li>
                <li>
                    <a @click="logout" class="justify-end">退出登录</a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { logout } from '@/utils';

const userInfo = ref({
    name: "用户名", // 替换为用户实际名称
    avatar: "/web/logo.svg"
});
</script>

<style lang="scss" scoped>

.avatar img {
    transition: transform 0.3s ease;
}

.avatar img:hover {
    transform: scale(1.1);
}

.menu li a {
    padding: 0.5rem 1rem;
    transition: background-color 0.3s ease;
    line-height: 2rem;
    font-size: 1rem;
}


.divider {
    margin: 0.5rem 0;
}
</style>
