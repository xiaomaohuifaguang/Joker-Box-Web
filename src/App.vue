<script setup>
import Footer from '@/components/common/Footer.vue';
import { useColorMode } from '@vueuse/core'
import { onMounted, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDark } from '@vueuse/core'
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




</script>
<template>
  <el-watermark :font="font" :content="'by小猫会发光xiaomaohuifaguang.github.com'">
    <RouterView style="margin: 0;" />
    <el-backtop :right="100" :bottom="100" />
  </el-watermark>


</template>
<style scoped></style>
