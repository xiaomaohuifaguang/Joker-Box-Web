<template>
    <el-menu :default-active="activeIndex" class="custom-navbar" mode="horizontal" :ellipsis="false" router
        @select="handleSelect">
        <!-- Logo 区域 -->
        <el-menu-item index="/" class="logo-item">
            <Logo class="logo-text" />
            <!-- <span class="logo-text">Your Brand</span> -->
        </el-menu-item>

        <!-- 主菜单项 -->
        <ElMenuItemInit v-for="menu in menuInit" :key="menu.path" :path="menu.path" :name="menu.name"
            :children="menu.children" :icon="menu.icon" class="nav-item" />

        <!-- 功能页下拉菜单 -->
        <el-sub-menu index="功能页" class="more-menu">
            <template #title>
                <el-icon class="menu-icon">
                    <MoreFilled />
                </el-icon>
                <span class="menu-text">功能页</span>
            </template>
            <el-menu-item index="/test" class="submenu-item">测试</el-menu-item>
            <el-menu-item index="/403" class="submenu-item">403</el-menu-item>
            <el-menu-item index="/404" class="submenu-item">404</el-menu-item>
        </el-sub-menu>

        <!-- 右侧功能区 -->
        <div class="right-actions">
            <div class="action-item">
                <AvatarDropDown />
            </div>
            <div class="action-item">
                <DarkSwitch />
            </div>
            <div class="action-item">
                <ThemeSelector />
            </div>
        </div>
    </el-menu>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getToken, http } from '@/utils'
import { MoreFilled } from '@element-plus/icons-vue'
import ThemeSelector from '@/components/common/ThemeSelector.vue'
import AvatarDropDown from './AvatarDropDown.vue'
import DarkSwitch from './DarkSwitch.vue'
import ElMenuItemInit from '@/components/common/ElMenuItemInit.vue'
import Logo from './Logo.vue'

const route = useRoute()
const activeIndex = ref(route.path)
const menuInit = ref([])

const handleSelect = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}

const queryMenu = () => {
    http.result({
        url: '/menu/menuTree',
        method: 'GET',
        params: { menuType: '-2' },
        success(result) {
            menuInit.value = result.data
        }
    })
}

onMounted(() => {
    queryMenu()
    if (getToken()) {
        queryMenu()
    }
})
</script>

<style scoped lang="scss">
.custom-navbar {
    height: 64px;
    padding: 0 24px;
    background-color: var(--el-bg-color-overlay);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border-bottom: none;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1000;

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
        height: 100%;
        display: flex;
        align-items: center;
        padding: 0 16px;
        transition: all 0.3s ease;

        &:hover {
            background-color: var(--el-color-primary-light-9);
            color: var(--el-color-primary);
        }

        &.is-active {
            color: var(--el-color-primary);
            border-bottom: 2px solid var(--el-color-primary);
        }
    }
}

.logo-item {
    margin-right: auto;
    padding: 0 24px 0 0 !important;
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--el-text-color-primary) !important;

    &:hover {
        background-color: transparent !important;
    }

    .logo {
        width: 32px;
        height: 32px;
        margin-right: 12px;
    }

    .logo-text {
        font-style: italic;
        background: linear-gradient(135deg, var(--el-color-primary), #6a11cb);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
}

.nav-item {
    font-weight: 500;
    color: var(--el-text-color-primary);
}

.more-menu {
    margin-left: auto;

    .menu-icon {
        font-size: 1.2rem;
        margin-right: 8px;
    }

    .menu-text {
        font-weight: 500;
    }
}

.submenu-item {
    min-width: 160px;
    padding: 0 20px !important;
}

.right-actions {
    display: flex;
    align-items: center;
    margin-left: auto;
    height: 100%;

    .action-item {
        padding: 0 12px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
            background-color: var(--el-color-primary-light-9);
        }
    }
}

@media (max-width: 992px) {
    .custom-navbar {
        padding: 0 12px;

        :deep(.el-menu-item),
        :deep(.el-sub-menu__title) {
            padding: 0 8px;
            font-size: 0.9rem;
        }

        .logo-item {
            padding-right: 0 !important;

            .logo-text {
                display: none;
            }
        }
    }
}
</style>