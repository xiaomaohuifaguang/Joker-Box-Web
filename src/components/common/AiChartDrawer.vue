<template>
    <el-drawer v-model="props.dialog" title="AI助手" direction="rtl" size="600px" @close="close"
        class="ai-assistant-drawer">
        <div class="drawer-content">
            <!-- 头部区域 - 模型选择 -->
            <div class="drawer-header">
                <div class="header-title">
                    <div class="ai-icon">
                        <el-icon>
                            <ChatDotRound />
                        </el-icon>
                    </div>
                    <div class="title-text">
                        <span class="main-title">AI 助手</span>
                        <span class="sub-title">智能对话</span>
                    </div>
                </div>
                <div class="model-selector">
                    <el-select v-model="selectedModel" placeholder="选择模型" size="small" class="model-select"
                        popper-class="model-select-popper">
                        <el-option v-for="model in availableModels" :key="model.id" :label="model.name"
                            :value="model.id" class="model-option" />
                    </el-select>
                    <el-tooltip content="切换不同模型以获得不同体验" placement="top">
                        <div class="model-tip">
                            <el-icon>
                                <InfoFilled />
                            </el-icon>
                        </div>
                    </el-tooltip>
                </div>
            </div>

            <!-- 聊天消息区域 - 可滚动 -->
            <div class="chat-container" ref="chatContainer">
                <!-- 欢迎消息 -->
                <div v-if="messages.length === 1" class="welcome-section">
                    <div class="welcome-icon">
                        <el-icon>
                            <Cpu />
                        </el-icon>
                    </div>
                    <h3 class="welcome-title">有什么可以帮您的？</h3>
                    <p class="welcome-desc">我可以帮您解答问题、优化代码、美化页面等</p>
                </div>

                <div v-for="(message, index) in messages" :key="index" class="message-wrapper" :class="message.role">
                    <div class="message-avatar">
                        <div class="avatar-bg" :class="message.role">
                            <el-icon v-if="message.role === 'assistant'">
                                <ChatDotRound />
                            </el-icon>
                            <Avatar v-else />
                        </div>
                    </div>
                    <div class="message-content-wrapper">
                        <div class="message-header">
                            <span class="sender-name">{{ message.role === 'user' ? '你' : 'AI助手' }}</span>
                            <span class="message-time">{{ formatTime(message.time) }}</span>
                        </div>
                        <div v-if="message.role === 'assistant' && message.reasoning_content" class="reasoning-block">
                            <div class="reasoning-header" @click="toggleReasoning(index)">
                                <el-icon class="reasoning-icon">
                                    <Sunrise />
                                </el-icon>
                                <span class="reasoning-title">已深度思考</span>
                                <el-icon class="reasoning-toggle-icon" :class="{ expanded: reasoningExpanded[index] }">
                                    <ArrowDown />
                                </el-icon>
                            </div>
                            <div v-show="reasoningExpanded[index]" class="reasoning-content">
                                <div class="message-text" v-html="formatMessageContent(message.reasoning_content)">
                                </div>
                            </div>
                        </div>
                        <div v-if="message.role === 'user' && editingIndex === index" class="edit-area">
                            <el-input v-model="editingContent" type="textarea" :rows="2" resize="none" class="edit-input"
                                @keydown="handleEditKeydown($event, index)" />
                            <div class="edit-actions">
                                <el-button size="small" @click="cancelEdit">取消</el-button>
                                <el-button type="primary" size="small" @click="saveEdit(index)">保存</el-button>
                            </div>
                        </div>
                        <div v-else class="message-bubble" :class="message.role">
                            <div class="message-text" v-html="formatMessageContent(message.content)"></div>
                        </div>
                        <div class="message-actions" :class="message.role">
                            <el-button link size="small" class="action-btn" @click="handleCopy(message.content, index)">
                                <el-icon :size="14">
                                    <DocumentCopy />
                                </el-icon>
                                <span v-show="copiedIndex === index">已复制</span>
                                <span v-show="copiedIndex !== index">复制</span>
                            </el-button>
                            <el-button v-if="message.role === 'user'" link size="small" class="action-btn"
                                @click="startEdit(index)">
                                <el-icon :size="14">
                                    <Edit />
                                </el-icon>
                                <span>编辑</span>
                            </el-button>
                            <el-button v-if="message.role === 'assistant' && index === messages.length - 1" link size="small" class="action-btn"
                                @click="regenerate">
                                <el-icon :size="14">
                                    <RefreshRight />
                                </el-icon>
                                <span>重新生成</span>
                            </el-button>
                        </div>
                    </div>
                </div>

                <!-- 流式输出中 -->
                <div v-if="flag" class="message-wrapper assistant">
                    <div class="message-avatar">
                        <div class="avatar-bg assistant">
                            <el-icon>
                                <ChatDotRound />
                            </el-icon>
                        </div>
                    </div>
                    <div class="message-content-wrapper">
                        <div class="message-header">
                            <span class="sender-name">AI助手</span>
                            <span class="message-time">{{ formatTime(new Date()) }}</span>
                        </div>
                        <div v-if="streamingReasoning" class="reasoning-block">
                            <div class="reasoning-header streaming">
                                <el-icon class="reasoning-icon">
                                    <Sunrise />
                                </el-icon>
                                <span class="reasoning-title">深度思考中...</span>
                            </div>
                            <div class="reasoning-content">
                                <div class="message-text" v-html="formatMessageContent(streamingReasoning)"></div>
                            </div>
                        </div>
                        <div class="message-bubble assistant">
                            <div class="message-text" v-html="formatMessageContent(streamingAnswer)"></div>
                            <div v-if="!streamingAnswer" class="typing-indicator">
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
                        <el-icon>
                            <Pointer />
                        </el-icon>
                        <span>{{ action }}</span>
                    </div>
                </div>
                <div class="input-area">
                    <div class="input-wrapper">
                        <el-input v-model="question" type="textarea" :rows="2" placeholder="输入您的问题，按 Enter 发送..."
                            resize="none" class="question-input" @keydown="handleKeydown">
                        </el-input>
                        <el-button type="primary" @click="send" :loading="flag" :disabled="!question.trim()"
                            class="send-button" circle>
                            <el-icon v-if="!flag">
                                <Promotion />
                            </el-icon>
                            <el-icon v-else class="is-loading">
                                <Loading />
                            </el-icon>
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
import { Loading, InfoFilled, ChatDotRound, Cpu, Pointer, Promotion, ArrowDown, Sunrise, DocumentCopy, RefreshRight, Edit } from '@element-plus/icons-vue';
import { CONSTANTS, http } from '@/utils';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import Avatar from './Avatar.vue';

const props = defineProps({
    dialog: {
        type: Boolean,
        required: false
    }
});

// 模型选择相关
const selectedModel = ref('');
const availableModels = ref<Array<{ id: string, name: string }>>([]);

const loadModels = async () => {
    try {
        const result = await http.post('/ai/model/queryPage', { current: 1, size: 100 })
        availableModels.value = result.records || []
        if (availableModels.value.length > 0 && !selectedModel.value) {
            selectedModel.value = availableModels.value[0].id
        }
    } catch (e) {
        console.error('加载模型列表失败', e)
    }
}

watch(() => props.dialog, (open) => {
    if (open && availableModels.value.length === 0) {
        loadModels()
    }
})

// 配置marked和highlight.js
const renderer = new marked.Renderer();
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
    const highlighted = hljs.highlight(text, { language }).value;
    return `<pre class="code-block"><code class="hljs language-${language}">${highlighted}</code></pre>\n`;
};

marked.setOptions({
    renderer,
    breaks: true,
    gfm: true
});

// 快速操作
const quickActions = ref([
    '解释代码',
    '优化建议',
    '生成代码',
    '调试帮助'
]);

const messages = ref<Array<{ role: string, content: string, reasoning_content?: string, time: Date }>>([
    {
        role: 'assistant',
        content: '你好！我是AI助手，请问有什么我可以帮助你的吗？',
        time: new Date()
    }
]);
const question = ref('');
const flag = ref(false);
const streamingAnswer = ref('');
const streamingReasoning = ref('');
const reasoningExpanded = ref<Record<number, boolean>>({});
const chatContainer = ref<HTMLElement | null>(null);
const autoScroll = ref(true);
const copiedIndex = ref<number | null>(null);
const editingIndex = ref<number | null>(null);
const editingContent = ref('');

const emit = defineEmits(['update:dialog']);

const close = () => {
    emit('update:dialog', false);
}

const toggleReasoning = (index: number) => {
    reasoningExpanded.value[index] = !reasoningExpanded.value[index];
}

const handleCopy = async (text: string, index: number) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
    copiedIndex.value = index;
    setTimeout(() => copiedIndex.value = null, 2000);
}

const startEdit = (index: number) => {
    editingIndex.value = index;
    editingContent.value = messages.value[index].content;
}

const cancelEdit = () => {
    editingIndex.value = null;
    editingContent.value = '';
}

const saveEdit = (index: number) => {
    if (!editingContent.value.trim()) return;
    messages.value[index].content = editingContent.value;
    editingIndex.value = null;
    editingContent.value = '';
}

const regenerate = () => {
    if (messages.value.length < 2) return;
    // 移除最后一条 assistant 消息
    if (messages.value[messages.value.length - 1]?.role === 'assistant') {
        messages.value.pop();
    }
    // 取出最后一条 user 消息内容重新发送
    const lastUser = messages.value[messages.value.length - 1];
    if (lastUser?.role === 'user') {
        question.value = lastUser.content;
        messages.value.pop();
        send();
    }
}

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
    }
}

const handleEditKeydown = (e: KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        saveEdit(index);
    }
}

const addCopyButtons = () => {
    nextTick(() => {
        if (!chatContainer.value) return;
        chatContainer.value.querySelectorAll('pre.code-block').forEach(pre => {
            if (pre.querySelector('.code-copy-btn')) return;
            const langMatch = pre.querySelector('code')?.className.match(/language-(\w+)/);
            const lang = langMatch ? langMatch[1].toUpperCase() : 'CODE';

            const header = document.createElement('div');
            header.className = 'code-header';
            header.innerHTML = `<span class="code-lang">${lang}</span>`;

            const btn = document.createElement('button');
            btn.className = 'code-copy-btn';
            btn.innerHTML = '<svg viewBox="0 0 1024 1024" width="14" height="14"><path fill="currentColor" d="M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64h64z m128-576H384a128 128 0 0 0-128 128v448a128 128 0 0 0 128 128h512a128 128 0 0 0 128-128V384a128 128 0 0 0-128-128z m-64 448H448a64 64 0 0 1-64-64V448a64 64 0 0 1 64-64h384a64 64 0 0 1 64 64v192a64 64 0 0 1-64 64z"/></svg><span>复制</span>';
            btn.onclick = () => {
                const code = pre.querySelector('code')?.textContent || '';
                navigator.clipboard.writeText(code);
                btn.querySelector('span')!.textContent = '已复制';
                setTimeout(() => btn.querySelector('span')!.textContent = '复制', 2000);
            };
            header.appendChild(btn);
            pre.insertBefore(header, pre.firstChild);
        });
    });
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
    addCopyButtons();
}, { deep: true });

watch(streamingAnswer, () => {
    scrollToBottom();
    addCopyButtons();
});

watch(streamingReasoning, () => {
    scrollToBottom();
});

// 格式化消息内容
const formatMessageContent = (content: string) => {
    return marked.parse(content);
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
        const response = await fetch(CONSTANTS.HTTP.BASEURL + '/ai/chat', {
            method: 'POST',
            headers: {
                'Authorization': CONSTANTS.SYSTEM.TOKEN_TYPE + ' ' + token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "model": selectedModel.value,
                "stream": true,
                "messages": messages.value.map(m => ({ role: m.role, content: m.content })),
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
        streamingReasoning.value = '';

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
                        const msg: any = {
                            role: 'assistant',
                            content: streamingAnswer.value,
                            time: new Date()
                        };
                        if (streamingReasoning.value) {
                            msg.reasoning_content = streamingReasoning.value;
                        }
                        messages.value.push(msg);
                        flag.value = false;
                        streamingAnswer.value = '';
                        streamingReasoning.value = '';
                        scrollToBottom();
                        return;
                    }

                    try {
                        const data = JSON.parse(jsonStr);
                        const delta = data.data?.choices?.[0]?.delta;
                        if (delta?.reasoning_content) {
                            const reasoning = delta.reasoning_content;
                            for (let i = 0; i < reasoning.length; i++) {
                                streamingReasoning.value += reasoning[i];
                            }
                            scrollToBottom();
                        }
                        if (delta?.content) {
                            const content = delta.content;
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
        background: var(--bg-page);
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
    background: var(--brand-gradient-soft);
    border-bottom: 1px solid var(--border-light);
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
        background: var(--brand-gradient);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-on-brand);
        font-size: 24px;
        box-shadow: var(--shadow-glow);
    }

    .title-text {
        display: flex;
        flex-direction: column;

        .main-title {
            font-size: var(--fs-xl);
            font-weight: var(--fw-bold);
            color: var(--text-primary);
        }

        .sub-title {
            font-size: var(--fs-xs);
            color: var(--text-secondary);
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
            border-radius: var(--radius-pill);
            background-color: var(--bg-container);
            box-shadow: 0 0 0 1px var(--border-light) inset;

            &:hover {
                box-shadow: 0 0 0 1px var(--brand-primary) inset;
            }

            &.is-focus {
                box-shadow: 0 0 0 2px var(--bg-overlay-strong) inset;
            }
        }

        :deep(.el-input__inner) {
            font-size: var(--fs-sm);
            height: 34px;
        }
    }

    .model-tip {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        cursor: pointer;
        color: var(--text-secondary);
        transition: background-color var(--duration-normal) var(--ease-out),
            color var(--duration-normal) var(--ease-out);

        &:hover {
            background-color: var(--bg-overlay);
            color: var(--brand-primary);
        }
    }
}

/* 聊天容器 */
.chat-container {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: var(--bg-page);
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--scrollbar-thumb);
        border-radius: 3px;
    }
}

/* 欢迎区域 */
.welcome-section {
    text-align: center;
    padding: 60px 20px;
    animation: welcomeIn 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) both;

    @keyframes welcomeIn {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    .welcome-icon {
        width: 80px;
        height: 80px;
        background: var(--brand-gradient-soft);
        border-radius: var(--radius-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        font-size: 40px;
        color: var(--brand-primary);
    }

    .welcome-title {
        font-size: var(--fs-3xl);
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
        margin-bottom: 8px;
    }

    .welcome-desc {
        font-size: var(--fs-md);
        color: var(--text-secondary);
    }
}

/* 消息包装器 */
.message-wrapper {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    animation: messageIn 0.35s cubic-bezier(0.25, 0.8, 0.25, 1) both;

    @keyframes messageIn {
        from {
            opacity: 0;
            transform: translateY(12px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    &.user {
        flex-direction: row-reverse;

        .message-content-wrapper {
            align-items: flex-end;
        }

        .message-bubble {
            background: var(--brand-gradient);
            color: var(--text-on-brand);
            border-bottom-right-radius: 4px;

            .message-text {
                color: var(--text-on-brand);

                pre.code-block {
                    background-color: rgba(255, 255, 255, 0.1);
                    border-left-color: rgba(255, 255, 255, 0.5);
                }

                code:not(pre code) {
                    background-color: rgba(255, 255, 255, 0.2);
                    color: var(--text-on-brand);
                }
            }
        }
    }

    &.assistant {
        .message-bubble {
            background-color: var(--bg-container);
            border: 1px solid var(--border-light);
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
            background: var(--brand-gradient);
            color: var(--text-on-brand);
        }

        &.assistant {
            background: var(--brand-gradient-soft);
            color: var(--brand-primary);
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
        font-size: var(--fs-sm);
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
    }

    .message-time {
        font-size: 11px;
        color: var(--text-secondary);
    }
}

.message-bubble {
    padding: 12px 16px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
}

.message-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
    padding: 0 4px;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity var(--duration-fast) var(--ease-out),
        transform var(--duration-fast) var(--ease-out);

    &.user {
        justify-content: flex-end;
    }

    .message-wrapper.assistant:hover &,
    .message-wrapper.user:hover & {
        opacity: 1;
        transform: translateY(0);
    }

    .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        font-size: 12px;
        color: var(--text-secondary);
        border-radius: var(--radius-sm);
        transition: all var(--duration-fast) var(--ease-out);

        .el-icon {
            font-size: 14px;
        }

        span {
            font-size: 12px;
        }

        &:hover {
            color: var(--brand-primary);
            background-color: var(--bg-overlay);
        }
    }
}

.message-text {
    font-size: var(--fs-md);
    line-height: var(--lh-normal);
    color: var(--text-primary);

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
        background-color: var(--bg-overlay);
        border-radius: var(--radius-sm);
        padding: 0;
        margin: 12px 0;
        overflow-x: auto;
        border-left: 3px solid var(--brand-primary);

        code {
            background-color: transparent;
            padding: 12px;
            font-family: var(--font-mono);
            font-size: 0.9em;
            color: inherit;
        }
    }

    code:not(pre code) {
        background-color: var(--bg-overlay);
        padding: 2px 6px;
        border-radius: var(--radius-xs);
        font-family: var(--font-mono);
        font-size: 0.9em;
        color: var(--brand-primary);
    }
}

/* 代码块头部与复制 */
:deep(pre.code-block) {
    position: relative;
    overflow: hidden;
    padding: 0;

    .code-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 12px;
        background-color: var(--bg-overlay-strong);
        border-bottom: 1px solid var(--border-light);
    }

    .code-lang {
        font-size: 11px;
        font-weight: var(--fw-semibold);
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .code-copy-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        font-size: 11px;
        color: var(--text-secondary);
        background: transparent;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-out);

        &:hover {
            color: var(--brand-primary);
            border-color: var(--brand-primary);
            background-color: var(--bg-overlay);
        }
    }

    code {
        display: block;
        padding: 12px;
        background-color: transparent;
    }
}

/* 思考过程区域 */
.reasoning-block {
    margin-bottom: 8px;
    border-radius: var(--radius-lg);
    background-color: var(--bg-overlay);
    border: 1px solid var(--border-light);
    overflow: hidden;
}

.reasoning-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    cursor: pointer;
    transition: background-color var(--duration-fast) var(--ease-out);
    user-select: none;

    &:hover {
        background-color: var(--bg-overlay-strong);
    }

    &.streaming {
        cursor: default;

        &:hover {
            background-color: transparent;
        }

        .reasoning-icon {
            animation: pulseIcon 2s infinite ease-in-out;
        }
    }
}

@keyframes pulseIcon {

    0%,
    100% {
        opacity: 0.6;
        transform: scale(1);
    }

    50% {
        opacity: 1;
        transform: scale(1.15);
    }
}

.reasoning-icon {
    font-size: 14px;
    color: var(--brand-primary);
}

.reasoning-title {
    flex: 1;
    font-size: var(--fs-sm);
    font-weight: var(--fw-medium);
    color: var(--text-secondary);
}

.reasoning-toggle-icon {
    font-size: 12px;
    color: var(--text-secondary);
    transition: transform var(--duration-normal) var(--ease-out);

    &.expanded {
        transform: rotate(180deg);
    }
}

.reasoning-content {
    padding: 0 14px 12px 14px;
    border-top: 1px solid var(--border-light);
    background-color: var(--bg-overlay);

    .message-text {
        font-size: var(--fs-sm);
        color: var(--text-secondary);
        line-height: var(--lh-normal);

        p {
            margin: 0.4em 0;
        }

        pre.code-block {
            background-color: var(--bg-overlay-strong);
            border-left-color: var(--border-light);

            code {
                color: inherit;
            }
        }

        code:not(pre code) {
            background-color: var(--bg-overlay-strong);
            color: var(--text-secondary);
        }
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
        background-color: var(--text-secondary);
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

    0%,
    80%,
    100% {
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
    background: var(--bg-container);
    border-top: 1px solid var(--border-light);
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
        background-color: var(--bg-overlay);
        border-radius: var(--radius-pill);
        cursor: pointer;
        font-size: var(--fs-xs);
        color: var(--text-regular);
        transition: background var(--duration-normal) var(--ease-out),
            color var(--duration-normal) var(--ease-out),
            transform var(--duration-normal) var(--ease-out);

        &:hover {
            background: var(--brand-gradient-soft);
            color: var(--brand-primary);
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
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-light);
            padding: 12px 16px;
            font-size: var(--fs-md);
            line-height: var(--lh-normal);
            background-color: var(--bg-overlay);
            color: var(--text-primary);
            transition: border-color var(--duration-normal) var(--ease-out),
                background-color var(--duration-normal) var(--ease-out),
                box-shadow var(--duration-normal) var(--ease-out);

            &:hover {
                border-color: var(--brand-primary);
            }

            &:focus {
                border-color: var(--brand-primary);
                background-color: var(--bg-container);
                box-shadow: 0 0 0 3px var(--bg-overlay-strong);
            }
        }
    }

    .send-button {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        background: var(--brand-gradient);
        border: none;
        color: var(--text-on-brand);
        font-size: 18px;
        transition: transform var(--duration-normal) var(--ease-out),
            box-shadow var(--duration-normal) var(--ease-out);

        &:hover {
            transform: scale(1.1);
            box-shadow: var(--shadow-glow);
        }

        &:active {
            transform: scale(0.95);
        }

        &:disabled {
            background: var(--text-disabled);
            transform: none;
            box-shadow: none;
        }
    }

    .input-footer {
        margin-top: 8px;
        text-align: center;

        .hint-text {
            font-size: 11px;
            color: var(--text-secondary);
        }
    }
}

/* 下拉框样式 */
:deep(.model-select-popper) {
    border-radius: var(--radius-md);
    overflow: hidden;

    .el-select-dropdown__item {
        padding: 10px 16px;
        margin: 4px 8px;
        border-radius: var(--radius-sm);
        transition: background-color var(--duration-fast) var(--ease-out),
            color var(--duration-fast) var(--ease-out);

        &.selected {
            font-weight: var(--fw-semibold);
            background: var(--brand-gradient-soft);
            color: var(--brand-primary);
        }

        &:hover {
            background-color: var(--bg-overlay);
        }
    }
}

.edit-area {
    width: 100%;
    max-width: 100%;
    background-color: var(--bg-container);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 12px;
    box-shadow: var(--shadow-sm);

    .edit-input {
        :deep(.el-textarea__inner) {
            border-radius: var(--radius-md);
            border: 1px solid var(--border-light);
            padding: 10px 12px;
            font-size: var(--fs-md);
            line-height: var(--lh-normal);
            background-color: var(--bg-overlay);
            color: var(--text-primary);
            resize: none;

            &:focus {
                border-color: var(--brand-primary);
            }
        }
    }

    .edit-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 10px;
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