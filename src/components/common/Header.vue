<template>
    <header class="app-header">
        <div class="header-container">
            <!-- Logo 区域 -->
            <div class="logo-section" @click="toHome">
                <div class="logo-icon">
                    <LogoIcon :size="32" />
                </div>
                <span class="logo-text">Joker Box</span>
            </div>

            <!-- 导航菜单 -->
            <nav class="nav-menu">
                <el-menu :default-active="activeIndex" mode="horizontal" :ellipsis="false" router
                    class="custom-menu" @select="handleSelect">
                    <ElMenuItemInit v-for="menu in menuInit" :key="menu.path" :path="menu.path" :name="menu.name"
                        :children="menu.children" :icon="menu.icon" />
                    
                    <!-- 功能页下拉菜单 -->
                    <el-sub-menu index="功能页" class="more-menu">
                        <template #title>
                            <el-icon class="menu-icon"><Grid /></el-icon>
                            <span class="menu-text">功能页</span>
                        </template>
                        <el-menu-item index="/test" class="submenu-item">
                            <el-icon><Tools /></el-icon>
                            <span>测试</span>
                        </el-menu-item>
                        <el-menu-item index="/403" class="submenu-item">
                            <el-icon><Warning /></el-icon>
                            <span>403</span>
                        </el-menu-item>
                        <el-menu-item index="/404" class="submenu-item">
                            <el-icon><CircleClose /></el-icon>
                            <span>404</span>
                        </el-menu-item>
                    </el-sub-menu>
                </el-menu>
            </nav>

            <!-- 右侧功能区 -->
            <div class="header-actions">
                <ThemeSelector />
                <AvatarDropDown />
            </div>
        </div>
    </header>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getToken, http, toPath } from '@/utils'
import { 
    Grid, Tools, Warning, CircleClose
} from '@element-plus/icons-vue'
import AvatarDropDown from './AvatarDropDown.vue'
import ThemeSelector from './ThemeSelector.vue'
import ElMenuItemInit from '@/components/common/ElMenuItemInit.vue'
import LogoIcon from '@/components/icon/LogoIcon.vue'

const route = useRoute()
const activeIndex = ref(route.path)
const menuInit = ref<any[]>([])

const handleSelect = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}

const queryMenu = async () => {
    menuInit.value = await http.get('/menu/menuTree', { params: { menuType: '-2' } })
}

const toHome = () => {
    toPath('/')
}

onMounted(() => {
    queryMenu()
    if (getToken()) {
        queryMenu()
    }
})
</script>

<style scoped lang="scss">
.app-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background-color: var(--bg-container);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-light);
    transition: background-color var(--duration-normal) var(--ease-out),
        border-color var(--duration-normal) var(--ease-out);
}

.header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
}

/* Logo Section */
.logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: background-color var(--duration-normal) var(--ease-out);
    padding: 8px 12px;
    border-radius: var(--radius-lg);

    &:hover {
        background-color: var(--bg-overlay);
    }
}

.logo-icon {
    width: 40px;
    height: 40px;
    background: var(--brand-gradient-soft);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
        width: 32px;
        height: 32px;
        object-fit: contain;
    }
}

.logo-text {
    font-size: var(--fs-xl);
    font-weight: var(--fw-bold);
    background: var(--brand-gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-family: 'PixelMplus10-Regular', sans-serif;
}

/* Navigation Menu */
.nav-menu {
    flex: 1;
    display: flex;
    justify-content: center;
    margin: 0 40px;
}

.custom-menu {
    background: transparent;
    border: none;

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
        height: 48px;
        line-height: 48px;
        padding: 0 16px;
        font-size: var(--fs-md);
        font-weight: var(--fw-medium);
        color: var(--text-regular);
        border-radius: var(--radius-md);
        margin: 0 4px;
        transition: background-color var(--duration-normal) var(--ease-out),
            color var(--duration-normal) var(--ease-out);

        &:hover {
            background-color: var(--bg-overlay);
            color: var(--brand-primary);
        }

        &.is-active {
            background: var(--brand-gradient-soft);
            color: var(--brand-primary);
        }
    }

    :deep(.el-sub-menu__title) {
        border-bottom: none !important;
    }

    :deep(.el-menu-item.is-active) {
        border-bottom: none;
    }
}

.more-menu {
    .menu-icon {
        margin-right: 6px;
        font-size: 16px;
    }
}

.submenu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 20px !important;
    
    .el-icon {
        font-size: 16px;
    }
}

/* Header Actions */
.header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* Responsive Design */
@media (max-width: 992px) {
    .header-container {
        padding: 0 16px;
    }

    .logo-text {
        display: none;
    }

    .nav-menu {
        margin: 0 20px;
    }

    .custom-menu {
        :deep(.el-menu-item),
        :deep(.el-sub-menu__title) {
            padding: 0 12px;
            font-size: 14px;
        }
    }
}

@media (max-width: 768px) {
    .header-container {
        height: 60px;
    }

    .logo-icon {
        width: 36px;
        height: 36px;

        img {
            width: 28px;
            height: 28px;
        }
    }

    .nav-menu {
        display: none;
    }

}

@media (max-width: 480px) {
    .header-container {
        padding: 0 12px;
    }
}
</style>
