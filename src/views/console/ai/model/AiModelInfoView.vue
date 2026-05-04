<template>
  <div class="detail-ai-model-container">
    <div v-loading="loading" element-loading-text="加载中..." element-loading-background="rgba(255, 255, 255, 0.7)">
      <div class="form-wrapper">
        <div class="form-header">
          <div class="header-icon">
            <el-icon><Cpu /></el-icon>
          </div>
          <h3>{{ props.type === 'view' ? 'AI 模型详情' : '编辑 AI 模型' }}</h3>
          <p>{{ props.type === 'view' ? '查看 AI 模型详细信息' : '修改 AI 模型配置' }}</p>
        </div>

        <el-form label-position="top" class="detail-form">
          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="24" :lg="24">
              <el-form-item label="名称">
                <el-input v-model="info.name" :disabled="props.type !== 'edit'" :placeholder="`请输入名称`" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="24">
              <el-form-item label="模型">
                <el-input v-model="info.model" :disabled="props.type !== 'edit'" :placeholder="`请输入模型`" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="24">
              <el-form-item label="版本">
                <el-input v-model="info.version" :disabled="props.type !== 'edit'" :placeholder="`请输入版本`" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="24">
              <el-form-item label="描述">
                <el-input v-model="info.description" :disabled="props.type !== 'edit'" :placeholder="`请输入描述`" type="textarea" :rows="3" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="24">
              <el-form-item label="创建时间">
                <el-input v-model="info.createTime" disabled :placeholder="`请输入创建时间`" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div class="action-bar" v-if="props.type === 'edit'">
          <el-button type="primary" @click="save" class="save-button">
            <el-icon><Check /></el-icon>
            <span>保存修改</span>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Cpu } from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const props = defineProps({
    id: String,
    type: String
})

const loading = ref(false)

const info = ref({
    id: '',
    name: '',
    model: '',
    version: '',
    description: '',
    userId: '',
    createTime: '',
})

const queryInfo = async () => {
    loading.value = true
    info.value = await http.post('/ai/model/info', { id: props.id })
    loading.value = false
}

const save = async () => {
    loading.value = true
    const result = await http.post('/ai/model/update', info.value, { raw: true })
    alert(result.msg, 'success')
    await queryInfo()
    loading.value = false
}

onMounted(() => {
    if (!props.id) return;
    queryInfo()
})
</script>

<style scoped lang="scss">
.detail-ai-model-container {
  padding: 24px;
  background: var(--bg-container);
}

.form-wrapper {
  background: var(--bg-container);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-light);
}

.form-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);

  .header-icon {
    width: 48px;
    height: 48px;
    background: var(--brand-gradient);
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
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 14px;
    color: var(--text-secondary);
    text-align: center;
  }
}

.detail-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
    font-size: 14px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 0 0 1px var(--border-light) inset;
    padding: 0 16px;
  }

  :deep(.el-input__wrapper:hover),
  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--brand-primary) inset;
  }

  :deep(.el-input__inner) {
    height: 40px;
  }

  :deep(.el-textarea__inner) {
    min-height: 100px;
    border-radius: 8px;
    line-height: 1.5;
  }

  :deep(.el-input.is-disabled .el-input__wrapper) {
    background-color: var(--bg-overlay);
    cursor: not-allowed;
  }
}

.action-bar {
  display: flex;
  justify-content: center;
  margin-top: 32px;

  .save-button {
    width: 200px;
    height: 44px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
    background: var(--brand-gradient);
    border: none;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow);
    }
  }
}

@media (max-width: 768px) {
  .detail-ai-model-container {
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
    .save-button {
      width: 100%;
    }
  }
}
</style>