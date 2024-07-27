<template>
    <div>
        <div className="navbar bg-base-100">
            <div className="navbar-start">
                <a className="btn btn-ghost text-xl">
                    <RouterLink :to="{ path: '/' }">Joker-Box</RouterLink>
                </a>
            </div>
            <div className="navbar-center">
                <ul className="menu bg-base-200 lg:menu-horizontal rounded-box">
                    <li v-for="menu in menus">
                        <RouterLink  :to="{ path: menu.path }" :class="route.path == menu.path  ? 'text-primary' : ''">
                            {{menu.name}}
                        </RouterLink>
                    </li>
                </ul>
            </div>
            <div class="navbar-end">
                <Avatar />
                <ThemeChoose />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import Avatar from '@/components/common/Avatar.vue';
import ThemeChoose from '@/components/common/ThemeChoose.vue'
import { useRoute } from 'vue-router'

const route = useRoute()


const menus = ref([
    {
        name:"主页",
        path:"/"
    },
    {
        name:"文件服务器",
        path:"/fileServer"
    },
    {
        name:"关于",
        path:"/about"
    }
])

</script>

<style lang="scss" scoped></style>