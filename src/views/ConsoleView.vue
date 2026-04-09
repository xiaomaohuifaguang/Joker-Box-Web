<template>
    <div class="console-layout">
        <!-- 侧边导航菜单 -->
        <aside class="sidebar" :class="{ collapsed: isCollapse }">
            <div class="sidebar-header">
                <div class="logo-section" @click="toPath('/')">
                    <div class="logo-icon">
                        <img src="@/assets/img/joker-1.png" alt="Logo" />
                    </div>
                    <span v-show="!isCollapse" class="logo-text">Joker Box</span>
                </div>
                <div class="collapse-toggle" @click="toggleCollapse">
                    <el-icon size="18">
                        <Fold v-show="!isCollapse" />
                        <Expand v-show="isCollapse" />
                    </el-icon>
                </div>
            </div>

            <div class="sidebar-content">
                <el-menu :default-active="activeIndex" router @select="handleSelect" :collapse="isCollapse"
                    class="console-menu" :collapse-transition="false">
                    <!-- 控制台主页 -->
                    <el-menu-item index="/console" class="menu-item home-item">
                        <el-icon><HomeFilled /></el-icon>
                        <span>控制台主页</span>
                    </el-menu-item>

                    <el-divider class="menu-divider" />

                    <!-- 动态菜单区域 -->
                    <div class="dynamic-menu-section" v-show="!isCollapse">
                        <div class="section-title">功能菜单</div>
                    </div>
                    <ElMenuItemInit v-for="menu in menuInit" :key="menu.path" :path="menu.path" :name="menu.name"
                        :children="menu.children" :icon="menu.icon" />

                    <el-divider class="menu-divider" />

                    <!-- 设置菜单 -->
                    <el-sub-menu index="/console/settings" class="menu-item settings-item">
                        <template #title>
                            <el-icon><Setting /></el-icon>
                            <span>系统设置</span>
                        </template>
                        <el-menu-item index="/console/settings/system-manager" class="sub-menu-item">
                            <el-icon><Tools /></el-icon>
                            <span>基础设置</span>
                        </el-menu-item>
                    </el-sub-menu>
                </el-menu>
            </div>

            <div class="sidebar-footer">
                <!-- 用户信息 -->
                <div class="user-card" :class="{ collapsed: isCollapse }">
                    <div class="user-avatar-wrapper">
                        <Avatar class="user-avatar" />
                        <div class="online-indicator"></div>
                    </div>
                    <div v-show="!isCollapse" class="user-info">
                        <div class="user-name">{{ userInfo().nickname }}</div>
                        <div class="user-role">管理员</div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-buttons" :class="{ collapsed: isCollapse }">
                    <el-tooltip content="退出登录" placement="top">
                        <div class="action-btn logout" @click="doLogout">
                            <el-icon><SwitchButton /></el-icon>
                        </div>
                    </el-tooltip>
                    <el-tooltip content="切换主题" placement="top">
                        <div class="action-btn">
                            <DarkSwitch />
                        </div>
                    </el-tooltip>
                </div>
            </div>
        </aside>

        <!-- 主内容区域 -->
        <main class="main-wrapper">
            <div class="content-area">
                <RouterView />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { confirm, http, logout, toPath, userInfo } from '@/utils'
import DarkSwitch from '@/components/common/DarkSwitch.vue'
import Avatar from '@/components/common/Avatar.vue'
import ElMenuItemInit from '@/components/common/ElMenuItemInit.vue'
import { HomeFilled, Expand, Fold, SwitchButton, Setting, Tools } from '@element-plus/icons-vue'

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
.console-layout {
    display: flex;
    height: 100vh;
    background-color: var(--el-bg-color-page);
}

/* Sidebar */
.sidebar {
    width: 260px;
    height: 100%;
    background: linear-gradient(180deg, var(--el-bg-color-overlay) 0%, var(--el-fill-color-light) 100%);
    border-right: 1px solid var(--el-border-color-light);
    display: flex;
    flex-direction: column;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 100;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);

    &.collapsed {
        width: 72px;
    }
}

/* Sidebar Header */
.sidebar-header {
    padding: 20px;
    border-bottom: 1px solid var(--el-border-color-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    flex: 1;

    &:hover {
        transform: scale(1.02);
    }
}

.logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);

    img {
        width: 28px;
        height: 28px;
        object-fit: contain;
    }
}

.logo-text {
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-family: 'PixelMplus10-Regular', sans-serif;
    white-space: nowrap;
}

.collapse-toggle {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--el-text-color-secondary);
    flex-shrink: 0;
    background-color: var(--el-bg-color);

    &:hover {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        transform: scale(1.1);
    }
}

/* Sidebar Content */
.sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--el-border-color);
        border-radius: 2px;
    }
}

.console-menu {
    background: transparent;
    border: none;

    /* 主页菜单项特殊样式 */
    .home-item {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        border: 1px solid rgba(102, 126, 234, 0.2);
        margin-bottom: 8px;

        &:hover {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
        }

        &.is-active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;

            .el-icon {
                color: white;
            }
        }
    }

    /* 动态菜单区域标题 */
    .dynamic-menu-section {
        padding: 8px 12px;
        margin-bottom: 4px;

        .section-title {
            font-size: 11px;
            font-weight: 600;
            color: var(--el-text-color-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    }

    /* 设置菜单 */
    .settings-item {
        margin-top: 4px;
    }

    /* 子菜单项 */
    .sub-menu-item {
        height: 40px !important;
        line-height: 40px !important;
        margin: 2px 0 !important;
        border-radius: 8px !important;
        padding-left: 36px !important;

        &:hover {
            background-color: var(--el-fill-color) !important;
        }

        &.is-active {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%) !important;
            color: #667eea !important;
        }
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
        height: 48px;
        line-height: 48px;
        margin-bottom: 4px;
        border-radius: 10px;
        color: var(--el-text-color-regular);
        transition: all 0.3s ease;

        &:hover {
            background-color: var(--el-fill-color-light);
            color: #667eea;

            .el-icon {
                color: #667eea;
            }
        }

        &.is-active {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            color: #667eea;
            font-weight: 600;

            .el-icon {
                color: #667eea;
            }
        }

        .el-icon {
            font-size: 18px;
            color: var(--el-text-color-secondary);
            transition: all 0.3s ease;
        }
    }

    :deep(.el-sub-menu__title) {
        border-bottom: none !important;
    }

    :deep(.el-menu-item.is-active) {
        border-bottom: none;
    }

    :deep(.el-menu--inline) {
        background: transparent !important;
        padding-left: 8px;
    }

    :deep(.el-sub-menu__icon-arrow) {
        color: var(--el-text-color-secondary);
        transition: all 0.3s ease;
    }

    :deep(.el-sub-menu.is-opened) {
        .el-sub-menu__title {
            color: #667eea;

            .el-icon {
                color: #667eea;
            }
        }

        .el-sub-menu__icon-arrow {
            color: #667eea;
        }
    }
}

.menu-divider {
    margin: 16px 12px;
    border-color: var(--el-border-color-light);
    opacity: 0.6;
}

/* Sidebar Footer */
.sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--el-border-color-light);
    background: linear-gradient(180deg, var(--el-fill-color-light) 0%, var(--el-bg-color-overlay) 100%);
}

.user-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background-color: var(--el-bg-color);
    border-radius: 12px;
    margin-bottom: 12px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
    }

    &.collapsed {
        justify-content: center;
        padding: 8px;

        .user-avatar-wrapper {
            margin: 0;
        }
    }
}

.user-avatar-wrapper {
    position: relative;
    flex-shrink: 0;

    .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid var(--el-color-primary-light-5);
    }

    .online-indicator {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 10px;
        height: 10px;
        background-color: #43e97b;
        border-radius: 50%;
        border: 2px solid var(--el-bg-color);
    }
}

.user-info {
    flex: 1;
    min-width: 0;

    .user-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-role {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-top: 2px;
    }
}

.action-buttons {
    display: flex;
    gap: 8px;

    &.collapsed {
        flex-direction: column;
        align-items: center;

        .action-btn {
            width: 40px;
            height: 40px;
        }
    }
}

.action-btn {
    flex: 1;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: var(--el-bg-color);
    color: var(--el-text-color-regular);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

    &:hover {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    &.logout {
        color: var(--el-color-danger);

        &:hover {
            background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
            color: white;
        }
    }

    .el-icon {
        font-size: 18px;
    }
}

/* Main Wrapper */
.main-wrapper {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.content-area {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    background-color: var(--el-bg-color-page);

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--el-border-color);
        border-radius: 3px;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        transform: translateX(-100%);
        box-shadow: 4px 0 16px rgba(0, 0, 0, 0.1);

        &.collapsed {
            transform: translateX(0);
            width: 260px;
        }

        &:not(.collapsed) {
            transform: translateX(0);
        }
    }

    .main-wrapper {
        margin-left: 0;
    }

    .content-area {
        padding: 16px;
    }
}

@media (max-width: 480px) {
    .content-area {
        padding: 12px;
    }
}
</style>