<template>
    <div class="app-layout">
        <!-- 顶部导航栏 -->
        <el-header class="app-header">
            <Header />
        </el-header>

        <!-- 主内容区域 -->
        <main class="app-main">
            <!-- 悬浮提示区域 -->
            <transition-group name="prompt" tag="div" class="floating-prompts" v-if="prompts.length > 0">
                <div class="prompt-item" v-for="(item, index) in prompts" :key="item.id || index"
                    :style="{ 'z-index': 2000 + index }">
                    <div class="prompt-icon">
                        <el-icon>
                            <Warning />
                        </el-icon>
                    </div>
                    <div class="prompt-content">
                        <div class="prompt-title">系统提示</div>
                        <div class="prompt-message">{{ item.prompt }}</div>
                    </div>
                    <div class="prompt-close" @click="removePrompt(index)">
                        <el-icon>
                            <Close />
                        </el-icon>
                    </div>
                </div>
            </transition-group>

            <!-- 路由视图 -->
            <div class="router-view-container">
                <RouterView />
            </div>
        </main>
        <!-- 页脚 -->
        <Footer v-if="!['/login', '/register', '/start'].includes(route.path)" />
    </div>
</template>

<script setup lang="ts">
import { Warning, Close } from '@element-plus/icons-vue'
import Header from '@/components/common/Header.vue';
import Footer from '@/components/common/Footer.vue';
import { http } from '@/utils';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';



const route = useRoute()
const prompts = ref<Array<{ id?: string, prompt: string }>>([])

const removePrompt = (index: number) => {
    prompts.value.splice(index, 1)
}

onMounted(() => {
    http.result({
        url: '/system/prompt',
        method: 'POST',
        success(result) {
            prompts.value = result.data.map((item: any, index: number) => ({
                ...item,
                id: item.id || `prompt-${index}-${Date.now()}`
            }))
        }
    })
})
</script>

<style scoped lang="scss">
.app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--el-bg-color-page);
}

.app-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    padding: 0;
    height: auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.app-main {
    flex: 1;
    position: relative;
    padding-top: 20px;
    padding-bottom: 20px;
}

.router-view-container {
    // max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.floating-prompts {
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
}

.prompt-item {
    display: flex;
    align-items: center;
    width: 80%;
    max-width: 800px;
    padding: 14px 18px;
    margin-bottom: 12px;
    background-color: var(--el-bg-color);
    border-radius: 10px;
    box-shadow: var(--el-box-shadow-light);
    border-left: 4px solid var(--el-color-warning);
    pointer-events: auto;
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--el-box-shadow);
    }
}

.prompt-icon {
    margin-right: 14px;
    color: var(--el-color-warning);
    font-size: 22px;
}

.prompt-content {
    flex: 1;
    min-width: 0;
}

.prompt-title {
    font-weight: 600;
    color: var(--el-color-warning);
    margin-bottom: 6px;
    font-size: 15px;
}

.prompt-message {
    color: var(--el-text-color-regular);
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
}

.prompt-close {
    margin-left: 16px;
    color: var(--el-text-color-placeholder);
    cursor: pointer;
    transition: color 0.2s;
    flex-shrink: 0;

    &:hover {
        color: var(--el-text-color-secondary);
    }
}

/* 动画效果 */
.prompt-enter-active,
.prompt-leave-active {
    transition: all 0.3s ease;
}

.prompt-enter-from,
.prompt-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.prompt-move {
    transition: transform 0.3s ease;
}

.app-footer {
    margin-top: auto;
}

@media (max-width: 768px) {
    .app-main {
        padding-top: 15px;
        padding-bottom: 15px;
    }

    .router-view-container {
        padding: 0 15px;
    }

    .floating-prompts {
        top: 70px;
    }

    .prompt-item {
        width: calc(100% - 30px);
        padding: 12px 15px;
        margin-bottom: 10px;
    }

    .prompt-icon {
        font-size: 20px;
        margin-right: 12px;
    }

    .prompt-close {
        margin-left: 12px;
    }
}

@media (max-width: 480px) {
    .app-main {
        padding-top: 10px;
    }

    .prompt-item {
        width: calc(100% - 20px);
        padding: 10px 12px;
    }

    .prompt-title {
        font-size: 14px;
        margin-bottom: 4px;
    }

    .prompt-message {
        font-size: 13px;
    }
}
</style>