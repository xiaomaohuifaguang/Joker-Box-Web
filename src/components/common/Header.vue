<template>
    <el-menu :default-active="activeIndex" class="" mode="horizontal" :ellipsis="false" router="true"
        @select="handleSelect">
        <el-menu-item index="/" style="font-size: 2rem;font-style: italic;font-weight: bold;">
            Joker Box
        </el-menu-item>
        <el-menu-item index="/website">
            <el-icon>
                <Website />
            </el-icon>
            <span>网站</span>
        </el-menu-item>
        <ElMenuItemInit v-for="menu in menuInit" :path="menu['path']" :name="menu['name']" :children="menu['children']"
            :icon="menu['icon']" />
        <!-- <el-menu-item index="/approve">
            <el-icon>
                <Cpu />
            </el-icon>
            <span>卧龙</span>
        </el-menu-item>
        <el-menu-item index="/money">
            <el-icon>
                <Chicken />
            </el-icon>
            <span>凤雏</span>
        </el-menu-item>
        <el-menu-item index="/file-server">
            <el-icon>
                <CloudDisk />
            </el-icon>
            <span>码头</span>
        </el-menu-item>
        <el-menu-item index="/website">
            <el-icon>
                <Website />
            </el-icon>
            <span>网站</span>
        </el-menu-item>
        <el-menu-item index="/code-maker">
            <el-icon>
                <EditPen />
            </el-icon>
            <span>代码生成器</span>
        </el-menu-item> -->
        <el-sub-menu index="功能页">
            <template #title>
                <el-icon>
                    <MoreFilled />
                </el-icon>
                <span>功能页</span>
            </template>
            <el-menu-item index="/test">测试</el-menu-item>
            <el-menu-item index="/403">403</el-menu-item>
            <el-menu-item index="/404">404</el-menu-item>
        </el-sub-menu>
        <div style="display: flex;justify-content: center;align-items: center;margin-left: 3rem;margin-right: 1rem;">
            <AvatarDropDown style="margin-left: 1rem;margin-right: 1rem;" />
        </div>
        <div
            style="display: flex;justify-content: center;align-items: center;margin-left: 2rem;margin-right: 1rem;cursor: pointer;">
            <DarkSwitch />
        </div>
        <div
            style="display: flex;justify-content: center;align-items: center;margin-left: 2rem;margin-right: 1rem;cursor: pointer;">
            <ThemeSelector />
        </div>
    </el-menu>
</template>

<script lang="ts" setup>
import ThemeSelector from '@/components/common/ThemeSelector.vue';
import { onMounted, ref } from 'vue'
import AvatarDropDown from './AvatarDropDown.vue';
import DarkSwitch from './DarkSwitch.vue';
import { useRoute } from 'vue-router';
import { userInfo, toPath, http, getToken } from '@/utils';
import Website from '../icon/Website.vue';
import CloudDisk from '../icon/CloudDisk.vue';
import ElMenuItemInit from '@/components/common/ElMenuItemInit.vue';

const route = useRoute()
const activeIndex = ref(route.path)
const handleSelect = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}


const menuInit = ref([])

const queryMenu = () => {
    http.result({
        url: '/menu/menuTree',
        method: 'GET',
        params: {
            menuType: '-2'
        },
        success(result) {
            menuInit.value = result.data
        }
    })
}

onMounted(() => {
    if (getToken() != undefined && getToken != null) {
        queryMenu()
    }

})


</script>

<style>
.el-menu--horizontal>.el-menu-item:nth-child(1) {
    margin-right: auto;
}
</style>