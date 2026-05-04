<template>
    <div class="website-edit-container">
        <div v-loading="loading" element-loading-text="加载中...">
            <div class="content-wrapper">
                <div class="form-header">
                    <div class="header-icon">
                        <el-icon><Link /></el-icon>
                    </div>
                    <div class="header-content">
                        <h3>{{ props.type === 'view' ? '网站详情' : '编辑网站' }}</h3>
                        <p>{{ props.type === 'view' ? '查看网站信息' : '修改网站收藏信息' }}</p>
                    </div>
                </div>

                <el-form label-position="top" class="website-form">
                    <el-row :gutter="20">
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                            <el-form-item label="ID">
                                <el-input v-model="info.id" autocomplete="off" disabled size="large">
                                    <template #prefix>
                                        <el-icon><Key /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                            <el-form-item label="名称">
                                <el-input
                                    v-model="info.title"
                                    autocomplete="off"
                                    :disabled="props.type !== 'edit'"
                                    size="large">
                                    <template #prefix>
                                        <el-icon><Document /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                            <el-form-item label="分组名称">
                                <el-input
                                    v-model="info.groupName"
                                    autocomplete="off"
                                    :disabled="props.type !== 'edit'"
                                    size="large">
                                    <template #prefix>
                                        <el-icon><Folder /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                            <el-form-item label="网站地址">
                                <el-input
                                    v-model="info.url"
                                    autocomplete="off"
                                    :disabled="props.type !== 'edit'"
                                    size="large">
                                    <template #prefix>
                                        <el-icon><Link /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="简介">
                        <el-input
                            v-model="info.description"
                            type="textarea"
                            :rows="4"
                            autocomplete="off"
                            :disabled="props.type !== 'edit'"
                            size="large" />
                    </el-form-item>
                    <el-row :gutter="20">
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                            <el-form-item label="创建时间">
                                <el-input v-model="info.createTime" autocomplete="off" disabled size="large">
                                    <template #prefix>
                                        <el-icon><Clock /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                            <el-form-item label="更新时间">
                                <el-input v-model="info.updateTime" autocomplete="off" disabled size="large">
                                    <template #prefix>
                                        <el-icon><Timer /></el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </div>

            <div class="form-footer" v-if="props.type === 'edit'">
                <el-button type="primary" size="large" @click="save" class="save-button" :loading="loading">
                    <el-icon><Check /></el-icon>
                    <span>保存修改</span>
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import {
    Link,
    Key,
    Document,
    Folder,
    Clock,
    Timer,
    Check
} from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const props = defineProps({
    id: String,
    type: String
})

const loading = ref(false)

const info = ref({
    id: null,
    groupName: "",
    url: "",
    title: "",
    description: "",
    createTime: null,
    updateTime: null
})

const queryInfo = async () => {
    loading.value = true
    info.value = await http.post('/website/info', undefined, { params: { id: props.id } })
    loading.value = false
}

const save = async () => {
    loading.value = true
    const result = await http.post('/website/save', info.value, { raw: true })
    alert(result.msg, 'success')
    await queryInfo()
    loading.value = false
}

onMounted(() => {
    if (props.id) queryInfo()
})
</script>

<style scoped lang="scss">
.website-edit-container {
    padding: 24px;
    background: var(--el-bg-color-page);

    .content-wrapper {
        max-width: 900px;
        margin: 0 auto;
    }

    .form-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 28px;

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

    .website-form {
        :deep(.el-form-item__label) {
            font-weight: 500;
            color: var(--el-text-color-regular);
            padding-bottom: 8px;
        }

        :deep(.el-input__wrapper) {
            border-radius: 10px;
        }
    }

    .form-footer {
        display: flex;
        justify-content: center;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--el-border-color-lighter);

        .save-button {
            min-width: 200px;
            height: 46px;
            font-size: 16px;
            font-weight: 500;
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

@media (max-width: 768px) {
    .website-edit-container {
        padding: 16px;

        .form-header {
            flex-direction: column;
            text-align: center;
        }

        .form-footer {
            .save-button {
                width: 100%;
            }
        }
    }
}
</style>
