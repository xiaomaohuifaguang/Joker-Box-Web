<template>
    <el-select v-model="value" multiple filterable remote reserve-keyword placeholder="请输入用户名或昵称搜索"
        :remote-method="remoteMethod" :loading="loading" class="user-selector" popper-class="user-selector-popper"
        @change="handleChange">
        <template #prefix>
            <el-icon>
                <User />
            </el-icon>
        </template>
        <el-option v-for="item in options" :key="item.id" :label="item.username + ' / ' + item.nickname"
            :value="item.id">
            <div class="user-option">
                <el-avatar :size="24" :src="item.avatar || ''" class="user-avatar">
                    {{ item.nickname?.charAt(0) || item.username?.charAt(0) }}
                </el-avatar>
                <div class="user-info">
                    <span class="username">{{ item.username }}</span>
                    <span class="nickname">{{ item.nickname }}</span>
                </div>
            </div>
        </el-option>
        <template #empty>
            <div class="empty-tip">
                <el-icon>
                    <Search />
                </el-icon>
                <span>未找到匹配用户</span>
            </div>
        </template>
    </el-select>
</template>

<script setup lang="ts">
import { User, Search } from '@element-plus/icons-vue'
import { http } from '@/utils'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
    ids: any[]
}>()

const options = ref([])
const value = ref<any[]>([])
const loading = ref(false)

const emit = defineEmits(['update:ids'])

// 当 id 发生变化时，通知父组件
watch(value, (newValue) => {
    emit('update:ids', newValue)
})

const handleChange = (val: any[]) => {
    emit('update:ids', val)
}

onMounted(() => {
    value.value = props.ids
    init()
})

const init = () => {
    if (value.value.length > 0) {
        loading.value = true
        http.result({
            url: '/user/selectorInitByIds',
            method: 'POST',
            data: value.value,
            success(result) {
                options.value = result.data
                loading.value = false
            }
        })
    }
}

const remoteMethod = (query: string) => {
    if (query) {
        loading.value = true

        http.result({
            url: '/user/selectorUserWithInfo',
            method: 'POST',
            params: {
                search: query
            },
            success(result) {
                loading.value = false
                options.value = result.data
            }
        })
    } else {
        options.value = []
    }
}
</script>

<style scoped lang="scss">
.user-selector {
    :deep(.el-input__inner) {
        padding-left: 36px;
    }

    :deep(.el-input__prefix) {
        display: flex;
        align-items: center;
        padding-left: 10px;
    }

    :deep(.el-tag) {
        display: flex;
        align-items: center;
        margin: 2px;
        background-color: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary-light-7);

        .el-tag__close {
            color: var(--el-color-primary);

            &:hover {
                background-color: var(--el-color-primary-light-5);
                color: white;
            }
        }
    }
}

.user-option {
    display: flex;
    align-items: center;
    padding: 8px 0;

    .user-avatar {
        margin-right: 12px;
        background-color: var(--el-color-primary);
        color: white;
    }

    .user-info {
        display: flex;
        flex-direction: column;

        .username {
            font-size: 14px;
            color: var(--el-text-color-regular);
        }

        .nickname {
            font-size: 12px;
            color: var(--el-text-color-secondary);
        }
    }
}
</style>

<style lang="scss">
.user-selector-popper {
    .empty-tip {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 0;
        color: var(--el-text-color-secondary);

        .el-icon {
            margin-right: 8px;
            font-size: 16px;
        }
    }

    .el-select-dropdown__item {
        height: auto;
        padding: 0 12px;
    }

    .el-select-dropdown__item.selected {
        .user-info {

            .username,
            .nickname {
                color: inherit;
            }
        }
    }
}
</style>