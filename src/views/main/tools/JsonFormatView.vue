<template>
    <div class="json-formatter-container">
        <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12" :lg="10" :xl="10">
                <div class="input-section">
                    <div class="section-header">
                        <h3>输入 JSON</h3>
                        <div class="header-actions">
                            <el-tooltip content="压缩 JSON" placement="top">
                                <el-button size="small" circle @click="compressJson">
                                    <el-icon>
                                        <Minus />
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                            <el-tooltip content="美化 JSON" placement="top">
                                <el-button size="small" circle @click="formatJson">
                                    <el-icon>
                                        <MagicStick />
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                            <el-tooltip content="清空内容" placement="top">
                                <el-button size="small" circle @click="clearInput">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                        </div>
                    </div>
                    <el-input v-model="jsonInput" type="textarea" :rows="25" placeholder="请输入 JSON 字符串或直接粘贴 JSON 数据"
                        resize="none" class="input-textarea" />
                    <div class="action-buttons">
                        <el-button type="primary" @click="formatJson" :icon="MagicStick">格式化</el-button>
                        <el-button @click="compressJson" :icon="Minus">压缩</el-button>
                        <el-button @click="clearInput" :icon="Delete">清空</el-button>
                        <el-button @click="copyInput" :icon="DocumentCopy">复制</el-button>
                    </div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="10" :xl="10">
                <div class="output-section">
                    <div class="section-header">
                        <h3>格式化结果</h3>
                        <div class="header-actions">
                            <el-tooltip content="复制 JSON" placement="top">
                                <el-button size="small" circle @click="copyOutput">
                                    <el-icon>
                                        <DocumentCopy />
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                            <el-tooltip content="展开全部" placement="top">
                                <el-button size="small" circle @click="expandAll">
                                    <el-icon>
                                        <FullScreen />
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                            <el-tooltip content="折叠全部" placement="top">
                                <el-button size="small" circle @click="collapseAll">
                                    <el-icon>
                                        <Close />
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                        </div>
                    </div>
                    <div v-if="jsonData" class="json-viewer">
                        <json-viewer :value="jsonData" :expand-depth="expandDepth" copyable boxed :sort="sortEnabled"
                            :theme="isDark ? 'dark' : 'light'" @click-key="handleKeyClick" />
                    </div>
                    <div v-else class="placeholder">
                        <el-empty description="格式化后的 JSON 将显示在这里" />
                    </div>
                    <div class="viewer-controls">
                        <el-checkbox v-model="sortEnabled" size="small">按键名排序</el-checkbox>
                        <el-slider v-model="expandDepth" :min="1" :max="5" :step="1" show-stops show-input size="small"
                            style="width: 150px" />
                        <span class="slider-label">展开深度: {{ expandDepth }}</span>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import {
    MagicStick,
    Minus,
    Delete,
    DocumentCopy,
    FullScreen,
    Close
} from '@element-plus/icons-vue'
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'

const { copy: copyToClipboard } = useClipboard()

const jsonInput = ref('')
const jsonData = ref(null)
const expandDepth = ref(3)
const sortEnabled = ref(false)
const isDark = computed(() => document.documentElement.getAttribute('data-theme') === 'dark')

const formatJson = () => {
    try {
        if (!jsonInput.value.trim()) {
            ElMessage.warning('请输入 JSON 字符串')
            return
        }
        jsonData.value = JSON.parse(jsonInput.value)
        ElMessage.success('JSON 格式化成功')
    } catch (error) {
        ElMessage.error('JSON 格式错误，请检查输入')
        console.error('JSON 解析错误:', error)
        jsonData.value = null
    }
}

const compressJson = () => {
    try {
        if (!jsonInput.value.trim()) {
            ElMessage.warning('请输入 JSON 字符串')
            return
        }
        const parsed = JSON.parse(jsonInput.value)
        jsonInput.value = JSON.stringify(parsed)
        jsonData.value = parsed
        ElMessage.success('JSON 压缩成功')
    } catch (error) {
        ElMessage.error('JSON 格式错误，请检查输入')
        console.error('JSON 解析错误:', error)
    }
}

const clearInput = () => {
    jsonInput.value = ''
    jsonData.value = null
    ElMessage.info('已清空输入')
}

const copyInput = async () => {
    if (!jsonInput.value.trim()) {
        ElMessage.warning('没有内容可复制')
        return
    }
    await copyToClipboard(jsonInput.value)
    ElMessage.success('已复制输入内容')
}

const copyOutput = async () => {
    if (!jsonData.value) {
        ElMessage.warning('没有内容可复制')
        return
    }
    await copyToClipboard(JSON.stringify(jsonData.value, null, 2))
    ElMessage.success('已复制格式化后的 JSON')
}

const expandAll = () => {
    expandDepth.value = 5
}

const collapseAll = () => {
    expandDepth.value = 1
}

const handleKeyClick = ({ key, path }) => {
    console.log('Clicked key:', key, 'at path:', path)
}
</script>

<style scoped>
.json-formatter-container {
    padding: 20px;
    max-width: 1600px;
    margin: 0 auto;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.section-header h3 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: var(--el-font-size-large);
}

.header-actions {
    display: flex;
    gap: 8px;
}

.input-section,
.output-section {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.input-textarea {
    flex: 1;
    margin-bottom: 16px;
}

.action-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.json-viewer {
    flex: 1;
    overflow: auto;
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    padding: 12px;
    background-color: var(--el-fill-color-light);
    margin-bottom: 12px;
}

.placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-fill-color-blank);
    margin-bottom: 12px;
}

.viewer-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
}

.slider-label {
    font-size: var(--el-font-size-extra-small);
    color: var(--el-text-color-secondary);
    margin-left: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .json-formatter-container {
        padding: 12px;
    }

    .action-buttons {
        justify-content: space-between;
    }

    .viewer-controls {
        flex-wrap: wrap;
    }
}

/* 调整json-viewer内部样式 */
:deep(.json-viewer-container) {
    height: 100%;
    --jv-padding: 4px;
    --jv-font-family: var(--el-font-family);
    --jv-font-size: var(--el-font-size-base);
    --jv-line-height: var(--el-line-height);

    /* 颜色变量 */
    --jv-key-color: var(--el-color-primary);
    --jv-string-color: var(--el-color-success);
    --jv-number-color: var(--el-color-warning);
    --jv-boolean-color: var(--el-color-danger);
    --jv-null-color: var(--el-color-info);
    --jv-arrow-color: var(--el-text-color-secondary);
    --jv-edit-color: var(--el-color-primary);
    --jv-copy-color: var(--el-color-primary);
    --jv-background-color: var(--el-fill-color-light);
    --jv-ellipsis-color: var(--el-text-color-secondary);
    --jv-hover-color: var(--el-fill-color-dark);
    --jv-float-button-background-color: var(--el-bg-color-overlay);
    --jv-float-button-color: var(--el-text-color-regular);
}

/* 暗色模式适配 */
[data-theme="dark"] {
    :deep(.json-viewer-container) {
        --jv-background-color: var(--el-bg-color);
        --jv-key-color: var(--el-color-primary-light-3);
        --jv-string-color: var(--el-color-success-light-3);
        --jv-number-color: var(--el-color-warning-light-3);
        --jv-boolean-color: var(--el-color-danger-light-3);
        --jv-null-color: var(--el-color-info-light-3);
    }
}
</style>