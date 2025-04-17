<template>
    <!-- 登录和注册按钮 -->
    <div v-if="userInfo() == null" class="auth-buttons">
        <el-button text @click="toPath('/login')" class="login-button">
            <el-icon>
                <User />
            </el-icon>
            <span>登录</span>
        </el-button>
        <el-button type="primary" @click="toPath('/register')" class="register-button">
            <el-icon>
                <EditPen />
            </el-icon>
            <span>注册</span>
        </el-button>
    </div>

    <!-- 用户信息下拉菜单 -->
    <el-dropdown v-else placement="bottom-end" trigger="click" class="user-dropdown">
        <div class="avatar-wrapper">
            <Avatar class="avatar" />
            <el-icon class="dropdown-arrow">
                <ArrowDown />
            </el-icon>
        </div>

        <template #dropdown>
            <div class="dropdown-card">
                <!-- 用户信息头部 -->
                <div class="user-header">
                    <Avatar class="header-avatar" />
                    <div class="user-meta">
                        <div class="nickname">{{ userInfo().nickname }}</div>
                        <div class="vip-badge">
                            <el-icon>
                                <StarFilled />
                            </el-icon>
                            <span>VIP8</span>
                        </div>
                        <div class="user-id">账号: {{ userInfo().username }}</div>
                    </div>
                </div>

                <!-- 组织信息 -->
                <div class="org-section">
                    <div class="section-title">所属组织</div>
                    <div class="org-tags">
                        <el-tag v-for="org in userInfo().orgs" :key="org.id" type="success" class="org-tag">
                            <el-icon>
                                <OfficeBuilding />
                            </el-icon>
                            {{ org.name }}
                        </el-tag>
                    </div>
                </div>

                <!-- 角色信息 -->
                <div class="role-section">
                    <div class="section-title">拥有角色</div>
                    <div class="role-tags">
                        <el-tag v-for="role in userInfo().roles" :key="role.id" type="warning" class="role-tag">
                            <el-icon>
                                <UserFilled />
                            </el-icon>
                            {{ role.name }}
                        </el-tag>
                    </div>
                </div>

                <!-- 菜单项 -->
                <el-menu class="dropdown-menu">
                    <el-menu-item @click="toPath('/person-space')" class="menu-item">
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>个人空间</span>
                    </el-menu-item>

                    <el-menu-item v-if="userInfo().admin" @click="toPath('/console')" class="menu-item">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>控制台</span>
                    </el-menu-item>

                    <el-menu-item @click="logout" class="menu-item logout-item">
                        <el-icon>
                            <SwitchButton />
                        </el-icon>
                        <span>退出登录</span>
                    </el-menu-item>
                </el-menu>
            </div>
        </template>
    </el-dropdown>
</template>

<script setup lang="ts">
import { User, EditPen, ArrowDown, StarFilled, OfficeBuilding, UserFilled, Monitor, SwitchButton } from '@element-plus/icons-vue'
import Avatar from './Avatar.vue'
import { userInfo, logout, toPath } from '@/utils'
</script>

<style scoped lang="scss">
.auth-buttons {
    display: flex;
    align-items: center;
    gap: 12px;

    .login-button {
        color: var(--el-text-color-primary);
        font-weight: 500;
        padding: 8px 16px;
        transition: all 0.3s ease;

        &:hover {
            color: var(--el-color-primary);
            background-color: var(--el-color-primary-light-9);
        }

        .el-icon {
            margin-right: 6px;
        }
    }

    .register-button {
        padding: 8px 16px;
        font-weight: 500;
        transition: all 0.3s ease;

        .el-icon {
            margin-right: 6px;
        }
    }
}

.user-dropdown {
    cursor: pointer;

    .avatar-wrapper {
        display: flex;
        align-items: center;
        padding: 4px;
        border-radius: 50px;
        transition: all 0.3s ease;

        &:hover {
            background-color: var(--el-color-primary-light-9);
        }

        .avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid var(--el-color-primary-light-5);
        }

        .dropdown-arrow {
            margin-left: 4px;
            font-size: 12px;
            color: var(--el-text-color-secondary);
        }
    }
}

.dropdown-card {
    width: 280px;
    padding: 16px;
    background-color: var(--el-bg-color-overlay);
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);

    .user-header {
        display: flex;
        align-items: center;
        padding-bottom: 16px;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--el-border-color-light);

        .header-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            margin-right: 12px;
            border: 2px solid var(--el-color-primary);
        }

        .user-meta {
            flex: 1;

            .nickname {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 4px;
                color: var(--el-text-color-primary);
            }

            .vip-badge {
                display: inline-flex;
                align-items: center;
                padding: 2px 8px;
                background-color: var(--el-color-warning-light-9);
                border-radius: 4px;
                color: var(--el-color-warning-dark-2);
                font-size: 12px;
                margin-bottom: 4px;

                .el-icon {
                    font-size: 14px;
                    margin-right: 4px;
                }
            }

            .user-id {
                font-size: 12px;
                color: var(--el-text-color-secondary);
            }
        }
    }

    .section-title {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .org-section,
    .role-section {
        margin-bottom: 16px;

        .org-tags,
        .role-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .org-tag,
            .role-tag {
                margin: 0;

                .el-icon {
                    margin-right: 4px;
                }
            }
        }
    }

    .dropdown-menu {
        border: none;

        .menu-item {
            height: 40px;
            line-height: 40px;
            border-radius: 6px;
            margin-bottom: 4px;
            transition: all 0.3s ease;

            &:hover {
                background-color: var(--el-color-primary-light-9);
                color: var(--el-color-primary);
            }

            .el-icon {
                margin-right: 8px;
                font-size: 16px;
            }
        }

        .logout-item {
            color: var(--el-color-danger);

            &:hover {
                background-color: var(--el-color-danger-light-9);
                color: var(--el-color-danger);
            }
        }
    }
}

@media (max-width: 768px) {
    .auth-buttons {
        gap: 8px;

        .login-button,
        .register-button {
            padding: 6px 12px;
            font-size: 14px;
        }
    }

    .dropdown-card {
        width: 240px;
    }
}
</style>