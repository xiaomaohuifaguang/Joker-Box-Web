<template>
    <div class="website-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon><Star /></el-icon>
                    </div>
                    <div class="title-text">
                        <h1>网站收藏</h1>
                        <p>共 {{ totalWebsites }} 个网站，{{ groups.length }} 个分组</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 主体内容 -->
        <div class="page-container">
            <div class="content-layout">
                <!-- 左侧导航 -->
                <aside class="sidebar">
                    <div class="sidebar-card">
                        <div class="sidebar-header">
                            <div class="header-icon">
                                <el-icon><Folder /></el-icon>
                            </div>
                            <span class="header-title">分组导航</span>
                        </div>
                        <div class="nav-list">
                            <a v-for="group in groups" :key="group.groupName" 
                               :href="`#${group.groupName}`"
                               class="nav-link"
                               :class="{ active: activeGroup === group.groupName }"
                               @click.prevent="scrollToGroup(group.groupName)">
                                <span class="nav-dot"></span>
                                <span class="nav-name">{{ group.groupName }}</span>
                                <span class="nav-badge">{{ group.child.length }}</span>
                            </a>
                        </div>
                    </div>
                </aside>

                <!-- 右侧内容 -->
                <main class="main-content">
                    <div v-for="group in groups" :key="group.groupName" 
                         class="group-block" 
                         :id="group.groupName">
                        <div class="group-header">
                            <h2 class="group-name">{{ group.groupName }}</h2>
                            <span class="group-count">{{ group.child.length }} 个网站</span>
                        </div>
                        
                        <div class="sites-grid">
                            <a v-for="site in group.child" :key="site.title"
                               :href="site.url" target="_blank" class="site-card">
                                <div class="site-icon" :style="{ background: getSiteColor(site.title) }">
                                    <img v-if="site.favicon" :src="site.favicon" @error="onImgError">
                                    <el-icon v-else><Link /></el-icon>
                                </div>
                                <div class="site-info">
                                    <h3 class="site-title">{{ site.title }}</h3>
                                    <p class="site-desc">{{ site.description }}</p>
                                    <span class="site-url">
                                        <el-icon><Link /></el-icon>
                                        {{ formatUrl(site.url) }}
                                    </span>
                                </div>
                            </a>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { http } from '@/utils';
import { Star, Link, Folder } from '@element-plus/icons-vue';

const groups = ref<any[]>([]);
const activeGroup = ref('');

const totalWebsites = computed(() => {
    return groups.value.reduce((sum, g) => sum + (g.child?.length || 0), 0);
});

const getSiteColor = (name: string) => {
    if (!name) return '#667eea'
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#667eea', '#764ba2']
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
}

const queryList = () => {
    http.result({
        url: '/website/group',
        method: 'POST',
        success(result) {
            groups.value = result.data;
            if (groups.value.length > 0) {
                activeGroup.value = groups.value[0].groupName;
            }
        }
    });
};

const formatUrl = (url: string) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
};

const onImgError = (e: Event) => {
    (e.target as HTMLImageElement).style.display = 'none';
};

const scrollToGroup = (name: string) => {
    activeGroup.value = name;
    document.getElementById(name)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const onScroll = () => {
    const pos = window.scrollY + 150;
    for (const g of groups.value) {
        const el = document.getElementById(g.groupName);
        if (el && pos >= el.offsetTop && pos < el.offsetTop + el.offsetHeight) {
            activeGroup.value = g.groupName;
            break;
        }
    }
};

onMounted(() => {
    queryList();
    window.addEventListener('scroll', onScroll);
});
</script>

<style scoped lang="scss">
.website-page {
    min-height: calc(100vh - 60px);
    background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);
}

/* 页面头部 */
.page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 32px 0;
    margin-bottom: 24px;
}

.header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 20px;

    .title-icon {
        width: 64px;
        height: 64px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);

        .el-icon {
            font-size: 32px;
            color: white;
        }
    }

    .title-text {
        h1 {
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 600;
            color: white;
        }

        p {
            margin: 0;
            font-size: 15px;
            color: rgba(255, 255, 255, 0.85);
        }
    }
}

/* 主体布局 */
.page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px 40px;
}

.content-layout {
    display: flex;
    gap: 24px;
}

/* 左侧导航 */
.sidebar {
    width: 240px;
    flex-shrink: 0;
    position: sticky;
    top: 90px;
    height: fit-content;
}

.sidebar-card {
    background: var(--el-bg-color);
    border-radius: 16px;
    padding: 20px;
    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--el-border-color-lighter);
}

.sidebar-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .header-icon {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
            font-size: 18px;
            color: white;
        }
    }

    .header-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
    }
}

.nav-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    color: var(--el-text-color-regular);
    text-decoration: none;
    font-size: 14px;
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
        background: var(--el-fill-color-light);
        color: var(--el-text-color-primary);
        transform: translateX(4px);
    }

    &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

        .nav-dot {
            background: white;
        }

        .nav-badge {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }
    }
}

.nav-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--el-border-color-dark);
    flex-shrink: 0;
}

.nav-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
}

.nav-badge {
    padding: 2px 10px;
    background: var(--el-fill-color);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    flex-shrink: 0;
}

/* 右侧内容 */
.main-content {
    flex: 1;
    min-width: 0;
}

.group-block {
    margin-bottom: 40px;
    background: var(--el-bg-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--el-border-color-lighter);

    &:last-child {
        margin-bottom: 0;
    }
}

.group-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--el-border-color-lighter);
}

.group-name {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
}

.group-count {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    padding: 4px 12px;
    border-radius: 12px;
}

/* 网站卡片网格 */
.sites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
}

.site-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 20px;
    background: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.3s;

    &:hover {
        border-color: #667eea;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
        transform: translateY(-4px);
    }
}

.site-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .el-icon {
        font-size: 22px;
        color: white;
    }
}

.site-info {
    flex: 1;
    min-width: 0;
}

.site-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 6px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.site-desc {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin: 0 0 8px 0;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.site-url {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #667eea;
    font-family: 'Consolas', monospace;

    .el-icon {
        font-size: 12px;
    }
}

/* 响应式 */
@media (max-width: 992px) {
    .content-layout {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        position: static;
    }

    .nav-list {
        flex-direction: row;
        flex-wrap: wrap;
    }

    .nav-link {
        width: auto;
    }
}

@media (max-width: 768px) {
    .page-header {
        padding: 24px 0;

        .header-content {
            padding: 0 16px;
        }

        .header-title {
            flex-direction: column;
            text-align: center;

            .title-text {
                h1 {
                    font-size: 22px;
                }
            }
        }
    }

    .page-container {
        padding: 0 16px 24px;
    }

    .group-block {
        padding: 16px;
    }

    .sites-grid {
        grid-template-columns: 1fr;
    }
}
</style>
