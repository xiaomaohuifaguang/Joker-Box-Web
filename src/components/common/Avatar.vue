<template>
    <div class="avatar-container">
        <el-avatar :size="size" :src="avatarUrl" @error="errorHandler" class="custom-avatar">
            <Joker v-if="userSex !== '男' && userSex !== '女'" class="avatar-icon" />
            <JokerMan v-if="userSex === '男'" class="avatar-icon" />
            <JokerWoman v-if="userSex === '女'" class="avatar-icon" />
        </el-avatar>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { userInfoRef, CONSTANTS } from '@/utils'
import Joker from '../icon/Joker.vue'
import JokerMan from '../icon/JokerMan.vue'
import JokerWoman from '../icon/JokerWoman.vue'

// 定义props控制大小
const props = defineProps({
    size: {
        type: Number,
        default: 36 // 默认大小
    }
})

const userSex = computed(() => userInfoRef.value?.sex || '')
const avatarUrl = computed(() => CONSTANTS.HTTP.BASEURL + '/auth/avatar/' + userInfoRef.value?.userId)

const errorHandler = () => true
</script>

<style scoped lang="scss">
.avatar-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.custom-avatar {
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
}

.avatar-icon {
    width: 70%;
    height: 70%;
}
</style>