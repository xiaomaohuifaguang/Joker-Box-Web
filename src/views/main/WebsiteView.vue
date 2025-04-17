<template>
    <div class="website-navigation-container">
        <el-row class="main-container">
            <!-- 主要内容区域 -->
            <el-col :span="18" :offset="3">
                <el-row :gutter="20" v-for="group in groups" :key="group.groupName" class="group-container">
                    <!-- 分组标题 -->
                    <el-col :span="24">
                        <div class="group-header">
                            <el-tag class="group-tag" size="large" :id="group.groupName" effect="dark" round>
                                {{ group.groupName }}
                            </el-tag>
                            <el-divider class="group-divider" />
                        </div>
                    </el-col>

                    <!-- 网站卡片 -->
                    <el-col :span="6" v-for="item in group.child" :key="item.title" class="item-container">
                        <el-card class="website-card" shadow="hover" :body-style="{ padding: '20px' }">
                            <a :href="item.url" target="_blank" class="card-link">
                                <div class="card-content">
                                    <div class="title-container">
                                        <el-icon class="favicon">
                                            <Link />
                                        </el-icon>
                                        <el-text class="title" truncated>
                                            {{ item.title }}
                                        </el-text>
                                    </div>
                                    <el-text class="description" truncated lines="2">
                                        {{ item.description }}
                                    </el-text>
                                    <div class="url-container">
                                        <el-text class="url" truncated>
                                            {{ formatUrl(item.url) }}
                                        </el-text>
                                    </div>
                                </div>
                            </a>
                        </el-card>
                    </el-col>
                </el-row>
            </el-col>

            <!-- 侧边导航 -->
            <el-col :span="3" class="sidebar-col">
                <el-affix :offset="70">
                    <el-card class="sidebar-card" shadow="never">
                        <el-scrollbar>
                            <el-anchor class="sidebar-anchor">
                                <el-anchor-link v-for="group in groups" :key="group.groupName"
                                    :href="`#${group.groupName}`" class="anchor-link">
                                    <el-icon class="anchor-icon">
                                        <ArrowRight />
                                    </el-icon>
                                    {{ group.groupName }}
                                </el-anchor-link>
                            </el-anchor>
                        </el-scrollbar>
                    </el-card>
                </el-affix>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { http } from '@/utils';
import { Link, ArrowRight } from '@element-plus/icons-vue';

const groups = ref([]);

const queryList = () => {
    http.result({
        url: '/website/group',
        method: 'POST',
        success(result) {
            groups.value = result.data;
        }
    });
};

const formatUrl = (url: string) => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return url;
    }
};

onMounted(() => {
    queryList();
});
</script>

<style scoped lang="scss">
.website-navigation-container {
    padding: 2rem 0;
    background-color: var(--el-bg-color-page);
    min-height: 100vh;
}

.main-container {
    //max-width: 1400px;
    margin: 0 auto;
}

.group-container {
    margin-bottom: 3rem;
}

.group-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
}

.group-tag {
    font-size: 1.2rem;
    font-weight: 600;
    padding: 0 1.5rem;
    background-color: var(--el-color-primary);
    border: none;
    flex-shrink: 0;
}

.group-divider {
    margin: 0 0 0 1.5rem;
    background-color: var(--el-border-color-light);
}

.item-container {
    margin-bottom: 1.5rem;
    padding: 0 0.75rem;
}

.website-card {
    height: 100%;
    border-radius: 10px;
    transition: all 0.3s ease;
    border: 1px solid var(--el-border-color-light);

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        border-color: var(--el-color-primary-light-5);
    }
}

.card-link {
    text-decoration: none;
    color: inherit;
    display: block;
    height: 100%;
}

.card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.title-container {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.favicon {
    margin-right: 0.8rem;
    color: var(--el-color-primary);
    font-size: 1.2rem;
}

.title {
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--el-text-color-primary);
    line-height: 1.4;
}

.description {
    font-size: 0.95rem;
    color: var(--el-text-color-secondary);
    margin-bottom: 1.5rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.url-container {
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px dashed var(--el-border-color);
}

.url {
    font-size: 0.85rem;
    color: var(--el-color-primary);
}

.sidebar-col {
    position: relative;
}

.sidebar-card {
    border-radius: 8px;
    border: 1px solid var(--el-border-color-light);
    background-color: var(--el-bg-color-overlay);

    :deep(.el-card__body) {
        padding: 15px;
    }
}

.sidebar-anchor {
    :deep(.el-anchor) {
        padding: 0;
    }

    :deep(.el-anchor__ink) {
        display: none;
    }
}

.anchor-link {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    margin-bottom: 5px;
    border-radius: 6px;
    font-size: 1rem;
    color: var(--el-text-color-secondary);
    transition: all 0.3s ease;

    &:hover {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
    }

    &.is-active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        font-weight: 500;
    }
}

.anchor-icon {
    margin-right: 8px;
    font-size: 0.9rem;
}

@media (max-width: 992px) {
    .main-container {
        flex-direction: column;
    }

    .sidebar-col {
        display: none;
    }

    .item-container {
        width: 50%;
    }
}

@media (max-width: 768px) {
    .item-container {
        width: 100%;
    }

    .group-tag {
        font-size: 1rem;
        padding: 0 1rem;
    }
}
</style>