<template>
  <div class="person-info-page">
    <!-- 个人信息卡片 -->
    <div class="info-card">
      <div class="card-header">
        <div class="header-icon">
          <el-icon><UserFilled /></el-icon>
        </div>
        <span class="header-title">基本信息</span>
      </div>

      <div class="card-body">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <el-upload
              class="avatar-uploader"
              :action="CONSTANTS.HTTP.BASEURL + '/auth/avatarUpload'"
              accept="image/png, image/jpeg"
              :headers="{ authorization: CONSTANTS.SYSTEM.TOKEN_TYPE + ' ' + getToken() }"
              name="uploadFile"
              :on-success="handleAvatarSuccess"
              :on-error="handleAvatarError"
              :show-file-list="false">
              <div class="avatar-container">
                <el-image
                  :src="CONSTANTS.HTTP.BASEURL + '/auth/avatar/' + userInfo().userId"
                  fit="cover"
                  :key="avatarFlag"
                  class="avatar-image">
                  <template #error>
                    <div class="avatar-placeholder">
                      <el-icon class="placeholder-icon"><Plus /></el-icon>
                      <span class="placeholder-text">上传头像</span>
                    </div>
                  </template>
                </el-image>
                <div class="avatar-overlay">
                  <el-icon><Camera /></el-icon>
                  <span>更换头像</span>
                </div>
              </div>
            </el-upload>
          </div>
          <div class="avatar-hint">
            <el-icon><InfoFilled /></el-icon>
            <span>支持 JPG、PNG 格式，建议尺寸 200x200</span>
          </div>
        </div>

        <div class="form-section">
          <el-form :model="userInfoTmp" label-position="top" class="info-form">
            <el-row :gutter="24">
              <el-col :xs="24" :sm="12">
                <el-form-item label="用户名">
                  <el-input
                    v-model="userInfoTmp.username"
                    placeholder="请输入用户名"
                    :prefix-icon="User"
                    size="large" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="昵称">
                  <el-input
                    v-model="userInfoTmp.nickname"
                    placeholder="请输入昵称"
                    :prefix-icon="Star"
                    size="large" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :xs="24" :sm="12">
                <el-form-item label="性别">
                  <el-select
                    v-model="userInfoTmp.sex"
                    placeholder="请选择性别"
                    size="large"
                    class="gender-select">
                    <el-option label="男" value="男">
                      <el-icon><Male /></el-icon>
                      <span>男</span>
                    </el-option>
                    <el-option label="女" value="女">
                      <el-icon><Female /></el-icon>
                      <span>女</span>
                    </el-option>
                    <el-option label="保密" value="保密">
                      <el-icon><Hide /></el-icon>
                      <span>保密</span>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="手机号">
                  <el-input
                    v-model="userInfoTmp.phone"
                    placeholder="请输入手机号"
                    :prefix-icon="Phone"
                    size="large" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="邮箱">
              <el-input
                v-model="userInfoTmp.mail"
                placeholder="请输入邮箱地址"
                :prefix-icon="Message"
                size="large" />
            </el-form-item>

            <el-form-item class="submit-item">
              <el-button
                type="primary"
                size="large"
                @click="updateUserInfo"
                class="submit-btn">
                <el-icon><Check /></el-icon>
                <span>保存修改</span>
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 账号安全卡片 -->
    <div class="security-card">
      <div class="card-header">
        <div class="header-icon security">
            <el-icon><Lock /></el-icon>
          </div>
        <span class="header-title">账号安全</span>
      </div>
      <div class="card-body">
        <div class="security-item">
          <div class="item-info">
            <div class="item-icon">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="item-text">
              <span class="item-title">登录密码</span>
              <span class="item-desc">定期修改密码可以保护账号安全</span>
            </div>
          </div>
          <el-button type="primary" link @click="$emit('switch-tab', '2')">
            修改密码
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { alert, CONSTANTS, getToken, http, saveUserInfo, userInfo } from '@/utils';
import { onMounted, ref } from 'vue';
import {
  Plus,
  UserFilled,
  User,
  Star,
  Male,
  Female,
  Hide,
  Phone,
  Message,
  Check,
  Camera,
  InfoFilled,
  Lock,
  ArrowRight
} from '@element-plus/icons-vue'
import type { UploadFile, UploadFiles } from 'element-plus';

defineEmits(['switch-tab'])

const userInfoTmp = ref({
  "username": "",
  "nickname": "",
  "admin": false,
  "sex": "",
  "mail": null,
  "phone": null
})

const avatarFlag = ref(true)

const handleAvatarSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  alert('头像上传成功', 'success');
  avatarFlag.value = !avatarFlag.value;
}

const handleAvatarError = (error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  alert('头像上传失败', 'error')
}

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
})
</script>

<style scoped lang="scss">
.person-info-page {
  .info-card,
  .security-card {
    background: var(--el-bg-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--el-border-color-lighter);
    margin-bottom: 24px;

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      .header-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.security {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }

        .el-icon {
          font-size: 20px;
          color: white;
        }
      }

      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;

    .avatar-wrapper {
      position: relative;
      margin-bottom: 12px;

      .avatar-uploader {
        cursor: pointer;

        .avatar-container {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--el-border-color-lighter);
          transition: all 0.3s ease;

          &:hover {
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);

            .avatar-overlay {
              opacity: 1;
            }
          }

          .avatar-image {
            width: 100%;
            height: 100%;
          }

          .avatar-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--el-fill-color-light);
            color: var(--el-text-color-secondary);

            .placeholder-icon {
              font-size: 32px;
              margin-bottom: 8px;
            }

            .placeholder-text {
              font-size: 12px;
            }
          }

          .avatar-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            opacity: 0;
            transition: opacity 0.3s ease;

            .el-icon {
              font-size: 24px;
              margin-bottom: 4px;
            }

            span {
              font-size: 12px;
            }
          }
        }
      }
    }

    .avatar-hint {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--el-text-color-secondary);

      .el-icon {
        font-size: 14px;
      }
    }
  }

  .form-section {
    .info-form {
      :deep(.el-form-item__label) {
        font-weight: 500;
        color: var(--el-text-color-regular);
        padding-bottom: 8px;
      }

      :deep(.el-input__wrapper) {
        border-radius: 10px;
        padding: 4px 16px;
      }

      .gender-select {
        width: 100%;

        :deep(.el-option) {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }

      .submit-item {
        margin-top: 32px;
        margin-bottom: 0;

        .submit-btn {
          height: 48px;
          padding: 0 32px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
          }

          .el-icon {
            margin-right: 8px;
            font-size: 18px;
          }
        }
      }
    }
  }

  .security-card {
    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--el-fill-color-light);
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: var(--el-fill-color);
      }

      .item-info {
        display: flex;
        align-items: center;
        gap: 16px;

        .item-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          .el-icon {
            font-size: 24px;
            color: white;
          }
        }

        .item-text {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .item-title {
            font-size: 16px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .item-desc {
            font-size: 13px;
            color: var(--el-text-color-secondary);
          }
        }
      }

      .el-button {
        font-weight: 500;

        .el-icon {
          margin-left: 4px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .person-info-page {
    .info-card,
    .security-card {
      padding: 20px;

      .card-header {
        margin-bottom: 20px;
        padding-bottom: 12px;
      }
    }

    .security-card {
      .security-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;

        .el-button {
          width: 100%;
          justify-content: center;
        }
      }
    }
  }
}
</style>
