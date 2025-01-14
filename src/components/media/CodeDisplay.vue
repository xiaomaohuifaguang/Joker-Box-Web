<template>
    <div class="code-container">
        <pre class="prism-container">
        <code ref="code" :class="`language-${language}`">{{ code }}</code>
      </pre>
        <el-button v-clipboard:copy="code" v-clipboard:success="onCopySuccess" class="copy-btn" type="primary"
            title="Copy to clipboard">
            复制
        </el-button>
    </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, watch } from "vue";
import Prism from "prismjs";
import "prismjs/components/prism-java.min.js"; // 引入 Java 语言支持
import "prismjs/themes/prism-tomorrow.css"; // 可选：选择不同的主题
import { alert } from "@/utils";

const props = defineProps({
    code: String,
    language: {
        type: String,
        default: "java",  // 默认语言为 Java
    },
});

// Clipboard success handler
const onCopySuccess = () => {
    alert('复制成功！', 'success');
};

const highlightCode = () => {
    nextTick(() => {
        Prism.highlightAll(); // 高亮所有代码块
    });
};

// 监听 language 变化并重新高亮代码
watch(() => props.language, () => {
    highlightCode(); // 语言变化时重新高亮
}, { immediate: true }); // 立即应用首次高亮

onMounted(() => {
    highlightCode(); // 组件加载时，高亮代码
});
</script>

<style scoped>
.code-container {
    position: relative;
}

.prism-container {
    /* background-color: antiquewhite; */
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

pre {
    overflow-x: auto;
    margin: 0;
    padding: 0;
}

code {
    display: block;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.copy-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    /* background-color: #fff; */
    /* border: 1px solid #ccc; */
    border-radius: 4px;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

.copy-btn:hover {
    background-color: #f0f0f0;
}
</style>