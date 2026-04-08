<template>
    <!-- 主评论 -->
    <div class="comment-item">
        <div class="comment-header">
            <span class="comment-author">{{ mainComment.createByName }}</span>
        </div>
        <div class="comment-content">
            {{ mainComment.comment }}
        </div>
        <div class="comment-footer">
            <span class="comment-time">{{ formatTime(mainComment.createTime) }}</span>
            <el-button type="text" size="small" class="reply-btn" @click="openReplyDialog(mainComment)">
                <el-icon>
                    <ChatDotRound />
                </el-icon>
                <span>回复</span>
            </el-button>
        </div>

        <!-- 回复列表容器 -->
        <div class="reply-container">
            <!-- 顶部展开按钮 -->
            <div v-if="commmentAll.pageInfo.total > 0" class="reply-toggle top-toggle">
                <el-button type="text" size="small" @click="toggleReplies" :loading="loading" class="toggle-btn">
                    <el-icon :class="{ 'rotate-icon': open }">
                        <ArrowRight />
                    </el-icon>
                    <span>{{ open ? '收起回复' : `展开回复(${commmentAll.pageInfo.total})` }}</span>
                </el-button>
            </div>

            <!-- 回复列表 -->
            <div v-if="open" class="reply-list">
                <!-- 回复项 -->
                <div v-for="(item, index) in commmentAll.list" :key="index" class="reply-item">
                    <div class="reply-header">
                        <span class="reply-author">{{ item.createByName }}
                            <span v-if="item.replayName" class="reply-target">回复 {{ item.replayName }}</span>
                        </span>
                    </div>
                    <div class="reply-content">
                        {{ item.comment }}
                    </div>
                    <div class="reply-footer">
                        <span class="reply-time">{{ formatTime(item.createTime) }}</span>
                        <el-button type="text" size="small" class="reply-btn" @click="openReplyDialog(item)">
                            <el-icon>
                                <ChatDotRound />
                            </el-icon>
                            <span>回复</span>
                        </el-button>
                    </div>
                </div>

                <!-- 底部控制栏（加载更多 + 收起） -->
                <div class="reply-control-bar">
                    <el-button v-if="hasNextPageTag" type="text" size="small" @click="queryComment" :loading="loading"
                        class="load-btn">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                        <span>{{ loading ? '加载中...' : '加载更多' }}</span>
                    </el-button>

                    <el-button type="text" size="small" @click="toggleReplies" class="toggle-btn">
                        <el-icon class="rotate-icon">
                            <ArrowRight />
                        </el-icon>
                        <span>收起回复</span>
                    </el-button>
                </div>
            </div>
        </div>
    </div>

    <!-- 回复弹窗 -->
    <el-dialog v-model="replayInfoDialog" :title="`回复 ${replyTargetName}`" width="500px" class="reply-dialog">
        <div class="dialog-content">
            <el-input v-model="replayInfo.comment" type="textarea" :rows="4" resize="none" placeholder="写下你的回复..."
                class="reply-textarea" />
            <div class="dialog-footer">
                <el-button @click="replayInfoDialog = false">取消</el-button>
                <el-button type="primary" @click="addComment" :disabled="!replayInfo.comment.trim()">
                    提交
                </el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ArrowRight, Refresh, ChatDotRound } from '@element-plus/icons-vue'
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
    queryComment()
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
.comment-item {
    margin-bottom: 16px;
    padding: 16px;
    background-color: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
}

.comment-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .comment-author {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
    }
}

.comment-content {
    font-size: 14px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    margin-bottom: 12px;
    word-break: break-word;
}

.comment-footer {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    .comment-time {
        margin-right: 16px;
        color: var(--el-text-color-placeholder);
    }

    .reply-btn {
        padding: 0;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        display: flex;
        align-items: center;

        &:hover {
            color: var(--el-color-primary);
        }

        .el-icon {
            margin-right: 4px;
            font-size: 14px;
        }
    }
}

.reply-container {
    margin-top: 12px;
    border-left: 2px solid var(--el-border-color-light);
    padding-left: 16px;

    .reply-toggle {
        margin-bottom: 8px;

        .toggle-btn {
            padding: 0;
            color: var(--el-text-color-secondary);
            font-size: 12px;
            display: flex;
            align-items: center;

            &:hover {
                color: var(--el-color-primary);
            }

            .el-icon {
                margin-right: 6px;
                transition: transform 0.3s;
                font-size: 12px;
            }
        }
    }
}

.rotate-icon {
    transform: rotate(90deg);
}

.reply-list {
    margin-top: 8px;

    .reply-item {
        padding: 12px 0;
        border-bottom: 1px dashed var(--el-border-color-lighter);

        &:last-child {
            border-bottom: none;
        }

        .reply-header {
            margin-bottom: 6px;

            .reply-author {
                font-size: 13px;
                font-weight: 600;
                color: var(--el-text-color-primary);
            }

            .reply-target {
                font-weight: normal;
                color: var(--el-text-color-secondary);
                margin-left: 4px;
            }
        }

        .reply-content {
            font-size: 13px;
            line-height: 1.5;
            color: var(--el-text-color-regular);
            margin-bottom: 8px;
            word-break: break-word;
        }

        .reply-footer {
            display: flex;
            align-items: center;
            font-size: 11px;
            color: var(--el-text-color-secondary);

            .reply-time {
                margin-right: 16px;
                color: var(--el-text-color-placeholder);
            }

            .reply-btn {
                padding: 0;
                font-size: 12px;
                color: var(--el-text-color-secondary);
                display: flex;
                align-items: center;

                &:hover {
                    color: var(--el-color-primary);
                }

                .el-icon {
                    margin-right: 4px;
                    font-size: 14px;
                }
            }
        }
    }

    .reply-control-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px dashed var(--el-border-color-lighter);

        .load-btn,
        .toggle-btn {
            padding: 0;
            color: var(--el-text-color-secondary);
            font-size: 12px;
            display: flex;
            align-items: center;

            &:hover {
                color: var(--el-color-primary);
            }

            .el-icon {
                margin-right: 6px;
                font-size: 12px;
            }
        }
    }
}

/* 回复弹窗样式 */
.reply-dialog {
    :deep(.el-dialog__header) {
        border-bottom: 1px solid var(--el-border-color-light);
        padding-bottom: 12px;
        margin-bottom: 16px;
    }

    :deep(.el-dialog__title) {
        font-size: 16px;
        font-weight: 600;
    }

    .dialog-content {
        padding: 0 16px;

        .reply-textarea {
            :deep(.el-textarea__inner) {
                border-radius: 6px;
                padding: 12px;
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 16px;
                resize: none;
                box-shadow: none;

                &:focus {
                    border-color: var(--el-color-primary);
                }
            }
        }

        .dialog-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;

            .el-button {
                min-width: 80px;
            }
        }
    }
}
</style>