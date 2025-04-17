<template>
    <div class="process-container" v-loading="loading">
        <el-row :gutter="20">
            <el-col v-if="processDefinitionList.length == 0" :span="24">
                <el-result icon="warning" title="提示" sub-title="暂无可用流程" />
            </el-col>
            <el-col v-for="item in processDefinitionList" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
                <el-card @click="chooseOne(item.id)" class="process-card" shadow="hover">
                    <div class="card-content">
                        <h3>{{ item.processName }}</h3>
                        <div class="card-footer">
                            <el-tag type="info" size="small">点击选择</el-tag>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang='ts'>
import { http } from '@/utils';
import { onMounted, ref } from 'vue';

var processDefinitionList = ref([]);
const emit = defineEmits(['choose'])

const deployListApi = () => {
    loading.value = true;
    http.result({
        url: '/processDefinition/deployList',
        method: 'POST',
        success: (result) => {
            processDefinitionList.value = result.data
            loading.value = false;
        }
    })
}

const chooseOne = (processDefinitionId) => {
    emit('choose', processDefinitionId)
}

const loading = ref(false)

onMounted(() => {
    deployListApi()
})
</script>

<style scoped>
.process-container {
    min-height: 50vh;
    padding: 20px;
    /* background-color: #f5f7fa; */
}

.process-card {
    margin-bottom: 20px;
    transition: all 0.3s ease;
    border-radius: 8px;
    border: 1px solid #ebeef5;
}

.process-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
    border-color: var(--el-color-primary);
    cursor: pointer;
}

.card-content {
    padding: 10px;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.card-content h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #333;
    font-weight: 500;
    word-break: break-word;
}

.card-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}

.el-result {
    padding: 20px 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .process-container {
        padding: 10px;
    }
}
</style>