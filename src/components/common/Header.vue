<template>
    <header class="app-header">
        <div class="header-container">
            <!-- Logo 区域 -->
            <div class="logo-section" @click="toHome">
                <div class="logo-icon">
                    <img src="@/assets/img/joker-1.png" alt="Logo" />
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
                <!-- 主题切换 -->
                <div class="action-btn theme-btn">
                    <DarkSwitch />
                </div>

                <!-- 用户区域 -->
                <div class="user-section">
                    <AvatarDropDown />
                </div>
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
import DarkSwitch from './DarkSwitch.vue'
import ElMenuItemInit from '@/components/common/ElMenuItemInit.vue'

const route = useRoute()
const activeIndex = ref(route.path)
const menuInit = ref<any[]>([])

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
    background-color: var(--el-bg-color-overlay);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--el-border-color-light);
    transition: all 0.3s ease;
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
    transition: all 0.3s ease;
    padding: 8px 12px;
    border-radius: 12px;

    &:hover {
        background-color: var(--el-fill-color-light);
    }
}

.logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-radius: 12px;
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
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        height: 50px;
        line-height: 50px;
        padding: 0 20px;
        font-size: 15px;
        font-weight: 500;
        color: var(--el-text-color-regular);
        border-radius: 10px;
        margin: 0 4px;
        transition: all 0.3s ease;

        &:hover {
            background-color: var(--el-fill-color-light);
            color: var(--el-color-primary);
        }

        &.is-active {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            color: #667eea;
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

.action-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--el-text-color-regular);

    &:hover {
        background-color: var(--el-fill-color-light);
        color: var(--el-color-primary);
        transform: translateY(-2px);
    }

    .el-icon {
        font-size: 20px;
    }
}

.user-section {
    margin-left: 8px;
    padding: 4px;
    border-radius: 50px;
    transition: all 0.3s ease;

    &:hover {
        background-color: var(--el-fill-color-light);
    }
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

    .action-btn {
        width: 36px;
        height: 36px;

        .el-icon {
            font-size: 18px;
        }
    }
}

@media (max-width: 480px) {
    .header-container {
        padding: 0 12px;
    }
}
</style>
