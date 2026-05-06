<template>
    <footer class="app-footer">
        <div class="footer-container">
            <!-- 顶部装饰线 -->
            <div class="footer-divider">
                <div class="divider-line"></div>
                <div class="divider-icon">
                    <el-icon><StarFilled /></el-icon>
                </div>
                <div class="divider-line"></div>
            </div>

            <!-- 主要内容区域 -->
            <div class="footer-content">
                <!-- 品牌区域 -->
                <div class="footer-brand">
                    <div class="brand-logo">
                        <LogoIcon :size="48" />
                        <span class="brand-name">Joker Box</span>
                    </div>
                    <p class="brand-slogan">救赎之道，就在其中</p>
                    <div class="social-links">
                        <a href="https://github.com/xiaomaohuifaguang" target="_blank" class="social-link">
                            <el-icon><svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px;">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg></el-icon>
                        </a>
                        <a href="mailto:xiaomaohuifaguang@163.com" class="social-link">
                            <el-icon><Message /></el-icon>
                        </a>
                        <a href="https://xiaomaohuifaguang.github.io/blog/" target="_blank" class="social-link">
                            <el-icon><Document /></el-icon>
                        </a>
                    </div>
                </div>

                <!-- 链接区域 -->
                <div class="footer-links">
                    <div class="link-column">
                        <h4 class="column-title">
                            <el-icon><Connection /></el-icon>
                            联系方式
                        </h4>
                        <ul class="link-list">
                            <li>
                                <a href="mailto:xiaomaohuifaguang@163.com" class="footer-link">
                                    <el-icon><Message /></el-icon>
                                    <span>xiaomaohuifaguang@163.com</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="link-column">
                        <h4 class="column-title">
                            <el-icon><Collection /></el-icon>
                            作品
                        </h4>
                        <ul class="link-list">
                            <li>
                                <a href="https://xiaomaohuifaguang.github.io/blog/" target="_blank" class="footer-link">
                                    <el-icon><Reading /></el-icon>
                                    <span>技术博客</span>
                                </a>
                            </li>
                            <li>
                                <span class="footer-link disabled">
                                    <el-icon><Box /></el-icon>
                                    <span>Joker-Box</span>
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div class="link-column">
                        <h4 class="column-title">
                            <el-icon><Link /></el-icon>
                            源码
                        </h4>
                        <ul class="link-list">
                            <li>
                                <a href="https://github.com/xiaomaohuifaguang/blog" target="_blank" class="footer-link">
                                    <el-icon><svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                                    </svg></el-icon>
                                    <span>Blog</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/xiaomaohuifaguang/Joker-Box-Web" target="_blank" class="footer-link">
                                    <el-icon><Monitor /></el-icon>
                                    <span>Joker-Box-Web</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/xiaomaohuifaguang/Joker-Box" target="_blank" class="footer-link">
                                    <el-icon><Cpu /></el-icon>
                                    <span>Joker-Box</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- 底部版权 -->
            <div class="footer-bottom">
                <div class="copyright">
                    <span>版权所有 © {{ currentYear }}</span>
                    <a href="https://github.com/xiaomaohuifaguang" target="_blank" class="author-link">
                        <el-icon><UserFilled /></el-icon>
                        小猫会发光
                    </a>
                </div>
                <div class="footer-meta">
                    <span class="meta-item">Made with</span>
                    <el-icon class="heart-icon"><svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></el-icon>
                    <span class="meta-item">by Joker Box Team</span>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LogoIcon from '@/components/icon/LogoIcon.vue'
import {
    StarFilled, Message, Document, Connection, Collection,
    Link, Reading, Box, Monitor, Cpu, UserFilled
} from '@element-plus/icons-vue';

const currentYear = ref(new Date().getFullYear());
</script>

<style scoped lang="scss">
.app-footer {
    background: linear-gradient(180deg, var(--bg-page) 0%, var(--bg-elevated) 100%);
    border-top: 1px solid var(--border-light);
    padding: 60px 0 30px;
    margin-top: 60px;
}

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

/* Footer Divider */
.footer-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 50px;
    gap: 20px;

    .divider-line {
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--border-base), transparent);
        max-width: 200px;
    }

    .divider-icon {
        width: 50px;
        height: 50px;
        background: var(--brand-gradient);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-on-brand);
        font-size: 24px;
        box-shadow: var(--shadow-glow);
    }
}

/* Footer Content */
.footer-content {
    display: flex;
    gap: 80px;
    margin-bottom: 50px;
}

/* Brand Section */
.footer-brand {
    flex: 0 0 300px;

    .brand-logo {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;

        img {
            width: 50px;
            height: 50px;
            object-fit: contain;
        }

        .brand-name {
            font-size: var(--fs-2xl);
            font-weight: var(--fw-bold);
            background: var(--brand-gradient-text);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-family: 'PixelMplus10-Regular', sans-serif;
        }
    }

    .brand-slogan {
        font-size: var(--fs-md);
        color: var(--text-secondary);
        margin-bottom: 24px;
        font-style: italic;
    }

    .social-links {
        display: flex;
        gap: 12px;

        .social-link {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-md);
            background: var(--bg-container);
            border: 1px solid var(--border-light);
            color: var(--text-regular);
            transition: background var(--duration-normal) var(--ease-out),
                color var(--duration-normal) var(--ease-out),
                border-color var(--duration-normal) var(--ease-out),
                transform var(--duration-normal) var(--ease-out),
                box-shadow var(--duration-normal) var(--ease-out);

            &:hover {
                background: var(--brand-gradient);
                border-color: transparent;
                color: var(--text-on-brand);
                transform: translateY(-3px);
                box-shadow: var(--shadow-glow);
            }

            .el-icon {
                font-size: 20px;
            }
        }
    }
}

/* Links Section */
.footer-links {
    flex: 1;
    display: flex;
    gap: 60px;
}

.link-column {
    flex: 1;

    .column-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: var(--fs-lg);
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 2px solid var(--border-light);

        .el-icon {
            font-size: 18px;
            color: var(--brand-primary);
        }
    }

    .link-list {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
            margin-bottom: 12px;
        }
    }
}

.footer-link {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--text-regular);
    text-decoration: none;
    font-size: var(--fs-md);
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    transition: background var(--duration-normal) var(--ease-out),
        color var(--duration-normal) var(--ease-out),
        transform var(--duration-normal) var(--ease-out);

    &:hover {
        background: var(--bg-overlay);
        color: var(--brand-primary);
        transform: translateX(4px);
    }

    &.disabled {
        cursor: default;
        opacity: 0.6;

        &:hover {
            background: transparent;
            color: var(--text-regular);
            transform: none;
        }
    }

    .el-icon {
        font-size: 16px;
        flex-shrink: 0;
    }

    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

/* Footer Bottom */
.footer-bottom {
    border-top: 1px solid var(--border-light);
    padding-top: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.copyright {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--fs-md);
    color: var(--text-secondary);

    .author-link {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--brand-primary);
        text-decoration: none;
        font-weight: var(--fw-medium);
        transition: color var(--duration-normal) var(--ease-out);

        &:hover {
            color: var(--brand-secondary);
            text-decoration: underline;
        }

        .el-icon {
            font-size: 16px;
        }
    }
}

.footer-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--fs-md);
    color: var(--text-placeholder);

    .meta-item {
        font-style: italic;
    }

    .heart-icon {
        color: var(--danger);
        font-size: 16px;
        animation: heartbeat 1.5s ease-in-out infinite;
    }
}

@keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

/* Responsive Design */
@media (max-width: 992px) {
    .footer-content {
        flex-direction: column;
        gap: 50px;
    }

    .footer-brand {
        flex: none;
        text-align: center;

        .brand-logo {
            justify-content: center;
        }

        .social-links {
            justify-content: center;
        }
    }

    .footer-links {
        gap: 40px;
    }
}

@media (max-width: 768px) {
    .app-footer {
        padding: 40px 0 20px;
        margin-top: 40px;
    }

    .footer-divider {
        margin-bottom: 30px;

        .divider-line {
            max-width: 100px;
        }
    }

    .footer-links {
        flex-direction: column;
        gap: 30px;
    }

    .link-column {
        .column-title {
            margin-bottom: 16px;
        }
    }

    .footer-bottom {
        flex-direction: column;
        text-align: center;
        gap: 16px;
    }
}

@media (max-width: 480px) {
    .footer-container {
        padding: 0 16px;
    }

    .brand-logo {
        .brand-name {
            font-size: 20px;
        }
    }

    .footer-link {
        font-size: 13px;
    }
}
</style>
