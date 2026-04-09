<template>
    <div class="gandashi-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon><ChatDotRound /></el-icon>
                    </div>
                    <div class="title-text">
                        <h1>干大事社区</h1>
                        <p>分享想法，交流经验，共同成长</p>
                    </div>
                </div>
                <el-button type="primary" class="post-btn" @click="dialogAdd = true">
                    <el-icon><EditPen /></el-icon>
                    <span>发布帖子</span>
                </el-button>
            </div>
        </div>

        <el-row>
            <el-col :span="18" :offset="3">
                <!-- 搜索区域 -->
                <div class="search-section">
                    <div class="search-box">
                        <el-icon class="search-icon"><Search /></el-icon>
                        <el-input 
                            v-model="queryParam.search" 
                            placeholder="搜索感兴趣的帖子..." 
                            clearable 
                            class="search-input"
                            @clear="handleSearch" 
                            @keyup.enter="handleSearch">
                        </el-input>
                        <el-button type="primary" class="search-btn" @click="handleSearch">
                            搜索
                        </el-button>
                    </div>
                </div>

                <!-- 帖子列表 -->
                <div class="post-list-container">
                    <div v-for="item in list" :key="item.id" class="post-card" @click="handleViewPost(item)">
                        <div class="post-main">
                            <div class="post-header-row">
                                <h3 class="post-title" :title="item.title">
                                    <el-tag v-if="item.isTop" type="warning" size="small" effect="dark" class="top-tag">
                                        <el-icon><Top /></el-icon>
                                        置顶
                                    </el-tag>
                                    {{ truncateText(item.title, 40) }}
                                </h3>
                            </div>
                            <p v-if="item.digest" class="post-digest" :title="item.digest">
                                {{ truncateText(item.digest, 80) }}
                            </p>
                            <div class="post-meta">
                                <div class="meta-item author">
                                    <div class="author-avatar" :style="{ background: getAvatarColor(item.createByName) }">
                                        {{ item.createByName ? item.createByName.charAt(0).toUpperCase() : '?' }}
                                    </div>
                                    <span class="author-name" :title="item.createByName">
                                        {{ truncateText(item.createByName, 8) }}
                                    </span>
                                </div>
                                <div class="meta-item time">
                                    <el-icon><Clock /></el-icon>
                                    <span :title="formatFullTime(item.createTime)">
                                        {{ formatTime(item.createTime) }}
                                    </span>
                                </div>
                                <div class="meta-item stats">
                                    <span class="stat">
                                        <el-icon><View /></el-icon>
                                        {{ item.viewCount || 0 }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="post-arrow">
                            <el-icon><ArrowRight /></el-icon>
                        </div>
                    </div>

                    <!-- 空状态 -->
                    <div v-if="list.length === 0" class="empty-state">
                        <div class="empty-icon">
                            <el-icon><DocumentDelete /></el-icon>
                        </div>
                        <h3>暂无帖子</h3>
                        <p>快来发布第一条帖子吧！</p>
                    </div>

                    <!-- 分页 -->
                    <div v-if="list.length > 0" class="pagination-wrapper">
                        <el-pagination 
                            v-model:current-page="pageInfo.current" 
                            v-model:page-size="pageInfo.size"
                            :page-sizes="[10, 20, 30, 50]" 
                            :total="pageInfo.total"
                            layout="total, sizes, prev, pager, next, jumper" 
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange" />
                    </div>
                </div>

                <!-- 发帖对话框 -->
                <el-dialog 
                    v-model="dialogAdd" 
                    width="850px" 
                    :close-on-click-modal="false"
                    :close-on-press-escape="false" 
                    v-if="dialogAdd" 
                    :show-close="false"
                    destroy-on-close
                    class="post-dialog">
                    <template #header>
                        <div class="dialog-header">
                            <div class="dialog-title">
                                <el-icon><EditPen /></el-icon>
                                <span>发表新帖</span>
                            </div>
                            <el-button class="close-btn" circle @click="dialogAdd = false">
                                <el-icon><Close /></el-icon>
                            </el-button>
                        </div>
                    </template>
                    <PostAddView @success="handlePostSuccess" />
                </el-dialog>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { Search, EditPen, Clock, View, ChatDotRound, ArrowRight, Top, Close, DocumentDelete } from '@element-plus/icons-vue';
import PostAddView from './PostAddView.vue';
import { http } from '@/utils';
import { useRoute } from 'vue-router'
const route = useRoute()

const dialogAdd = ref(false);
const list = ref([]);

const queryParam = ref({
    search: '',
    createUsername: '',
});

const pageInfo = ref({
    current: 1,
    size: 20,
    total: 0,
    pages: 0
});

// 获取头像颜色
const getAvatarColor = (name) => {
    if (!name) return '#909399'
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a']
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
}

// 格式化时间（简洁版）
const formatTime = (time) => {
    if (!time) return '';

    const now = new Date();
    const date = new Date(time);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60 * 3) {
        return '刚刚';
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (date.toDateString() === now.toDateString()) {
        return `${hours}:${minutes}`;
    } else if (year === now.getFullYear()) {
        return `${month}月${day}日`;
    } else {
        return `${year}-${month}-${day}`;
    }
};

// 格式化时间（完整版，用于title提示）
const formatFullTime = (time) => {
    if (!time) return '';
    const date = new Date(time);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 截断文本显示
const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// 搜索帖子
const handleSearch = () => {
    pageInfo.value.current = 1;
    queryPage();
};

// 分页大小变化
const handleSizeChange = (val) => {
    pageInfo.value.size = val;
    queryPage();
};

// 当前页变化
const handleCurrentChange = (val) => {
    pageInfo.value.current = val;
    queryPage();
};

// 查看帖子详情
const handleViewPost = (post) => {
    window.open('ganDaShi/' + post.createUsername + '/' + post.id);
};

// 发帖成功回调
const handlePostSuccess = () => {
    dialogAdd.value = false;
    queryPage();
};

watch(() => route.params.username, (newVal) => {
    if (queryParam.value.createUsername != newVal) {
        queryParam.value.createUsername = newVal;
        pageInfo.value.current = 1;
        queryPage();
    }
});

// 查询帖子列表
const queryPage = () => {
    http.result({
        url: '/ganDaShiPost/queryPage',
        method: 'POST',
        data: {
            current: pageInfo.value.current,
            size: pageInfo.value.size,
            search: queryParam.value.search,
            createUsername: queryParam.value.createUsername
        },
        success(result) {
            list.value = result.data.records;
            pageInfo.value.current = result.data.current;
            pageInfo.value.size = result.data.size;
            pageInfo.value.total = result.data.total;
            pageInfo.value.pages = result.data.pages;
        }
    });
};

onMounted(() => {
    queryParam.value.createUsername = route.params.username ? route.params.username : '';
    queryPage();
});
</script>

<style scoped lang="scss">
.gandashi-page {
    min-height: calc(100vh - 60px);
    background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);
    padding-bottom: 40px;

    // 页面头部
    .page-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 0;
        margin-bottom: 32px;

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
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
                    font-size: 32px;
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

        .post-btn {
            height: 48px;
            padding: 0 28px;
            font-size: 16px;
            font-weight: 500;
            border-radius: 12px;
            background: white;
            color: #667eea;
            border: none;
            transition: all 0.3s ease;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            }

            .el-icon {
                margin-right: 8px;
                font-size: 18px;
            }
        }
    }

    // 搜索区域
    .search-section {
        margin-bottom: 24px;

        .search-box {
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--el-bg-color);
            padding: 8px;
            border-radius: 12px;
            box-shadow: var(--el-box-shadow-light);
            border: 1px solid var(--el-border-color-lighter);

            .search-icon {
                font-size: 20px;
                color: var(--el-text-color-secondary);
                margin-left: 12px;
            }

            .search-input {
                flex: 1;

                :deep(.el-input__inner) {
                    border: none;
                    background: transparent;
                    font-size: 15px;
                    padding-left: 8px;

                    &::placeholder {
                        color: var(--el-text-color-placeholder);
                    }
                }
            }

            .search-btn {
                height: 44px;
                padding: 0 24px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 500;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
            }
        }
    }

    // 帖子列表容器
    .post-list-container {
        .post-card {
            display: flex;
            align-items: center;
            gap: 16px;
            background: var(--el-bg-color);
            padding: 24px;
            margin-bottom: 16px;
            border-radius: 12px;
            box-shadow: var(--el-box-shadow-light);
            border: 1px solid var(--el-border-color-lighter);
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
                border-color: var(--el-color-primary-light-5);

                .post-arrow {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    transform: translateX(4px);
                }
            }

            .post-main {
                flex: 1;
                min-width: 0;

                .post-header-row {
                    margin-bottom: 10px;

                    .post-title {
                        margin: 0;
                        font-size: 17px;
                        font-weight: 600;
                        color: var(--el-text-color-primary);
                        line-height: 1.5;
                        display: flex;
                        align-items: center;
                        gap: 10px;

                        .top-tag {
                            flex-shrink: 0;
                            font-weight: 500;

                            .el-icon {
                                margin-right: 4px;
                                font-size: 12px;
                            }
                        }
                    }
                }

                .post-digest {
                    margin: 0 0 14px 0;
                    font-size: 14px;
                    color: var(--el-text-color-secondary);
                    line-height: 1.6;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .post-meta {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    flex-wrap: wrap;

                    .meta-item {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 13px;
                        color: var(--el-text-color-secondary);

                        &.author {
                            .author-avatar {
                                width: 28px;
                                height: 28px;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 12px;
                                font-weight: 600;
                                color: white;
                            }

                            .author-name {
                                color: var(--el-text-color-regular);
                                font-weight: 500;
                            }
                        }

                        &.time {
                            .el-icon {
                                font-size: 14px;
                            }
                        }

                        &.stats {
                            margin-left: auto;

                            .stat {
                                display: flex;
                                align-items: center;
                                gap: 4px;
                                padding: 4px 10px;
                                background: var(--el-fill-color-light);
                                border-radius: 20px;

                                .el-icon {
                                    font-size: 14px;
                                }
                            }
                        }
                    }
                }
            }

            .post-arrow {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--el-fill-color-light);
                color: var(--el-text-color-secondary);
                transition: all 0.3s ease;
                flex-shrink: 0;

                .el-icon {
                    font-size: 18px;
                }
            }
        }

        // 空状态
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px 24px;
            background: var(--el-bg-color);
            border-radius: 16px;
            box-shadow: var(--el-box-shadow-light);

            .empty-icon {
                width: 100px;
                height: 100px;
                background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 24px;

                .el-icon {
                    font-size: 48px;
                    color: #667eea;
                }
            }

            h3 {
                margin: 0 0 8px 0;
                font-size: 20px;
                color: var(--el-text-color-primary);
            }

            p {
                margin: 0;
                font-size: 14px;
                color: var(--el-text-color-secondary);
            }
        }

        // 分页
        .pagination-wrapper {
            display: flex;
            justify-content: center;
            margin-top: 32px;
            padding: 20px;
            background: var(--el-bg-color);
            border-radius: 12px;
            box-shadow: var(--el-box-shadow-light);
        }
    }
}

// 发帖对话框
.post-dialog {
    :deep(.el-dialog__header) {
        margin: 0;
        padding: 0;
    }

    :deep(.el-dialog__body) {
        padding: 0;
    }

    .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

        .dialog-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 18px;
            font-weight: 600;
            color: white;

            .el-icon {
                font-size: 22px;
            }
        }

        .close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;

            &:hover {
                background: rgba(255, 255, 255, 0.3);
            }
        }
    }
}

// 响应式适配
@media (max-width: 768px) {
    .gandashi-page {
        .page-header {
            padding: 24px 0;

            .header-content {
                flex-direction: column;
                text-align: center;
            }

            .header-title {
                flex-direction: column;

                .title-text {
                    h1 {
                        font-size: 24px;
                    }
                }
            }
        }

        .search-section {
            .search-box {
                flex-wrap: wrap;

                .search-input {
                    width: 100%;
                }

                .search-btn {
                    width: 100%;
                }
            }
        }

        .post-list-container {
            .post-card {
                padding: 16px;

                .post-main {
                    .post-meta {
                        .meta-item.stats {
                            margin-left: 0;
                            width: 100%;
                            margin-top: 8px;
                        }
                    }
                }
            }
        }
    }
}
</style>
