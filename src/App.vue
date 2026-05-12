<script setup>
import { useColorMode } from '@vueuse/core'
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AiChartDrawer from './components/common/AiChartDrawer.vue';
import { alert, http, saveUserInfo, userInfo, userInfoRef } from '@/utils';
import ChatGpt from '@/components/icon/ChatGpt.vue';

const { system, store } = useColorMode()
store.value === 'auto' ? system.value : store.value
const route = useRoute()
onMounted(() => {
  getUserInfo()
})

async function getUserInfo() {
  if (userInfo() == null) {
    return;
  }
  const data = await http.post('/auth/userInfo')
  saveUserInfo(data)
  return userInfo()
}
const font = reactive({
  color: 'rgba(0, 0, 0, .15)',
  fontSize: '30'
})

watch(
)


// const root = document.documentElement;
// root.style.setProperty('--el-color-primary', 'red');\

const aiChartDialog = ref(false);




import html2canvas from 'html2canvas';

const captureRef = ref(null);
const imageBase64 = ref('');
const imageDialog = ref(false);

const captureToBase64 = async () => {
  if (!captureRef.value) return;

  try {
    const canvas = await html2canvas(captureRef.value, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    imageBase64.value = canvas.toDataURL('image/png');
    imageDialog.value = true;
  } catch (error) {
    console.error('Error capturing div:', error);
    alert('截图失败，请稍后重试', 'error');
  }
};

const downloadImage = () => {
  if (!imageBase64.value) return;
  const link = document.createElement('a');
  const timestamp = new Date().toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).replace(/[/: ]/g, '-');
  link.download = `截图-${timestamp}.png`;
  link.href = imageBase64.value;
  link.click();
};

</script>
<template>
  <div ref="captureRef">
    <el-watermark :font="font" :content="'by小猫会发光xiaomaohuifaguang.github.com'">
      <RouterView style="margin: 0;" />
      <el-backtop :right="100" :bottom="100" />
      <AiChartDrawer v-model:dialog="aiChartDialog" @update:dialog="(flag) => { aiChartDialog = flag }" />
    </el-watermark>
  </div>

  <el-button v-if="userInfoRef != null && !aiChartDialog" class="ai-assistant-btn"
    @click="aiChartDialog = !aiChartDialog;" circle>
    <el-icon :size="40">
      <ChatGpt />
    </el-icon>
  </el-button>
  <el-tooltip content="网页截屏" placement="left">
    <el-button class="pic-assistant-btn" @click="captureToBase64" circle>
      <el-icon :size="40">
        <CameraFilled />
      </el-icon>
    </el-button>
  </el-tooltip>

  <el-dialog v-model="imageDialog" title="网页截屏" width="80%" destroy-on-close class="capture-dialog" align-center>
    <div class="capture-preview">
      <img v-if="imageBase64" :src="imageBase64" alt="Captured Image" />
    </div>
    <template #footer>
      <div class="capture-dialog-footer">
        <el-button @click="imageDialog = false">关闭</el-button>
        <el-button type="primary" :icon="Download" @click="downloadImage">下载图片</el-button>
      </div>
    </template>
  </el-dialog>

</template>
<style>
/* 截图按钮样式 */
.pic-assistant-btn {
  position: fixed;
  left: 24px;
  bottom: 24px;
  z-index: 10000;
  width: 56px;
  height: 56px;
  padding: 0;
  border-radius: 50%;
  background: var(--data-grad-3);
  border: none;
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* AI助手按钮样式 */
.ai-assistant-btn {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 10000;
  width: 56px;
  height: 56px;
  padding: 0;
  border-radius: 50%;
  background: var(--data-grad-3);
  border: none;
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.ai-assistant-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.ai-assistant-btn:active {
  transform: scale(0.95);
}

.ai-assistant-btn .el-icon {
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.pic-assistant-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.pic-assistant-btn:active {
  transform: scale(0.95);
}

.pic-assistant-btn .el-icon {
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

/* 暗黑模式适配 */
[data-theme="joker"] .ai-assistant-btn,
[data-theme="obsidian"] .ai-assistant-btn,
[data-theme="joker"] .pic-assistant-btn,
[data-theme="obsidian"] .pic-assistant-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 截图弹窗样式 */
.capture-dialog .capture-preview {
  max-height: 65vh;
  overflow: auto;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  padding: 8px;
}

.capture-dialog .capture-preview img {
  width: 100%;
  display: block;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.capture-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>