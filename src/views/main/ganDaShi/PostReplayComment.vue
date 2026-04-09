<template>
    <!-- 主评论 -->
    <div class="comment-card">
        <div class="comment-main">
            <div class="comment-header">
                <div class="author-info">
                    <div class="author-avatar" :style="{ background: getAvatarColor(mainComment.createByName) }">
                        {{ mainComment.createByName ? mainComment.createByName.charAt(0).toUpperCase() : '?' }}
                    </div>
                    <span class="author-name">{{ mainComment.createByName }}</span>
                </div>
                <span class="comment-time">{{ formatTime(mainComment.createTime) }}</span>
            </div>
            <div class="comment-content">
                {{ mainComment.comment }}
            </div>
            <div class="comment-actions">
                <el-button type="primary" link size="small" class="reply-btn" @click="openReplyDialog(mainComment)">
                    <el-icon><ChatDotRound /></el-icon>
                    <span>回复</span>
                </el-button>
            </div>
        </div>

        <!-- 回复列表容器 -->
        <div class="reply-section" v-if="commmentAll.pageInfo.total > 0">
            <!-- 展开/收起按钮 -->
            <div class="reply-toggle">
                <el-button type="primary" link size="small" @click="toggleReplies" :loading="loading" class="toggle-btn">
                    <el-icon :class="{ 'rotate-icon': open }"><ArrowRight /></el-icon>
                    <span>{{ open ? '收起回复' : `展开 ${commmentAll.pageInfo.total} 条回复` }}</span>
                </el-button>
            </div>

            <!-- 回复列表 -->
            <div v-if="open" class="reply-list">
                <div v-for="(item, index) in commmentAll.list" :key="index" class="reply-item">
                    <div class="reply-header">
                        <div class="author-info">
                            <div class="author-avatar small" :style="{ background: getAvatarColor(item.createByName) }">
                                {{ item.createByName ? item.createByName.charAt(0).toUpperCase() : '?' }}
                            </div>
                            <span class="author-name">{{ item.createByName }}</span>
                            <span v-if="item.replayName" class="reply-to">
                                <el-icon><Right /></el-icon>
                                <span class="target-name">{{ item.replayName }}</span>
                            </span>
                        </div>
                        <span class="reply-time">{{ formatTime(item.createTime) }}</span>
                    </div>
                    <div class="reply-content">
                        {{ item.comment }}
                    </div>
                    <div class="reply-actions">
                        <el-button type="primary" link size="small" class="reply-btn" @click="openReplyDialog(item)">
                            <el-icon><ChatDotRound /></el-icon>
                            <span>回复</span>
                        </el-button>
                    </div>
                </div>

                <!-- 底部控制栏 -->
                <div class="reply-footer-bar">
                    <el-button v-if="hasNextPageTag" type="primary" link size="small" @click="queryComment" :loading="loading" class="load-btn">
                        <el-icon><Refresh /></el-icon>
                        <span>{{ loading ? '加载中...' : '加载更多' }}</span>
                    </el-button>
                    <el-button type="info" link size="small" @click="toggleReplies" class="collapse-btn">
                        <el-icon><ArrowUp /></el-icon>
                        <span>收起</span>
                    </el-button>
                </div>
            </div>
        </div>
    </div>

    <!-- 回复弹窗 -->
    <el-dialog v-model="replayInfoDialog" :title="`回复 ${replyTargetName}`" width="500px" class="reply-dialog" destroy-on-close>
        <div class="reply-dialog-content">
            <div class="reply-target-info">
                <el-icon><ChatLineRound /></el-icon>
                <span>正在回复 <strong>{{ replyTargetName }}</strong></span>
            </div>
            <el-input 
                v-model="replayInfo.comment" 
                type="textarea" 
                :rows="4" 
                resize="none" 
                placeholder="写下你的回复..."
                maxlength="300"
                show-word-limit
                class="reply-textarea" />
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="replayInfoDialog = false">取消</el-button>
                <el-button type="primary" @click="addComment" :disabled="!replayInfo.comment.trim()" class="submit-btn">
                    <el-icon><Promotion /></el-icon>
                    提交回复
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ArrowRight, ArrowUp, Refresh, ChatDotRound, Right, ChatLineRound, Promotion } from '@element-plus/icons-vue'
import { http, alert } from '@/utils'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
    postId: {
        type: String,
        required: true
    },
    parentId: {
        type: String,
        required: true
    },
    replayCount: {
        type: Number,
        default: 0
    },
    mainComment: {
        type: Object,
        default: () => ({})
    }
})

const open = ref(false)
const loading = ref(false)
const replayInfoDialog = ref(false)
const replyTargetName = ref('')

const commmentAll = ref({
    pageInfo: {
        pageCurrent: 0,
        pageSize: 3,
        total: 0
    },
    list: []
})

const hasNextPageTag = ref(false)

const replayInfo = ref({
    postId: props.postId,
    parentId: props.parentId,
    replayId: props.parentId,
    replayName: null,
    comment: ''
})

// 获取头像颜色
const getAvatarColor = (name) => {
    if (!name) return '#909399'
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a']
    const index = name ? name.charCodeAt(0) % colors.length : 0
    return colors[index]
}

// 打开回复对话框
const openReplyDialog = (comment) => {
    replayInfo.value.replayId = comment.id
    replayInfo.value.replayName = comment.createByName
    replyTargetName.value = comment.createByName
    replayInfoDialog.value = true
}

// 格式化时间
const formatTime = (time) => {
    if (!time) return '';

    const now = new Date();
    const date = new Date(time);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60 * 3) return '刚刚';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (date.toDateString() === now.toDateString()) return `${hours}:${minutes}`;
    if (year === now.getFullYear()) return `${month}月${day}日`;
    return `${year}年${month}月${day}日`;
}

// 切换展开/收起状态
const toggleReplies = () => {
    if (open.value) {
        commmentAll.value.list = []
        commmentAll.value.pageInfo.pageCurrent = 0
        hasNextPageTag.value = false
    } else {
        queryComment()
    }
    open.value = !open.value
}

// 检查是否有下一页
const hasNextPage = () => {
    if (commmentAll.value.pageInfo.total === 0) {
        hasNextPageTag.value = false
        return
    }
    const totalPages = Math.ceil(commmentAll.value.pageInfo.total / commmentAll.value.pageInfo.pageSize)
    hasNextPageTag.value = commmentAll.value.pageInfo.pageCurrent < totalPages
}

// 查询回复列表
const queryComment = () => {
    if (loading.value) return

    loading.value = true
    commmentAll.value.pageInfo.pageCurrent++

    http.result({
        url: '/ganDaShiComment/queryPage',
        method: 'POST',
        data: {
            postId: props.postId,
            parentId: props.parentId,
            current: commmentAll.value.pageInfo.pageCurrent,
            size: commmentAll.value.pageInfo.pageSize
        },
        success(result) {
            commmentAll.value.list = [...commmentAll.value.list, ...result.data.records]
            commmentAll.value.pageInfo.total = result.data.total
            hasNextPage()
            loading.value = false
            open.value = true
        }
    })
}

// 添加评论
const addComment = () => {
    http.result({
        url: '/ganDaShiComment/add',
        method: 'POST',
        data: {
            postId: replayInfo.value.postId,
            comment: replayInfo.value.comment,
            parentId: replayInfo.value.parentId,
            replayId: replayInfo.value.replayId,
        },
        success(result) {
            alert('评论成功', 'success')
            commmentAll.value.list.push(result.data)
            replayInfo.value.comment = ''
            replayInfo.value.parentId = props.parentId
            replayInfo.value.replayId = props.parentId
            replayInfoDialog.value = false
            commmentAll.value.pageInfo.total++
        }
    })
}

// 初始化
onMounted(() => {
    commmentAll.value.pageInfo.total = props.replayCount
    hasNextPage()
})

// 监听回复数量变化
watch(() => props.replayCount, (newVal) => {
    commmentAll.value.pageInfo.total = newVal
    hasNextPage()
})
</script>

<style scoped lang="scss">
.comment-card {
    background: var(--el-bg-color);
    border-radius: 12px;
    padding: 20px;
    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--el-border-color-lighter);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
    }

    .comment-main {
        .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .author-info {
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

                    &.small {
                        width: 28px;
                        height: 28px;
                        font-size: 12px;
                    }
                }

                .author-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--el-text-color-primary);
                }
            }

            .comment-time {
                font-size: 13px;
                color: var(--el-text-color-secondary);
            }
        }

        .comment-content {
            font-size: 15px;
            line-height: 1.7;
            color: var(--el-text-color-regular);
            margin-bottom: 12px;
            word-break: break-word;
        }

        .comment-actions {
            .reply-btn {
                font-size: 13px;
                padding: 0;

                .el-icon {
                    margin-right: 4px;
                    font-size: 14px;
                }
            }
        }
    }

    // 回复区域
    .reply-section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px dashed var(--el-border-color-lighter);

        .reply-toggle {
            margin-bottom: 12px;

            .toggle-btn {
                font-size: 13px;
                padding: 0;

                .el-icon {
                    margin-right: 6px;
                    transition: transform 0.3s ease;
                    font-size: 14px;
                }
            }
        }

        .reply-list {
            background: var(--el-fill-color-light);
            border-radius: 10px;
            padding: 16px;

            .reply-item {
                padding: 12px 0;
                border-bottom: 1px solid var(--el-border-color-lighter);

                &:last-child {
                    border-bottom: none;
                }

                &:first-child {
                    padding-top: 0;
                }

                .reply-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;

                    .author-info {
                        display: flex;
                        align-items: center;
                        gap: 8px;

                        .author-name {
                            font-size: 14px;
                            font-weight: 600;
                            color: var(--el-text-color-primary);
                        }

                        .reply-to {
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            font-size: 13px;
                            color: var(--el-text-color-secondary);

                            .el-icon {
                                font-size: 12px;
                            }

                            .target-name {
                                color: var(--el-color-primary);
                                font-weight: 500;
                            }
                        }
                    }

                    .reply-time {
                        font-size: 12px;
                        color: var(--el-text-color-placeholder);
                    }
                }

                .reply-content {
                    font-size: 14px;
                    line-height: 1.6;
                    color: var(--el-text-color-regular);
                    margin-bottom: 8px;
                    padding-left: 36px;
                    word-break: break-word;
                }

                .reply-actions {
                    padding-left: 36px;

                    .reply-btn {
                        font-size: 12px;
                        padding: 0;

                        .el-icon {
                            margin-right: 4px;
                            font-size: 12px;
                        }
                    }
                }
            }

            .reply-footer-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px dashed var(--el-border-color-lighter);

                .load-btn,
                .collapse-btn {
                    font-size: 13px;
                    padding: 0;

                    .el-icon {
                        margin-right: 4px;
                    }
                }
            }
        }
    }
}

.rotate-icon {
    transform: rotate(90deg);
}

// 回复弹窗样式
.reply-dialog {
    :deep(.el-dialog__header) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0;
        padding: 16px 20px;

        .el-dialog__title {
            color: white;
            font-size: 16px;
            font-weight: 600;
        }

        .el-dialog__headerbtn .el-dialog__close {
            color: white;
        }
    }

    :deep(.el-dialog__body) {
        padding: 20px;
    }

    :deep(.el-dialog__footer) {
        padding: 16px 20px;
        border-top: 1px solid var(--el-border-color-lighter);
    }

    .reply-dialog-content {
        .reply-target-info {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px;
            background: var(--el-color-primary-light-9);
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 14px;
            color: var(--el-text-color-regular);

            .el-icon {
                font-size: 16px;
                color: var(--el-color-primary);
            }

            strong {
                color: var(--el-color-primary);
            }
        }

        .reply-textarea {
            :deep(.el-textarea__inner) {
                border-radius: 10px;
                padding: 14px;
                font-size: 14px;
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

    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;

        .submit-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;

            &:hover:not(:disabled) {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .el-icon {
                margin-right: 4px;
            }
        }
    }
}
</style>
