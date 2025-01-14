<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="24">
                <el-form label-position="left" label-width="auto">
                    <!-- <el-form-item label="组织id">
                        <el-input v-model="info.id" autocomplete="off" />
                    </el-form-item> -->
                    <!-- <el-form-item label="父级机构id">
                        <el-input v-model="info.parentId" autocomplete="off" disabled />
                    </el-form-item> -->
                    <el-form-item label="父级机构">
                        <el-input v-model="info.parentName" autocomplete="off" disabled />
                    </el-form-item>
                    <el-form-item label="机构名称">
                        <el-input v-model="info.name" autocomplete="off" />
                    </el-form-item>
                    <!-- <el-form-item label="逻辑删除">
                        <el-input v-model="info.deleted" autocomplete="off" />
                    </el-form-item> -->
                    <!-- <el-form-item label="创建时间">
                        <el-input v-model="info.createTime" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="更新时间">
                        <el-input v-model="info.updateTime" autocomplete="off" />
                    </el-form-item> -->
                </el-form>
            </el-col>
        </el-row>
        <el-divider />
        <div style="display: flex;justify-content: center;">
            <el-button type="primary" plain @click="add" size="large">添加</el-button>
        </div>
    </div>

</template>

<script setup lang='ts'>
import { alert, http } from '@/utils';
import { onMounted, ref } from 'vue';

const props = defineProps({
    parentId: String,
    parentName: String
})

const emit = defineEmits(['success']);

const info = ref({
    id: '',
    parentId: '',
    parentName: '',
    name: '',
    deleted: '',
    createTime: '',
    updateTime: '',
})


const add = () => {
    http.result({
        url: '/org/add',
        method: 'POST',
        data: info.value,
        success(result) {
            alert(result.msg, 'success')
            emit('success');
            info.value.name = ''
            info.value.parentId = ''
            // queryInfo()
        }
    })
}

onMounted(() => {
    info.value.parentId = props.parentId
    info.value.parentName = props.parentName
})

</script>

<style scoped>
.el-col {
    margin-top: 1rem;
}
</style>