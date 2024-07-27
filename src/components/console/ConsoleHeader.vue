<template>
    <div>
        <div className="navbar bg-base-100">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl"><RouterLink :to="{ path: '/console' }">Joker-Box控制台</RouterLink></a>
            </div>
            <div className="flex-none gap-2">
                <Avatar/>
                <ThemeChoose/>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Avatar from '@/components/common/Avatar.vue'
import ThemeChoose from '@/components/common/ThemeChoose.vue'
</script>

<style lang="scss" scoped></style>