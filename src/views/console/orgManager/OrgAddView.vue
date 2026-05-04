<template>
    <div class="add-org-container">
        <div class="form-header">
            <div class="header-icon">
                <el-icon><Plus /></el-icon>
            </div>
            <div class="header-content">
                <h3>添加机构</h3>
                <p>在选定父级机构下创建新机构</p>
            </div>
        </div>

        <div class="form-content">
            <el-form label-position="top" class="org-form">
                <el-form-item label="父级机构">
                    <el-input v-model="info.parentName" disabled class="disabled-input">
                        <template #prefix>
                            <el-icon><Connection /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item label="机构名称" required>
                    <el-input
                        v-model="info.name"
                        autocomplete="off"
                        placeholder="请输入机构名称"
                        @keyup.enter="add"
                        class="form-input">
                        <template #prefix>
                            <el-icon><OfficeBuilding /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
        </div>

        <div class="form-footer">
            <el-button type="primary" @click="add" class="save-button" :loading="loading">
                <el-icon><Check /></el-icon>
                <span>添加机构</span>
            </el-button>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { Plus, Connection, OfficeBuilding, Check } from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const props = defineProps({
    parentId: String,
    parentName: String
})

const emit = defineEmits(['success']);

const loading = ref(false)

const info = ref({
    id: '',
    parentId: '',
    parentName: '',
    name: '',
    deleted: '',
    createTime: '',
    updateTime: '',
})

const add = async () => {
    if (!info.value.name.trim()) {
        alert('请输入机构名称', 'warning')
        return
    }

    loading.value = true
    try {
        const result = await http.post('/org/add', info.value, { raw: true })
        if (result.code === '200') {
            alert(result.msg, 'success')
            emit('success');
            info.value.name = ''
        }
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    info.value.parentId = props.parentId || ''
    info.value.parentName = props.parentName || ''
})
</script>

<style scoped lang="scss">
.add-org-container {
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
        .org-form {
            :deep(.el-form-item__label) {
                font-weight: 500;
                color: var(--el-text-color-regular);
                padding-bottom: 8px;
            }

            .disabled-input {
                :deep(.el-input__wrapper) {
                    background: var(--el-fill-color-light);
                }
            }

            .form-input {
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
        }
    }

    .form-footer {
        margin-top: 32px;

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
