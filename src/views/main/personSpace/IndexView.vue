<template>
  <div class="person-space-page">
    <!-- 页面头部 -->
    <PageHeader :icon="User" title="个人中心" description="管理您的个人信息和账户安全" />

    <div class="person-space-container">
      <el-row>
        <el-col :xs="24" :sm="24" :md="6" :lg="5" :xl="4">
          <!-- 侧边菜单 -->
          <div class="sidebar-menu">
            <div class="menu-header">
              <el-icon><Menu /></el-icon>
              <span>功能菜单</span>
            </div>
            <el-menu 
              :default-active="menuActive" 
              @select="handleMenuSelect"
              class="custom-menu">
              <el-menu-item index="1">
                <el-icon><UserFilled /></el-icon>
                <span>个人信息</span>
              </el-menu-item>
              <el-menu-item index="2">
                <el-icon><Lock /></el-icon>
                <span>修改密码</span>
              </el-menu-item>
            </el-menu>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="18" :lg="19" :xl="20">
          <!-- 主内容区 -->
          <div class="main-content">
            <transition name="fade" mode="out-in">
              <div :key="menuActive" class="content-wrapper">
                <PersonInfoView v-if="menuActive == '1'" @switch-tab="handleMenuSelect" />
                <UpdatePasswordView v-if="menuActive == '2'" />
              </div>
            </transition>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { User, Menu, UserFilled, Lock } from '@element-plus/icons-vue';
import PersonInfoView from './PersonInfoView.vue';
import UpdatePasswordView from './UpdatePasswordView.vue';

const menuActive = ref('1');

const handleMenuSelect = (index: string) => {
  menuActive.value = index;
};
</script>

<style scoped lang="scss">
.person-space-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-elevated) 100%);

  .person-space-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px 40px;
  }

  .sidebar-menu {
    background: var(--bg-container);
    border-radius: 16px;
    padding: 20px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    margin-bottom: 20px;

    .menu-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 12px 16px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--border-light);
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);

      .el-icon {
        font-size: 18px;
        color: var(--brand-primary);
      }
    }

    .custom-menu {
      border: none;

      :deep(.el-menu-item) {
        border-radius: 10px;
        margin-bottom: 8px;
        height: 48px;
        line-height: 48px;
        font-size: 15px;
        transition: all 0.3s ease;

        &:hover {
          background: var(--bg-overlay);
        }

        &.is-active {
          background: var(--brand-gradient);
          color: var(--text-on-brand);

          .el-icon {
            color: var(--text-on-brand);
          }
        }

        .el-icon {
          font-size: 18px;
          margin-right: 10px;
        }
      }
    }
  }

  .main-content {
    padding-left: 24px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (max-width: 768px) {
  .person-space-page {
    .person-space-container {
      padding: 0 16px 24px;
    }

    .sidebar-menu {
      padding: 16px;
    }

    .main-content {
      padding-left: 0;
      margin-top: 20px;
    }
  }
}
</style>
