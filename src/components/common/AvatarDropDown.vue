<template>
    <el-button link @click="toPath('/login')" v-if="userInfo() == null">登录</el-button>
    <el-dropdown placement="bottom" v-if="userInfo() != null">
        <Avatar style="cursor: pointer;outline: none" />
        <template #dropdown>
            <div style="text-align: center;width: 200px;font-family: '华文新魏';padding: 0.5rem;">
                <div>{{ userInfo().nickname }}</div>
                <div style="color: red;">VIP8</div>
                <div>性别：{{ userInfo().sex }}</div>
            </div>
            <el-dropdown-menu>
                <el-dropdown-item @click="toPath('/person-space')">
                    <div class="menu-item">
                        <el-icon>
                            <user />
                        </el-icon>
                        <span>个人空间</span>
                    </div>
                </el-dropdown-item>
                <el-dropdown-item v-if="userInfo().admin" @click="toPath('/console')">
                    <div class="menu-item">
                        <el-icon>
                            <Console />
                        </el-icon>
                        <span>控制台</span>
                    </div>

                </el-dropdown-item>
                <el-dropdown-item @click="logout">
                    <div class="menu-item">
                        <el-icon>
                            <switch-button />
                        </el-icon>
                        <span>退出登录</span>
                    </div>

                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
    <el-button link @click="toPath('/register')" v-if="userInfo() == null" style="margin-left: 1rem;">注册</el-button>
</template>

<script setup lang='ts'>
import Console from '../icon/Console.vue';
import Avatar from './Avatar.vue';
import { userInfo, logout, toPath } from '@/utils';
</script>

<style scoped>
.menu-item {
    padding-left: 1rem;
    width: 100%;
    height: 2rem;
    border-bottom: 1px solid var(--el-border-color);
}

.menu-item span {
    margin-left: 1rem;
}
</style>