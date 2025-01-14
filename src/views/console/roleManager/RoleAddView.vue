<template>
    <div class="container">
        <el-select v-model="withRole" placeholder="选择复制角色" size="large" style="width: 100%;" clearable>
            <template #prefix>选择复制角色 非必选</template>
            <el-option v-for="item in selectorRoles" :key="item.key" :label="item.value" :value="item.key" />
        </el-select>

        <el-divider />

        <el-input v-model="roleName" autocomplete="off" size="large" placeholder="请输入角色名称" class="input-field">
            <template #prepend>名称</template>
        </el-input>

        <div class="button-container">
            <el-button type="primary" plain @click="addRole" size="large" class="save-button">保存</el-button>
        </div>
    </div>
</template>

<script setup lang='ts'>
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
        }
    })
}

onMounted(() => {
    selectorRole()
})
</script>

<style scoped>
.container {
    padding: 20px;
    background-color: var(--el-background-color);
    /* 使用 ElementPlus 的背景色 */
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-select,
.el-input {
    margin-bottom: 20px;
    border-radius: 6px;
}

.input-field {
    width: 100%;
    height: 40px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: var(--el-input-background-color);
    /* 使用 ElementPlus 的输入框背景色 */
}

.button-container {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

.save-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    border-radius: 6px;
    background-color: var(--el-button-primary-bg-color);
    /* 使用 ElementPlus 的按钮背景色 */
    border-color: var(--el-button-primary-border-color);
    /* 使用 ElementPlus 的按钮边框颜色 */
    color: var(--el-button-primary-text-color);
    /* 使用 ElementPlus 的按钮文字颜色 */
}

.save-button:hover {
    background-color: var(--el-button-primary-hover-bg-color);
    /* 使用 ElementPlus 的按钮 hover 背景色 */
    color: var(--el-button-primary-hover-text-color);
    /* 使用 ElementPlus 的按钮 hover 文字颜色 */
}
</style>
