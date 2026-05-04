<template>
    <el-select v-model="value" filterable remote reserve-keyword placeholder="请输入用户名或昵称搜索" :remote-method="remoteMethod"
        :loading="loading" class="user-selector" popper-class="user-selector-popper" @change="handleChange">
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

const options = ref<any[]>([])
const value = ref('')
const loading = ref(false)

const emit = defineEmits(['update:id'])

// 当 id 发生变化时，通知父组件
watch(value, (newValue) => {
    emit('update:id', newValue)
})

const handleChange = (val) => {
    emit('update:id', val)
}

onMounted(() => {
    init()
})

const init = () => {
    if (value.value.length > 0 || true) {
        loading.value = true
        http.result({
            url: '/user/selectorInitByIds',
            method: 'POST',
            data: [value.value],
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
    :deep(.el-input__wrapper) {
        border-radius: 12px;
        box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
        transition: all 0.3s ease;
        padding: 4px 16px;

        &:hover,
        &.is-focus {
            box-shadow: 0 0 0 2px #667eea inset;
        }
    }

    :deep(.el-input__inner) {
        padding-left: 4px;
        height: 44px;
    }

    :deep(.el-input__prefix) {
        display: flex;
        align-items: center;
        padding-right: 8px;

        .el-icon {
            font-size: 18px;
            color: var(--el-text-color-secondary);
            transition: color 0.3s ease;
        }
    }

    &:focus-within {
        :deep(.el-input__prefix .el-icon) {
            color: #667eea;
        }
    }
}

.user-option {
    display: flex;
    align-items: center;
    padding: 12px 8px;
    transition: all 0.2s ease;
    border-radius: 8px;

    &:hover {
        background: var(--el-fill-color-light);
    }

    .user-avatar {
        margin-right: 14px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
    }

    .user-info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .username {
            font-size: 15px;
            color: var(--el-text-color-primary);
            font-weight: 600;
        }

        .nickname {
            font-size: 13px;
            color: var(--el-text-color-secondary);
        }
    }
}
</style>

<style lang="scss">
.user-selector-popper {
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
    border: 1px solid var(--el-border-color-lighter) !important;
    overflow: hidden;

    .empty-tip {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 16px;
        color: var(--el-text-color-secondary);
        gap: 10px;

        .el-icon {
            font-size: 20px;
            opacity: 0.6;
        }

        span {
            font-size: 14px;
            font-weight: 500;
        }
    }

    .el-select-dropdown__item {
        height: auto;
        padding: 0 12px;
        margin: 4px 8px;
        border-radius: 8px;
        transition: all 0.2s ease;

        &:hover {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
        }

        &.selected {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
            color: #667eea;
            font-weight: 600;
        }
    }

    .el-select-dropdown__wrap {
        padding: 8px 0;
    }
}
</style>