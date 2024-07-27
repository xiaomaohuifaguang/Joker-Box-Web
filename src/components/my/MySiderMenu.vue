<template>
    <div>
        <Menus :menus="menus" />
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Menus from '@/components/common/Menus.vue'

const menus = ref([
    {
        name: "我的",
        path: "/my",
        child: []
    },
    {
        name: "设置",
        path: "/my/settings"
    }
])

</script>

<style lang="scss" scoped></style>