<template>
    <div class="post-view-page">
        <div class="post-detail-container">
            <!-- 帖子头部 -->
            <div class="post-header-section">
                <h1 class="post-title">{{ info.title }}</h1>
                <div class="post-meta">
                    <div class="meta-author">
                        <div class="author-avatar" :style="{ background: getAvatarColor(info.createByName) }">
                            {{ info.createByName ? info.createByName.charAt(0).toUpperCase() : '?' }}
                        </div>
                        <el-link :href="'/ganDaShi/' + info.createUsername" target="_blank" class="author-link">
                            {{ info.createByName }}
                        </el-link>
                    </div>
                    <div class="meta-divider"></div>
                    <div class="meta-time">
                        <el-icon><Clock /></el-icon>
                        <span>{{ formatFullTime(info.createTime) }}</span>
                    </div>
                    <div class="meta-views">
                        <el-icon><View /></el-icon>
                        <span>{{ info.viewCount || 0 }} 阅读</span>
                    </div>
                </div>
            </div>

            <!-- 帖子内容 -->
            <div class="post-content-section">
                <TiptapEditor v-model="info.content" :onlyRead="true" class="post-editor" />
            </div>

            <!-- 评论区 -->
            <div class="comment-section">
                <div class="comment-header">
                    <div class="comment-title">
                        <div class="title-icon">
                            <el-icon><ChatDotRound /></el-icon>
                        </div>
                        <span>哔哔区</span>
                        <span class="comment-count">{{ commmentAll.pageInfo.total }} 条评论</span>
                    </div>
                </div>

                <!-- 评论输入框 -->
                <div class="comment-input-area">
                    <div class="input-wrapper">
                        <el-input 
                            v-model="mainComment.comment" 
                            type="textarea" 
                            :rows="3" 
                            resize="none" 
                            placeholder="发表你的看法，参与讨论..."
                            maxlength="300"
                            show-word-limit
                            class="comment-textarea" />
                    </div>
                    <div class="input-actions">
                        <span class="input-tip">
                            <el-icon><InfoFilled /></el-icon>
                            文明发言，友善互动
                        </span>
                        <el-button 
                            type="primary" 
                            class="submit-comment-btn" 
                            @click="addComment"
                            :disabled="!mainComment.comment.trim()" 
                            :loading="commentLoading">
                            <el-icon><Promotion /></el-icon>
                            发表评论
                        </el-button>
                    </div>
                </div>

                <!-- 评论列表 -->
                <div class="comment-list">
                    <div v-for="(item, index) in commmentAll.list" :key="index" class="comment-item-wrapper">
                        <PostReplayComment 
                            :mainComment="item" 
                            :postId="item.postId" 
                            :parentId="item.id"
                            :replayCount="item.replayCount" />
                    </div>

                    <!-- 加载更多 -->
                    <div v-if="hasNextPageTag" class="load-more-wrapper">
                        <el-button 
                            type="primary" 
                            plain 
                            :loading="loading" 
                            @click="queryComment"
                            class="load-more-btn">
                            <el-icon><ArrowDown /></el-icon>
                            <span v-if="!loading">加载更多评论</span>
                            <span v-else>加载中...</span>
                        </el-button>
                    </div>

                    <!-- 空状态 -->
                    <div v-if="commmentAll.list.length === 0" class="empty-comment">
                        <div class="empty-icon">
                            <el-icon><ChatLineRound /></el-icon>
                        </div>
                        <h3>暂无评论</h3>
                        <p>快来抢沙发，发表第一条评论吧！</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import TiptapEditor from '@/components/editor/TiptapEditor.vue';
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';
import { Clock, View, ChatDotRound, ArrowDown, Promotion, InfoFilled, ChatLineRound } from '@element-plus/icons-vue'
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
    viewCount: 0,
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

// 获取头像颜色
const getAvatarColor = (name) => {
    if (!name) return '#909399'
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a']
    const index = name ? name.charCodeAt(0) % colors.length : 0
    return colors[index]
}

// 格式化完整时间
const formatFullTime = (time) => {
    if (!time) return '';
    const date = new Date(time);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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
.post-view-page {
    min-height: calc(100vh - 60px);
    background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);
    padding: 32px 24px;

    .post-detail-container {
        max-width: 900px;
        margin: 0 auto;
        background: var(--el-bg-color);
        border-radius: 16px;
        box-shadow: var(--el-box-shadow-light);
        overflow: hidden;

        // 帖子头部
        .post-header-section {
            padding: 32px;
            border-bottom: 1px solid var(--el-border-color-lighter);

            .post-title {
                margin: 0 0 20px 0;
                font-size: 26px;
                font-weight: 600;
                color: var(--el-text-color-primary);
                line-height: 1.4;
                word-break: break-word;
            }

            .post-meta {
                display: flex;
                align-items: center;
                gap: 16px;
                flex-wrap: wrap;

                .meta-author {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    .author-avatar {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        font-weight: 600;
                        color: white;
                    }

                    .author-link {
                        font-size: 15px;
                        font-weight: 500;
                    }
                }

                .meta-divider {
                    width: 1px;
                    height: 16px;
                    background: var(--el-border-color);
                }

                .meta-time,
                .meta-views {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    color: var(--el-text-color-secondary);

                    .el-icon {
                        font-size: 16px;
                    }
                }
            }
        }

        // 帖子内容
        .post-content-section {
            padding: 32px;
            border-bottom: 1px solid var(--el-border-color-lighter);

            .post-editor {
                border: none;
                background: transparent;

                :deep(.ProseMirror) {
                    padding: 0;
                }
            }
        }

        // 评论区
        .comment-section {
            padding: 32px;
            background: var(--el-fill-color-light);

            .comment-header {
                margin-bottom: 24px;

                .comment-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    .title-icon {
                        width: 40px;
                        height: 40px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                        font-size: 20px;
                        font-weight: 600;
                        color: var(--el-text-color-primary);
                    }

                    .comment-count {
                        font-size: 14px;
                        font-weight: normal;
                        color: var(--el-text-color-secondary);
                        background: var(--el-bg-color);
                        padding: 4px 12px;
                        border-radius: 20px;
                        margin-left: 8px;
                    }
                }
            }

            // 评论输入区
            .comment-input-area {
                background: var(--el-bg-color);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
                box-shadow: var(--el-box-shadow-light);

                .input-wrapper {
                    margin-bottom: 16px;

                    .comment-textarea {
                        :deep(.el-textarea__inner) {
                            border-radius: 10px;
                            padding: 16px;
                            font-size: 15px;
                            line-height: 1.6;
                            background: var(--el-fill-color-light);
                            border-color: var(--el-border-color-lighter);
                            transition: all 0.3s;

                            &:focus {
                                border-color: #667eea;
                                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                                background: var(--el-bg-color);
                            }
                        }

                        :deep(.el-input__count) {
                            background: transparent;
                        }
                    }
                }

                .input-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;

                    .input-tip {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-size: 13px;
                        color: var(--el-text-color-secondary);

                        .el-icon {
                            font-size: 14px;
                            color: var(--el-color-info);
                        }
                    }

                    .submit-comment-btn {
                        height: 42px;
                        padding: 0 24px;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 500;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        transition: all 0.3s ease;

                        &:hover:not(:disabled) {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
                        }

                        &:disabled {
                            opacity: 0.6;
                        }

                        .el-icon {
                            margin-right: 6px;
                        }
                    }
                }
            }

            // 评论列表
            .comment-list {
                .comment-item-wrapper {
                    margin-bottom: 16px;
                }

                .load-more-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-top: 24px;

                    .load-more-btn {
                        height: 44px;
                        padding: 0 32px;
                        border-radius: 10px;
                        font-size: 14px;
                        border-color: #667eea;
                        color: #667eea;

                        &:hover {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-color: transparent;
                            color: white;
                        }

                        .el-icon {
                            margin-right: 6px;
                        }
                    }
                }

                .empty-comment {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 24px;
                    background: var(--el-bg-color);
                    border-radius: 12px;
                    box-shadow: var(--el-box-shadow-light);

                    .empty-icon {
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 20px;

                        .el-icon {
                            font-size: 40px;
                            color: #667eea;
                        }
                    }

                    h3 {
                        margin: 0 0 8px 0;
                        font-size: 18px;
                        color: var(--el-text-color-primary);
                    }

                    p {
                        margin: 0;
                        font-size: 14px;
                        color: var(--el-text-color-secondary);
                    }
                }
            }
        }
    }
}

// 响应式适配
@media (max-width: 768px) {
    .post-view-page {
        padding: 16px;

        .post-detail-container {
            .post-header-section {
                padding: 20px;

                .post-title {
                    font-size: 20px;
                }
            }

            .post-content-section {
                padding: 20px;
            }

            .comment-section {
                padding: 20px;

                .comment-input-area {
                    .input-actions {
                        flex-direction: column;

                        .submit-comment-btn {
                            width: 100%;
                        }
                    }
                }
            }
        }
    }
}
</style>
