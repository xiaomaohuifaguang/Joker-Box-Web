<template>
    <el-row>
        <el-col :span="24" :offset="0">
            <el-container>
                <el-menu :default-active="activeIndex" class="" :ellipsis="false" router="true" @select="handleSelect"
                    :collapse="isCollapse">
                    <el-menu-item index="/" style="height: 7rem;font-size: 2rem;">
                        <el-icon v-show="isCollapse">
                            <HomeFilled />
                        </el-icon>
                        <span style="font-style: italic;font-weight: bold;">Joker Box</span>
                    </el-menu-item>

                    <div style="display: flex;justify-content: center;margin-bottom: 1rem;">
                        <el-button plain @click="isCollapse = !isCollapse" link>
                            <el-icon size=" 30">
                                <Expand v-show="isCollapse" />
                                <Fold v-show="!isCollapse" />
                            </el-icon>
                        </el-button>
                    </div>

                    <el-menu-item index="/console">
                        <el-icon>
                            <Console />
                        </el-icon>
                        <span>控制台主页</span>
                    </el-menu-item>

                    <el-sub-menu index="/console/authority/">
                        <template #title>
                            <el-icon>
                                <user />
                            </el-icon>
                            <span>身份与权限</span>
                        </template>
                        <el-menu-item index="/console/authority/user-manager">
                            <el-icon>
                                <UserSettings />
                            </el-icon>
                            <span>用户管理</span>
                        </el-menu-item>
                        <el-menu-item index="/console/authority/role-manager">
                            <el-icon>
                                <RoleSettings />
                            </el-icon>
                            <span>角色管理</span>
                        </el-menu-item>
                    </el-sub-menu>

                    <el-menu-item index="/console/api-manager">
                        <el-icon>
                            <Api />
                        </el-icon>
                        <span>API管理</span>
                    </el-menu-item>

                    <el-menu-item index="/console/website-manager">
                        <el-icon>
                            <Website />
                        </el-icon>
                        <span>网址收藏</span>
                    </el-menu-item>

                    <el-sub-menu index="/console/settings">
                        <template #title>
                            <el-icon>
                                <tools />
                            </el-icon>
                            <span>设置</span>
                        </template>

                        <el-menu-item index="/console/settings/system-manager">
                            <el-icon>
                                <SystemSettings />
                            </el-icon>
                            <span>系统设置</span>
                        </el-menu-item>
                    </el-sub-menu>
                    <el-divider />
                    <div style="display: flex;justify-content: center;cursor: pointer;">
                        <Avatar />
                    </div>
                    <div style="display: flex;justify-content: center;margin-top: 1rem;cursor: pointer;">
                        {{ isCollapse ? userInfo().nickname.substring(0, 1) : userInfo().nickname.substring(0, 6) }}
                    </div>
                    <el-divider />
                    <el-menu-item index="#logout" @click="doLogout">
                        <el-icon>
                            <switch-button />
                        </el-icon>
                        <span>退出登录</span>
                    </el-menu-item>

                    <div style="display: flex;justify-content: center;margin-top: 1rem;">
                        <el-button plain @click="isCollapse = !isCollapse" link>
                            <el-icon size=" 30">
                                <Expand v-show="isCollapse" />
                                <Fold v-show="!isCollapse" />
                            </el-icon>
                        </el-button>
                    </div>
                    <div style="display: flex;justify-content: center;margin-top: 1rem;">
                        <DarkSwitch />
                    </div>
                </el-menu>
                <el-container style="min-height: 100vh;">
                    <el-main class="padding-lr-1">
                        <RouterView />
                    </el-main>
                </el-container>
            </el-container>
        </el-col>
    </el-row>
</template>
<script setup lang='ts'>
import { onUpdated, ref } from 'vue'
import { useRoute } from 'vue-router';
import DarkSwitch from '@/components/common/DarkSwitch.vue';
import Avatar from '@/components/common/Avatar.vue';
import { confirm, logout, userInfo } from '@/utils';
import Api from '@/components/icon/Api.vue';
import RoleSettings from '@/components/icon/RoleSettings.vue';
import UserSettings from '@/components/icon/UserSettings.vue';
import SystemSettings from '@/components/icon/SystemSettings.vue';
import Console from '@/components/icon/Console.vue';
import Website from '@/components/icon/Website.vue';
const route = useRoute();
const activeIndex = ref(route.path)
const isCollapse = ref(false)
const handleSelect = (key: string, keyPath: string[]) => {
    // console.log(key, keyPath)
}
const doLogout = () => {
    confirm('提示', '确定退出吗', () => {
        logout()
    })
}

onUpdated(() => {
})

</script>

<style scoped>
.padding-lr-0 {
    padding-left: 0;
    padding-right: 0;
}

.padding-lr-1 {
    padding-left: 1rem;
    padding-right: 1rem;
}
</style>