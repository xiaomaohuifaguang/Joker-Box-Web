<template>
    <div class="post-detail-container">
        <!-- 帖子头部 -->
        <div class="post-header">
            <h1 class="post-title">{{ info.title }}</h1>
            <div class="post-meta">
                <span class="post-author">
                    <!-- <el-avatar :size="24" :src="getAvatar(info.createByName)" class="author-avatar" /> -->
                    <el-link :href="'/ganDaShi/' + info.createUsername" target="_blank" class="author-link">
                        {{ info.createByName }}
                    </el-link>
                </span>
                <span class="post-time">
                    <el-icon>
                        <Clock />
                    </el-icon>
                    {{ formatTime(info.createTime) }}
                </span>
            </div>
        </div>

        <!-- 帖子内容 -->
        <div class="post-content">
            <TiptapEditor v-model="info.content" :onlyRead="true" class="post-editor" />
        </div>

        <!-- 评论区 -->
        <div class="post-comment">
            <div class="comment-header">
                <h3 class="comment-title">
                    <el-icon>
                        <ChatDotRound />
                    </el-icon>
                    哔哔区
                </h3>
                <span class="comment-count">{{ commmentAll.pageInfo.total }} 条评论</span>
            </div>

            <div class="comment-form">
                <el-input v-model="mainComment.comment" type="textarea" :rows="4" resize="none" placeholder="哔哔两句..."
                    class="comment-input" maxlength="300" show-word-limit />
                <div class="form-footer">
                    <el-button type="primary" class="comment-button" @click="addComment"
                        :disabled="!mainComment.comment.trim()" :loading="commentLoading">
                        发表评论
                    </el-button>
                </div>
            </div>

            <!-- 评论列表 -->
            <div class="comment-list">
                <div v-for="(item, index) in commmentAll.list" :key="index" class="comment-item">
                    <PostReplayComment :mainComment="item" :postId="item.postId" :parentId="item.id"
                        :replayCount="item.replayCount" />
                </div>

                <!-- 加载更多 -->
                <div v-if="hasNextPageTag" class="load-more">
                    <el-button type="text" :loading="loading" @click="queryComment" class="load-more-btn">
                        <template #default>
                            <span v-if="!loading">加载更多评论</span>
                            <span v-else>正在加载...</span>
                        </template>
                        <template #loading>
                            <span>加载中...</span>
                        </template>
                    </el-button>
                </div>

                <div v-if="commmentAll.list.length === 0" class="empty-comment">
                    <el-empty description="暂无评论，快来抢沙发~" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import TiptapEditor from '@/components/editor/TiptapEditor.vue';
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';
import { User, Clock, ChatDotRound } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import PostReplayComment from './PostReplayComment.vue';

const route = useRoute()

const info = ref({
    id: '',
    title: '',
    content: '',
    text: '',
    createBy: '',
    createByName: '',
    createUsername: '',
    createTime: '',
})

const mainComment = ref({
    postId: '',
    comment: ''
})

const commmentAll = ref({
    pageInfo: {
        pageCurrent: 0,
        pageSize: 10,
        total: 0
    },
    list: []
})

const hasNextPageTag = ref(false)
const loading = ref(false)
const commentLoading = ref(false)

// 获取用户头像（模拟）
const getAvatar = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#A38CF9', '#FFA07A']
    const index = name.length % colors.length
    return `https://via.placeholder.com/40/${colors[index].substring(1)}/FFFFFF?text=${name.charAt(0)}`
}

// 格式化时间
const formatTime = (time) => {
    if (!time) return '';

    const now = new Date();
    const date = new Date(time);
    const diffInSeconds = Math.floor((now - date) / 1000);

    // 3分钟内的显示"刚刚"
    if (diffInSeconds < 60 * 3) {
        return '刚刚';
    }

    // 获取各时间组件（确保两位数显示）
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // 判断是否今天
    if (date.toDateString() === now.toDateString()) {
        return `${hours}:${minutes}`;
    }
    // 判断是否今年
    else if (year === now.getFullYear()) {
        return `${month}月${day}日`;
    }
    // 非今年
    else {
        return `${year}年${month}月${day}日`;
    }
};

const queryInfo = () => {
    http.result({
        url: '/ganDaShiPost/info',
        method: 'POST',
        data: { id: route.params.id },
        success(result) {
            info.value = result.data
            mainComment.value.postId = info.value.id
            queryComment()
        }
    })
}

const addComment = () => {
    if (!mainComment.value.comment.trim()) return

    commentLoading.value = true
    http.result({
        url: '/ganDaShiComment/add',
        method: 'POST',
        data: {
            postId: mainComment.value.postId,
            comment: mainComment.value.comment,
        },
        success(result) {
            alert('评论成功', 'success')
            commmentAll.value.list.unshift(result.data);
            mainComment.value.comment = ''
            commmentAll.value.pageInfo.total++
            commentLoading.value = false
        },
        error() {
            commentLoading.value = false
        }
    })
}

const hasNextPage = () => {
    if (commmentAll.value.pageInfo.total === 0) {
        hasNextPageTag.value = false
        return
    }

    const totalPages = Math.ceil(commmentAll.value.pageInfo.total / commmentAll.value.pageInfo.pageSize)
    hasNextPageTag.value = commmentAll.value.pageInfo.pageCurrent < totalPages
}

const queryComment = () => {
    if (loading.value) return

    loading.value = true
    commmentAll.value.pageInfo.pageCurrent++

    http.result({
        url: '/ganDaShiComment/queryPage',
        method: 'POST',
        data: {
            postId: mainComment.value.postId,
            current: commmentAll.value.pageInfo.pageCurrent,
            size: commmentAll.value.pageInfo.pageSize
        },
        success(result) {
            commmentAll.value.list = [...commmentAll.value.list, ...result.data.records]
            commmentAll.value.pageInfo.total = result.data.total
            hasNextPage()
            loading.value = false
        },
        error() {
            loading.value = false
        }
    })
}

onMounted(() => {
    queryInfo()
})
</script>

<style scoped lang="scss">
.post-detail-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 30px;
    background-color: var(--el-bg-color);
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.post-header {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--el-border-color-light);
}

.post-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
    line-height: 1.4;
    word-break: break-word;
}

.post-meta {
    display: flex;
    align-items: center;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    gap: 24px;
}

.post-author {
    display: flex;
    align-items: center;
    gap: 8px;

    .author-avatar {
        margin-right: 6px;
    }
}

.author-link {
    color: var(--el-text-color-regular);
    text-decoration: none;
    transition: color 0.2s;
    font-weight: 500;

    &:hover {
        color: var(--el-color-primary);
    }
}

.post-time {
    display: flex;
    align-items: center;

    .el-icon {
        margin-right: 6px;
        font-size: 16px;
    }
}

.post-content {
    margin: 32px 0;
    min-height: 200px;

    .post-editor {
        width: 100%;
        margin: 0 auto;
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        background-color: var(--el-bg-color);
        padding: 16px;
    }
}

.post-comment {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid var(--el-border-color-light);

    .comment-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
    }

    .comment-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        display: flex;
        align-items: center;
        gap: 8px;

        .el-icon {
            color: var(--el-color-primary);
        }
    }

    .comment-count {
        font-size: 14px;
        color: var(--el-text-color-secondary);
    }
}

.comment-form {
    margin-bottom: 24px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;
    padding: 16px;

    .comment-input {
        margin-bottom: 16px;

        :deep(.el-textarea__inner) {
            border-radius: 6px;
            padding: 12px;
            font-size: 14px;
            line-height: 1.6;
            background-color: var(--el-fill-color-blank);
            border-color: var(--el-border-color-light);
            transition: all 0.2s;
            box-shadow: none;

            &:focus {
                border-color: var(--el-color-primary);
                box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
            }
        }
    }

    .form-footer {
        display: flex;
        justify-content: flex-end;
    }

    .comment-button {
        min-width: 120px;
        height: 40px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
    }
}

.comment-list {
    .comment-item {
        margin-bottom: 16px;
    }

    .load-more {
        display: flex;
        justify-content: center;
        margin-top: 16px;

        .load-more-btn {
            color: var(--el-text-color-secondary);
            font-size: 14px;

            &:hover {
                color: var(--el-color-primary);
            }
        }
    }

    .empty-comment {
        padding: 40px 0;
        text-align: center;
        color: var(--el-text-color-secondary);
    }
}
</style>