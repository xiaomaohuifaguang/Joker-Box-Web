<template>
    <div class="avatar-dropdown-container">
        <!-- 登录和注册按钮 -->
        <div v-if="userInfo() == null" class="auth-buttons">
            <el-button text @click="toPath('/login')" class="login-btn">
                <el-icon><User /></el-icon>
                <span>登录</span>
            </el-button>
            <el-button type="primary" @click="toPath('/register')" class="register-btn">
                <el-icon><EditPen /></el-icon>
                <span>注册</span>
            </el-button>
        </div>

        <!-- 用户信息下拉菜单 -->
        <div v-else class="user-actions">
            <!-- 消息通知 -->
            <el-badge :value="99" :offset="[-5, 5]" class="message-badge">
                <div class="action-icon-btn" @click="toPath('/mail')">
                    <el-icon><Message /></el-icon>
                </div>
            </el-badge>

            <!-- 用户下拉 -->
            <el-dropdown placement="bottom-end" trigger="click" class="user-dropdown" popper-class="user-dropdown-popper">
                <div class="avatar-trigger">
                    <div class="avatar-wrapper">
                        <Avatar class="user-avatar" />
                        <div class="online-status"></div>
                    </div>
                    <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
                </div>

                <template #dropdown>
                    <div class="user-dropdown-card">
                        <!-- 用户信息头部 -->
                        <div class="user-header">
                            <div class="avatar-ring">
                                <Avatar class="header-avatar" />
                            </div>
                            <div class="user-info">
                                <div class="nickname-row">
                                    <span class="nickname">{{ userInfo().nickname }}</span>
                                    <div class="vip-badge">
                                        <el-icon><StarFilled /></el-icon>
                                        <span>VIP8</span>
                                    </div>
                                </div>
                                <div class="user-id">@{{ userInfo().username }}</div>
                            </div>
                        </div>

                        <!-- 统计信息 -->
                        <div class="user-stats">
                            <div class="stat-item">
                                <span class="stat-value">128</span>
                                <span class="stat-label">关注</span>
                            </div>
                            <div class="stat-divider"></div>
                            <div class="stat-item">
                                <span class="stat-value">3.2k</span>
                                <span class="stat-label">粉丝</span>
                            </div>
                            <div class="stat-divider"></div>
                            <div class="stat-item">
                                <span class="stat-value">99+</span>
                                <span class="stat-label">消息</span>
                            </div>
                        </div>

                        <!-- 组织信息 -->
                        <div v-if="userInfo().orgs && userInfo().orgs.length > 0" class="info-section">
                            <div class="section-header">
                                <el-icon><OfficeBuilding /></el-icon>
                                <span>所属组织</span>
                            </div>
                            <div class="tag-list">
                                <el-tag v-for="org in userInfo().orgs" :key="org.id" type="success" effect="light" class="info-tag">
                                    {{ org.name }}
                                </el-tag>
                            </div>
                        </div>

                        <!-- 角色信息 -->
                        <div v-if="userInfo().roles && userInfo().roles.length > 0" class="info-section">
                            <div class="section-header">
                                <el-icon><UserFilled /></el-icon>
                                <span>拥有角色</span>
                            </div>
                            <div class="tag-list">
                                <el-tag v-for="role in userInfo().roles" :key="role.id" type="warning" effect="light" class="info-tag">
                                    {{ role.name }}
                                </el-tag>
                            </div>
                        </div>

                        <!-- 菜单项 -->
                        <div class="menu-section">
                            <div class="menu-item" @click="toPath('/person-space')">
                                <div class="menu-icon-wrapper">
                                    <el-icon><User /></el-icon>
                                </div>
                                <span class="menu-text">个人空间</span>
                                <el-icon class="menu-arrow"><ArrowRight /></el-icon>
                            </div>

                            <div v-if="userInfo().admin" class="menu-item" @click="toPath('/console')">
                                <div class="menu-icon-wrapper admin">
                                    <el-icon><Monitor /></el-icon>
                                </div>
                                <span class="menu-text">控制台</span>
                                <el-icon class="menu-arrow"><ArrowRight /></el-icon>
                            </div>

                            <div class="menu-item" @click="toPath('/settings')">
                                <div class="menu-icon-wrapper">
                                    <el-icon><Setting /></el-icon>
                                </div>
                                <span class="menu-text">设置</span>
                                <el-icon class="menu-arrow"><ArrowRight /></el-icon>
                            </div>

                            <div class="menu-divider"></div>

                            <div class="menu-item logout" @click="clickLogout">
                                <div class="menu-icon-wrapper logout">
                                    <el-icon><SwitchButton /></el-icon>
                                </div>
                                <span class="menu-text">退出登录</span>
                            </div>
                        </div>
                    </div>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup lang="ts">
import { User, EditPen, ArrowDown, ArrowRight, StarFilled, OfficeBuilding, UserFilled, Monitor, SwitchButton, Message, Setting } from '@element-plus/icons-vue'
import Avatar from './Avatar.vue'
import { userInfo, logout, toPath } from '@/utils'

const clickLogout = () => {
    logout()
    window.location.reload()
}
</script>

<style scoped lang="scss">
.avatar-dropdown-container {
    display: flex;
    align-items: center;
}

/* Auth Buttons */
.auth-buttons {
    display: flex;
    align-items: center;
    gap: 8px;

    .login-btn {
        color: var(--el-text-color-regular);
        font-weight: 500;
        padding: 8px 16px;
        border-radius: 10px;
        transition: all 0.3s ease;

        &:hover {
            color: #667eea;
            background-color: rgba(102, 126, 234, 0.1);
        }

        .el-icon {
            margin-right: 6px;
        }
    }

    .register-btn {
        padding: 8px 16px;
        font-weight: 500;
        border-radius: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .el-icon {
            margin-right: 6px;
        }
    }
}

/* User Actions */
.user-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.action-icon-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--el-text-color-regular);
    background-color: var(--el-fill-color-light);

    &:hover {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        transform: translateY(-2px);
    }

    .el-icon {
        font-size: 20px;
    }
}

.message-badge {
    :deep(.el-badge__content) {
        background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
        border: none;
    }
}

/* Avatar Trigger */
.avatar-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 4px 4px 4px;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: var(--el-fill-color-light);

    &:hover {
        background-color: rgba(102, 126, 234, 0.1);
    }
}

.avatar-wrapper {
    position: relative;
    width: 36px;
    height: 36px;

    .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid var(--el-color-primary-light-5);
    }

    .online-status {
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

.dropdown-arrow {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-right: 4px;
}

/* User Dropdown Card */
.user-dropdown-card {
    width: 300px;
    padding: 20px;
    background-color: var(--el-bg-color-overlay);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.user-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;

    .avatar-ring {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        padding: 3px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

        .header-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 3px solid var(--el-bg-color);
        }
    }

    .user-info {
        flex: 1;

        .nickname-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;

            .nickname {
                font-size: 16px;
                font-weight: 600;
                color: var(--el-text-color-primary);
            }

            .vip-badge {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 2px 8px;
                background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                border-radius: 20px;
                color: white;
                font-size: 11px;
                font-weight: 600;

                .el-icon {
                    font-size: 12px;
                }
            }
        }

        .user-id {
            font-size: 13px;
            color: var(--el-text-color-secondary);
        }
    }
}

/* User Stats */
.user-stats {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 12px;
    margin-bottom: 20px;

    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .stat-value {
            font-size: 18px;
            font-weight: 700;
            color: var(--el-text-color-primary);
        }

        .stat-label {
            font-size: 12px;
            color: var(--el-text-color-secondary);
        }
    }

    .stat-divider {
        width: 1px;
        height: 30px;
        background-color: var(--el-border-color-light);
    }
}

/* Info Section */
.info-section {
    margin-bottom: 16px;

    .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;

        .el-icon {
            font-size: 14px;
        }
    }

    .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .info-tag {
            margin: 0;
            border-radius: 6px;
        }
    }
}

/* Menu Section */
.menu-section {
    .menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 4px;

        &:hover {
            background-color: var(--el-fill-color-light);

            .menu-arrow {
                opacity: 1;
                transform: translateX(4px);
            }
        }

        &.logout {
            color: var(--el-color-danger);

            &:hover {
                background-color: var(--el-color-danger-light-9);
            }

            .menu-icon-wrapper.logout {
                background-color: var(--el-color-danger-light-9);
                color: var(--el-color-danger);
            }
        }

        .menu-icon-wrapper {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background-color: rgba(102, 126, 234, 0.1);
            color: #667eea;
            transition: all 0.3s ease;

            &.admin {
                background-color: rgba(245, 87, 108, 0.1);
                color: #f5576c;
            }

            .el-icon {
                font-size: 18px;
            }
        }

        .menu-text {
            flex: 1;
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
        }

        .menu-arrow {
            font-size: 14px;
            color: var(--el-text-color-secondary);
            opacity: 0;
            transition: all 0.3s ease;
        }
    }

    .menu-divider {
        height: 1px;
        background-color: var(--el-border-color-light);
        margin: 8px 0;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .auth-buttons {
        gap: 6px;

        .login-btn,
        .register-btn {
            padding: 6px 12px;
            font-size: 14px;
        }
    }

    .action-icon-btn {
        width: 36px;
        height: 36px;

        .el-icon {
            font-size: 18px;
        }
    }

    .user-dropdown-card {
        width: 280px;
        padding: 16px;
    }

    .user-header {
        .avatar-ring {
            width: 48px;
            height: 48px;

            .header-avatar {
                width: 42px;
                height: 42px;
            }
        }
    }
}
</style>
