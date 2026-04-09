<template>
    <div class="add-role-container">
        <div class="form-header">
            <div class="header-icon">
                <el-icon><Plus /></el-icon>
            </div>
            <div class="header-content">
                <h3>创建新角色</h3>
                <p>填写角色信息，快速创建系统角色</p>
            </div>
        </div>

        <div class="form-content">
            <el-select
                v-model="withRole"
                placeholder="选择复制角色（可选）"
                class="form-select"
                clearable>
                <template #prefix>
                    <el-icon><CopyDocument /></el-icon>
                </template>
                <el-option
                    v-for="item in selectorRoles"
                    :key="item.key"
                    :label="item.value"
                    :value="item.key" />
            </el-select>

            <div class="divider-wrapper">
                <span class="divider-text">角色信息</span>
            </div>

            <el-input
                v-model="roleName"
                autocomplete="off"
                placeholder="请输入角色名称"
                class="form-input"
                @keyup.enter="addRole">
                <template #prefix>
                    <el-icon><User /></el-icon>
                </template>
            </el-input>
        </div>

        <div class="form-footer">
            <el-button type="primary" @click="addRole" class="save-button" :loading="loading">
                <el-icon><Check /></el-icon>
                <span>保存角色</span>
            </el-button>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { Plus, User, Check, CopyDocument } from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const loading = ref(false)
const roleName = ref('')
const withRole = ref('')

const selectorRoles = ref([])

const emit = defineEmits(['success']);

const selectorRole = () => {
    http.result({
        url: '/role/selector',
        method: 'POST',
        success(result) {
            selectorRoles.value = result.data
        }
    })
}

const addRole = () => {
    if (!roleName.value.trim()) {
        alert('请输入角色名称', 'warning')
        return
    }

    loading.value = true
    http.result({
        url: '/role/add',
        method: 'POST',
        params: {
            roleName: roleName.value,
            withRole: withRole.value
        },
        success(result) {
            if (result.code === '200') {
                roleName.value = ''
                withRole.value = ''
                alert('添加成功', 'success')
                emit('success');
            }
            loading.value = false
        },
        error() {
            loading.value = false
        }
    })
}

onMounted(() => {
    selectorRole()
})
</script>

<style scoped lang="scss">
.add-role-container {
    padding: 32px 24px;

    .form-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 32px;

        .header-icon {
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            .el-icon {
                font-size: 26px;
                color: white;
            }
        }

        .header-content {
            flex: 1;

            h3 {
                margin: 0 0 6px 0;
                font-size: 20px;
                font-weight: 600;
                color: var(--el-text-color-primary);
            }

            p {
                margin: 0;
                font-size: 14px;
                color: var(--el-text-color-secondary);
            }
        }
    }

    .form-content {
        .form-select,
        .form-input {
            margin-bottom: 24px;

            :deep(.el-input__wrapper) {
                border-radius: 12px;
                padding: 8px 16px;
                transition: all 0.3s;

                &:hover {
                    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
                }

                &.is-focus {
                    box-shadow: 0 0 0 2px var(--el-color-primary) inset;
                }
            }
        }

        .divider-wrapper {
            display: flex;
            align-items: center;
            margin: 28px 0;

            .divider-text {
                font-size: 13px;
                color: var(--el-text-color-secondary);
                padding: 0 16px;
                position: relative;
                font-weight: 500;

                &::before,
                &::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    width: 40px;
                    height: 1px;
                    background: var(--el-border-color-lighter);
                }

                &::before {
                    right: 100%;
                }

                &::after {
                    left: 100%;
                }
            }
        }
    }

    .form-footer {
        .save-button {
            width: 100%;
            height: 48px;
            font-size: 16px;
            border-radius: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            transition: all 0.3s;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            }
        }
    }
}
</style>
