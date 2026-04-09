<template>
    <el-drawer v-model="props.dialog" title="AI助手" direction="rtl" size="600px" @close="close"
        class="ai-assistant-drawer">
        <div class="drawer-content">
            <!-- 头部区域 - 模型选择 -->
            <div class="drawer-header">
                <div class="header-title">
                    <div class="ai-icon">
                        <el-icon><ChatDotRound /></el-icon>
                    </div>
                    <div class="title-text">
                        <span class="main-title">AI 助手</span>
                        <span class="sub-title">智能对话</span>
                    </div>
                </div>
                <div class="model-selector">
                    <el-select v-model="selectedModel" placeholder="选择模型" size="small" class="model-select"
                        popper-class="model-select-popper">
                        <el-option v-for="model in availableModels" :key="model.value" :label="model.label"
                            :value="model.value" class="model-option" />
                    </el-select>
                    <el-tooltip content="切换不同模型以获得不同体验" placement="top">
                        <div class="model-tip">
                            <el-icon><InfoFilled /></el-icon>
                        </div>
                    </el-tooltip>
                </div>
            </div>

            <!-- 聊天消息区域 - 可滚动 -->
            <div class="chat-container" ref="chatContainer">
                <!-- 欢迎消息 -->
                <div v-if="messages.length === 1" class="welcome-section">
                    <div class="welcome-icon">
                        <el-icon><Cpu /></el-icon>
                    </div>
                    <h3 class="welcome-title">有什么可以帮您的？</h3>
                    <p class="welcome-desc">我可以帮您解答问题、优化代码、美化页面等</p>
                </div>

                <div v-for="(message, index) in messages" :key="index" class="message-wrapper"
                    :class="message.role">
                    <div class="message-avatar">
                        <div class="avatar-bg" :class="message.role">
                            <el-icon v-if="message.role === 'assistant'"><ChatDotRound /></el-icon>
                            <Avatar v-else />
                        </div>
                    </div>
                    <div class="message-content-wrapper">
                        <div class="message-header">
                            <span class="sender-name">{{ message.role === 'user' ? '你' : 'AI助手' }}</span>
                            <span class="message-time">{{ formatTime(message.time) }}</span>
                        </div>
                        <div class="message-bubble" :class="message.role">
                            <div class="message-text" v-html="formatMessageContent(message.content)"></div>
                        </div>
                    </div>
                </div>

                <!-- 流式输出中 -->
                <div v-if="flag" class="message-wrapper assistant">
                    <div class="message-avatar">
                        <div class="avatar-bg assistant">
                            <el-icon><ChatDotRound /></el-icon>
                        </div>
                    </div>
                    <div class="message-content-wrapper">
                        <div class="message-header">
                            <span class="sender-name">AI助手</span>
                            <span class="message-time">{{ formatTime(new Date()) }}</span>
                        </div>
                        <div class="message-bubble assistant">
                            <div class="message-text" v-html="formatMessageContent(streamingAnswer)"></div>
                            <div class="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 固定在底部的输入区域 -->
            <div class="input-area-wrapper">
                <div class="quick-actions">
                    <div v-for="(action, index) in quickActions" :key="index" class="quick-action"
                        @click="insertQuickAction(action)">
                        <el-icon><Pointer /></el-icon>
                        <span>{{ action }}</span>
                    </div>
                </div>
                <div class="input-area">
                    <div class="input-wrapper">
                        <el-input v-model="question" type="textarea" :rows="2" placeholder="输入您的问题，按 Enter 发送..."
                            resize="none" class="question-input" @keyup.enter.native="send">
                        </el-input>
                        <el-button type="primary" @click="send" :loading="flag" :disabled="!question.trim()"
                            class="send-button" circle>
                            <el-icon v-if="!flag"><Promotion /></el-icon>
                            <el-icon v-else class="is-loading"><Loading /></el-icon>
                        </el-button>
                    </div>
                    <div class="input-footer">
                        <span class="hint-text">Enter 发送，Shift + Enter 换行</span>
                    </div>
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<script setup lang='ts'>
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue';
import { Loading, InfoFilled, ChatDotRound, Cpu, Pointer, Promotion } from '@element-plus/icons-vue';
import { CONSTANTS } from '@/utils';
import { marked, MarkedOptions } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import Avatar from './Avatar.vue';

const props = defineProps({
    dialog: {
        type: Boolean,
        required: false
    }
});

// 模型选择相关
const selectedModel = ref('wangge:deepseek-r1-7b');
const availableModels = ref([
    { value: 'wangge:deepseek-r1-7b', label: 'DeepSeek R1 7B' },
    { value: 'wangge:qwen2.5-0.5b', label: 'Qwen 2.5 0.5B' },
    { value: 'wangge:deepseek-r1-1.5b', label: 'DeepSeek R1 1.5B' },
    { value: 'qwen2.5:0.5b', label: 'Qwen 2.5' },
    { value: 'deepseek-r1:8b', label: 'DeepSeek R1 8B' }
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
    '解释代码',
    '优化建议',
    '生成代码',
    '调试帮助'
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
    question.value = action + '：';
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
    :deep(.el-drawer__header) {
        display: none;
    }

    :deep(.el-drawer__body) {
        padding: 0;
        background: var(--el-bg-color-page);
    }
}

.drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* 头部区域 */
.drawer-header {
    padding: 20px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-bottom: 1px solid var(--el-border-color-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 12px;

    .ai-icon {
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .title-text {
        display: flex;
        flex-direction: column;

        .main-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--el-text-color-primary);
        }

        .sub-title {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-top: 2px;
        }
    }
}

.model-selector {
    display: flex;
    align-items: center;
    gap: 8px;

    .model-select {
        width: 160px;

        :deep(.el-input__wrapper) {
            border-radius: 20px;
            background-color: var(--el-bg-color);
            box-shadow: 0 0 0 1px var(--el-border-color-light) inset;

            &:hover {
                box-shadow: 0 0 0 1px #667eea inset;
            }

            &.is-focus {
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) inset;
            }
        }

        :deep(.el-input__inner) {
            font-size: 13px;
            height: 34px;
        }
    }

    .model-tip {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        cursor: pointer;
        color: var(--el-text-color-secondary);
        transition: all 0.3s ease;

        &:hover {
            background-color: var(--el-fill-color-light);
            color: #667eea;
        }
    }
}

/* 聊天容器 */
.chat-container {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: var(--el-bg-color-page);
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--el-border-color);
        border-radius: 3px;
    }
}

/* 欢迎区域 */
.welcome-section {
    text-align: center;
    padding: 60px 20px;

    .welcome-icon {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        font-size: 40px;
        color: #667eea;
    }

    .welcome-title {
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
    }

    .welcome-desc {
        font-size: 14px;
        color: var(--el-text-color-secondary);
    }
}

/* 消息包装器 */
.message-wrapper {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    &.user {
        flex-direction: row-reverse;

        .message-content-wrapper {
            align-items: flex-end;
        }

        .message-bubble {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 4px;

            .message-text {
                color: white;

                pre.code-block {
                    background-color: rgba(255, 255, 255, 0.1);
                    border-left-color: rgba(255, 255, 255, 0.5);
                }

                code:not(pre code) {
                    background-color: rgba(255, 255, 255, 0.2);
                    color: white;
                }
            }
        }
    }

    &.assistant {
        .message-bubble {
            background-color: var(--el-bg-color);
            border: 1px solid var(--el-border-color-light);
            border-bottom-left-radius: 4px;
        }
    }
}

.message-avatar {
    flex-shrink: 0;

    .avatar-bg {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;

        &.user {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        &.assistant {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            color: #667eea;
        }
    }
}

.message-content-wrapper {
    display: flex;
    flex-direction: column;
    max-width: calc(100% - 60px);
}

.message-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    padding: 0 4px;

    .sender-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--el-text-color-primary);
    }

    .message-time {
        font-size: 11px;
        color: var(--el-text-color-secondary);
    }
}

.message-bubble {
    padding: 12px 16px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.message-text {
    font-size: 14px;
    line-height: 1.6;
    color: var(--el-text-color-primary);

    p {
        margin: 0.5em 0;

        &:first-child {
            margin-top: 0;
        }

        &:last-child {
            margin-bottom: 0;
        }
    }

    pre.code-block {
        background-color: var(--el-fill-color-light);
        border-radius: 8px;
        padding: 12px;
        margin: 12px 0;
        overflow-x: auto;
        border-left: 3px solid #667eea;

        code {
            background-color: transparent;
            padding: 0;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 0.9em;
            color: var(--el-text-color-primary);
        }
    }

    code:not(pre code) {
        background-color: var(--el-fill-color-light);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 0.9em;
        color: #667eea;
    }
}

/* 打字指示器 */
.typing-indicator {
    display: flex;
    gap: 4px;
    margin-top: 8px;
    padding: 4px 0;

    span {
        width: 6px;
        height: 6px;
        background-color: var(--el-text-color-secondary);
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out both;

        &:nth-child(1) {
            animation-delay: -0.32s;
        }

        &:nth-child(2) {
            animation-delay: -0.16s;
        }
    }
}

@keyframes typing {
    0%, 80%, 100% {
        transform: scale(0.6);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

/* 输入区域 */
.input-area-wrapper {
    padding: 16px 20px 20px;
    background: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-light);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
}

.quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;

    .quick-action {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        background-color: var(--el-fill-color-light);
        border-radius: 16px;
        cursor: pointer;
        font-size: 12px;
        color: var(--el-text-color-regular);
        transition: all 0.3s ease;

        &:hover {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            color: #667eea;
            transform: translateY(-2px);
        }

        .el-icon {
            font-size: 12px;
        }
    }
}

.input-area {
    .input-wrapper {
        display: flex;
        gap: 12px;
        align-items: flex-end;
    }

    .question-input {
        flex: 1;

        :deep(.el-textarea__inner) {
            border-radius: 20px;
            border: 1px solid var(--el-border-color-light);
            padding: 12px 16px;
            font-size: 14px;
            line-height: 1.5;
            background-color: var(--el-fill-color-light);
            transition: all 0.3s ease;

            &:hover {
                border-color: #667eea;
            }

            &:focus {
                border-color: #667eea;
                background-color: var(--el-bg-color);
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
        }
    }

    .send-button {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        font-size: 18px;
        transition: all 0.3s ease;

        &:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        &:active {
            transform: scale(0.95);
        }

        &:disabled {
            background: var(--el-text-color-disabled);
            transform: none;
            box-shadow: none;
        }
    }

    .input-footer {
        margin-top: 8px;
        text-align: center;

        .hint-text {
            font-size: 11px;
            color: var(--el-text-color-secondary);
        }
    }
}

/* 下拉框样式 */
:deep(.model-select-popper) {
    border-radius: 12px;
    overflow: hidden;

    .el-select-dropdown__item {
        padding: 10px 16px;
        margin: 4px 8px;
        border-radius: 8px;
        transition: all 0.2s;

        &.selected {
            font-weight: 600;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            color: #667eea;
        }

        &:hover {
            background-color: var(--el-fill-color-light);
        }
    }
}

/* 响应式 */
@media (max-width: 768px) {
    .drawer-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .model-selector {
        width: 100%;

        .model-select {
            flex: 1;
        }
    }

    .message-wrapper {
        &.user {
            .message-content-wrapper {
                max-width: 85%;
            }
        }

        &.assistant {
            .message-content-wrapper {
                max-width: 85%;
            }
        }
    }
}
</style>