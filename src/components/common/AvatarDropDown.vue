<template>
    <div class="avatar-dropdown-container">
        <!-- 登录和注册按钮 -->
        <div v-if="userInfoRef == null" class="auth-buttons">
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
                                    <span class="nickname">{{ userInfoRef.nickname }}</span>
                                    <div class="vip-badge">
                                        <el-icon><StarFilled /></el-icon>
                                        <span>VIP8</span>
                                    </div>
                                </div>
                                <div class="user-id">@{{ userInfoRef.username }}</div>
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
                        <div v-if="userInfoRef.orgs && userInfoRef.orgs.length > 0" class="info-section">
                            <div class="section-header">
                                <el-icon><OfficeBuilding /></el-icon>
                                <span>所属组织</span>
                            </div>
                            <div class="tag-list">
                                <el-tag v-for="org in userInfoRef.orgs" :key="org.id" type="success" effect="light" class="info-tag">
                                    {{ org.name }}
                                </el-tag>
                            </div>
                        </div>

                        <!-- 角色信息 -->
                        <div v-if="userInfoRef.roles && userInfoRef.roles.length > 0" class="info-section">
                            <div class="section-header">
                                <el-icon><UserFilled /></el-icon>
                                <span>拥有角色</span>
                            </div>
                            <div class="tag-list">
                                <el-tag v-for="role in userInfoRef.roles" :key="role.id" type="warning" effect="light" class="info-tag">
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

                            <div v-if="userInfoRef.admin" class="menu-item" @click="toPath('/console')">
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
import { userInfoRef, logout, toPath } from '@/utils'

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
        color: var(--text-regular);
        font-weight: var(--fw-medium);
        padding: 8px 16px;
        border-radius: var(--radius-md);
        transition: color var(--duration-normal) var(--ease-out),
            background-color var(--duration-normal) var(--ease-out);

        &:hover {
            color: var(--brand-primary);
            background: var(--bg-overlay);
        }

        .el-icon {
            margin-right: 6px;
        }
    }

    .register-btn {
        padding: 8px 16px;
        font-weight: var(--fw-medium);
        border-radius: var(--radius-md);
        background: var(--brand-gradient);
        border: none;
        color: var(--text-on-brand);
        transition: transform var(--duration-normal) var(--ease-out),
            box-shadow var(--duration-normal) var(--ease-out);

        &:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-glow);
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
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--duration-normal) var(--ease-out),
        color var(--duration-normal) var(--ease-out),
        transform var(--duration-normal) var(--ease-out);
    color: var(--text-regular);
    background-color: var(--bg-overlay);

    &:hover {
        background: var(--brand-gradient);
        color: var(--text-on-brand);
        transform: translateY(-2px);
    }

    .el-icon {
        font-size: 20px;
    }
}

.message-badge {
    :deep(.el-badge__content) {
        background: var(--data-grad-6);
        border: none;
        color: var(--text-on-brand);
    }
}

/* Avatar Trigger */
.avatar-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px 4px 4px;
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: background-color var(--duration-normal) var(--ease-out);
    background-color: var(--bg-overlay);

    &:hover {
        background-color: var(--bg-overlay-strong);
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
        border: 2px solid var(--brand-primary-light);
    }

    .online-status {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 10px;
        height: 10px;
        background-color: var(--success);
        border-radius: 50%;
        border: 2px solid var(--bg-container);
    }
}

.dropdown-arrow {
    font-size: 12px;
    color: var(--text-secondary);
    margin-right: 4px;
}

/* User Dropdown Card */
.user-dropdown-card {
    width: 300px;
    padding: 20px;
    background-color: var(--bg-elevated);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
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
        background: var(--brand-gradient);

        .header-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 3px solid var(--bg-elevated);
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
                font-size: var(--fs-lg);
                font-weight: var(--fw-semibold);
                color: var(--text-primary);
            }

            .vip-badge {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 2px 8px;
                background: var(--data-grad-5);
                border-radius: var(--radius-pill);
                color: var(--text-on-brand);
                font-size: 11px;
                font-weight: var(--fw-semibold);

                .el-icon {
                    font-size: 12px;
                }
            }
        }

        .user-id {
            font-size: var(--fs-sm);
            color: var(--text-secondary);
        }
    }
}

/* User Stats */
.user-stats {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 16px;
    background-color: var(--bg-overlay);
    border-radius: var(--radius-md);
    margin-bottom: 20px;

    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .stat-value {
            font-size: var(--fs-xl);
            font-weight: var(--fw-bold);
            color: var(--text-primary);
        }

        .stat-label {
            font-size: var(--fs-xs);
            color: var(--text-secondary);
        }
    }

    .stat-divider {
        width: 1px;
        height: 30px;
        background-color: var(--border-light);
    }
}

/* Info Section */
.info-section {
    margin-bottom: 16px;

    .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: var(--fs-xs);
        color: var(--text-secondary);
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: var(--ls-wide);

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
            border-radius: var(--radius-sm);
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
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: background-color var(--duration-normal) var(--ease-out);
        margin-bottom: 4px;

        &:hover {
            background-color: var(--bg-overlay);

            .menu-arrow {
                opacity: 1;
                transform: translateX(4px);
            }
        }

        &.logout {
            color: var(--danger);

            &:hover {
                background-color: var(--danger-bg);
            }

            .menu-icon-wrapper.logout {
                background-color: var(--danger-bg);
                color: var(--danger);
            }
        }

        .menu-icon-wrapper {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-md);
            background-color: var(--bg-overlay);
            color: var(--brand-primary);
            transition: background var(--duration-normal) var(--ease-out),
                color var(--duration-normal) var(--ease-out);

            &.admin {
                background-color: var(--danger-bg);
                color: var(--danger);
            }

            .el-icon {
                font-size: 18px;
            }
        }

        .menu-text {
            flex: 1;
            font-size: var(--fs-md);
            font-weight: var(--fw-medium);
            color: var(--text-primary);
        }

        .menu-arrow {
            font-size: 14px;
            color: var(--text-secondary);
            opacity: 0;
            transition: opacity var(--duration-normal) var(--ease-out),
                transform var(--duration-normal) var(--ease-out);
        }
    }

    .menu-divider {
        height: 1px;
        background-color: var(--border-light);
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
