<template>
    <el-row class="layout-container">
        <el-col :span="24">
            <el-container class="main-container">
                <!-- 侧边导航菜单 -->
                <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
                    <el-menu :default-active="activeIndex" router @select="handleSelect" :collapse="isCollapse"
                        class="sidebar-menu" :collapse-transition="false">
                        <!-- Logo区域 -->
                        <el-menu-item index="/" class="logo-item">
                            <el-icon v-show="isCollapse">
                                <HomeFilled />
                            </el-icon>
                            <div v-show="!isCollapse" class="logo-content">
                                <Logo class="logo-text" />
                                <!-- <span class="logo-text">Admin Pro</span> -->
                            </div>
                        </el-menu-item>

                        <!-- 折叠按钮 -->
                        <div class="collapse-btn" @click="toggleCollapse">
                            <el-tooltip :content="isCollapse ? '展开菜单' : '折叠菜单'" placement="right">
                                <el-button text circle>
                                    <el-icon size="20">
                                        <Expand v-show="isCollapse" />
                                        <Fold v-show="!isCollapse" />
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                        </div>

                        <!-- 控制台主页 -->
                        <el-menu-item index="/console" class="menu-item">
                            <el-icon>
                                <Console />
                            </el-icon>
                            <span>控制台主页</span>
                        </el-menu-item>

                        <!-- 动态菜单 -->
                        <ElMenuItemInit v-for="menu in menuInit" :key="menu.path" :path="menu.path" :name="menu.name"
                            :children="menu.children" :icon="menu.icon" class="menu-item" />

                        <!-- 设置菜单 -->
                        <el-sub-menu index="/console/settings" class="menu-item">
                            <template #title>
                                <el-icon>
                                    <SystemSettings />
                                </el-icon>
                                <span>设置</span>
                            </template>
                            <el-menu-item index="/console/settings/system-manager">
                                <el-icon>
                                    <SystemSettings />
                                </el-icon>
                                <span>系统设置</span>
                            </el-menu-item>
                        </el-sub-menu>

                        <!-- 用户信息区域 -->
                        <el-divider class="sidebar-divider" />
                        <div class="user-info">
                            <Avatar class="user-avatar" />
                            <div class="user-name">
                                {{ isCollapse ? userInfo().nickname.substring(0, 1) : userInfo().nickname.substring(0,
                                    6) }}
                            </div>
                        </div>
                        <el-divider class="sidebar-divider" />

                        <!-- 退出登录 -->
                        <el-menu-item index="#logout" @click="doLogout" class="logout-item">
                            <el-icon>
                                <SwitchButton />
                            </el-icon>
                            <span>退出登录</span>
                        </el-menu-item>

                        <!-- 底部操作区域 -->
                        <div class="bottom-actions">
                            <el-tooltip :content="isCollapse ? '展开菜单' : '折叠菜单'" placement="right">
                                <el-button text circle @click="toggleCollapse">
                                    <el-icon size="20">
                                        <Expand v-show="isCollapse" />
                                        <Fold v-show="!isCollapse" />
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                            <DarkSwitch class="dark-switch" />
                        </div>
                    </el-menu>
                </el-aside>

                <!-- 主内容区域 -->
                <el-container class="content-container">
                    <el-main class="main-content">
                        <RouterView />
                    </el-main>
                </el-container>
            </el-container>
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { confirm, http, logout, toPath, userInfo } from '@/utils'
import Logo from '@/components/common/Logo.vue'
import DarkSwitch from '@/components/common/DarkSwitch.vue'
import Avatar from '@/components/common/Avatar.vue'
import ElMenuItemInit from '@/components/common/ElMenuItemInit.vue'
import { HomeFilled, Expand, Fold, SwitchButton } from '@element-plus/icons-vue'
import Api from '@/components/icon/Api.vue';
import RoleSettings from '@/components/icon/RoleSettings.vue';
import UserSettings from '@/components/icon/UserSettings.vue';
import SystemSettings from '@/components/icon/SystemSettings.vue';
import Org from '@/components/icon/Org.vue';
import Console from '@/components/icon/Console.vue';
import Website from '@/components/icon/Website.vue';

const route = useRoute()
const activeIndex = ref(route.path)
const isCollapse = ref(false)
const menuInit = ref([])

const handleSelect = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}

const doLogout = () => {
    confirm('提示', '确定退出吗', () => {
        logout()
        toPath('/')
    })
}

const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value
}

const queryMenu = () => {
    http.result({
        url: '/menu/menuTree',
        method: 'GET',
        success(result) {
            menuInit.value = result.data
        }
    })
}

onMounted(() => {
    queryMenu()
})
</script>

<style scoped lang="scss">
.layout-container {
    height: 100vh;
    // overflow: hidden;
}

.main-container {
    height: 100%;
}

.sidebar {
    background-color: var(--el-bg-color-overlay);
    border-right: 1px solid var(--el-border-color-light);
    transition: width 0.3s ease;

    .sidebar-menu {
        height: 100%;
        border-right: none;
        display: flex;
        flex-direction: column;
    }
}

.logo-item {
    height: 80px !important;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--el-color-primary-light-9);
    border-bottom: 1px solid var(--el-border-color-light);

    .logo-content {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;

        .logo {
            width: 30px;
            height: 30px;
            margin-right: 10px;
        }

        .logo-text {
            font-size: 1.2rem;
            font-weight: bold;
            font-style: italic;
            color: var(--el-color-primary);
        }
    }
}

.collapse-btn {
    display: flex;
    justify-content: center;
    padding: 15px 0;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background-color: var(--el-color-primary-light-9);
    }
}

.menu-item {

    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
        background-color: var(--el-color-primary-light-9);
    }

    &.is-active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
    }
}

.sidebar-divider {
    margin: 10px 0;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;

    .user-avatar {
        width: 40px;
        height: 40px;
        margin-bottom: 8px;
    }

    .user-name {
        font-size: 0.9rem;
        font-weight: 500;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }
}

.logout-item {
    color: var(--el-color-danger);
    margin: 10px;
    border-radius: 6px;

    &:hover {
        background-color: var(--el-color-danger-light-9);
    }
}

.bottom-actions {
    margin-top: auto;
    padding: 15px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;

    .dark-switch {
        margin-top: 10px;
    }
}

.content-container {
    background-color: var(--el-bg-color-page);
}

.main-content {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
}

@media (max-width: 768px) {
    .sidebar {
        width: 64px !important;
    }

    .logo-text {
        display: none;
    }
}
</style>