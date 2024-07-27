<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

// 设置主题
const theme = localStorage.getItem("theme")
if (theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

</script>

<template>
  <div>
    <RouterView/>
    <el-backtop :right="100" :bottom="100" />
  </div>

</template>

<style scoped></style>
