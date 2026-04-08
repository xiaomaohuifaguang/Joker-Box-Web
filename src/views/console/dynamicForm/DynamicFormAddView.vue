<template>
    <div class="add-container">
        <el-card class="add-card" shadow="never">
            <template #header>
                <div class="card-header">
                    <span>添加表单</span>
                </div>
            </template>

            <el-row :gutter="20">
                <el-col :span="6">
                    <el-form label-position="top" class="add-form">
                        <el-row :gutter="24">
                            <!-- <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="表单id" prop="id">
                            <el-input v-model="info.id" :placeholder="`请输入表单id`" clearable />
                        </el-form-item>
                    </el-col> -->
                            <el-col :xs="24" :sm="24" :md="24" :lg="24">
                                <el-form-item label="表单名称" prop="name">
                                    <el-input v-model="info.name" :placeholder="`请输入表单名称`" clearable />
                                </el-form-item>
                            </el-col>
                            <el-col :xs="24" :sm="24" :md="24" :lg="24">
                                <el-form-item label="描述" prop="description">
                                    <el-input v-model="info.description" :placeholder="`请输入描述`" clearable />
                                </el-form-item>
                            </el-col>
                            <!-- <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="版本" prop="version">
                            <el-input v-model="info.version" :placeholder="`请输入版本`" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="状态 0 草稿 1 发布" prop="status">
                            <el-input v-model="info.status" :placeholder="`请输入状态 0 草稿 1 发布`" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="逻辑删除" prop="deleted">
                            <el-input v-model="info.deleted" :placeholder="`请输入逻辑删除`" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="创建人" prop="createBy">
                            <el-input v-model="info.createBy" :placeholder="`请输入创建人`" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="创建时间" prop="createTime">
                            <el-input v-model="info.createTime" :placeholder="`请输入创建时间`" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="更新时间" prop="updateTime">
                            <el-input v-model="info.updateTime" :placeholder="`请输入更新时间`" clearable />
                        </el-form-item>
                    </el-col> -->
                        </el-row>
                    </el-form>
                </el-col>
                <el-col :span="12">
                    <FormMaker :form-fields="info.formFields" @update:fields="info.formFields = $event;" type="create"
                        v-model="formData" />
                </el-col>
            </el-row>

            <el-divider class="form-divider" />

            <div class="action-bar">
                <el-button type="primary" size="large" @click="add" class="add-button">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    <span>确认添加</span>
                </el-button>
                <el-button type="info" size="large" @click="emit('success')" class="add-button">
                    <span>取消</span>
                </el-button>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { alert, http } from '@/utils';
import { ref } from 'vue';
import FormMaker from '@/components/dynamicForm/FormMaker.vue';

const emit = defineEmits(['success']);

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

const formData = ref({})

const add = () => {
    http.result({
        url: '/dynamicForm/add',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            emit('success');
        }
    })
}
</script>

<style scoped lang="scss">
.add-container {
    padding: 20px;
    background-color: var(--el-bg-color-page);
}

.add-card {
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

.add-form {
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

    .add-button {
        width: 200px;
        height: 40px;
        font-size: 16px;
        font-weight: 500;
        border-radius: 8px;
    }
}

@media (max-width: 768px) {
    .add-form {
        :deep(.el-col) {
            width: 100%;
            margin-bottom: 0;
        }
    }

    .action-bar {
        .add-button {
            width: 100%;
        }
    }
}
</style>