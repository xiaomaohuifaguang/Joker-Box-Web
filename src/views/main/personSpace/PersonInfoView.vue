<template>
    <div class="user-profile-container">
        <el-card shadow="hover" class="profile-card">
            <el-descriptions title="个人信息" direction="vertical" border size="small" :column="2">
                <el-descriptions-item :rowspan="3" :width="120" label="头像" align="center" class="avatar-item">
                    <el-upload class="avatar-uploader" :action="CONSTANTS.HTTP.BASEURL + '/auth/avatarUpload'"
                        accept="image/png, image/jpeg"
                        :headers="{ authorization: CONSTANTS.SYSTEM.TOKEN_TYPE + ' ' + getToken() }" name="uploadFile"
                        :on-success="(response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                            alert('上传成功', 'success');
                            avatarFlag = !avatarFlag;
                        }"
                        :on-progress="(evt: UploadProgressEvent, uploadFile: UploadFile, uploadFiles: UploadFiles) => { }"
                        :on-error="(error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                            alert('上传失败', 'error')
                        }" :show-file-list="false">
                        <el-image :src="CONSTANTS.HTTP.BASEURL + '/auth/avatar/' + userInfo().userId" fit="cover"
                            :key="avatarFlag" class="avatar-image">
                            <template #error>
                                <div class="avatar-error">
                                    <el-icon class="avatar-uploader-icon">
                                        <Plus />
                                    </el-icon>
                                    <span class="upload-text">上传头像</span>
                                </div>
                            </template>
                        </el-image>
                    </el-upload>
                    <div class="avatar-hint">支持 JPG/PNG 格式</div>
                </el-descriptions-item>

                <el-descriptions-item label="用户名">
                    <el-input v-model="userInfoTmp.username" placeholder="填写用户名" clearable />
                </el-descriptions-item>

                <el-descriptions-item label="昵称">
                    <el-input v-model="userInfoTmp.nickname" placeholder="填写昵称" clearable />
                </el-descriptions-item>

                <el-descriptions-item label="性别">
                    <el-select v-model="userInfoTmp.sex" placeholder="选择性别" style="width: 100%">
                        <el-option label="男" value="男" />
                        <el-option label="女" value="女" />
                        <el-option label="未知" value="未知" />
                    </el-select>
                </el-descriptions-item>

                <el-descriptions-item label="手机号">
                    <el-input v-model="userInfoTmp.phone" placeholder="填写手机号" clearable />
                </el-descriptions-item>

                <el-descriptions-item label="邮箱">
                    <el-input v-model="userInfoTmp.mail" placeholder="填写邮箱" clearable />
                </el-descriptions-item>

                <el-descriptions-item :span="2" class="action-item">
                    <el-button type="primary" @click="updateUserInfo" size="medium" round>
                        <el-icon>
                            <Check />
                        </el-icon>
                        保存修改
                    </el-button>
                </el-descriptions-item>
            </el-descriptions>
        </el-card>

        <!-- 双因子认证部分（隐藏） -->
        <el-card shadow="hover" class="two-factor-card" v-if="false">
            <el-descriptions title="双因子认证" direction="vertical" border>
                <el-descriptions-item label="安全提示">
                    <div class="two-factor-desc">
                        身份验证器应用程序和浏览器扩展程序（例如 1Password、Authy、Microsoft Authenticator等）会生成一次性密码，
                        该密码可在登录期间提示时用作验证您身份的第二个因素。
                    </div>
                    <div class="qr-code-section">
                        <div class="qr-code-title">扫描二维码</div>
                        <div class="qr-code-hint">
                            使用身份验证器应用或浏览器扩展程序进行扫描。了解有关启用 2FA 的更多信息。
                        </div>
                        <el-row class="qr-code-container">
                            <el-col :span="8">
                                <el-image :src="'data:image/png;base64,' + qrCode.base64" alt="QR Code" fit="fill"
                                    class="qr-code-image" />
                                <el-row class="verify-section">
                                    <el-col :span="18">
                                        <el-input placeholder="验证动态码" />
                                    </el-col>
                                    <el-col :span="6">
                                        <el-button type="primary" class="save-btn">保存</el-button>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </div>
                </el-descriptions-item>
            </el-descriptions>
        </el-card>
    </div>
</template>

<script setup lang='ts'>
import { alert, CONSTANTS, getToken, http, saveUserInfo, userInfo } from '@/utils';
import { onMounted, ref } from 'vue';
import { Plus, Check } from '@element-plus/icons-vue'
import { UploadFile, UploadFiles, UploadProgressEvent } from 'element-plus';

const userInfoTmp = ref({
    "username": "",
    "nickname": "",
    "admin": false,
    "sex": "",
    "mail": null,
    "phone": null
})

const qrCode = ref({
    secret: '',
    base64: ''
})

const avatarFlag = ref(true)

async function getUserInfo() {
    http.result({
        url: '/auth/userInfo',
        method: 'POST',
        success(result) {
            saveUserInfo(result.data)
            userInfoTmp.value = result.data
        }
    })
}

async function qrCodeImage() {
    http.result({
        url: '/auth/qrCodeImage',
        method: 'POST',
        success(result) {
            qrCode.value.base64 = result.data.base64
            qrCode.value.secret = result.data.secret
        }
    })
}

const updateUserInfo = () => {
    http.result({
        url: '/auth/updateUserInfo',
        method: 'POST',
        data: userInfoTmp.value,
        success(result) {
            if (result.code == 200) {
                alert(result.msg, 'success')
                getUserInfo()
            }
        }
    })
}

onMounted(() => {
    getUserInfo()
    // qrCodeImage()
})
</script>

<style scoped>
.user-profile-container {
    max-width: 900px;
    margin: 20px auto;
    padding: 0 15px;
}

.profile-card {
    margin-bottom: 20px;
}

.two-factor-card {
    margin-top: 20px;
}

.avatar-item {
    padding: 15px;
    text-align: center;
}

.avatar-uploader {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
}

.avatar-image {
    width: 120px;
    height: 120px;
    border-radius: 6px;
    border: 1px dashed var(--el-border-color);
    transition: all 0.3s;
}

.avatar-image:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.avatar-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 120px;
    color: var(--el-text-color-secondary);
}

.avatar-uploader-icon {
    font-size: 32px;
    margin-bottom: 8px;
}

.upload-text {
    font-size: 14px;
}

.avatar-hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 5px;
}

.action-item {
    text-align: center;
    padding: 15px 0;
}

.two-factor-desc {
    font-size: 14px;
    color: var(--el-text-color-regular);
    margin-bottom: 15px;
    line-height: 1.6;
}

.qr-code-section {
    margin-top: 20px;
}

.qr-code-title {
    font-weight: bold;
    margin-bottom: 8px;
}

.qr-code-hint {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-bottom: 15px;
}

.qr-code-container {
    margin-top: 15px;
}

.qr-code-image {
    width: 200px;
    height: 200px;
    margin-bottom: 15px;
}

.verify-section {
    display: flex;
    align-items: center;
}

.save-btn {
    width: 100%;
}

:deep(.el-descriptions__title) {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
}

:deep(.el-descriptions__body) {
    background-color: var(--el-bg-color);
}

:deep(.el-descriptions-item__label) {
    font-weight: 500;
}
</style>