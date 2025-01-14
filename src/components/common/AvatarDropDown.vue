<template>
    <!-- 登录和注册按钮 -->
    <el-button link @click="toPath('/login')" v-if="userInfo() == null" class="auth-button">登录</el-button>
    <el-button link @click="toPath('/register')" v-if="userInfo() == null" class="auth-button"
        style="margin-left: 1rem;">注册</el-button>

    <!-- 用户信息下拉菜单 -->
    <el-dropdown placement="bottom" v-if="userInfo() != null">
        <Avatar style="cursor: pointer;outline: none" class="avatar" />
        <template #dropdown>
            <div class="dropdown-content">
                <!-- 用户信息 -->
                <div class="user-info">
                    <div class="nickname">{{ userInfo().nickname }}</div>
                    <div class="vip-status">VIP8</div>
                    <div class="sex">性别：{{ userInfo().sex }}</div>
                </div>

                <!-- 组织信息 -->
                <el-row :gutter="20" class="org-row">
                    <el-col v-for="org in userInfo().orgs" :span="12" :key="org.id">
                        <el-button type="success" class="org-button">
                            <el-icon>
                                <Org />
                            </el-icon>
                            {{ org.name }}
                        </el-button>
                    </el-col>
                </el-row>

                <!-- 角色信息 -->
                <el-row :gutter="20" class="role-row">
                    <el-col v-for="role in userInfo().roles" :span="12" :key="role.id">
                        <el-button type="warning" class="role-button">
                            <el-icon>
                                <RoleSettings />
                            </el-icon>
                            {{ role.name }}
                        </el-button>
                    </el-col>
                </el-row>

                <!-- 下拉菜单项 -->
                <el-dropdown-menu>
                    <el-dropdown-item @click="toPath('/person-space')" class="menu-item">
                        <el-icon>
                            <user />
                        </el-icon>
                        <span>个人空间</span>
                    </el-dropdown-item>

                    <el-dropdown-item v-if="userInfo().admin" @click="toPath('/console')" class="menu-item">
                        <el-icon>
                            <Console />
                        </el-icon>
                        <span>控制台</span>
                    </el-dropdown-item>

                    <el-dropdown-item @click="logout" class="menu-item">
                        <el-icon>
                            <switch-button />
                        </el-icon>
                        <span>退出登录</span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </div>
        </template>
    </el-dropdown>
</template>

<script setup lang='ts'>
import Console from '../icon/Console.vue';
import RoleSettings from '../icon/RoleSettings.vue';
import Avatar from './Avatar.vue';
import { userInfo, logout, toPath } from '@/utils';
</script>

<style scoped>
/* 通用按钮样式 */
.auth-button {
    font-size: 14px;
    /* color: #409EFF; */
    padding: 8px 16px;
    transition: background-color 0.3s ease;
}

.auth-button:hover {
    /* background-color: #f5f7fa; */
}

/* 头像样式 */
.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

/* 下拉菜单内容 */
.dropdown-content {
    padding: 1rem;
    min-width: 300px;
    /* background-color: #fff; */
    /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
    border-radius: 8px;
}

/* 用户信息区域 */
.user-info {
    text-align: center;
    font-family: '华文新魏', sans-serif;
    margin-bottom: 1rem;
}

.nickname {
    font-size: 18px;
    font-weight: bold;
}

.vip-status {
    color: red;
    margin-top: 5px;
}

.sex {
    font-size: 14px;
    /* color: #888; */
    margin-top: 5px;
}

/* 组织信息行 */
.org-row {
    margin-bottom: 1rem;
}

.org-button {
    width: 100%;
    padding: 8px 0;
    border-radius: 4px;
    font-size: 14px;
}

.org-button:hover {
    /* background-color: #f5f7fa; */
}

/* 角色信息行 */
.role-row {
    margin-bottom: 1rem;
}

.role-button {
    width: 100%;
    padding: 8px 0;
    border-radius: 4px;
    font-size: 14px;
}

.role-button:hover {
    /* background-color: #f5f7fa; */
}

/* 下拉菜单项 */
.menu-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    font-size: 14px;
    /* color: #333; */
    transition: background-color 0.2s ease;
}

.menu-item:hover {
    /* background-color: #f5f7fa; */
}

.menu-item el-icon {
    font-size: 18px;
    margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .dropdown-content {
        min-width: 250px;
    }

    .auth-button {
        font-size: 12px;
    }
}
</style>
