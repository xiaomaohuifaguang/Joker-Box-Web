<script setup>
import { useColorMode } from '@vueuse/core'
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDark } from '@vueuse/core'
import AiChartDrawer from './components/common/AiChartDrawer.vue';
import { alert, http, saveUserInfo, userInfo } from '@/utils';
import ChatGpt from '@/components/icon/ChatGpt.vue';


const { system, store } = useColorMode()
store.value === 'auto' ? system.value : store.value
const route = useRoute()
const isDark = useDark()
onMounted(() => {
  getUserInfo()
})

async function getUserInfo() {
  if (userInfo() == null) {
    return;
  }
  http.result({
    url: '/auth/userInfo',
    method: 'POST',
    success(result) {
      saveUserInfo(result.data)
      return userInfo()
    }
  })
}
const font = reactive({
  color: 'rgba(0, 0, 0, .15)',
  fontSize: '30'
})

watch(
  isDark,
  () => {
    font.color = isDark.value
      ? 'rgba(255, 255, 255, .15)'
      : 'rgba(0, 0, 0, .15)'
  },
  {
    immediate: true,
  }
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
      scale: 2, // 提高分辨率（可选）
      logging: false, // 关闭日志（可选）
      useCORS: true, // 允许跨域图片（可选）
    });

    // 获取 Base64 字符串
    imageBase64.value = canvas.toDataURL('image/png');
    // console.log('Base64:', imageBase64.value);
    // alert('截图成功！请向下拉', 'success');
    imageDialog.value = true;
    // 如果需要下载（可选）
    // const link = document.createElement('a');
    // link.download = 'capture.png';
    // link.href = imageBase64.value;
    // link.click();
  } catch (error) {
    console.error('Error capturing div:', error);
  }
};

</script>
<template>
  <div ref="captureRef">
    <el-watermark :font="font" :content="'by小猫会发光xiaomaohuifaguang.github.com'">
      <RouterView style="margin: 0;" />
      <el-backtop :right="100" :bottom="100" />
      <AiChartDrawer v-model:dialog="aiChartDialog" @update:dialog="(flag) => { aiChartDialog = flag }" />
    </el-watermark>

    <el-button v-if="userInfo() != null && !aiChartDialog" class="ai-assistant-btn"
      @click="aiChartDialog = !aiChartDialog;" circle>
      <el-icon :size="40">
        <ChatGpt />
      </el-icon>
    </el-button>
    <el-button class="pic-assistant-btn" @click="captureToBase64" circle>
      <el-icon :size="40">
        <CameraFilled />
      </el-icon>
    </el-button>
  </div>

  <el-dialog v-model="imageDialog" title="网页截屏">
    <img v-if="imageBase64" :src="imageBase64" alt="Captured Image" width="100%" />
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
  background: linear-gradient(135deg, #409EFF 0%, #36D1DC 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  background: linear-gradient(135deg, #409EFF 0%, #36D1DC 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

/* 暗黑模式适配 */
.dark .ai-assistant-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>