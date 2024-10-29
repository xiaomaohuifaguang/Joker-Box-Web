<template>
    <el-descriptions title="" direction="vertical" border style="margin-top: 20px" size="small">
        <el-descriptions-item :rowspan="2" :width="100" label="头像" align="center">
            <el-upload class="avatar-uploader" :action="CONSTANTS.HTTP.BASEURL + '/auth/avatarUpload'"
                accept="image/png, image/jpeg"
                :headers="{ authorization: CONSTANTS.SYSTEM.TOKEN_TYPE + ' ' + getToken() }" name="uploadFile"
                :on-success="(response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => { alert('上传成功', 'success'); avatarFlag = !avatarFlag; }"
                :on-progress="(evt: UploadProgressEvent, uploadFile: UploadFile, uploadFiles: UploadFiles) => { }"
                :on-error="(error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) => { alert('上传失败', 'error') }"
                :show-file-list="false">
                <el-image :src="CONSTANTS.HTTP.BASEURL + '/auth/avatar/' + userInfo().username" fit="fill"
                    :key="avatarFlag" style="height: 100px;width: 100px;">
                    <template #error>
                        <div>
                            <el-icon class="avatar-uploader-icon">
                                <Plus />
                            </el-icon>
                        </div>
                    </template>
                </el-image>
            </el-upload>
        </el-descriptions-item>
        <el-descriptions-item label="用户名">{{ userInfoTmp.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ userInfoTmp.nickname }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ userInfoTmp.sex }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">
            {{ userInfoTmp.mail }}
        </el-descriptions-item>
    </el-descriptions>
</template>
<script setup lang='ts'>
import { alert, CONSTANTS, getToken, http, saveUserInfo, userInfo } from '@/utils';
import { onMounted, ref } from 'vue';
import { Plus } from '@element-plus/icons-vue'
import { UploadFile, UploadFiles, UploadProgressEvent } from 'element-plus';


const userInfoTmp = ref({
    "username": "zhangsan",
    "nickname": "超级管理员",
    "admin": false,
    "sex": "未知",
    "mail": null,
    "phone": null
})
const avatarFlag = ref(true)


async function getUserInfo() {
    http.result({
        url: '/auth/userInfo',
        method: 'POST',
        success(result) {
            saveUserInfo(result.data)
        }
    })
}

onMounted(() => {
    getUserInfo()
    userInfoTmp.value = userInfo()

})

</script>

<style scoped>
.el-col {
    margin-top: 1rem;
}
</style>
<style scoped>
.avatar-uploader .avatar {
    width: 100px;
    height: 100px;
    display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 78px;
    height: 88px;
    text-align: center;
}
</style>
