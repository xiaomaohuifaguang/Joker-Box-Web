<script setup>
import Footer from '@/components/common/Footer.vue';
import { useColorMode } from '@vueuse/core'
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDark } from '@vueuse/core'
import AiChartDrawer from './components/common/AiChartDrawer.vue';
import { userInfo } from '@/utils';
const { system, store } = useColorMode()
store.value === 'auto' ? system.value : store.value
const route = useRoute()
const isDark = useDark()
onMounted(() => {
})


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

</script>
<template>
  <el-watermark :font="font" :content="'by小猫会发光xiaomaohuifaguang.github.com'">
    <RouterView style="margin: 0;" />
    <el-backtop :right="100" :bottom="100" />
    <AiChartDrawer v-if="userInfo() != null" v-model:dialog="aiChartDialog" :key="'aiChartDialog' + aiChartDialog" />
  </el-watermark>
  <el-button v-if="userInfo() != null" class="fixed-button" type="primary" @click="aiChartDialog = !aiChartDialog;">
    AI助手
  </el-button>
</template>
<style>
/* 设置按钮的固定位置 */
.fixed-button {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  /* 确保按钮在页面其他内容之上 */
}
</style>
