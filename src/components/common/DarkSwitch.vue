<template>
    <el-icon @click="isDark = !isDark" style="cursor: pointer;">
        <Moon v-show="isDark" />
        <Sunny v-show="!isDark" />
    </el-icon>
</template>
<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useColorMode } from '@vueuse/core'
const { system, store } = useColorMode()
store.value === 'auto' ? system.value : store.value
const isDark = useDark()

</script>