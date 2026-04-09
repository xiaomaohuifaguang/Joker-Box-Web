<template>
    <div class="doing-page">
        <!-- 背景装饰 -->
        <div class="bg-decoration">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
        </div>

        <div class="doing-container">
            <!-- 建设中卡片 -->
            <div class="construction-card" @click="utils.toPath('#')">
                <div class="icon-wrapper">
                    <div class="gear gear-large">
                        <el-icon><Setting /></el-icon>
                    </div>
                    <div class="gear gear-small">
                        <el-icon><Tools /></el-icon>
                    </div>
                </div>
                <h1 class="title">功能开发中</h1>
                <p class="subtitle">敬请期待，我们正努力为您带来更好的体验</p>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="status-text">
                    <el-icon><Loading /></el-icon>
                    <span>正在开发...</span>
                </div>
            </div>

            <!-- 娱乐区域 -->
            <div class="entertainment-section">
                <div class="section-header">
                    <div class="header-icon">
                        <el-icon><VideoPlay /></el-icon>
                    </div>
                    <span>等待 meantime，看个直播</span>
                </div>
                <div class="video-wrapper">
                    <iframe 
                        src="https://www.bilibili.com/blackboard/live/live-activity-player.html?cid=1774686942&quality=0"
                        frameborder="no" 
                        framespacing="0" 
                        scrolling="no" 
                        allow="autoplay; encrypted-media"
                        allowfullscreen="true">
                    </iframe>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import utils from '@/utils';
import { Setting, Tools, Loading, VideoPlay } from '@element-plus/icons-vue';
</script>

<style scoped lang="scss">
.doing-page {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);
    position: relative;
    overflow: hidden;
    padding: 60px 24px;

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
                width: 500px;
                height: 500px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                top: -150px;
                right: -150px;
                animation: float 20s ease-in-out infinite;
            }

            &-2 {
                width: 350px;
                height: 350px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                bottom: -100px;
                left: -100px;
                animation: float 15s ease-in-out infinite reverse;
            }

            &-3 {
                width: 250px;
                height: 250px;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                top: 40%;
                left: 60%;
                animation: pulse 10s ease-in-out infinite;
            }
        }
    }

    .doing-container {
        position: relative;
        z-index: 1;
        max-width: 900px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 40px;
    }

    // 建设中卡片
    .construction-card {
        background: var(--el-bg-color);
        border-radius: 24px;
        padding: 48px 60px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--el-border-color-lighter);
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        max-width: 500px;

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 25px 70px rgba(102, 126, 234, 0.15);
            border-color: var(--el-color-primary-light-5);

            .icon-wrapper {
                .gear-large {
                    animation: rotate 2s linear infinite;
                }

                .gear-small {
                    animation: rotate-reverse 1.5s linear infinite;
                }
            }
        }

        .icon-wrapper {
            position: relative;
            display: inline-block;
            margin-bottom: 24px;

            .gear {
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;

                &-large {
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);

                    .el-icon {
                        font-size: 48px;
                        color: white;
                    }
                }

                &-small {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    position: absolute;
                    bottom: -10px;
                    right: -20px;
                    box-shadow: 0 6px 20px rgba(240, 147, 251, 0.3);

                    .el-icon {
                        font-size: 28px;
                        color: white;
                    }
                }
            }
        }

        .title {
            font-size: 28px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            margin: 0 0 12px 0;
        }

        .subtitle {
            font-size: 14px;
            color: var(--el-text-color-secondary);
            margin: 0 0 24px 0;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: var(--el-fill-color-light);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 16px;

            .progress-fill {
                height: 100%;
                width: 60%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                border-radius: 4px;
                animation: progress-shine 2s ease-in-out infinite;
            }
        }

        .status-text {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            color: var(--el-color-primary);

            .el-icon {
                font-size: 16px;
                animation: rotate 1s linear infinite;
            }
        }
    }

    // 娱乐区域
    .entertainment-section {
        width: 100%;
        background: var(--el-bg-color);
        border-radius: 24px;
        padding: 32px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--el-border-color-lighter);

        .section-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;

            .header-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;

                .el-icon {
                    font-size: 20px;
                    color: white;
                }
            }

            span {
                font-size: 18px;
                font-weight: 600;
                color: var(--el-text-color-primary);
            }
        }

        .video-wrapper {
            position: relative;
            padding-bottom: 56.25%; // 16:9 比例
            height: 0;
            overflow: hidden;
            border-radius: 16px;
            background: var(--el-fill-color-light);

            iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
            }
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
        transform: scale(1);
        opacity: 0.05;
    }
    50% {
        transform: scale(1.2);
        opacity: 0.08;
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes rotate-reverse {
    from {
        transform: rotate(360deg);
    }
    to {
        transform: rotate(0deg);
    }
}

@keyframes progress-shine {
    0% {
        background-position: -200% center;
    }
    100% {
        background-position: 200% center;
    }
}

// 响应式
@media (max-width: 768px) {
    .doing-page {
        padding: 40px 16px;

        .construction-card {
            padding: 36px 24px;

            .icon-wrapper {
                .gear-large {
                    width: 80px;
                    height: 80px;

                    .el-icon {
                        font-size: 36px;
                    }
                }

                .gear-small {
                    width: 48px;
                    height: 48px;

                    .el-icon {
                        font-size: 22px;
                    }
                }
            }

            .title {
                font-size: 24px;
            }
        }

        .entertainment-section {
            padding: 20px;

            .section-header {
                span {
                    font-size: 16px;
                }
            }
        }
    }
}
</style>
