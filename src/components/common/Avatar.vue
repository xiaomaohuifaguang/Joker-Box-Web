<template>
    <div v-if="userInfo() != null">
        <el-avatar :size="35" :src="CONSTANTS.HTTP.BASEURL + '/auth/avatar/' + userInfo().username"
            @error="errorHandler">
            <Joker v-if="userInfo().sex != '男' && userInfo().sex != '女'" />
            <JokerMan v-if="userInfo().sex == '男'" />
            <JokerWoman v-if="userInfo().sex == '女'" />
        </el-avatar>
    </div>
</template>

<script lang="ts" setup>
import { userInfo, CONSTANTS } from '@/utils';
import Joker from '../icon/Joker.vue';
import JokerMan from '../icon/JokerMan.vue';
import JokerWoman from '../icon/JokerWoman.vue';
const errorHandler = () => true




</script>