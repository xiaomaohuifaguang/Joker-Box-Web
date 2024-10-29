<template>
    <el-row :gutter="20">
        <el-col :span="18" :offset="3">
            <el-container>
                <el-aside width="200px"><el-menu :default-active="menuActive" @select="(
                    index: string,
                    indexPath: string[],
                    item: MenuItemClicked,
                    routerResult?: Promise<void | NavigationFailure>
                ) => {
                    menuActive = index
                }">
                        <el-menu-item index="1">个人信息</el-menu-item>
                        <el-menu-item index="2">修改密码</el-menu-item>
                    </el-menu></el-aside>
                <el-main>
                    <PersonInfoView v-if="menuActive == '1'" />
                    <UpdatePasswordView v-if="menuActive == '2'" />
                </el-main>
            </el-container>
        </el-col>
    </el-row>

</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { MenuItemClicked } from 'element-plus';
import { NavigationFailure } from 'vue-router';
import PersonInfoView from './PersonInfoView.vue';
import UpdatePasswordView from './UpdatePasswordView.vue';

const menuActive = ref('1')


</script>

<style></style>