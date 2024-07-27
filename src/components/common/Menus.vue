<template>
    <div>
        <ul className="menu">
            <li v-for="menu in props.menus" class="text-base subpixel-antialiased	font-bold tracking-widest">
                <RouterLink v-if="!menu.child || menu.child.length == 0" :to="{ path: menu.path }" :title="menu.name" :class="isActive(menu) ? 'text-primary' : ''">
                    {{ menu.name }}
                </RouterLink>
                <details v-if="menu.child && menu.child.length > 0" :open="isActive(menu)">
                    <summary :title="menu.name">
                        {{ menu.name }}
                    </summary>
                    <!-- 递归 -->
                    <Menus :menus="menu.child" />
                </details>
            </li>
        </ul>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router';
import Menus from '@/components/common/Menus.vue';
const route = useRoute()

const props = defineProps({
    menus: Array as () => Menu[]
})

/**
 * 判断当前路由是否在menu及其child内
 * @param menu 菜单项
 */
const isActive = (menu: Menu) => {
    if(menu.path == route.path){
        return true;
    }
    if(menu.child && menu.child.length > 0){
        let tmpFlag = false;
        for(let i = 0 ; i < menu.child.length ; i++ ){
            tmpFlag = isActive(menu.child[i]) || tmpFlag;
            if(tmpFlag) return true;
        }
        return false;
    }
}

interface Menu {
    name: string,
    path: string,
    child?: Menu[]
}


</script>

<style lang="scss" scoped>

</style>