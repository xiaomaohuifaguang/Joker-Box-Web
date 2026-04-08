<template>
    <div class="detail-container">
        <div v-loading="loading" element-loading-text="加载中..." element-loading-background="rgba(255, 255, 255, 0.7)">
            <el-card class="detail-card" shadow="never">
                <template #header>
                    <div class="card-header">
                        <span>{{ props.type === 'view' ? '详情' : '编辑' }}</span>
                    </div>
                </template>
                <el-row :gutter="20">
                    <el-col :span="6">
                        <el-form label-position="top" class="detail-form">
                            <el-row :gutter="24">
                                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                                    <el-form-item label="表单id">
                                        <el-input v-model="info.id" disabled :placeholder="`请输入表单id`" />
                                    </el-form-item>
                                </el-col>
                                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                                    <el-form-item label="表单名称">
                                        <el-input v-model="info.name" :disabled="props.type !== 'edit'"
                                            :placeholder="`请输入表单名称`" />
                                    </el-form-item>
                                </el-col>
                                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                                    <el-form-item label="描述">
                                        <el-input v-model="info.description" :disabled="props.type !== 'edit'"
                                            :placeholder="`请输入描述`" />
                                    </el-form-item>
                                </el-col>
                                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                                    <el-form-item label="版本">
                                        <el-input v-model="info.version" disabled :placeholder="`请输入版本`" />
                                    </el-form-item>
                                </el-col>
                                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                                    <el-form-item label="状态">
                                        <el-input v-model="info.status" disabled :placeholder="`请输入状态 0 草稿 1 发布`" />
                                    </el-form-item>
                                </el-col>
                                <!-- <el-col :xs="24" :sm="24" :md="24" :lg="24">
                            <el-form-item label="逻辑删除">
                                <el-input v-model="info.deleted" :disabled="props.type !== 'edit'"
                                    :placeholder="`请输入逻辑删除`" />
                            </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="24" :lg="24">
                            <el-form-item label="创建人">
                                <el-input v-model="info.createBy" :disabled="props.type !== 'edit'"
                                    :placeholder="`请输入创建人`" />
                            </el-form-item>
                        </el-col> -->
                                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                                    <el-form-item label="创建时间">
                                        <el-input v-model="info.createTime" disabled :placeholder="`请输入创建时间`" />
                                    </el-form-item>
                                </el-col>
                                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                                    <el-form-item label="更新时间">
                                        <el-input v-model="info.updateTime" disabled :placeholder="`请输入更新时间`" />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form>
                    </el-col>
                    <el-col :span="12">
                        <FormMaker :form-fields="info.formFields" @update:fields="info.formFields = $event;"
                            v-model="formData" :type="props.type == 'edit' ? 'create' : 'view'" />
                    </el-col>
                </el-row>


                <el-divider class="form-divider" />

                <div class="action-bar">
                    <el-button type="primary" size="large" @click="save" class="save-button"
                        v-if="props.type === 'edit'">
                        <el-icon>
                            <Check />
                        </el-icon>
                        <span>保存修改</span>
                    </el-button>
                    <el-button type="info" size="large" @click="emit('success')" class="add-button">
                        <span>关闭</span>
                    </el-button>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';
import FormMaker from '@/components/dynamicForm/FormMaker.vue';


const emit = defineEmits(['success']);


const props = defineProps({
    id: Number,
    type: String
})

const loading = ref(false)

const formData = ref({})

const info = ref({
    id: -1,
    name: '',
    description: '',
    version: '',
    status: '',
    deleted: '',
    createBy: '',
    createTime: '',
    updateTime: '',
    formFields: []
})

const queryInfo = () => {
    loading.value = true
    http.result({
        url: '/dynamicForm/info',
        method: 'POST',
        data: {
            id: props.id
        },
        success(result) {
            info.value = result.data
            loading.value = false
        }
    })
}

const save = () => {
    loading.value = true
    http.result({
        url: '/dynamicForm/update',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            queryInfo()
            loading.value = false
        }
    })
}

onMounted(() => {
    if (!props.id) return;
    queryInfo()
})
</script>

<style scoped lang="scss">
.detail-container {
    padding: 20px;
    background-color: var(--el-bg-color-page);
}

.detail-card {
    border-radius: 8px;

    :deep(.el-card__header) {
        border-bottom: 1px solid var(--el-border-color-light);
        padding: 16px 20px;

        .card-header {
            font-size: 18px;
            font-weight: 600;
            color: var(--el-text-color-primary);
        }
    }
}

.detail-form {
    :deep(.el-form-item__label) {
        font-weight: 500;
        color: var(--el-text-color-regular);
        margin-bottom: 6px;
    }

    :deep(.el-input__inner) {
        height: 40px;
        line-height: 40px;
        border-radius: 8px;
    }
}

.form-divider {
    margin: 20px 0;
}

.action-bar {
    display: flex;
    justify-content: center;
    margin-top: 20px;

    .save-button {
        width: 200px;
        height: 40px;
        font-size: 16px;
        font-weight: 500;
        border-radius: 8px;
    }
}

@media (max-width: 768px) {
    .detail-form {
        :deep(.el-col) {
            width: 100%;
            margin-bottom: 0;
        }
    }

    .action-bar {
        .save-button {
            width: 100%;
        }
    }
}
</style>