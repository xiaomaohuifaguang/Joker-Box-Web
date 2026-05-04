<template>
    <div class="add-menu-container">
        <div class="form-header">
            <div class="header-icon">
                <el-icon><Plus /></el-icon>
            </div>
            <div class="header-content">
                <h3>添加菜单</h3>
                <p>配置菜单基本信息和权限</p>
            </div>
        </div>

        <div class="form-content">
            <el-form label-position="top" class="menu-form">
                <el-form-item label="菜单类型" required>
                    <el-radio-group v-model="info.menuType" size="large">
                        <el-radio-button value="-1">
                            <el-icon><Monitor /></el-icon>
                            <span>后台菜单</span>
                        </el-radio-button>
                        <el-radio-button value="-2">
                            <el-icon><HomeFilled /></el-icon>
                            <span>前台菜单</span>
                        </el-radio-button>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="父级菜单">
                    <el-cascader
                        v-model="info.parentId"
                        :options="menuTree"
                        :props="{
                            children: 'children',
                            label: 'name',
                            value: 'id',
                            emitPath: false,
                            checkStrictly: true,
                        }"
                        placeholder="请选择父级菜单（可选）"
                        size="large"
                        style="width: 100%"
                        clearable />
                </el-form-item>

                <el-form-item label="菜单名称" required>
                    <el-input
                        v-model="info.name"
                        autocomplete="off"
                        placeholder="请输入菜单名称"
                        size="large"
                        @keyup.enter="add">
                        <template #prefix>
                            <el-icon><Document /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item label="路由路径" required>
                    <el-input
                        v-model="info.path"
                        autocomplete="off"
                        placeholder="请输入路由路径，如：/user/list"
                        size="large">
                        <template #prefix>
                            <el-icon><Link /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item label="菜单图标">
                    <div class="icon-selector">
                        <div class="icon-preview" :style="{ background: info.icon ? '#667eea' : '#909399' }">
                            <el-icon :size="28" color="white">
                                <component :is="info.icon || 'Menu'" />
                            </el-icon>
                        </div>
                        <el-button type="primary" plain @click="dialogIcon.open = true" size="large">
                            <el-icon><Grid /></el-icon>
                            <span>选择图标</span>
                        </el-button>
                    </div>
                </el-form-item>

                <el-form-item label="排序权重">
                    <el-input-number
                        v-model="info.sort"
                        :min="0"
                        :max="999"
                        controls-position="right"
                        size="large"
                        style="width: 100%" />
                </el-form-item>

                <el-form-item label="白名单">
                    <el-radio-group v-model="info.whiteList" size="large">
                        <el-radio-button value="1">
                            <el-icon><Unlock /></el-icon>
                            <span>开启</span>
                        </el-radio-button>
                        <el-radio-button value="0">
                            <el-icon><Lock /></el-icon>
                            <span>关闭</span>
                        </el-radio-button>
                    </el-radio-group>
                </el-form-item>
            </el-form>
        </div>

        <div class="form-footer">
            <el-button type="primary" @click="add" class="save-button" :loading="loading" size="large">
                <el-icon><Check /></el-icon>
                <span>添加菜单</span>
            </el-button>
        </div>

        <!-- 图标选择对话框 -->
        <el-dialog
            v-model="dialogIcon.open"
            title="选择菜单图标"
            width="800px"
            center
            destroy-on-close
            class="icon-dialog">
            <IconSelector v-model:name="info.icon" />
            <template #footer>
                <el-button @click="dialogIcon.open = false" size="large">取消</el-button>
                <el-button type="primary" @click="dialogIcon.open = false" size="large">确认</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang='ts'>
import {
    Plus,
    Monitor,
    HomeFilled,
    Document,
    Link,
    Grid,
    Check,
    Unlock,
    Lock,
    Menu
} from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const loading = ref(false)

const info = ref({
    menuType: '-1',
    parentId: '',
    name: '',
    path: '',
    icon: '',
    sort: 0,
    whiteList: '0'
})

const menuTree = ref<any[]>([])

const dialogIcon = ref({
    open: false,
    title: '图标选择'
})

const emit = defineEmits(['success']);

const queryMenuTree = () => {
    http.result({
        url: '/menu/menuTreeAll',
        method: 'GET',
        params: { menuType: info.value.menuType },
        success(result) {
            menuTree.value = result.data
        }
    })
}

const add = () => {
    if (!info.value.name.trim()) {
        alert('请输入菜单名称', 'warning')
        return
    }

    if (!info.value.path.trim()) {
        alert('请输入路由路径', 'warning')
        return
    }

    loading.value = true
    http.result({
        url: '/menu/add',
        method: 'POST',
        data: info.value,
        success(result) {
            if (result.code === '200') {
                alert(result.msg, 'success')
                emit('success');
                // 重置表单
                info.value = {
                    menuType: '-1',
                    parentId: '',
                    name: '',
                    path: '',
                    icon: '',
                    sort: 0,
                    whiteList: '0'
                }
            }
            loading.value = false
        },
        error() {
            loading.value = false
        }
    })
}

onMounted(() => {
    queryMenuTree()
})
</script>

<style scoped lang="scss">
.add-menu-container {
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
        .menu-form {
            :deep(.el-form-item__label) {
                font-weight: 500;
                color: var(--el-text-color-regular);
                padding-bottom: 8px;
            }

            :deep(.el-input__wrapper),
            :deep(.el-input-number__decrease),
            :deep(.el-input-number__increase) {
                border-radius: 10px;
            }

            :deep(.el-radio-group) {
                .el-radio-button {
                    .el-icon {
                        margin-right: 4px;
                    }
                }
            }

            .icon-selector {
                display: flex;
                align-items: center;
                gap: 16px;

                .icon-preview {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
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

.icon-dialog {
    :deep(.el-dialog__header) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0;
        padding: 20px 24px;

        .el-dialog__title {
            color: white;
            font-weight: 600;
        }

        .el-dialog__headerbtn .el-dialog__close {
            color: white;
        }
    }

    :deep(.el-dialog__body) {
        padding: 24px;
    }

    :deep(.el-dialog__footer) {
        padding: 16px 24px;
        border-top: 1px solid var(--el-border-color-lighter);
    }
}
</style>
