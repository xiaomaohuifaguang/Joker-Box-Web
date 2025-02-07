<template>
    <el-row :gutter="20">
        <el-col :span="18" :offset="3">
            <!-- 文件上传区域 -->
            <el-upload drag :action="'/joker-box/file/upload?parentId=' + parentId"
                :headers="{ authorization: CONSTANTS.SYSTEM.TOKEN_TYPE + ' ' + getToken() }" name="uploadFile"
                :data="{ parentId: parentId }"
                :on-success="(response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => { query() }"
                :on-progress="(evt: UploadProgressEvent, uploadFile: UploadFile, uploadFiles: UploadFiles) => { percent = evt.percent; }"
                :on-error="(error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) => { alert('上传失败', 'error') }"
                :show-file-list="false" class="upload-container">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                    拖拽文件到这里 或<em>点击上传</em>
                </div>
            </el-upload>

            <!-- 上传进度 -->
            <div style="height: 3vh;">
                <el-progress v-show="percent > 0" :percentage="percent" :text-inside="percent != 100" :stroke-width="20"
                    :status="percent == 100 ? 'success' : ''" striped-flow />
            </div>

            <!-- 文件夹历史记录和新建文件夹按钮 -->
            <el-row style="margin-top: 1rem;">
                <el-col :span="22">
                    <el-button @click="chooseFolder(item.id)" link v-for="item in history" class="history-menu-item">
                        {{ item.name + ' /' }}
                    </el-button>
                </el-col>
                <el-col :span="2">
                    <div style="float: right;">
                        <el-button type="primary" link @click="dialogAddFolder.flag = true">新建文件夹</el-button>
                    </div>
                </el-col>
            </el-row>

            <el-divider />

            <!-- 文件列表 -->
            <el-scrollbar style="height: 60vh;padding-right: 1rem;">
                <el-row>
                    <el-col v-for="item in list" class="item-col" :key="item.id">
                        <el-row style="padding: 0.5rem; font-size: 1rem;">
                            <el-col :span="16" @click="click(item)" class="file-item">
                                <el-icon style="margin-right: 1rem;">
                                    <Document v-if="item.type != 'folder'" />
                                    <Folder v-if="item.type == 'folder'" />
                                </el-icon>
                                {{ item.filename }}
                            </el-col>
                            <el-col :span="2">
                                <div style="float: right;">{{ item.createTime }}</div>
                            </el-col>
                            <el-col :span="2">
                                <div style="float: right;">{{ item.size.toLocaleString() }}</div>
                            </el-col>
                            <el-col :span="4">
                                <div style="float: right;">
                                    <el-dropdown trigger="click">
                                        <el-icon>
                                            <MoreFilled />
                                        </el-icon>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <el-dropdown-item v-if="item.type == 'folder'"
                                                    @click="click(item)">打开</el-dropdown-item>
                                                <el-dropdown-item v-if="item.type != 'folder'"
                                                    @click="click(item)">预览</el-dropdown-item>
                                                <el-dropdown-item v-if="item.type != 'folder'">下载</el-dropdown-item>
                                                <el-dropdown-item
                                                    @click="() => { dialogEdit.flag = true; dialogEdit.id = item.id; dialogEdit.value = item.filename }">重命名</el-dropdown-item>
                                                <el-dropdown-item @click="remove(item.id)">删除</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>
                                </div>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
                <div style="height: 200px;">
                    <!-- 占位 -->
                </div>
            </el-scrollbar>
        </el-col>
    </el-row>

    <!-- 新建文件夹弹窗 -->
    <el-dialog v-model="dialogAddFolder.flag" width="500" title="新建文件夹" center top="40vh">
        <el-input placeholder="输入新建文件夹名称" v-model="dialogAddFolder.value" />
        <template #footer>
            <el-button @click="dialogAddFolder.value = ''; dialogAddFolder.flag = false;"
                class="footer-button">取消</el-button>
            <el-button type="primary" @click="add()" class="footer-button">确认</el-button>
        </template>
    </el-dialog>

    <!-- 重命名文件夹弹窗 -->
    <el-dialog v-model="dialogEdit.flag" width="500" title="重命名文件夹" center>
        <el-input placeholder="输入新的文件夹名称" v-model="dialogEdit.value" />
        <template #footer>
            <el-button @click="dialogEdit.value = ''; dialogEdit.flag = false; dialogEdit.id = ''"
                class="footer-button">取消</el-button>
            <el-button type="primary" @click="rename()" class="footer-button">确认</el-button>
        </template>
    </el-dialog>

    <!-- 文件查看弹窗 -->
    <el-dialog v-model="dialogView.flag" width="800" :title="dialogView.title" center @close=""
        :close-on-click-modal="false" :close-on-press-escape="false">
        <ViewView :fileId="dialogView.id" :contentType="dialogView.contentType" :filename="dialogView.title"
            v-if="dialogView.flag" />
    </el-dialog>
</template>

<script setup lang='ts'>
import Document from '@/components/icon/Document.vue';
import Folder from '@/components/icon/Folder.vue';
import { alert, confirm, CONSTANTS, getToken, http } from '@/utils';
import { onMounted, ref } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import { UploadFile, UploadFiles, UploadProgressEvent } from 'element-plus';
import ViewView from './ViewView.vue';

const percent = ref(0);
const parentId = ref('0');
const list = ref([]);
const history = ref([{ id: '0', name: '根路径' }]);
const dialogAddFolder = ref({ flag: false, value: '' });
const dialogEdit = ref({ flag: false, value: '', id: '' });
const dialogView = ref({ flag: false, title: '', id: '', contentType: '' });

const query = () => {
    http.result({
        url: '/file/list',
        method: 'POST',
        params: { parentId: parentId.value },
        success(result) {
            list.value = result.data;
        }
    });
};

const click = (item: any) => {
    if (item.type == 'folder') {
        parentId.value = item.id;
        history.value.push({ id: item.id, name: item.filename });
        query();
    } else {
        dialogView.value.id = item.id;
        dialogView.value.title = item.filename;
        dialogView.value.contentType = item.contentType;
        dialogView.value.flag = true;
    }
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
    http.result({
        url: '/file/createFolder',
        method: 'POST',
        params: { parentId: parentId.value, fileName: dialogAddFolder.value.value },
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

const rename = () => {
    http.result({
        url: '/file/rename',
        method: 'POST',
        params: { fileId: dialogEdit.value.id, filename: dialogEdit.value.value },
        success(result) {
            if (result.code == 200) {
                alert('请求成功', 'success');
                dialogEdit.value.flag = false;
                dialogEdit.value.value = '';
                dialogEdit.value.id = '';
                query();
            }
        }
    });
};

onMounted(() => {
    query();
});
</script>

<style scoped>
.upload-container .el-upload__text {
    color: var(--el-text-color);
    font-size: 1rem;
    line-height: 1.5;
    font-weight: normal;
}

.upload-container .el-upload__dragger {
    border: 2px dashed var(--el-border-color);
    padding: 3rem;
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-background-color);
}

.upload-container .el-upload__text em {
    color: var(--el-color-primary);
}

.history-menu-item {
    cursor: pointer;
    color: var(--el-text-color);
    font-size: 1rem;
}

.history-menu-item:hover {
    color: var(--el-color-primary);
}

.item-col {
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    cursor: pointer;
    margin-top: 1rem;
}

.item-col:hover {
    background-color: var(--el-color-primary-light);
    border-color: var(--el-color-primary);
}

.file-item {
    display: flex;
    align-items: center;
}

.file-item .el-icon {
    margin-right: 1rem;
}

.el-dialog .el-input {
    width: 100%;
    margin-bottom: 1rem;
}

.el-dialog .el-button {
    margin: 0.5rem;
}

.footer-button {
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    border-radius: 4px;
    min-width: 100px;
}
</style>
