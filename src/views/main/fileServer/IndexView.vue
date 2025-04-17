<template>
    <div class="file-manager-container">
        <el-row :gutter="20">
            <el-col :span="20" :offset="2">
                <!-- 文件上传区域 -->
                <el-card shadow="hover" class="upload-card">
                    <el-upload drag :action="'/joker-box/file/upload?parentId=' + parentId"
                        :headers="{ authorization: CONSTANTS.SYSTEM.TOKEN_TYPE + ' ' + getToken() }" name="uploadFile"
                        :data="{ parentId: parentId }" :on-success="handleUploadSuccess"
                        :on-progress="handleUploadProgress" :on-error="handleUploadError" :show-file-list="false"
                        class="upload-container">
                        <el-icon class="upload-icon"><upload-filled /></el-icon>
                        <div class="el-upload__text">
                            拖拽文件到这里或<em>点击上传</em>
                        </div>
                        <div class="el-upload__tip">
                            支持单个文件上传，大小不超过100MB
                        </div>
                    </el-upload>

                    <!-- 上传进度 -->
                    <el-progress v-show="percent > 0" :percentage="percent" :stroke-width="16"
                        :status="percent == 100 ? 'success' : ''" striped striped-flow class="upload-progress" />
                </el-card>

                <!-- 路径导航和操作按钮 -->
                <el-card shadow="hover" class="path-card">
                    <div class="path-navigation">
                        <el-breadcrumb separator="/">
                            <el-breadcrumb-item v-for="item in history" :key="item.id" @click="chooseFolder(item.id)">
                                {{ item.name }}
                            </el-breadcrumb-item>
                        </el-breadcrumb>

                        <el-button type="primary" size="small" @click="dialogAddFolder.flag = true"
                            class="new-folder-btn">
                            <el-icon>
                                <FolderAdd />
                            </el-icon>
                            新建文件夹
                        </el-button>
                    </div>
                </el-card>

                <!-- 文件列表 -->
                <el-card shadow="hover" class="file-list-card">
                    <el-table :data="list" style="width: 100%" :empty-text="'暂无文件'" v-loading="loading"
                        @row-click="handleRowClick">
                        <el-table-column width="50">
                            <template #default="{ row }">
                                <el-icon size="20">
                                    <Document v-if="row.type != 'folder'" />
                                    <Folder v-if="row.type == 'folder'" />
                                </el-icon>
                            </template>
                        </el-table-column>

                        <el-table-column prop="filename" label="文件名" min-width="200">
                            <template #default="{ row }">
                                <span class="filename">{{ row.filename }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column prop="createTime" label="修改日期" width="180" />

                        <el-table-column prop="size" label="大小" width="120">
                            <template #default="{ row }">
                                {{ formatFileSize(row.size) }}
                            </template>
                        </el-table-column>

                        <el-table-column label="操作" width="100" align="right">
                            <template #default="{ row, $index }">
                                <el-dropdown trigger="click" @click.stop>
                                    <el-button text circle @click.stop>
                                        <el-icon>
                                            <MoreFilled />
                                        </el-icon>
                                    </el-button>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item v-if="row.type == 'folder'" @click.stop="openFolder(row)">
                                                打开
                                            </el-dropdown-item>
                                            <el-dropdown-item v-if="row.type != 'folder'"
                                                @click.stop="previewFile(row)">
                                                预览
                                            </el-dropdown-item>
                                            <el-dropdown-item v-if="row.type != 'folder'"
                                                @click.stop="downloadFile(row)">
                                                下载
                                            </el-dropdown-item>
                                            <el-dropdown-item @click.stop="openRenameDialog(row)">
                                                重命名
                                            </el-dropdown-item>
                                            <el-dropdown-item @click.stop="remove(row.id)"
                                                style="color: var(--el-color-danger)">
                                                删除
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>

        <!-- 新建文件夹弹窗 -->
        <el-dialog v-model="dialogAddFolder.flag" title="新建文件夹" width="400px" center>
            <el-form>
                <el-form-item label="文件夹名称">
                    <el-input v-model="dialogAddFolder.value" placeholder="请输入文件夹名称" clearable />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogAddFolder.flag = false">取消</el-button>
                <el-button type="primary" @click="add">确认</el-button>
            </template>
        </el-dialog>

        <!-- 重命名弹窗 -->
        <el-dialog v-model="dialogEdit.flag" title="重命名" width="400px" center>
            <el-form>
                <el-form-item label="新名称">
                    <el-input v-model="dialogEdit.value" placeholder="请输入新名称" clearable />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogEdit.flag = false">取消</el-button>
                <el-button type="primary" @click="rename">确认</el-button>
            </template>
        </el-dialog>

        <!-- 文件查看弹窗 -->
        <el-dialog v-model="dialogView.flag" :title="dialogView.title" width="80%" top="5vh"
            @close="dialogView.flag = false">
            <ViewView :fileId="dialogView.id" :contentType="dialogView.contentType" :filename="dialogView.title"
                v-if="dialogView.flag" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { UploadFilled, FolderAdd, Document, Folder, MoreFilled } from '@element-plus/icons-vue';
import { alert, confirm, CONSTANTS, getToken, http } from '@/utils';
import ViewView from './ViewView.vue';
import type { UploadFile, UploadFiles, UploadProgressEvent } from 'element-plus';

const percent = ref(0);
const parentId = ref('0');
const list = ref([]);
const history = ref([{ id: '0', name: '根路径' }]);
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

const query = () => {
    loading.value = true;
    http.result({
        url: '/file/list',
        method: 'POST',
        params: { parentId: parentId.value },
        success(result) {
            list.value = result.data;
            loading.value = false;
        },
        error() {
            loading.value = false;
        }
    });
};

const handleUploadSuccess = (response: any, file: UploadFile, files: UploadFiles) => {
    percent.value = 0;
    query();
    alert('上传成功', 'success');
};

const handleUploadProgress = (evt: UploadProgressEvent, file: UploadFile, files: UploadFiles) => {
    percent.value = evt.percent;
};

const handleUploadError = (error: Error, file: UploadFile, files: UploadFiles) => {
    percent.value = 0;
    alert('上传失败', 'error');
};

const handleRowClick = (row: any) => {
    if (row.type === 'folder') {
        openFolder(row);
    } else {
        previewFile(row);
    }
};

const openFolder = (folder: any) => {
    parentId.value = folder.id;
    history.value.push({ id: folder.id, name: folder.filename });
    query();
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

const add = () => {
    if (!dialogAddFolder.value.value.trim()) {
        alert('请输入文件夹名称', 'warning');
        return;
    }

    http.result({
        url: '/file/createFolder',
        method: 'POST',
        params: {
            parentId: parentId.value,
            fileName: dialogAddFolder.value.value
        },
        success(result) {
            if (result.code == 200) {
                alert('添加成功', 'success');
                dialogAddFolder.value.flag = false;
                dialogAddFolder.value.value = '';
                query();
            }
        }
    });
};

const remove = (fileId: string) => {
    confirm('提示', '确认要删除吗？', () => {
        http.result({
            url: '/file/delete',
            method: 'POST',
            params: { fileId: fileId },
            success(result) {
                if (result.code == 200) {
                    alert('删除成功', 'success');
                    query();
                }
            }
        });
    });
};

const openRenameDialog = (item: any) => {
    dialogEdit.value.flag = true;
    dialogEdit.value.id = item.id;
    dialogEdit.value.value = item.filename;
};

const rename = () => {
    if (!dialogEdit.value.value.trim()) {
        alert('请输入新名称', 'warning');
        return;
    }

    http.result({
        url: '/file/rename',
        method: 'POST',
        params: {
            fileId: dialogEdit.value.id,
            filename: dialogEdit.value.value
        },
        success(result) {
            if (result.code == 200) {
                alert('重命名成功', 'success');
                dialogEdit.value.flag = false;
                dialogEdit.value.value = '';
                dialogEdit.value.id = '';
                query();
            }
        }
    });
};

const downloadFile = (file: any) => {
    window.open(`/joker-box/file/download?fileId=${file.id}`, '_blank');
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

onMounted(() => {
    query();
});
</script>

<style scoped lang="scss">
.file-manager-container {
    padding: 20px 0;
    min-height: calc(100vh - 60px);
    background-color: var(--el-bg-color-page);
}

.upload-card {
    margin-bottom: 20px;
    border-radius: 12px;

    :deep(.el-card__body) {
        padding: 20px;
    }
}

.upload-container {
    text-align: center;

    .upload-icon {
        font-size: 60px;
        color: var(--el-color-primary);
        margin-bottom: 15px;
    }

    .el-upload__text {
        font-size: 16px;
        color: var(--el-text-color-regular);
        margin-bottom: 10px;

        em {
            color: var(--el-color-primary);
            font-style: normal;
            font-weight: 500;
        }
    }

    .el-upload__tip {
        font-size: 12px;
        color: var(--el-text-color-secondary);
    }

    :deep(.el-upload-dragger) {
        border: 2px dashed var(--el-border-color);
        background-color: var(--el-bg-color);
        padding: 40px 20px;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
            border-color: var(--el-color-primary);
        }
    }
}

.upload-progress {
    margin-top: 15px;
}

.path-card {
    margin-bottom: 20px;
    border-radius: 12px;

    :deep(.el-card__body) {
        padding: 15px 20px;
    }
}

.path-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .el-breadcrumb {
        flex: 1;
        margin-right: 15px;

        :deep(.el-breadcrumb__inner) {
            cursor: pointer;
            transition: color 0.3s;

            &:hover {
                color: var(--el-color-primary);
            }
        }
    }

    .new-folder-btn {
        white-space: nowrap;
    }
}

.file-list-card {
    border-radius: 12px;

    :deep(.el-card__body) {
        padding: 0;
    }

    :deep(.el-table) {
        .el-table__row {
            cursor: pointer;

            &:hover {
                background-color: var(--el-color-primary-light-9);
            }
        }

        .filename {
            font-weight: 500;
        }

        .el-icon {
            vertical-align: middle;
        }
    }
}

.el-dialog {
    border-radius: 12px;

    :deep(.el-dialog__header) {
        border-bottom: 1px solid var(--el-border-color-light);
        margin-right: 0;
    }

    :deep(.el-dialog__body) {
        padding: 20px;
    }

    :deep(.el-dialog__footer) {
        border-top: 1px solid var(--el-border-color-light);
        padding: 15px 20px;
        text-align: center;
    }
}

@media (max-width: 768px) {
    .el-col {
        width: 100%;
        margin-left: 0 !important;
    }

    .path-navigation {
        flex-direction: column;
        align-items: flex-start;

        .el-breadcrumb {
            margin-bottom: 10px;
            margin-right: 0;
            width: 100%;
        }

        .new-folder-btn {
            align-self: flex-end;
        }
    }
}
</style>