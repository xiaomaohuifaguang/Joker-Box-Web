<template>
    <div class="not-found-container">
        <div class="error-content">
            <!-- <div class="error-illustration">
                <Tips404 class="svg-image" />
            </div> -->
            <div class="error-details">
                <h1 class="error-title">404</h1>
                <h2 class="error-subtitle">页面不存在</h2>
                <p class="error-description">您访问的页面可能已被删除、更名或暂时不可用</p>
                <div class="action-buttons">
                    <el-button type="primary" size="large" @click="toPath('/')" class="home-button">
                        <el-icon>
                            <HomeFilled />
                        </el-icon>
                        <span>返回首页</span>
                    </el-button>
                    <el-button type="default" size="large" @click="$router.go(-1)" class="back-button">
                        <el-icon>
                            <ArrowLeft />
                        </el-icon>
                        <span>返回上一页</span>
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Tips404 from '@/components/svg/Tips404.vue'
import { toPath } from '@/utils'
import { HomeFilled, ArrowLeft } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.not-found-container {
    display: flex;
    justify-content: center;
    align-items: center;
    // min-height: 100vh;
    // background-color: var(--el-bg-color-page);
    padding: 2rem;
}

.error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 800px;
    text-align: center;
}

.error-illustration {
    margin-bottom: 2rem;

    .svg-image {
        width: 320px;
        height: 320px;
        opacity: 0.9;
    }
}

.error-details {
    .error-title {
        font-size: 5rem;
        font-weight: 700;
        color: var(--el-color-primary);
        margin-bottom: 0.5rem;
        line-height: 1;
    }

    .error-subtitle {
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 1rem;
    }

    .error-description {
        font-size: 1.1rem;
        color: var(--el-text-color-secondary);
        margin-bottom: 2.5rem;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
    }
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;

    .home-button,
    .back-button {
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;

        .el-icon {
            margin-right: 0.5rem;
            font-size: 1.1rem;
        }
    }
}

@media (max-width: 768px) {
    .error-illustration .svg-image {
        width: 240px;
        height: 240px;
    }

    .error-title {
        font-size: 3.5rem !important;
    }

    .error-subtitle {
        font-size: 1.5rem !important;
    }

    .error-description {
        font-size: 1rem !important;
    }

    .action-buttons {
        flex-direction: column;
        gap: 0.8rem;

        .home-button,
        .back-button {
            width: 100%;
        }
    }
}

@media (max-width: 480px) {
    .error-illustration .svg-image {
        width: 180px;
        height: 180px;
    }

    .error-title {
        font-size: 3rem !important;
    }
}
</style>