<template>
    <div class="file-manager-container">
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon><FolderOpened /></el-icon>
                    </div>
                    <div class="title-text">
                        <h1>文件管理</h1>
                        <p>安全存储，便捷管理</p>
                    </div>
                </div>
                <div class="header-stats">
                    <div class="stat-item">
                        <el-icon><Document /></el-icon>
                        <span>{{ list.length }} 个文件</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="content-wrapper">
            <!-- 文件上传区域 -->
            <div class="upload-section">
                <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
                    <el-upload drag :action="'/joker-box/file/upload?parentId=' + parentId"
                        :headers="{ authorization: CONSTANTS.SYSTEM.TOKEN_TYPE + ' ' + getToken() }" name="uploadFile"
                        :data="{ parentId: parentId }" :on-success="handleUploadSuccess"
                        :on-progress="handleUploadProgress" :on-error="handleUploadError" :show-file-list="false"
                        class="upload-component">
                        <div class="upload-content">
                            <div class="upload-icon-wrapper">
                                <el-icon class="upload-icon"><UploadFilled /></el-icon>
                            </div>
                            <div class="upload-text">
                                <h3>拖拽文件到这里上传</h3>
                                <p>或者 <span class="highlight">点击选择文件</span></p>
                            </div>
                            <div class="upload-hint">
                                <el-icon><InfoFilled /></el-icon>
                                <span>支持单个文件上传，大小不超过 100MB</span>
                            </div>
                        </div>
                    </el-upload>

                    <!-- 上传进度 -->
                    <div v-show="percent > 0" class="upload-progress-wrapper">
                        <div class="progress-header">
                            <span class="progress-title">上传中...</span>
                            <span class="progress-percent">{{ percent }}%</span>
                        </div>
                        <el-progress :percentage="percent" :stroke-width="8" :status="percent == 100 ? 'success' : ''"
                            striped striped-flow class="upload-progress" />
                    </div>
                </div>
            </div>

            <!-- 路径导航和操作按钮 -->
            <div class="toolbar-section">
                <div class="breadcrumb-wrapper">
                    <el-button text circle size="small" @click="goBack" :disabled="history.length <= 1" class="back-btn">
                        <el-icon><ArrowLeft /></el-icon>
                    </el-button>
                    <el-breadcrumb separator="/" class="custom-breadcrumb">
                        <el-breadcrumb-item v-for="(item, index) in history" :key="item.id"
                            @click="chooseFolder(item.id)" :class="{ active: index === history.length - 1 }">
                            <el-icon v-if="item.id === '0'"><HomeFilled /></el-icon>
                            <span v-else>{{ item.name }}</span>
                        </el-breadcrumb-item>
                    </el-breadcrumb>
                </div>

                <div class="action-group">
                    <el-button type="primary" @click="dialogAddFolder.flag = true" class="action-btn primary">
                        <el-icon><FolderAdd /></el-icon>
                        <span>新建文件夹</span>
                    </el-button>
                    <el-button @click="query" class="action-btn" circle>
                        <el-icon><Refresh /></el-icon>
                    </el-button>
                </div>
            </div>

            <!-- 文件列表 -->
            <div class="file-list-section">
                <div v-if="list.length === 0 && !loading" class="empty-state">
                    <div class="empty-icon">
                        <el-icon><FolderOpened /></el-icon>
                    </div>
                    <h3>文件夹是空的</h3>
                    <p>拖拽文件到这里上传，或点击"新建文件夹"</p>
                </div>

                <div v-else class="file-grid">
                    <div v-for="item in list" :key="item.id" class="file-card" @click="handleItemClick(item)"
                        :class="{ folder: item.type === 'folder' }">
                        <div class="file-icon-wrapper">
                            <div class="file-icon" :class="getFileIconClass(item)">
                                <el-icon v-if="item.type === 'folder'" :size="40"><Folder /></el-icon>
                                <el-icon v-else-if="isImage(item)" :size="40"><Picture /></el-icon>
                                <el-icon v-else-if="isVideo(item)" :size="40"><VideoCamera /></el-icon>
                                <el-icon v-else-if="isDocument(item)" :size="40"><Document /></el-icon>
                                <el-icon v-else :size="40"><Document /></el-icon>
                            </div>
                            <div v-if="item.type !== 'folder'" class="file-type-badge">
                                {{ getFileExtension(item.filename) }}
                            </div>
                        </div>
                        <div class="file-info">
                            <div class="filename" :title="item.filename">{{ item.filename }}</div>
                            <div class="file-meta">
                                <span class="file-size">{{ formatFileSize(item.size) }}</span>
                                <span class="file-date">{{ formatDate(item.createTime) }}</span>
                            </div>
                        </div>
                        <div class="file-actions" @click.stop>
                            <el-dropdown trigger="click" placement="bottom-end">
                                <el-button text circle class="more-btn">
                                    <el-icon><MoreFilled /></el-icon>
                                </el-button>
                                <template #dropdown>
                                    <el-dropdown-menu class="file-dropdown-menu">
                                        <el-dropdown-item v-if="item.type === 'folder'" @click.stop="openFolder(item)">
                                            <el-icon><FolderOpened /></el-icon>
                                            <span>打开</span>
                                        </el-dropdown-item>
                                        <el-dropdown-item v-if="item.type !== 'folder'" @click.stop="previewFile(item)">
                                            <el-icon><View /></el-icon>
                                            <span>预览</span>
                                        </el-dropdown-item>
                                        <el-dropdown-item v-if="item.type !== 'folder'" @click.stop="downloadFile(item)">
                                            <el-icon><Download /></el-icon>
                                            <span>下载</span>
                                        </el-dropdown-item>
                                        <el-dropdown-item @click.stop="openRenameDialog(item)">
                                            <el-icon><EditPen /></el-icon>
                                            <span>重命名</span>
                                        </el-dropdown-item>
                                        <el-dropdown-item divided @click.stop="remove(item.id)" class="danger">
                                            <el-icon><Delete /></el-icon>
                                            <span>删除</span>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </div>
                </div>

                <el-skeleton v-if="loading" :rows="3" animated class="loading-skeleton" />
            </div>
        </div>

        <!-- 新建文件夹弹窗 -->
        <el-dialog v-model="dialogAddFolder.flag" title="新建文件夹" width="420px" center class="custom-dialog">
            <div class="dialog-content">
                <div class="dialog-icon">
                    <el-icon><FolderAdd /></el-icon>
                </div>
                <el-form class="dialog-form">
                    <el-form-item>
                        <el-input v-model="dialogAddFolder.value" placeholder="请输入文件夹名称" clearable size="large"
                            @keyup.enter="add">
                            <template #prefix>
                                <el-icon><Folder /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <el-button @click="dialogAddFolder.flag = false" size="large">取消</el-button>
                <el-button type="primary" @click="add" size="large" :disabled="!dialogAddFolder.value.trim()">
                    创建
                </el-button>
            </template>
        </el-dialog>

        <!-- 重命名弹窗 -->
        <el-dialog v-model="dialogEdit.flag" title="重命名" width="420px" center class="custom-dialog">
            <div class="dialog-content">
                <div class="dialog-icon">
                    <el-icon><EditPen /></el-icon>
                </div>
                <el-form class="dialog-form">
                    <el-form-item>
                        <el-input v-model="dialogEdit.value" placeholder="请输入新名称" clearable size="large"
                            @keyup.enter="rename">
                            <template #prefix>
                                <el-icon><Document /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <el-button @click="dialogEdit.flag = false" size="large">取消</el-button>
                <el-button type="primary" @click="rename" size="large" :disabled="!dialogEdit.value.trim()">
                    确认
                </el-button>
            </template>
        </el-dialog>

        <!-- 文件查看弹窗 -->
        <el-dialog v-model="dialogView.flag" :title="dialogView.title" width="80%" top="5vh"
            @close="dialogView.flag = false" class="preview-dialog" destroy-on-close>
            <ViewView :fileId="dialogView.id" :contentType="dialogView.contentType" :filename="dialogView.title"
                v-if="dialogView.flag" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
    UploadFilled, FolderAdd, Document, Folder, MoreFilled,
    FolderOpened, ArrowLeft, HomeFilled, Refresh, Picture,
    VideoCamera, View, Download, EditPen, Delete, InfoFilled
} from '@element-plus/icons-vue';
import { alert, confirm, CONSTANTS, getToken, http } from '@/utils';
import ViewView from './ViewView.vue';
import type { UploadFile, UploadFiles, UploadProgressEvent } from 'element-plus';

const percent = ref(0);
const parentId = ref('0');
const list = ref<any[]>([]);
const history = ref([{ id: '0', name: '根目录' }]);
const loading = ref(false);

const dialogAddFolder = ref({
    flag: false,
    value: ''
});

const dialogEdit = ref({
    flag: false,
    value: '',
    id: ''
});

const dialogView = ref({
    flag: false,
    title: '',
    id: '',
    contentType: ''
});

const query = async () => {
    loading.value = true;
    try {
        list.value = await http.post('/file/list', undefined, { params: { parentId: parentId.value } });
    } finally {
        loading.value = false;
    }
};

const handleUploadSuccess = (response: any, file: UploadFile, files: UploadFiles) => {
    percent.value = 0;
    query();
    alert('上传成功', 'success');
};

const handleUploadProgress = (evt: UploadProgressEvent, file: UploadFile, files: UploadFiles) => {
    percent.value = Math.round(evt.percent);
};

const handleUploadError = (error: Error, file: UploadFile, files: UploadFiles) => {
    percent.value = 0;
    alert('上传失败', 'error');
};

const handleDrop = (e: DragEvent) => {
    // 处理拖拽上传
};

const handleItemClick = (item: any) => {
    if (item.type === 'folder') {
        openFolder(item);
    } else {
        previewFile(item);
    }
};

const openFolder = (folder: any) => {
    parentId.value = folder.id;
    history.value.push({ id: folder.id, name: folder.filename });
    query();
};

const goBack = () => {
    if (history.value.length > 1) {
        history.value.pop();
        parentId.value = history.value[history.value.length - 1].id;
        query();
    }
};

const previewFile = (file: any) => {
    dialogView.value.id = file.id;
    dialogView.value.title = file.filename;
    dialogView.value.contentType = file.contentType;
    dialogView.value.flag = true;
};

const chooseFolder = (id: string) => {
    let tmp = [];
    for (let index = 0; index < history.value.length; index++) {
        const element = history.value[index];
        tmp.push(element);
        if (id == element.id) {
            parentId.value = id;
            history.value = tmp;
            query();
            break;
        }
    }
};

const add = async () => {
    if (!dialogAddFolder.value.value.trim()) {
        alert('请输入文件夹名称', 'warning');
        return;
    }

    await http.post('/file/createFolder', undefined, {
        params: {
            parentId: parentId.value,
            fileName: dialogAddFolder.value.value
        }
    });
    alert('创建成功', 'success');
    dialogAddFolder.value.flag = false;
    dialogAddFolder.value.value = '';
    query();
};

const remove = (fileId: string) => {
    confirm('删除确认', '确定要删除这个文件吗？删除后无法恢复。', async () => {
        await http.post('/file/delete', undefined, { params: { fileId: fileId } });
        alert('删除成功', 'success');
        query();
    });
};

const openRenameDialog = (item: any) => {
    dialogEdit.value.flag = true;
    dialogEdit.value.id = item.id;
    dialogEdit.value.value = item.filename;
};

const rename = async () => {
    if (!dialogEdit.value.value.trim()) {
        alert('请输入新名称', 'warning');
        return;
    }

    await http.post('/file/rename', undefined, {
        params: {
            fileId: dialogEdit.value.id,
            filename: dialogEdit.value.value
        }
    });
    alert('重命名成功', 'success');
    dialogEdit.value.flag = false;
    dialogEdit.value.value = '';
    dialogEdit.value.id = '';
    query();
};

const downloadFile = (file: any) => {
    window.open(`/joker-box/file/download?fileId=${file.id}`, '_blank');
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

const getFileExtension = (filename: string) => {
    const ext = filename.split('.').pop();
    return ext ? ext.toUpperCase() : '';
};

const isImage = (item: any) => {
    return item.contentType?.startsWith('image/');
};

const isVideo = (item: any) => {
    return item.contentType?.startsWith('video/');
};

const isDocument = (item: any) => {
    const docTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument'];
    return docTypes.some(type => item.contentType?.includes(type));
};

const getFileIconClass = (item: any) => {
    if (item.type === 'folder') return 'folder';
    if (isImage(item)) return 'image';
    if (isVideo(item)) return 'video';
    if (isDocument(item)) return 'document';
    return 'default';
};

onMounted(() => {
    query();
});
</script>

<style scoped lang="scss">
.file-manager-container {
    min-height: calc(100vh - 70px);
    background: linear-gradient(180deg, var(--bg-page) 0%, var(--bg-overlay) 100%);
}

/* Page Header */
.page-header {
    background: var(--brand-gradient-soft);
    border-bottom: 1px solid var(--border-light);
    padding: 30px 0;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 16px;

    .title-icon {
        width: 56px;
        height: 56px;
        background: var(--brand-gradient);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-on-brand);
        font-size: 28px;
        box-shadow: var(--shadow-glow);
    }

    .title-text {
        h1 {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 4px 0;
        }

        p {
            font-size: 14px;
            color: var(--text-secondary);
            margin: 0;
        }
    }
}

.header-stats {
    .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: var(--bg-container);
        border-radius: 12px;
        font-size: 14px;
        color: var(--text-regular);
        box-shadow: var(--shadow-sm);

        .el-icon {
            font-size: 18px;
            color: var(--brand-primary);
        }
    }
}

/* Content Wrapper */
.content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
}

/* Upload Section */
.upload-section {
    margin-bottom: 24px;
}

.upload-area {
    background: var(--bg-container);
    border-radius: 16px;
    padding: 8px;
    box-shadow: var(--shadow-md);
}

.upload-component {
    :deep(.el-upload) {
        width: 100%;
    }

    :deep(.el-upload-dragger) {
        width: 100%;
        height: auto;
        padding: 40px;
        border: 2px dashed var(--border-base);
        border-radius: 12px;
        background: transparent;
        transition: all 0.3s ease;

        &:hover {
            border-color: var(--brand-primary);
            background: linear-gradient(135deg, var(--bg-overlay) 0%, var(--bg-overlay) 100%);
        }
    }
}

.upload-content {
    text-align: center;
}

.upload-icon-wrapper {
    width: 80px;
    height: 80px;
    background: var(--brand-gradient-soft);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;

    .upload-icon {
        font-size: 40px;
        color: var(--brand-primary);
    }
}

.upload-text {
    h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 8px 0;
    }

    p {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;

        .highlight {
            color: var(--brand-primary);
            font-weight: 500;
            cursor: pointer;
        }
    }
}

.upload-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 16px;
    font-size: 12px;
    color: var(--text-secondary);

    .el-icon {
        font-size: 14px;
    }
}

.upload-progress-wrapper {
    padding: 16px 24px;
    border-top: 1px solid var(--border-light);

    .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .progress-title {
            font-size: 14px;
            color: var(--text-regular);
        }

        .progress-percent {
            font-size: 14px;
            font-weight: 600;
            color: var(--brand-primary);
        }
    }
}

/* Toolbar Section */
.toolbar-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 12px 16px;
    background: var(--bg-container);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
}

.breadcrumb-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;

    .back-btn {
        flex-shrink: 0;
    }

    .custom-breadcrumb {
        :deep(.el-breadcrumb__item) {
            cursor: pointer;

            .el-breadcrumb__inner {
                display: flex;
                align-items: center;
                gap: 4px;
                color: var(--text-secondary);
                transition: all 0.3s ease;

                &:hover {
                    color: var(--brand-primary);
                }
            }

            &.active .el-breadcrumb__inner {
                color: var(--text-primary);
                font-weight: 600;
                cursor: default;

                &:hover {
                    color: var(--text-primary);
                }
            }
        }
    }
}

.action-group {
    display: flex;
    gap: 8px;

    .action-btn {
        &.primary {
            background: var(--brand-gradient);
            border: none;

            &:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-glow);
            }
        }
    }
}

/* File List Section */
.file-list-section {
    min-height: 400px;
}

.empty-state {
    text-align: center;
    padding: 80px 20px;
    background: var(--bg-container);
    border-radius: 16px;
    box-shadow: var(--shadow-md);

    .empty-icon {
        width: 100px;
        height: 100px;
        background: var(--brand-gradient-soft);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        font-size: 48px;
        color: var(--brand-primary);
    }

    h3 {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 8px 0;
    }

    p {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
    }
}

.file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.file-card {
    background: var(--bg-container);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    position: relative;

    &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: var(--bg-overlay-strong);

        .file-actions {
            opacity: 1;
        }
    }

    &.folder {
        .file-icon {
            background: var(--warning-bg);
            color: var(--warning);
        }
    }
}

.file-icon-wrapper {
    position: relative;
    margin-bottom: 12px;

    .file-icon {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        transition: all 0.3s ease;

        &.folder {
            background: var(--warning-bg);
            color: var(--warning);
        }

        &.image {
            background: var(--success-bg);
            color: var(--success);
        }

        &.video {
            background: var(--danger-bg);
            color: var(--danger);
        }

        &.document {
            background: var(--info-bg);
            color: var(--info);
        }

        &.default {
            background: linear-gradient(135deg, var(--bg-overlay-strong) 0%, var(--bg-overlay-strong) 100%);
            color: var(--brand-primary);
        }
    }

    .file-type-badge {
        position: absolute;
        bottom: -4px;
        right: calc(50% - 32px);
        padding: 2px 8px;
        background: var(--bg-container);
        border: 1px solid var(--border-light);
        border-radius: 10px;
        font-size: 10px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
    }
}

.file-info {
    text-align: center;

    .filename {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .file-meta {
        display: flex;
        justify-content: center;
        gap: 8px;
        font-size: 12px;
        color: var(--text-secondary);
    }
}

.file-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;

    .more-btn {
        background: var(--bg-container);
        box-shadow: var(--shadow-sm);

        &:hover {
            background: var(--bg-overlay);
        }
    }
}

/* Dialog Styles */
.custom-dialog {
    :deep(.el-dialog__header) {
        text-align: center;
        padding: 24px;
        border-bottom: 1px solid var(--border-light);

        .el-dialog__title {
            font-size: 18px;
            font-weight: 600;
        }
    }

    :deep(.el-dialog__body) {
        padding: 24px;
    }

    :deep(.el-dialog__footer) {
        padding: 16px 24px 24px;
        border-top: 1px solid var(--border-light);
    }
}

.dialog-content {
    text-align: center;

    .dialog-icon {
        width: 64px;
        height: 64px;
        background: var(--brand-gradient-soft);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        font-size: 32px;
        color: var(--brand-primary);
    }

    .dialog-form {
        max-width: 320px;
        margin: 0 auto;
    }
}

/* Dropdown Menu */
.file-dropdown-menu {
    .el-dropdown-menu__item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;

        .el-icon {
            font-size: 16px;
        }

        &.danger {
            color: var(--danger);

            &:hover {
                background-color: var(--danger-bg);
            }
        }
    }
}

/* Loading Skeleton */
.loading-skeleton {
    padding: 20px;
}

/* Responsive */
@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
    }

    .content-wrapper {
        padding: 16px;
    }

    .file-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
    }

    .toolbar-section {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }

    .breadcrumb-wrapper {
        order: 2;
    }

    .action-group {
        order: 1;
        justify-content: flex-end;
    }
}

@media (max-width: 480px) {
    .file-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .upload-content {
        padding: 20px;
    }
}
</style>