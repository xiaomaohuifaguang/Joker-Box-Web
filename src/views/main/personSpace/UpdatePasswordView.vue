<template>
  <div class="password-page">
    <!-- 修改密码卡片 -->
    <div class="password-card">
      <div class="card-header">
        <div class="header-icon">
          <el-icon><Lock /></el-icon>
        </div>
        <div class="header-text">
          <span class="header-title">修改密码</span>
          <span class="header-subtitle">定期修改密码可以保护账号安全</span>
        </div>
      </div>

      <div class="card-body">
        <el-form
          ref="ruleFormRef"
          :model="passwordInfo"
          label-position="top"
          :rules="rules"
          @submit.prevent="submitForm(ruleFormRef)"
          status-icon
          class="password-form">

          <!-- 原密码 -->
          <el-form-item label="原密码" prop="oldPassword">
            <el-input
              v-model="passwordInfo.oldPassword"
              type="password"
              placeholder="请输入当前使用的密码"
              show-password
              clearable
              :prefix-icon="Lock"
              size="large">
            </el-input>
          </el-form-item>

          <!-- 新密码 -->
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordInfo.newPassword"
              type="password"
              placeholder="8-16位字符，建议包含字母、数字和符号"
              show-password
              clearable
              :prefix-icon="Key"
              size="large">
            </el-input>
            <!-- 密码强度指示器 -->
            <div class="password-strength" v-if="passwordInfo.newPassword">
              <div class="strength-bar-container">
                <div class="strength-bar" :class="getPasswordStrengthClass"></div>
              </div>
              <span class="strength-text" :class="getPasswordStrengthClass">
                {{ getPasswordStrengthText }}
              </span>
            </div>
            <div class="password-tips" v-else>
              <el-icon><InfoFilled /></el-icon>
              <span>密码长度8-16位，建议包含字母、数字和特殊字符</span>
            </div>
          </el-form-item>

          <!-- 确认新密码 -->
          <el-form-item label="确认新密码" prop="newPasswordAgain">
            <el-input
              v-model="passwordInfo.newPasswordAgain"
              type="password"
              placeholder="请再次输入新密码"
              show-password
              clearable
              :prefix-icon="CircleCheck"
              size="large">
            </el-input>
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item class="submit-item">
            <el-button
              type="primary"
              native-type="submit"
              size="large"
              :loading="loading"
              class="submit-btn">
              <template #loading>
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>正在提交...</span>
              </template>
              <template #default>
                <el-icon><Check /></el-icon>
                <span>确认修改</span>
              </template>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 安全提示卡片 -->
    <div class="tips-card">
      <div class="card-header">
        <div class="header-icon tips">
          <el-icon><Warning /></el-icon>
        </div>
        <span class="header-title">安全提示</span>
      </div>
      <div class="card-body">
        <div class="tip-item">
          <div class="tip-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <span>避免使用生日、手机号等容易被猜到的密码</span>
        </div>
        <div class="tip-item">
          <div class="tip-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <span>建议每3个月更换一次密码</span>
        </div>
        <div class="tip-item">
          <div class="tip-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <span>不同网站使用不同的密码</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { alert, confirm, http, toPath } from '@/utils';
import type { FormInstance, FormRules } from 'element-plus';
import { ref, computed } from 'vue';
import {
  Lock,
  Key,
  CircleCheck,
  Check,
  Loading,
  InfoFilled,
  Warning
} from '@element-plus/icons-vue';

const ruleFormRef = ref<FormInstance>();
const loading = ref(false);

const passwordInfo = ref({
  oldPassword: '',
  newPassword: '',
  newPasswordAgain: ''
});

const validatePasswordAgain = (rule: any, value: string, callback: any) => {
  if (value !== passwordInfo.value.newPassword) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules = ref<FormRules>({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 8, max: 16, message: '密码长度应为8-16位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 16, message: '密码长度应为8-16位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === passwordInfo.value.oldPassword) {
          callback(new Error('新密码不能与原密码相同'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  newPasswordAgain: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validatePasswordAgain, trigger: 'blur' }
  ]
});

// 计算密码强度
const getPasswordStrengthClass = computed(() => {
  const password = passwordInfo.value.newPassword;
  if (!password) return '';

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  if (password.length < 8) return 'strength-weak';

  const strength = (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);

  switch (strength) {
    case 1: return 'strength-weak';
    case 2: return 'strength-medium';
    case 3: return 'strength-strong';
    default: return 'strength-weak';
  }
});

const getPasswordStrengthText = computed(() => {
  const password = passwordInfo.value.newPassword;
  if (!password) return '';

  if (password.length < 8) return '密码太短';

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const strength = (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);

  switch (strength) {
    case 1: return '弱';
    case 2: return '中等';
    case 3: return '强';
    default: return '弱';
  }
});

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  try {
    loading.value = true;
    await formEl.validate(async (valid, fields) => {
      if (valid) {
        await http.post('/auth/changePassword', undefined, {
          params: {
            oldPassword: passwordInfo.value.oldPassword,
            newPassword: passwordInfo.value.newPassword
          }
        });
        confirm("密码修改成功", "请使用新密码重新登录", () => {
          toPath('/');
        }, () => {
          toPath('/');
        });
      }
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.password-page {
  .password-card,
  .tips-card {
    background: var(--bg-container);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    margin-bottom: 24px;

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-light);

      .header-icon {
        width: 40px;
        height: 40px;
        background: var(--brand-gradient);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.tips {
          background: var(--data-grad-6);
        }

        .el-icon {
          font-size: 20px;
          color: var(--text-on-brand);
        }
      }

      .header-text {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .header-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .header-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
        }
      }
    }
  }

  .password-form {
    :deep(.el-form-item__label) {
      font-weight: 500;
      color: var(--text-regular);
      padding-bottom: 8px;
    }

    :deep(.el-input__wrapper) {
      border-radius: 10px;
      padding: 4px 16px;
    }

    .password-strength {
      margin-top: 12px;
      display: flex;
      align-items: center;
      gap: 12px;

      .strength-bar-container {
        flex: 1;
        height: 6px;
        background: var(--bg-overlay);
        border-radius: 3px;
        overflow: hidden;

        .strength-bar {
          height: 100%;
          border-radius: 3px;
          transition: all 0.3s ease;

          &.strength-weak {
            width: 33%;
            background: var(--danger);
          }

          &.strength-medium {
            width: 66%;
            background: var(--warning);
          }

          &.strength-strong {
            width: 100%;
            background: var(--success);
          }
        }
      }

      .strength-text {
        font-size: 13px;
        font-weight: 500;
        min-width: 50px;

        &.strength-weak {
          color: var(--danger);
        }

        &.strength-medium {
          color: var(--warning);
        }

        &.strength-strong {
          color: var(--success);
        }
      }
    }

    .password-tips {
      margin-top: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-secondary);

      .el-icon {
        font-size: 14px;
        color: var(--info);
      }
    }

    .submit-item {
      margin-top: 32px;
      margin-bottom: 0;

      .submit-btn {
        width: 100%;
        height: 48px;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 500;
        background: var(--brand-gradient);
        border: none;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow-strong);
        }

        .el-icon {
          margin-right: 8px;
          font-size: 18px;
        }
      }
    }
  }

  .tips-card {
    .tip-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-light);

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      &:first-child {
        padding-top: 0;
      }

      .tip-icon {
        width: 24px;
        height: 24px;
        background: var(--success-bg);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .el-icon {
          font-size: 14px;
          color: var(--success);
        }
      }

      span {
        font-size: 14px;
        color: var(--text-regular);
      }
    }
  }
}

@media (max-width: 768px) {
  .password-page {
    .password-card,
    .tips-card {
      padding: 20px;

      .card-header {
        margin-bottom: 20px;
        padding-bottom: 12px;
      }
    }
  }
}
</style>
