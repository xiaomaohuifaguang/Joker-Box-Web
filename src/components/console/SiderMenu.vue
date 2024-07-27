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
        name: "主页",
        path: "/console",
        child: []
    },
    {
        name: "鉴权服务",
        path: "/auth",
        child: [
            {
                name: "用户管理",
                path: "/console/auth/userManager"
            },
            {
                name: "角色管理",
                path: "/console/auth/roleManager",
            },
            {
                name: "api管理",
                path: "/console/auth/apiManager",
            }
        ]
    }
])

</script>

<style lang="scss" scoped></style>