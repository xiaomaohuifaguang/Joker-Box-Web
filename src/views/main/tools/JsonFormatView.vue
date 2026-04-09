<template>
    <div class="json-formatter-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon><DataLine /></el-icon>
                    </div>
                    <div class="title-text">
                        <h1>JSON 格式化工具</h1>
                        <p>快速格式化、压缩、查看 JSON 数据</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="json-formatter-container">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="24" :md="12" :lg="10" :xl="10">
                    <div class="input-section card-section">
                        <div class="section-header">
                            <div class="section-title">
                                <div class="title-icon small input">
                                    <el-icon><Edit /></el-icon>
                                </div>
                                <h3>输入 JSON</h3>
                            </div>
                            <div class="header-actions">
                                <el-tooltip content="压缩 JSON" placement="top">
                                    <el-button size="small" circle @click="compressJson" class="action-btn compress">
                                        <el-icon>
                                            <Minus />
                                        </el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip content="美化 JSON" placement="top">
                                    <el-button size="small" circle @click="formatJson" class="action-btn format">
                                        <el-icon>
                                            <Opportunity />
                                        </el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip content="清空内容" placement="top">
                                    <el-button size="small" circle @click="clearInput" class="action-btn delete">
                                        <el-icon>
                                            <Delete />
                                        </el-icon>
                                    </el-button>
                                </el-tooltip>
                            </div>
                        </div>
                        <el-input v-model="jsonInput" type="textarea" :rows="20" placeholder="请输入 JSON 字符串或直接粘贴 JSON 数据"
                            resize="none" class="input-textarea" />
                        <div class="action-buttons">
                            <el-button type="primary" @click="formatJson" class="primary-btn" :icon="Opportunity">格式化</el-button>
                            <el-button @click="compressJson" class="secondary-btn" :icon="Minus">压缩</el-button>
                            <el-button @click="clearInput" class="secondary-btn" :icon="Delete">清空</el-button>
                            <el-button @click="copyInput" class="secondary-btn" :icon="DocumentCopy">复制</el-button>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="10" :xl="10">
                    <div class="output-section card-section">
                        <div class="section-header">
                            <div class="section-title">
                                <div class="title-icon small output">
                                    <el-icon><Document /></el-icon>
                                </div>
                                <h3>格式化结果</h3>
                            </div>
                            <div class="header-actions">
                                <el-tooltip content="复制 JSON" placement="top">
                                    <el-button size="small" circle @click="copyOutput" class="action-btn copy">
                                        <el-icon>
                                            <DocumentCopy />
                                        </el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip content="展开全部" placement="top">
                                    <el-button size="small" circle @click="expandAll" class="action-btn expand">
                                        <el-icon>
                                            <FullScreen />
                                        </el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip content="折叠全部" placement="top">
                                    <el-button size="small" circle @click="collapseAll" class="action-btn collapse">
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
                            <div class="placeholder-content">
                                <el-icon><DocumentDelete /></el-icon>
                                <p>格式化后的 JSON 将显示在这里</p>
                            </div>
                        </div>
                        <div class="viewer-controls">
                            <div class="control-item">
                                <el-checkbox v-model="sortEnabled" size="small">
                                    <span class="checkbox-label">按键名排序</span>
                                </el-checkbox>
                            </div>
                            <div class="control-item slider">
                                <span class="slider-label">展开深度</span>
                                <el-slider v-model="expandDepth" :min="1" :max="5" :step="1" show-stops show-input size="small"
                                    class="depth-slider" />
                                <span class="depth-value">{{ expandDepth }}</span>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import {
    Opportunity,
    Minus,
    Delete,
    DocumentCopy,
    FullScreen,
    Close,
    DataLine,
    Edit,
    Document,
    DocumentDelete
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

<style scoped lang="scss">
.json-formatter-page {
    min-height: calc(100vh - 60px);
    background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);
    padding-bottom: 40px;

    // 页面头部
    .page-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 32px 0;
        margin-bottom: 32px;

        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 20px;

            .title-icon {
                width: 64px;
                height: 64px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);

                .el-icon {
                    font-size: 32px;
                    color: white;
                }
            }

            .title-text {
                h1 {
                    margin: 0 0 8px 0;
                    font-size: 28px;
                    font-weight: 600;
                    color: white;
                }

                p {
                    margin: 0;
                    font-size: 15px;
                    color: rgba(255, 255, 255, 0.85);
                }
            }
        }
    }
}

.json-formatter-container {
    padding: 0 24px;
    max-width: 1400px;
    margin: 0 auto;
}

.card-section {
    background: var(--el-bg-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--el-border-color-lighter);
    height: 100%;
    display: flex;
    flex-direction: column;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .section-title {
        display: flex;
        align-items: center;
        gap: 12px;

        .title-icon {
            &.small {
                width: 36px;
                height: 36px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;

                &.input {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                &.output {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                }

                .el-icon {
                    font-size: 18px;
                }
            }
        }

        h3 {
            margin: 0;
            color: var(--el-text-color-primary);
            font-size: 18px;
            font-weight: 600;
        }
    }

    .header-actions {
        display: flex;
        gap: 8px;

        .action-btn {
            width: 36px;
            height: 36px;
            transition: all 0.3s ease;

            &:hover {
                transform: scale(1.1);
            }

            &.compress {
                background: var(--el-color-warning-light-9);
                color: var(--el-color-warning);
            }

            &.format {
                background: var(--el-color-primary-light-9);
                color: var(--el-color-primary);
            }

            &.delete {
                background: var(--el-color-danger-light-9);
                color: var(--el-color-danger);
            }

            &.copy {
                background: var(--el-color-success-light-9);
                color: var(--el-color-success);
            }

            &.expand {
                background: var(--el-color-info-light-9);
                color: var(--el-color-info);
            }

            &.collapse {
                background: var(--el-color-danger-light-9);
                color: var(--el-color-danger);
            }
        }
    }
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

    :deep(.el-textarea__inner) {
        border-radius: 12px;
        padding: 16px;
        font-size: 14px;
        line-height: 1.6;
        background: var(--el-fill-color-light);
        border-color: var(--el-border-color-lighter);
        transition: all 0.3s ease;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;

        &:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            background: var(--el-bg-color);
        }
    }
}

.action-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    flex-wrap: wrap;

    .primary-btn {
        height: 42px;
        padding: 0 20px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
        }
    }

    .secondary-btn {
        height: 42px;
        padding: 0 16px;
        border-radius: 10px;
        font-size: 14px;
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-1px);
        }
    }
}

.json-viewer {
    flex: 1;
    overflow: auto;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
    padding: 16px;
    background-color: var(--el-fill-color-light);
    margin-bottom: 16px;
}

.placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--el-border-color-lighter);
    border-radius: 12px;
    background-color: var(--el-fill-color-light);
    margin-bottom: 16px;
    min-height: 300px;

    .placeholder-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: var(--el-text-color-secondary);

        .el-icon {
            font-size: 48px;
            opacity: 0.4;
        }

        p {
            margin: 0;
            font-size: 14px;
        }
    }
}

.viewer-controls {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 12px 16px;
    background: var(--el-fill-color-light);
    border-radius: 10px;
    flex-wrap: wrap;

    .control-item {
        display: flex;
        align-items: center;
        gap: 12px;

        &.slider {
            flex: 1;
            justify-content: flex-end;
        }

        .checkbox-label {
            font-size: 14px;
            color: var(--el-text-color-regular);
        }

        .slider-label {
            font-size: 14px;
            color: var(--el-text-color-secondary);
            white-space: nowrap;
        }

        .depth-slider {
            width: 180px;
        }

        .depth-value {
            min-width: 30px;
            text-align: center;
            font-size: 14px;
            font-weight: 600;
            color: #667eea;
            background: var(--el-color-primary-light-9);
            padding: 4px 8px;
            border-radius: 6px;
        }
    }
}

// 调整json-viewer内部样式
:deep(.json-viewer-container) {
    height: 100%;
    --jv-padding: 8px;
    --jv-font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    --jv-font-size: 14px;
    --jv-line-height: 1.6;

    --jv-key-color: var(--el-color-primary);
    --jv-string-color: var(--el-color-success);
    --jv-number-color: var(--el-color-warning);
    --jv-boolean-color: var(--el-color-danger);
    --jv-null-color: var(--el-color-info);
    --jv-arrow-color: var(--el-text-color-secondary);
    --jv-edit-color: var(--el-color-primary);
    --jv-copy-color: var(--el-color-primary);
    --jv-background-color: transparent;
    --jv-ellipsis-color: var(--el-text-color-secondary);
    --jv-hover-color: var(--el-fill-color-lighter);
}

// 暗色模式适配
[data-theme="dark"] {
    :deep(.json-viewer-container) {
        --jv-key-color: var(--el-color-primary-light-3);
        --jv-string-color: var(--el-color-success-light-3);
        --jv-number-color: var(--el-color-warning-light-3);
        --jv-boolean-color: var(--el-color-danger-light-3);
        --jv-null-color: var(--el-color-info-light-3);
    }
}

// 响应式调整
@media (max-width: 768px) {
    .json-formatter-page {
        padding-bottom: 24px;

        .page-header {
            padding: 24px 0;
            margin-bottom: 24px;

            .header-content {
                padding: 0 16px;
            }

            .header-title {
                flex-direction: column;
                text-align: center;

                .title-text {
                    h1 {
                        font-size: 22px;
                    }
                }
            }
        }
    }

    .json-formatter-container {
        padding: 0 16px;
    }

    .card-section {
        padding: 16px;
        margin-bottom: 20px;
    }

    .action-buttons {
        justify-content: flex-start;

        .primary-btn,
        .secondary-btn {
            flex: 1;
        }
    }

    .viewer-controls {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;

        .control-item {
            width: 100%;

            &.slider {
                justify-content: space-between;
            }

            .depth-slider {
                width: 100%;
            }
        }
    }
}
</style>