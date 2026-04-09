<template>
    <div class="not-found-page">
        <!-- 背景装饰 -->
        <div class="bg-decoration">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
        </div>

        <div class="not-found-container">
            <div class="error-content">
                <!-- 404 图标 -->
                <div class="error-icon">
                    <div class="ghost-wrapper">
                        <div class="ghost">
                            <el-icon><DocumentDelete /></el-icon>
                        </div>
                        <div class="ghost-glow"></div>
                        <div class="ghost-shadow"></div>
                    </div>
                    <div class="error-code">404</div>
                </div>

                <!-- 错误详情 -->
                <div class="error-details">
                    <h1 class="error-title">页面不存在</h1>
                    <p class="error-description">
                        抱歉，您访问的页面可能已被删除、更名或暂时不可用<br>
                        <span class="sub-text">请检查网址是否正确，或返回首页</span>
                    </p>

                    <!-- 操作按钮 -->
                    <div class="action-buttons">
                        <el-button type="primary" size="large" @click="toPath('/')" class="home-btn">
                            <el-icon><HomeFilled /></el-icon>
                            <span>返回首页</span>
                        </el-button>
                        <el-button size="large" @click="$router.go(-1)" class="back-btn">
                            <el-icon><ArrowLeft /></el-icon>
                            <span>返回上一页</span>
                        </el-button>
                    </div>
                </div>
            </div>

            <!-- 底部提示 -->
            <div class="footer-tip">
                <el-icon><Warning /></el-icon>
                <span>错误代码：404 Not Found</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { toPath } from '@/utils'
import { HomeFilled, ArrowLeft, DocumentDelete, Warning } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.not-found-page {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);
    position: relative;
    overflow: hidden;
    padding: 2rem;

    // 背景装饰
    .bg-decoration {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
        pointer-events: none;

        .circle {
            position: absolute;
            border-radius: 50%;
            opacity: 0.05;

            &-1 {
                width: 600px;
                height: 600px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                top: -200px;
                right: -200px;
                animation: float 20s ease-in-out infinite;
            }

            &-2 {
                width: 400px;
                height: 400px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                bottom: -100px;
                left: -100px;
                animation: float 15s ease-in-out infinite reverse;
            }

            &-3 {
                width: 300px;
                height: 300px;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: pulse 10s ease-in-out infinite;
            }
        }
    }

    .not-found-container {
        position: relative;
        z-index: 1;
        text-align: center;
        max-width: 600px;
    }

    .error-content {
        background: var(--el-bg-color);
        border-radius: 24px;
        padding: 60px 48px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--el-border-color-lighter);
    }

    // 错误图标区域
    .error-icon {
        position: relative;
        margin-bottom: 32px;

        .ghost-wrapper {
            position: relative;
            display: inline-block;

            .ghost {
                width: 120px;
                height: 120px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 60px 60px 24px 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                z-index: 2;
                box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
                animation: ghost-float 3s ease-in-out infinite;

                .el-icon {
                    font-size: 56px;
                    color: white;
                }

                &::before,
                &::after {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    width: 20px;
                    height: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                }

                &::before {
                    left: 20px;
                }

                &::after {
                    right: 20px;
                }
            }

            .ghost-glow {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 160px;
                height: 160px;
                background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
                border-radius: 50%;
                z-index: 1;
                animation: glow-pulse 2s ease-in-out infinite;
            }

            .ghost-shadow {
                position: absolute;
                bottom: -30px;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 20px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                z-index: 0;
                animation: shadow-scale 3s ease-in-out infinite;
            }
        }

        .error-code {
            font-size: 72px;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-top: 24px;
            line-height: 1;
            letter-spacing: -2px;
        }
    }

    // 错误详情
    .error-details {
        .error-title {
            font-size: 28px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            margin: 0 0 16px 0;
        }

        .error-description {
            font-size: 16px;
            color: var(--el-text-color-secondary);
            margin: 0 0 32px 0;
            line-height: 1.6;

            .sub-text {
                display: block;
                margin-top: 8px;
                font-size: 14px;
                opacity: 0.8;
            }
        }
    }

    // 操作按钮
    .action-buttons {
        display: flex;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;

        .home-btn {
            height: 48px;
            padding: 0 28px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 500;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            transition: all 0.3s ease;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
            }

            .el-icon {
                margin-right: 8px;
                font-size: 18px;
            }
        }

        .back-btn {
            height: 48px;
            padding: 0 28px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 500;
            transition: all 0.3s ease;

            &:hover {
                transform: translateY(-2px);
                background: var(--el-fill-color-light);
            }

            .el-icon {
                margin-right: 8px;
                font-size: 18px;
            }
        }
    }

    // 底部提示
    .footer-tip {
        margin-top: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 13px;
        color: var(--el-text-color-placeholder);

        .el-icon {
            font-size: 14px;
        }
    }
}

// 动画
@keyframes float {
    0%, 100% {
        transform: translate(0, 0) rotate(0deg);
    }
    33% {
        transform: translate(30px, -30px) rotate(5deg);
    }
    66% {
        transform: translate(-20px, 20px) rotate(-5deg);
    }
}

@keyframes pulse {
    0%, 100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.05;
    }
    50% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 0.08;
    }
}

@keyframes ghost-float {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-15px);
    }
}

@keyframes glow-pulse {
    0%, 100% {
        opacity: 0.5;
        transform: translate(-50%, -50%) scale(1);
    }
    50% {
        opacity: 0.8;
        transform: translate(-50%, -50%) scale(1.1);
    }
}

@keyframes shadow-scale {
    0%, 100% {
        transform: translateX(-50%) scale(1);
        opacity: 0.3;
    }
    50% {
        transform: translateX(-50%) scale(0.8);
        opacity: 0.2;
    }
}

// 响应式
@media (max-width: 768px) {
    .not-found-page {
        padding: 1rem;

        .error-content {
            padding: 40px 24px;
        }

        .error-icon {
            .ghost-wrapper {
                .ghost {
                    width: 100px;
                    height: 100px;

                    .el-icon {
                        font-size: 44px;
                    }
                }
            }

            .error-code {
                font-size: 56px;
            }
        }

        .error-details {
            .error-title {
                font-size: 24px;
            }

            .error-description {
                font-size: 14px;
            }
        }

        .action-buttons {
            flex-direction: column;

            .home-btn,
            .back-btn {
                width: 100%;
            }
        }
    }
}
</style>
