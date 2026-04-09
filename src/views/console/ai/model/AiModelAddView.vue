<template>
  <div class="add-ai-model-container">
    <div class="form-wrapper">
      <div class="form-header">
        <div class="header-icon">
          <el-icon><Cpu /></el-icon>
        </div>
        <h3>添加 AI 模型</h3>
        <p>配置新的 AI 模型参数</p>
      </div>

      <el-form label-position="top" class="add-form">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="24" :md="24" :lg="24">
            <el-form-item label="名称" prop="name">
              <el-input v-model="info.name" :placeholder="`请输入名称`" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24">
            <el-form-item label="模型" prop="model">
              <el-input v-model="info.model" :placeholder="`请输入模型`" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24">
            <el-form-item label="版本" prop="version">
              <el-input v-model="info.version" :placeholder="`请输入版本`" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="info.description" :placeholder="`请输入描述`" clearable type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="action-bar">
        <el-button type="primary" @click="add" class="add-button">
          <el-icon><Plus /></el-icon>
          <span>确认添加</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Cpu } from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { ref } from 'vue';

const emit = defineEmits(['success']);

const info = ref({
    id: '',
    name: '',
    model: '',
    version: '',
    description: '',
    userId: '',
    createTime: '',
})

const add = () => {
    http.result({
        url: '/ai/model/add',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            emit('success');
        }
    })
}
</script>

<style scoped lang="scss">
.add-ai-model-container {
  padding: 24px;
  background: var(--el-bg-color);
}

.form-wrapper {
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--el-border-color-lighter);
}

.form-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .header-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    margin-bottom: 8px;
  }

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  p {
    margin: 0;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
}

.add-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
    font-size: 14px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
    padding: 0 16px;
  }

  :deep(.el-input__wrapper:hover),
  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #667eea inset;
  }

  :deep(.el-input__inner) {
    height: 40px;
  }

  :deep(.el-textarea__inner) {
    min-height: 100px;
    border-radius: 8px;
    line-height: 1.5;
  }
}

.action-bar {
  display: flex;
  justify-content: center;
  margin-top: 32px;

  .add-button {
    width: 200px;
    height: 44px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }
}

@media (max-width: 768px) {
  .add-ai-model-container {
    padding: 16px;
  }

  .form-wrapper {
    padding: 16px;
  }

  .form-header {
    h3 {
      font-size: 18px;
    }
  }

  .action-bar {
    .add-button {
      width: 100%;
    }
  }
}
</style>