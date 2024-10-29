<script setup>
import Footer from '@/components/common/Footer.vue';
import { useColorMode } from '@vueuse/core'
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
const { system, store } = useColorMode()
store.value === 'auto' ? system.value : store.value
const route = useRoute()
onMounted(() => {
})

</script>
<template>

  <RouterView style="margin: 0;" />
  <el-backtop :right="100" :bottom="100" />

</template>
<style scoped></style>
