<template>
    <div class="post-container">
        <el-row>
            <el-col :span="18" :offset="3">
                <!-- 搜索和发帖区域 -->
                <div class="post-header">
                    <el-input v-model="queryParam.search" placeholder="搜索帖子..." clearable class="search-input"
                        @clear="handleSearch" @keyup.enter="handleSearch" size="large">
                        <template #append>
                            <el-button :icon="Search" @click="handleSearch" />
                        </template>
                    </el-input>
                    <el-button type="primary" :icon="Edit" @click="dialogAdd = true" size="large" class="post-button">
                        发帖
                    </el-button>
                </div>

                <!-- 帖子列表 -->
                <div class="post-list">
                    <div v-for="item in list" :key="item.id" class="post-item" @click="handleViewPost(item)">
                        <div class="post-content">
                            <div class="post-title-container">
                                <span class="post-title" :title="item.title">
                                    {{ truncateText(item.title, 30) }}
                                </span>
                                <el-tag v-if="item.isTop" type="warning" size="small" class="top-tag">
                                    置顶
                                </el-tag>
                            </div>
                            <div class="post-digest-container">
                                <span v-if="item.digest" class="post-digest" :title="item.digest">
                                    {{ truncateText(item.digest, 50) }}
                                </span>
                            </div>
                            <div class="post-meta-container">
                                <div class="post-author">
                                    <!-- <el-avatar :size="24" :src="getAvatar(item.createByName)" class="author-avatar" /> -->
                                    <span :title="item.createByName" class="author-name">
                                        {{ truncateText(item.createByName, 8) }}
                                    </span>
                                </div>
                                <div class="post-time">
                                    <el-icon>
                                        <Clock />
                                    </el-icon>
                                    <span :title="formatFullTime(item.createTime)">
                                        {{ formatTime(item.createTime) }}
                                    </span>
                                </div>
                                <div class="post-stats">
                                    <span class="stat-item">
                                        <el-icon>
                                            <View />
                                        </el-icon>
                                        {{ item.viewCount || 0 }}
                                    </span>
                                    <!-- <span class="stat-item">
                                        <el-icon>
                                            <ChatDotRound />
                                        </el-icon>
                                        {{ item.commentCount || 0 }}
                                    </span>
                                    <span class="stat-item">
                                        <el-icon>
                                            <Star />
                                        </el-icon>
                                        {{ item.likeCount || 0 }}
                                    </span> -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 空状态 -->
                    <el-empty v-if="list.length === 0" description="暂无帖子" class="empty-post" />

                    <!-- 分页 -->
                    <el-pagination v-model:current-page="pageInfo.current" v-model:page-size="pageInfo.size"
                        :page-sizes="[10, 20, 30, 50]" :total="pageInfo.total"
                        layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                        @current-change="handleCurrentChange" class="post-pagination" v-if="list.length > 0" />
                </div>

                <!-- 发帖对话框 -->
                <el-dialog v-model="dialogAdd" width="800px" :close-on-click-modal="false"
                    :close-on-press-escape="false" v-if="dialogAdd" :show-close="false" class="post-dialog">
                    <template #header>
                        <div class="dialog-header">
                            <span>发表新帖</span>
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
import { Search, Edit, User, Clock, View, ChatDotRound, Star } from '@element-plus/icons-vue';
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

// 获取用户头像（模拟）
const getAvatar = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#A38CF9', '#FFA07A']
    const index = name.length % colors.length
    return `https://via.placeholder.com/40/${colors[index].substring(1)}/FFFFFF?text=${name.charAt(0)}`
}

// 格式化时间（简洁版）
const formatTime = (time) => {
    if (!time) return '';

    const now = new Date();
    const date = new Date(time);
    const diffInSeconds = Math.floor((now - date) / 1000);

    // 1分钟内的显示"刚刚"
    if (diffInSeconds < 60 * 3) {
        return '刚刚';
    }

    // 获取各时间组件（确保两位数显示）
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // 判断是否今天
    if (date.toDateString() === now.toDateString()) {
        return `${hours}:${minutes}`;
    } else if (year === now.getFullYear()) {
        // 今年显示：月日
        return `${month}月${day}日`;
    } else {
        // 非今年显示：年月日
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
.post-container {
    padding: 24px 0;
    background-color: var(--el-bg-color-page);
    min-height: calc(100vh - 120px);
}

.post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;

    .search-input {
        flex: 1;
        max-width: 500px;

        :deep(.el-input-group__append) {
            background-color: var(--el-color-primary);
            color: white;

            .el-button {
                color: inherit;
            }
        }
    }

    .post-button {
        font-weight: 500;
        padding: 0 24px;
    }
}

.post-list {
    margin-top: 16px;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--el-bg-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    .empty-post {
        padding: 60px 0;
    }
}

.post-item {
    display: flex;
    align-items: center;
    padding: 16px 24px;
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        background-color: var(--el-color-primary-light-9);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    &:last-child {
        border-bottom: none;
    }
}

.post-content {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 16px;
}

.post-title-container {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;

    .post-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .top-tag {
        flex-shrink: 0;
    }
}

.post-digest-container {
    flex: 2;
    min-width: 0;

    .post-digest {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.post-meta-container {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 16px;
}

.post-author {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;

    .author-avatar {
        flex-shrink: 0;
    }

    .author-name {
        font-size: 14px;
        color: var(--el-text-color-regular);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.post-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
}

.post-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;

    .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--el-text-color-secondary);

        .el-icon {
            font-size: 14px;
        }
    }
}

.post-pagination {
    margin-top: 24px;
    justify-content: center;
    padding: 16px 0;
    background-color: var(--el-bg-color);
    border-radius: 8px;
}

.dialog-header {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    padding: 16px 0;
    border-bottom: 1px solid var(--el-border-color-light);
}

.el-icon {
    flex-shrink: 0;
}
</style>