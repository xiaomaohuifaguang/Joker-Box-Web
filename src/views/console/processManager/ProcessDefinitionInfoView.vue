<template>
    <div class="process-info-container" v-loading="loading">
        <el-row :gutter="20">
            <el-col :span="24">
                <el-form label-position="left" label-width="auto">
                    <el-form-item label="流程id">
                        <el-input v-model="info.id" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="流程定义key">
                        <el-input v-model="info.processKey" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="流程定义名称">
                        <el-input v-model="info.processName" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="流程描述">
                        <el-input v-model="info.processDescription" autocomplete="off"
                            :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="使用版本">
                        <el-input v-model="info.version" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="流程状态">
                        <el-input v-model="info.status" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="创建人userid">
                        <el-input v-model="info.createUserId" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-input v-model="info.createTime" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="更新时间">
                        <el-input v-model="info.updateTime" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                    <el-form-item label="逻辑删除">
                        <el-input v-model="info.deleted" autocomplete="off" :disabled="props.type != 'edit'" />
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-divider />
        <div class="save-button-wrapper" v-if="props.type == 'edit'">
            <el-button type="primary" plain @click="save" size="large">保存</el-button>
        </div>
    </div>

</template>

<script setup lang='ts'>
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const props = defineProps({
    id: String,
    type: String
})

const loading = ref(false)

const info = ref({
    id: '',
    processKey: '',
    processName: '',
    processDescription: '',
    version: '',
    status: '',
    createUserId: '',
    createTime: '',
    updateTime: '',
    deleted: '',
})

const queryInfo = () => {
    loading.value = true
    console.log(props.id)
    http.result({
        url: '/processDefinition/info',
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
        url: '/processDefinition/update',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            queryInfo()
        }
    })
}

onMounted(() => {
    if (props.id == '') return;
    queryInfo()
})

</script>

<style scoped lang="scss">
.process-info-container {
    padding: 24px;
    background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);
    min-height: 100%;
    max-width: 1000px;
    margin: 0 auto;
}

.el-row {
    .el-col {
        margin-top: 16px;
    }
}

.el-form {
    background: var(--el-bg-color);
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--el-border-color-lighter);

    :deep(.el-form-item) {
        margin-bottom: 24px;

        &:last-child {
            margin-bottom: 0;
        }
    }

    :deep(.el-form-item__label) {
        font-weight: 600;
        color: var(--el-text-color-primary);
        font-size: 14px;
    }

    :deep(.el-input__wrapper) {
        border-radius: 10px;
        box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
        transition: all 0.3s ease;

        &:hover {
            box-shadow: 0 0 0 1px #667eea inset;
        }

        &.is-focus {
            box-shadow: 0 0 0 2px #667eea inset;
        }
    }

    :deep(.el-input__inner) {
        height: 44px;
    }

    :deep(.el-input.is-disabled .el-input__wrapper) {
        background: var(--el-fill-color-light);

        .el-input__inner {
            color: var(--el-text-color-regular);
            -webkit-text-fill-color: var(--el-text-color-regular);
        }
    }
}

.el-divider {
    margin: 28px 0;
    border-color: var(--el-border-color-lighter);
}

.save-button-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 8px;

    .el-button {
        min-width: 160px;
        height: 48px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 15px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
            transform: translateY(-2px);
        }
    }
}

@media (max-width: 768px) {
    .process-info-container {
        padding: 16px;
    }

    .el-form {
        padding: 20px;
        border-radius: 12px;
    }

    .save-button-wrapper {
        .el-button {
            width: 100%;
            min-width: auto;
        }
    }
}
</style>