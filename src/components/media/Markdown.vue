<template>
    <div class="markdown-card">
        <div v-html="htmlValue"></div>
    </div>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/dark.css'; // 也可以选择其他风格
import { ref, onMounted } from 'vue';
import { CONSTANTS, getToken } from '@/utils';

const props = defineProps({
    src: String,
    type: String,
});

// 初始化 MarkdownIt 实例
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                    '</code></pre>';
            } catch (__) { }
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

const htmlValue = ref('');

// 请求头
const headers = {
    'Authorization': `${CONSTANTS.SYSTEM.TOKEN_TYPE} ${getToken()}`, // 添加自定义的 Authorization 或其他请求头
};

onMounted(async () => {
    try {
        const response = await fetch(props.src, {
            method: 'GET',
            headers: headers,  // 添加请求头
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const markdownContent = await response.text();
        htmlValue.value = md.render(markdownContent);
        // 初始化 highlight.js
        hljs.highlightAll();
    } catch (error) {
        console.error('获取文件失败', error);
    }
});
</script>

<style scoped>
.markdown-card table {
    width: 100%;
    border-collapse: collapse;
}

.markdown-card th {
    border: 1px solid var(--el-border-color);
    padding: 8px;
    text-align: left;
}

.markdown-card td {
    border: 1px solid var(--el-border-color);
    padding: 8px;
    text-align: left;
}

.markdown-card .hljs {
    padding: 1rem;
}
</style>