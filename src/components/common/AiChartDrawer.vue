<template>
    <el-drawer v-model="props.dialog" title="AI助手" direction="rtl" size="600px" @close="close"
        class="ai-assistant-drawer">
        <div class="drawer-content">
            <!-- 模型选择区域 -->
            <div class="model-selector-container">
                <div class="model-selector">
                    <el-select v-model="selectedModel" placeholder="选择模型" size="small" class="model-select"
                        popper-class="model-select-popper">
                        <el-option v-for="model in availableModels" :key="model.value" :label="model.label"
                            :value="model.value" class="model-option" />
                    </el-select>
                    <el-tooltip content="切换不同模型以获得不同体验" placement="top">
                        <el-icon class="model-tip">
                            <InfoFilled />
                        </el-icon>
                    </el-tooltip>
                </div>
            </div>

            <!-- 聊天消息区域 - 可滚动 -->
            <div class="chat-container" ref="chatContainer">
                <div v-for="(message, index) in messages" :key="index" class="message-wrapper">
                    <el-card shadow="hover"
                        :class="['message-card', message.role === 'user' ? 'user-message' : 'ai-message']">
                        <div slot="header" class="message-header">
                            <div class="message-avatar">
                                <!-- <el-avatar :size="28" :src="message.role === 'user' ? userAvatar : aiAvatar" /> -->
                                <el-icon :size="28">
                                    <ChatGpt v-if="message.role == 'assistant'" />
                                </el-icon>
                                <Avatar v-if="message.role == 'user'" />
                            </div>
                            <el-tag :type="message.role === 'user' ? 'primary' : 'success'" size="small" effect="plain"
                                class="message-sender">
                                {{ message.role === 'user' ? '你' : 'AI助手' }}
                            </el-tag>
                            <div class="message-time">{{ formatTime(message.time) }}</div>
                        </div>
                        <div class="message-content" v-html="formatMessageContent(message.content)"></div>
                    </el-card>
                </div>
                <div v-if="flag" class="message-wrapper">
                    <el-card shadow="hover" class="message-card ai-message">
                        <div slot="header" class="message-header">
                            <div class="message-avatar">
                                <el-avatar :size="28" :src="aiAvatar" />
                            </div>
                            <el-tag type="success" size="small" effect="plain" class="message-sender">
                                AI助手
                            </el-tag>
                            <div class="message-time">{{ formatTime(new Date()) }}</div>
                        </div>
                        <div class="message-content" v-html="formatMessageContent(streamingAnswer)"></div>
                    </el-card>
                </div>
            </div>

            <!-- 固定在底部的输入区域 -->
            <div class="input-area-wrapper">
                <div class="input-area">
                    <el-input v-model="question" type="textarea" :rows="3" placeholder="请输入您的问题..." resize="none"
                        class="question-input" @keyup.enter.native="send">
                        <template #append>
                            <el-button type="primary" @click="send" :loading="flag" :disabled="!question.trim()"
                                class="send-button" round>
                                <template #default>
                                    <span v-if="!flag">发送</span>
                                    <span v-else>思考中...</span>
                                </template>
                                <template #loading>
                                    <el-icon class="is-loading">
                                        <Loading />
                                    </el-icon>
                                </template>
                            </el-button>
                        </template>
                    </el-input>
                    <div class="quick-actions">
                        <el-tag v-for="(action, index) in quickActions" :key="index" class="quick-action" effect="plain"
                            @click="insertQuickAction(action)">
                            {{ action }}
                        </el-tag>
                    </div>
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<script setup lang='ts'>
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue';
import { Loading, InfoFilled } from '@element-plus/icons-vue';
import { CONSTANTS } from '@/utils';
import { marked, MarkedOptions } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import Avatar from './Avatar.vue';

// 默认头像
const userAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
const aiAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

const props = defineProps({
    dialog: {
        type: Boolean,
        required: false
    }
});

// 模型选择相关
const selectedModel = ref('wangge:deepseek-r1-7b');
const availableModels = ref([
    { value: 'wangge:deepseek-r1-7b', label: 'wangge:deepseek-r1-7b' },
    { value: 'wangge:qwen2.5-0.5b', label: 'wangge:qwen2.5-0.5b' },
    { value: 'wangge:deepseek-r1-1.5b', label: 'wangge:deepseek-r1-1.5b' },
    { value: 'qwen2.5:0.5b', label: 'qwen2.5:0.5b' },
    { value: 'deepseek-r1:8b', label: 'deepseek-r1:8b' }
]);

// 解决marked类型问题
declare module 'marked' {
    interface MarkedOptions {
        highlight?: (code: string, lang: string) => string;
        langPrefix?: string;
        breaks?: boolean;
        gfm?: boolean;
    }
}

// 配置marked和highlight.js
marked.setOptions({
    highlight: function (code: string, lang: string) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-',
    breaks: true,
    gfm: true
} as MarkedOptions);

// 快速操作
const quickActions = ref([
    '你是谁？',
    '解释这个错误是什么意思',
    '帮我优化这段代码',
    '如何实现这个功能？',
    '美化页面'
]);

const messages = ref<Array<{ role: string, content: string, time: Date }>>([
    {
        role: 'assistant',
        content: '你好！我是AI助手，请问有什么我可以帮助你的吗？',
        time: new Date()
    }
]);
const question = ref('');
const flag = ref(false);
const streamingAnswer = ref('');
const chatContainer = ref<HTMLElement | null>(null);
const autoScroll = ref(true);

const emit = defineEmits(['update:dialog']);

const close = () => {
    emit('update:dialog', false);
}

// 格式化时间
const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// 插入快速操作
const insertQuickAction = (action: string) => {
    question.value += action;
}

// 滚动到底部
const scrollToBottom = () => {
    if (!autoScroll.value) return;

    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTo({
                top: chatContainer.value.scrollHeight,
                behavior: 'smooth'
            });
        }
    });
};

// 处理滚动事件
const handleScroll = () => {
    if (!chatContainer.value) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainer.value;
    // 如果用户手动向上滚动超过200px，则暂停自动滚动
    autoScroll.value = scrollHeight - (scrollTop + clientHeight) < 200;
};

// 监听消息变化自动滚动
watch(() => messages.value, () => {
    scrollToBottom();
}, { deep: true });

// 格式化消息内容
const formatMessageContent = (content: string) => {
    const html = marked.parse(content);
    return String(html).replace(/<pre><code/g, '<pre class="code-block"><code');
};

const send = async () => {
    if (!question.value.trim() || flag.value) return;

    flag.value = true;
    messages.value.push({
        role: 'user',
        content: question.value,
        time: new Date()
    });
    scrollToBottom();

    const userQuestion = question.value;
    question.value = '';

    try {
        const token = localStorage.getItem(CONSTANTS.SYSTEM.TOKEN);
        const response = await fetch('/joker-box/ai/chat', {
            method: 'POST',
            headers: {
                'Authorization': CONSTANTS.SYSTEM.TOKEN_TYPE + ' ' + token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "model": selectedModel.value,
                "stream": true,
                "messages": messages.value,
                "options": {
                    "seed": 101,
                    "temperature": 0
                }
            })
        });

        if (!response.body) {
            throw new Error('Failed to get response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        streamingAnswer.value = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const jsonStr = line.substring(5).trim();
                    if (jsonStr === '[DONE]') {
                        messages.value.push({
                            role: 'assistant',
                            content: streamingAnswer.value,
                            time: new Date()
                        });
                        flag.value = false;
                        streamingAnswer.value = '';
                        scrollToBottom();
                        return;
                    }

                    try {
                        const data = JSON.parse(jsonStr);
                        if (data.data?.choices?.[0]?.delta?.content) {
                            const content = data.data.choices[0].delta.content;
                            for (let i = 0; i < content.length; i++) {
                                streamingAnswer.value += content[i];
                                await new Promise(resolve => setTimeout(resolve, 30));
                            }
                            scrollToBottom();
                        }
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error sending message:', error);
        flag.value = false;
        question.value = userQuestion;
        messages.value.pop();
    }
}

// 添加和移除滚动事件监听
onMounted(() => {
    if (chatContainer.value) {
        chatContainer.value.addEventListener('scroll', handleScroll);
    }
});

onUnmounted(() => {
    if (chatContainer.value) {
        chatContainer.value.removeEventListener('scroll', handleScroll);
    }
});
</script>

<style lang="scss" scoped>
.ai-assistant-drawer {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--el-bg-color-page);

    .el-drawer__header {
        margin-bottom: 0;
        padding: 16px 20px;
        border-bottom: 1px solid var(--el-border-color-light);
        background: var(--el-bg-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

        span {
            font-weight: 600;
            color: var(--el-text-color-primary);
            font-size: 18px;
        }
    }

    .el-drawer__body {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0;
        background: var(--el-bg-color-page);
    }

    .drawer-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
    }

    /* 模型选择器样式 */
    .model-selector-container {
        padding: 12px 16px;
        background: var(--el-bg-color);
        border-bottom: 1px solid var(--el-border-color-light);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .model-selector {
        display: flex;
        align-items: center;
        gap: 8px;

        .model-select {
            flex: 1;

            :deep(.el-input__inner) {
                border-radius: 18px;
                background-color: var(--el-fill-color-light);
                border-color: var(--el-border-color-light);
                font-size: 13px;
                height: 36px;
                line-height: 36px;
                padding-left: 16px;

                &:hover {
                    border-color: var(--el-color-primary-light-5);
                }

                &:focus {
                    border-color: var(--el-color-primary);
                    box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
                }
            }

            :deep(.el-input__suffix) {
                right: 8px;
            }
        }

        .model-tip {
            color: var(--el-text-color-secondary);
            cursor: pointer;
            transition: color 0.2s;

            &:hover {
                color: var(--el-color-primary);
            }
        }
    }

    .chat-container {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        background: var(--el-bg-color-page);
        scroll-behavior: smooth;
        /* 计算高度，留出输入区域的空间 */
        height: calc(100% - 180px);
        box-sizing: border-box;

        .message-wrapper {
            margin-bottom: 16px;
            transition: all 0.3s ease;

            &:last-child {
                margin-bottom: 0;
            }

            &:hover {
                transform: translateY(-2px);
            }
        }

        .message-card {
            border-radius: 12px;
            border: none;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

            &.user-message {
                background-color: var(--el-color-primary-light-9);
                margin-left: 15%;
                border-top-right-radius: 4px;

                .message-header {
                    .el-tag {
                        background-color: var(--el-color-primary-light-8);
                    }
                }
            }

            &.ai-message {
                background-color: var(--el-bg-color);
                margin-right: 15%;
                border-top-left-radius: 4px;
                border: 1px solid var(--el-border-color-light);

                .message-header {
                    .el-tag {
                        background-color: var(--el-color-success-light-8);
                    }
                }
            }

            .message-header {
                display: flex;
                align-items: center;
                padding: 8px 16px;
                border-bottom: 1px solid var(--el-border-color-lighter);

                .message-avatar {
                    margin-right: 10px;
                }

                .message-sender {
                    font-weight: 500;
                    margin-right: auto;
                }

                .message-time {
                    font-size: 12px;
                    color: var(--el-text-color-secondary);
                }
            }

            .message-content {
                padding: 16px;
                font-size: 14px;
                line-height: 1.7;
                color: var(--el-text-color-primary);

                p {
                    margin: 0.5em 0;
                }

                /* 代码块样式 */
                pre.code-block {
                    background-color: var(--el-fill-color-light);
                    border-radius: 6px;
                    padding: 12px;
                    margin: 12px 0;
                    overflow-x: auto;
                    border-left: 3px solid var(--el-color-primary);

                    code {
                        background-color: transparent;
                        padding: 0;
                        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                        font-size: 0.9em;
                        color: var(--el-text-color-primary);
                    }
                }

                /* 行内代码样式 */
                code:not(pre code) {
                    background-color: var(--el-fill-color-light);
                    padding: 2px 4px;
                    border-radius: 3px;
                    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                    font-size: 0.9em;
                    color: var(--el-color-danger);
                }
            }
        }
    }

    /* 固定在底部的输入区域 */
    .input-area-wrapper {
        position: sticky;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--el-bg-color);
        padding: 16px;
        border-top: 1px solid var(--el-border-color-light);
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
        z-index: 10;

        .input-area {
            max-width: 100%;
            margin: 0 auto;
        }

        .question-input {
            margin-bottom: 12px;
            border-radius: 12px;

            :deep(.el-textarea__inner) {
                border-radius: 12px;
                box-shadow: none;
                border: 1px solid var(--el-border-color);
                transition: all 0.3s ease;
                padding: 12px 16px;
                font-size: 14px;
                line-height: 1.5;

                &:focus {
                    border-color: var(--el-color-primary);
                    box-shadow: 0 0 0 2px var(--el-color-primary-light-5);
                }
            }

            :deep(.el-input-group__append) {
                background: transparent;
                border: none;
                padding: 0 12px;
            }
        }

        .quick-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;

            .quick-action {
                cursor: pointer;
                transition: all 0.2s ease;
                border-radius: 12px;
                padding: 4px 12px;
                font-size: 12px;

                &:hover {
                    background-color: var(--el-color-primary-light-9);
                    color: var(--el-color-primary);
                    transform: translateY(-2px);
                }
            }
        }

        .send-button {
            height: 40px;
            padding: 0 20px;
            font-weight: 500;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }

            &:active {
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
        }
    }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .ai-assistant-drawer {
        .model-selector {
            .model-select {
                :deep(.el-input__inner) {
                    background-color: var(--el-fill-color-dark);
                }
            }
        }

        .message-content {
            pre.code-block {
                background-color: var(--el-fill-color-dark);
                border-left-color: var(--el-color-primary-light-3);

                code {
                    color: var(--el-text-color-primary);
                }
            }

            code:not(pre code) {
                background-color: var(--el-fill-color-dark);
                color: var(--el-color-danger-light-3);
            }
        }

        .input-area-wrapper {
            background: var(--el-bg-color);
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);

            .quick-actions {
                .quick-action {
                    &:hover {
                        background-color: var(--el-color-primary-dark-2);
                    }
                }
            }
        }
    }
}

/* 下拉框选项样式 */
:deep(.model-select-popper) {
    .el-select-dropdown__item {
        padding: 8px 16px;
        border-radius: 6px;
        margin: 4px;
        transition: all 0.2s;

        &.selected {
            font-weight: 500;
            background-color: var(--el-color-primary-light-9);
            color: var(--el-color-primary);
        }

        &:hover {
            background-color: var(--el-color-primary-light-8);
        }
    }

    .el-select-dropdown__empty {
        padding: 8px 0;
        color: var(--el-text-color-secondary);
    }
}
</style>