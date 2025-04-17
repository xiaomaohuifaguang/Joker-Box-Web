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
                <el-image :src="CONSTANTS.HTTP.BASEURL + '/auth/avatar/' + userInfo().userId" fit="fill"
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
        <el-descriptions-item label="用户名">
            <el-input v-model="userInfoTmp.username" placeholder="填写用户名" />
        </el-descriptions-item>
        <el-descriptions-item label="昵称">
            <el-input v-model="userInfoTmp.nickname" placeholder="填写昵称" />
        </el-descriptions-item>
        <el-descriptions-item label="性别">
            <el-select v-model="userInfoTmp.sex" placeholder="选择性别">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
                <el-option label="未知" value="未知" />
            </el-select>
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
            <el-input v-model="userInfoTmp.phone" placeholder="填写手机号" />
        </el-descriptions-item>
        <el-descriptions-item label="" align="center">
            <!-- <el-input v-model="userInfoTmp.mail" placeholder="填写邮箱" /> -->
            <el-button type="success" @click="updateUserInfo">
                更新资料
            </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="双因子认证" v-if="false">
            身份验证器应用程序和浏览器扩展程序（例如 1Password、 Authy、 Microsoft Authenticator等）会生成一次性密码，该密码可在登录期间提示时用作验证您身份的第二个因素。
            扫描二维码
            使用身份验证器应用或浏览器扩展程序进行扫描。 了解有关启用 2FA 的更多信息。
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-row :gutter="20">
                        <el-col>
                            <el-image :src="'data:image/png;base64,' + qrCode.base64" alt="QR Code" fit="fill"
                                style="width: 100%;" />
                        </el-col>
                        <el-col>
                            <el-row :gutter="20">
                                <el-col :span="18">
                                    <el-input placeholder="验证动态码" style="width: 100%;" />
                                </el-col>
                                <el-col :span="6">
                                    <el-button type="primary" style="width: 100%;">保存</el-button>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </el-descriptions-item>
    </el-descriptions>

</template>
<script setup lang='ts'>
import { alert, CONSTANTS, getToken, http, saveUserInfo, userInfo } from '@/utils';
import { onMounted, ref } from 'vue';
import { Plus } from '@element-plus/icons-vue'
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
