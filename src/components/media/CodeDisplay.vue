<template>
    <div class="code-container">
        <div class="code-header">
            <span class="language-badge">{{ language.toUpperCase() }}</span>
            <el-button v-clipboard:copy="displayCode" v-clipboard:success="onCopySuccess" class="copy-btn"
                :icon="copied ? Check : DocumentCopy" :type="copied ? 'success' : 'primary'" title="Copy to clipboard"
                :key="tmpCopyButtonKey">
                {{ copied ? '已复制' : '复制' }}
            </el-button>
        </div>
        <pre class="prism-container line-numbers">
        <code ref="code" :class="`language-${language}`">{{ displayCode }}</code>
      </pre>
    </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, watch, ref, computed } from "vue";
import Prism from "prismjs";
import "prismjs/components/prism-java.min.js";
import "prismjs/components/prism-javascript.min.js";
import "prismjs/components/prism-python.min.js";
import "prismjs/components/prism-css.min.js";
import "prismjs/components/prism-json.min.js";
import "prismjs/components/prism-typescript.min.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/themes/prism-tomorrow.css";
import { alert, randomId } from "@/utils";
import { DocumentCopy, Check } from "@element-plus/icons-vue";

const props = defineProps({
    code: {
        type: [String, Object, Array],
        required: true,
    },
    language: {
        type: String,
        default: "java",
    },
});

const copied = ref(false);

const displayCode = computed(() => {
    if (typeof props.code === 'string') return props.code;
    try {
        return JSON.stringify(props.code, null, 2);
    } catch (e) {
        return String(props.code);
    }
});

const tmpCopyButtonKey = ref(randomId("tmpCopyButtonKey"))

const onCopySuccess = () => {
    copied.value = true;
    alert('复制成功！', 'success');
    setTimeout(() => {
        copied.value = false;
    }, 2000);
};

const highlightCode = () => {
    nextTick(() => {
        Prism.highlightAll();
    });
};

watch(() => props.language, () => {
    highlightCode();
}, { immediate: true });

watch(() => props.code, () => {
    tmpCopyButtonKey.value = randomId("tmpCopyButtonKey");
});

watch(displayCode, () => {
    highlightCode();
}, { immediate: true });

onMounted(() => {
    highlightCode();
});
</script>

<style scoped>
.code-container {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    background: #1e1e1e;
}

.code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: #2d2d2d;
    border-bottom: 1px solid #3e3e3e;
}

.language-badge {
    font-size: 12px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.prism-container {
    margin: 0;
    padding: 16px;
    border-radius: 0;
    background: #1e1e1e;
}

pre {
    overflow-x: auto;
    margin: 0;
    padding: 0;
}

pre::-webkit-scrollbar {
    height: 8px;
}

pre::-webkit-scrollbar-track {
    background: #2d2d2d;
    border-radius: 4px;
}

pre::-webkit-scrollbar-thumb {
    background: #4a4a4a;
    border-radius: 4px;
}

pre::-webkit-scrollbar-thumb:hover {
    background: #5a5a5a;
}

code {
    display: block;
    white-space: pre;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
}

.copy-btn {
    font-size: 12px;
    padding: 4px 12px;
    height: auto;
    border-radius: 6px;
}

:deep(.line-numbers .line-numbers-rows) {
    border-right: 1px solid #3e3e3e !important;
}

:deep(.line-numbers-rows > span) {
    color: #666 !important;
    pointer-events: none;
}
</style>