<template>
    <div class="post-add-container">
        <!-- 标题输入区 -->
        <div class="title-section">
            <div class="input-wrapper">
                <el-icon class="input-icon"><Edit /></el-icon>
                <el-input 
                    v-model="info.title" 
                    type="text" 
                    placeholder="请输入帖子标题，让更多人看到..." 
                    :maxlength="50" 
                    class="title-input"
                    size="large">
                    <template #suffix>
                        <span class="char-count">{{ info.title.length }}/50</span>
                    </template>
                </el-input>
            </div>
        </div>

        <!-- 内容编辑区 -->
        <div class="editor-section">
            <div class="editor-header">
                <el-icon><Document /></el-icon>
                <span>内容编辑</span>
            </div>
            <TiptapEditor 
                v-model="info.content" 
                @textChange="(value) => { info.text = value }" 
                class="content-editor" />
        </div>

        <!-- 操作按钮区 -->
        <div class="action-section">
            <div class="action-left">
                <span class="tip-text">
                    <el-icon><InfoFilled /></el-icon>
                    请文明发言，遵守社区规范
                </span>
            </div>
            <div class="action-right">
                <el-button @click="emit('success')" class="cancel-btn">
                    <el-icon><Close /></el-icon>
                    取消
                </el-button>
                <el-button type="primary" @click="push" class="submit-btn" :disabled="!isValid">
                    <el-icon><Promotion /></el-icon>
                    发布帖子
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import TiptapEditor from '@/components/editor/TiptapEditor.vue';
import { alert, http } from '@/utils';
import { ref, computed } from 'vue';
import { Edit, Document, InfoFilled, Close, Promotion } from '@element-plus/icons-vue';

const emit = defineEmits(['success'])

const info = ref({
    id: '',
    title: '',
    content: '',
    text: '',
    createBy: '',
    createTime: '',
})

// 验证表单是否有效
const isValid = computed(() => {
    return info.value.title.trim().length > 0 && info.value.content.trim().length > 0
})

const push = () => {
    if (!info.value.title.trim()) {
        alert('请输入标题', 'warning')
        return
    }
    if (!info.value.content.trim()) {
        alert('请输入内容', 'warning')
        return
    }
    
    http.result({
        url: '/ganDaShiPost/add',
        method: 'POST',
        data: info.value,
        success(result) {
            alert('发帖成功', 'success')
            emit('success')
        }
    })
}
</script>

<style scoped lang="scss">
.post-add-container {
    padding: 24px;
    background: var(--el-bg-color);

    // 标题输入区
    .title-section {
        margin-bottom: 24px;

        .input-wrapper {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: var(--el-fill-color-light);
            border-radius: 12px;
            border: 2px solid var(--el-border-color-lighter);
            transition: all 0.3s ease;

            &:focus-within {
                border-color: #667eea;
                background: var(--el-bg-color);
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .input-icon {
                font-size: 20px;
                color: var(--el-text-color-secondary);
            }

            .title-input {
                flex: 1;

                :deep(.el-input__inner) {
                    border: none;
                    background: transparent;
                    font-size: 16px;
                    font-weight: 500;
                    padding: 0;

                    &::placeholder {
                        color: var(--el-text-color-placeholder);
                    }
                }

                :deep(.el-input__suffix) {
                    .char-count {
                        font-size: 12px;
                        color: var(--el-text-color-secondary);
                    }
                }
            }
        }
    }

    // 编辑器区域
    .editor-section {
        margin-bottom: 24px;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--el-border-color-lighter);

        .editor-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 14px;
            font-weight: 500;

            .el-icon {
                font-size: 16px;
            }
        }

        .content-editor {
            min-height: 350px;
            border: none;
            border-radius: 0;

            :deep(.ProseMirror) {
                padding: 16px;
                min-height: 350px;
            }
        }
    }

    // 操作按钮区
    .action-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--el-border-color-lighter);

        .action-left {
            .tip-text {
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
        }

        .action-right {
            display: flex;
            gap: 12px;

            .cancel-btn {
                height: 44px;
                padding: 0 24px;
                border-radius: 10px;
                font-size: 14px;

                .el-icon {
                    margin-right: 6px;
                }
            }

            .submit-btn {
                height: 44px;
                padding: 0 28px;
                border-radius: 10px;
                font-size: 15px;
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
                    cursor: not-allowed;
                }

                .el-icon {
                    margin-right: 6px;
                }
            }
        }
    }
}

// 响应式适配
@media (max-width: 768px) {
    .post-add-container {
        padding: 16px;

        .action-section {
            flex-direction: column;

            .action-right {
                width: 100%;

                .cancel-btn,
                .submit-btn {
                    flex: 1;
                }
            }
        }
    }
}
</style>
