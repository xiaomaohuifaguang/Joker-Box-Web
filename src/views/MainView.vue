<template>
    <el-row>
        <el-col :span="24" :offset="0">
            <el-container style="min-height: 100vh;">
                <el-header class="padding-lr-0">
                    <Header />
                </el-header>

                <el-main class="padding-lr-0 main-container">
                    <!-- 悬浮提示区域 -->
                    <div class="floating-prompts" v-if="prompts.length > 0">
                        <div class="prompt-item" v-for="(item, index) in prompts" :key="index">
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
                    </div>

                    <RouterView />
                </el-main>
            </el-container>
        </el-col>
    </el-row>
    <Footer v-if="route.path != '/login' && route.path != '/register' && route.path != '/start'" />
</template>

<script setup lang='ts'>
import { Warning, Close } from '@element-plus/icons-vue'
import Header from '@/components/common/Header.vue';
import { http } from '@/utils';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const prompts = ref([])

const removePrompt = (index) => {
    prompts.value.splice(index, 1)
}

onMounted(() => {
    http.result({
        url: '/system/prompt',
        method: 'POST',
        success(result) {
            prompts.value = result.data
        }
    })
})
</script>

<style scoped lang="scss">
.padding-lr-0 {
    padding-left: 0;
    padding-right: 0;
}

.el-main {
    padding-top: 0;
    padding-bottom: 0;
    position: relative;
}

.main-container {
    padding-top: 20px;
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
    padding: 12px 16px;
    margin-bottom: 10px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-left: 4px solid #e6a23c;
    pointer-events: auto;
    animation: slideDown 0.3s ease-out;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
}

.prompt-icon {
    margin-right: 12px;
    color: #e6a23c;
    font-size: 20px;
}

.prompt-content {
    flex: 1;
}

.prompt-title {
    font-weight: 600;
    color: #e6a23c;
    margin-bottom: 4px;
}

.prompt-message {
    color: #606266;
    font-size: 14px;
}

.prompt-close {
    margin-left: 12px;
    color: #c0c4cc;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
        color: #909399;
    }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .prompt-item {
        width: 95%;
        padding: 10px 12px;
    }

    .floating-prompts {
        top: 70px;
    }
}
</style>