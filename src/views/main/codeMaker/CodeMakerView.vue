<template>
    <div class="code-generator-container">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon><MagicStick /></el-icon>
                    </div>
                    <div class="title-text">
                        <h1>代码生成器</h1>
                        <p>根据数据库表结构自动生成前后端代码</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="content-wrapper">
            <!-- 输入框区域 -->
            <div class="input-section">
                <div class="input-card">
                    <div class="input-header">
                        <div class="input-label">
                            <el-icon><Search /></el-icon>
                            <span>数据库表名</span>
                        </div>
                        <div class="input-actions">
                            <el-button text size="small" @click="showHistory = true" v-if="history.length > 0">
                                <el-icon><Clock /></el-icon>
                                历史记录
                            </el-button>
                        </div>
                    </div>
                    <div class="input-wrapper">
                        <el-input v-model="tableName" size="large" placeholder="请输入数据库表名，例如：sys_user" clearable
                            @keyup.enter="make" class="custom-input">
                            <template #prefix>
                                <el-icon><Collection /></el-icon>
                            </template>
                        </el-input>
                        <el-button type="primary" size="large" :icon="MagicStick" @click="make" :loading="loading"
                            class="generate-btn" :disabled="!tableName.trim()">
                            <span v-if="!loading">生成代码</span>
                            <span v-else>生成中...</span>
                        </el-button>
                    </div>
                    <div class="input-tips">
                        <div class="tip-item" v-if="!tableName">
                            <el-icon><InfoFilled /></el-icon>
                            <span>输入数据库表名后点击生成按钮，系统将自动生成完整的 CRUD 代码</span>
                        </div>
                        <div class="tip-item success" v-else>
                            <el-icon><CircleCheck /></el-icon>
                            <span>即将生成 <strong>{{ tableName }}</strong> 表的代码</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 代码展示区域 -->
            <div class="code-section" v-if="hasGeneratedCode">
                <div class="section-header">
                    <div class="header-left">
                        <el-icon><Document /></el-icon>
                        <span>生成结果</span>
                    </div>
                    <div class="header-right">
                        <el-button text size="small" @click="downloadAll">
                            <el-icon><Download /></el-icon>
                            下载全部
                        </el-button>
                        <el-button text size="small" @click="copyAll">
                            <el-icon><CopyDocument /></el-icon>
                            复制全部
                        </el-button>
                    </div>
                </div>

                <div class="code-card">
                    <el-tabs v-model="activeName" type="card" class="code-tabs" v-loading="loading">
                        <el-tab-pane v-for="(item, index) in tabList" :key="index" :name="item.name">
                            <template #label>
                                <div class="tab-label">
                                    <el-icon :size="16">
                                        <component :is="getTabIcon(item.name)" />
                                    </el-icon>
                                    <span>{{ item.label }}</span>
                                </div>
                            </template>
                            <div class="code-content">
                                <div class="code-header">
                                    <div class="filename">{{ getFilename(item) }}</div>
                                    <div class="code-actions">
                                        <el-button text size="small" @click="copyCode(item)">
                                            <el-icon><CopyDocument /></el-icon>
                                            复制
                                        </el-button>
                                        <el-button text size="small" @click="downloadCode(item)">
                                            <el-icon><Download /></el-icon>
                                            下载
                                        </el-button>
                                    </div>
                                </div>
                                <CodeDisplay v-if="data[item.name]" :code="data[item.name]" :language="item.language"
                                    :filename="getFilename(item)" />
                                <div v-else class="empty-code">
                                    <el-icon><DocumentDelete /></el-icon>
                                    <span>暂无生成内容</span>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>

            <!-- 空状态 -->
            <div class="empty-section" v-else>
                <div class="empty-content">
                    <div class="empty-animation">
                        <div class="code-line"></div>
                        <div class="code-line"></div>
                        <div class="code-line"></div>
                        <div class="code-line"></div>
                    </div>
                    <h3>准备生成代码</h3>
                    <p>在上方输入数据库表名，系统将为您自动生成：</p>
                    <div class="feature-list">
                        <div class="feature-item">
                            <el-icon><Check /></el-icon>
                            <span>Entity 实体类</span>
                        </div>
                        <div class="feature-item">
                            <el-icon><Check /></el-icon>
                            <span>Controller 控制层</span>
                        </div>
                        <div class="feature-item">
                            <el-icon><Check /></el-icon>
                            <span>Service 业务层</span>
                        </div>
                        <div class="feature-item">
                            <el-icon><Check /></el-icon>
                            <span>Mapper 数据访问层</span>
                        </div>
                        <div class="feature-item">
                            <el-icon><Check /></el-icon>
                            <span>Vue 前端页面</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 历史记录弹窗 -->
        <el-dialog v-model="showHistory" title="生成历史" width="400px" class="history-dialog">
            <div class="history-list">
                <div v-for="(item, index) in history" :key="index" class="history-item" @click="selectHistory(item)">
                    <div class="history-icon">
                        <el-icon><Clock /></el-icon>
                    </div>
                    <div class="history-info">
                        <div class="history-name">{{ item }}</div>
                        <div class="history-time">{{ formatTime(index) }}</div>
                    </div>
                    <el-button text circle size="small" @click.stop="removeHistory(index)">
                        <el-icon><Close /></el-icon>
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { alert, http } from "@/utils";
import CodeDisplay from "@/components/media/CodeDisplay.vue";
import {
    Search, MagicStick, Document, Collection, InfoFilled,
    CircleCheck, Clock, Download, CopyDocument, DocumentDelete,
    Close, Check, Cpu, Monitor, FolderOpened, Grid, Connection
} from "@element-plus/icons-vue";

const loading = ref(false);
const tableName = ref("");
const showHistory = ref(false);
const history = ref<string[]>([]);

const activeName = ref("entity");
const data = ref({
    index: "",
    add: "",
    info: "",
    entity: "",
    controller: "",
    service: "",
    impl: "",
    mapper: "",
    xml: "",
});

const hasGeneratedCode = computed(() => {
    return Object.values(data.value).some(code => code && code.length > 0);
});

const tabList = [
    { label: "Entity", name: "entity", language: "java" },
    { label: "Controller", name: "controller", language: "java" },
    { label: "Service", name: "service", language: "java" },
    { label: "ServiceImpl", name: "impl", language: "java" },
    { label: "Mapper", name: "mapper", language: "java" },
    { label: "XML", name: "xml", language: "xml" },
    { label: "Index.vue", name: "index", language: "html" },
    { label: "Add.vue", name: "add", language: "html" },
    { label: "Info.vue", name: "info", language: "html" },
];

const getTabIcon = (name: string) => {
    const iconMap: Record<string, any> = {
        entity: Cpu,
        controller: Monitor,
        service: Connection,
        impl: Connection,
        mapper: FolderOpened,
        xml: Document,
        index: Grid,
        add: Grid,
        info: Grid
    };
    return iconMap[name] || Document;
};

const make = async () => {
    if (!tableName.value.trim()) {
        alert("请输入表名", "warning");
        return;
    }

    // 添加到历史记录
    if (!history.value.includes(tableName.value)) {
        history.value.unshift(tableName.value);
        if (history.value.length > 10) {
            history.value.pop();
        }
    }

    loading.value = true;
    data.value = {
        index: "",
        add: "",
        info: "",
        entity: "",
        controller: "",
        service: "",
        impl: "",
        mapper: "",
        xml: "",
    };

    try {
        data.value = await http.post("/rapidDevelopmentController/generate", undefined, { params: { tableName: tableName.value } });
        alert("代码生成成功", "success");
    } finally {
        loading.value = false;
    }
};

const getFilename = (item: any) => {
    if (!tableName.value) return `${item.name}.${item.language}`;

    const className = tableName.value.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    switch (item.name) {
        case "entity":
            return `${className}.java`;
        case "controller":
            return `${className}Controller.java`;
        case "service":
            return `${className}Service.java`;
        case "impl":
            return `${className}ServiceImpl.java`;
        case "mapper":
            return `${className}Mapper.java`;
        case "xml":
            return `${className}Mapper.xml`;
        default:
            return `${className}${item.name.charAt(0).toUpperCase() + item.name.slice(1)}.vue`;
    }
};

const copyCode = (item: any) => {
    const code = data.value[item.name as keyof typeof data.value];
    if (code) {
        navigator.clipboard.writeText(code);
        alert("已复制到剪贴板", "success");
    }
};

const downloadCode = (item: any) => {
    const code = data.value[item.name as keyof typeof data.value];
    if (code) {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = getFilename(item);
        a.click();
        URL.revokeObjectURL(url);
    }
};

const copyAll = () => {
    let allCode = '';
    tabList.forEach(item => {
        const code = data.value[item.name as keyof typeof data.value];
        if (code) {
            allCode += `// ${getFilename(item)}\n${code}\n\n`;
        }
    });
    navigator.clipboard.writeText(allCode);
    alert("全部代码已复制", "success");
};

const downloadAll = () => {
    // 实现下载全部功能
    alert("下载功能开发中", "info");
};

const selectHistory = (item: string) => {
    tableName.value = item;
    showHistory.value = false;
};

const removeHistory = (index: number) => {
    history.value.splice(index, 1);
};

const formatTime = (index: number) => {
    const times = ['刚刚', '5分钟前', '10分钟前', '30分钟前', '1小时前', '2小时前'];
    return times[index] || `${index + 1}小时前`;
};
</script>

<style scoped lang="scss">
.code-generator-container {
    min-height: calc(100vh - 70px);
    background: linear-gradient(180deg, var(--el-bg-color-page) 0%, var(--el-fill-color-light) 100%);
}

/* Page Header */
.page-header {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-bottom: 1px solid var(--el-border-color-light);
    padding: 30px 0;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 16px;

    .title-icon {
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 28px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .title-text {
        h1 {
            font-size: 24px;
            font-weight: 700;
            color: var(--el-text-color-primary);
            margin: 0 0 4px 0;
        }

        p {
            font-size: 14px;
            color: var(--el-text-color-secondary);
            margin: 0;
        }
    }
}

/* Content Wrapper */
.content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
}

/* Input Section */
.input-section {
    margin-bottom: 24px;
}

.input-card {
    background: var(--el-bg-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .input-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);

        .el-icon {
            font-size: 18px;
            color: #667eea;
        }
    }
}

.input-wrapper {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .custom-input {
        flex: 1;

        :deep(.el-input__wrapper) {
            border-radius: 12px;
            box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
            padding: 0 16px;
            transition: all 0.3s ease;

            &:hover {
                box-shadow: 0 0 0 1px #667eea inset;
            }

            &.is-focus {
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) inset;
            }
        }

        :deep(.el-input__inner) {
            height: 52px;
            font-size: 16px;
        }

        :deep(.el-input__prefix) {
            font-size: 20px;
            color: var(--el-text-color-secondary);
        }
    }

    .generate-btn {
        height: 52px;
        padding: 0 32px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        &:disabled {
            opacity: 0.6;
        }
    }
}

.input-tips {
    .tip-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
        background: var(--el-fill-color-light);
        border-radius: 8px;
        font-size: 13px;
        color: var(--el-text-color-secondary);

        .el-icon {
            font-size: 16px;
        }

        &.success {
            background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(103, 194, 58, 0.05) 100%);
            color: var(--el-color-success);

            strong {
                color: var(--el-color-success);
                font-weight: 600;
            }
        }
    }
}

/* Code Section */
.code-section {
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding: 0 8px;

        .header-left {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 600;
            color: var(--el-text-color-primary);

            .el-icon {
                font-size: 20px;
                color: #667eea;
            }
        }

        .header-right {
            display: flex;
            gap: 8px;
        }
    }
}

.code-card {
    background: var(--el-bg-color);
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
}

.code-tabs {
    :deep(.el-tabs__header) {
        margin: 0;
        background: var(--el-fill-color-light);
        border-bottom: 1px solid var(--el-border-color-light);
    }

    :deep(.el-tabs__nav) {
        padding: 8px 8px 0;
    }

    :deep(.el-tabs__item) {
        height: 40px;
        line-height: 40px;
        padding: 0 16px;
        margin-right: 4px;
        border-radius: 8px 8px 0 0;
        transition: all 0.3s ease;
        font-size: 13px;

        &:hover {
            color: #667eea;
            background: rgba(102, 126, 234, 0.05);
        }

        &.is-active {
            background: var(--el-bg-color);
            color: #667eea;
            font-weight: 600;
            border-bottom: 2px solid #667eea;
        }
    }

    :deep(.el-tabs__content) {
        padding: 0;
    }
}

.tab-label {
    display: flex;
    align-items: center;
    gap: 6px;
}

.code-content {
    min-height: 500px;
    background: var(--el-bg-color-page);

    .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        background: var(--el-bg-color);
        border-bottom: 1px solid var(--el-border-color-light);

        .filename {
            font-size: 13px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            font-family: 'SFMono-Regular', Consolas, monospace;
            padding: 4px 12px;
            background: var(--el-fill-color-light);
            border-radius: 6px;
        }

        .code-actions {
            display: flex;
            gap: 8px;
        }
    }

    :deep(.code-display) {
        height: calc(500px - 53px);
    }
}

.empty-code {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: var(--el-text-color-secondary);

    .el-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
    }

    span {
        font-size: 14px;
    }
}

/* Empty Section */
.empty-section {
    padding: 40px 0;
}

.empty-content {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
}

.empty-animation {
    width: 200px;
    height: 120px;
    margin: 0 auto 32px;
    background: var(--el-fill-color-light);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .code-line {
        height: 12px;
        background: linear-gradient(90deg, var(--el-border-color-light) 0%, var(--el-fill-color) 50%, var(--el-border-color-light) 100%);
        background-size: 200% 100%;
        border-radius: 6px;
        animation: shimmer 2s infinite;

        &:nth-child(1) { width: 100%; }
        &:nth-child(2) { width: 80%; animation-delay: 0.2s; }
        &:nth-child(3) { width: 90%; animation-delay: 0.4s; }
        &:nth-child(4) { width: 60%; animation-delay: 0.6s; }
    }
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.empty-content {
    h3 {
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 8px 0;
    }

    p {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin: 0 0 24px 0;
    }
}

.feature-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    max-width: 400px;
    margin: 0 auto;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--el-bg-color);
    border-radius: 10px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    .el-icon {
        font-size: 16px;
        color: var(--el-color-success);
    }
}

/* History Dialog */
.history-dialog {
    :deep(.el-dialog__header) {
        padding: 20px;
        border-bottom: 1px solid var(--el-border-color-light);
    }

    :deep(.el-dialog__body) {
        padding: 0;
    }
}

.history-list {
    max-height: 400px;
    overflow-y: auto;
}

.history-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: 1px solid var(--el-border-color-light);

    &:hover {
        background: var(--el-fill-color-light);
    }

    &:last-child {
        border-bottom: none;
    }

    .history-icon {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #667eea;
    }

    .history-info {
        flex: 1;

        .history-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
        }

        .history-time {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-top: 2px;
        }
    }
}

/* Responsive */
@media (max-width: 768px) {
    .header-content {
        padding: 0 16px;
    }

    .content-wrapper {
        padding: 16px;
    }

    .input-wrapper {
        flex-direction: column;

        .generate-btn {
            width: 100%;
        }
    }

    .feature-list {
        grid-template-columns: 1fr;
    }

    .code-content {
        min-height: 400px;

        :deep(.code-display) {
            height: calc(400px - 53px);
        }
    }
}
</style>