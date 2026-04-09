<template>
    <div class="process-select-container" v-loading="loading">
        <!-- 空状态 -->
        <div v-if="processDefinitionList.length === 0" class="empty-state">
            <div class="empty-icon">
                <el-icon><Warning /></el-icon>
            </div>
            <h3>暂无可用流程</h3>
            <p>请联系管理员配置审批流程</p>
        </div>

        <!-- 流程卡片网格 -->
        <div v-else class="process-grid">
            <div v-for="item in processDefinitionList" :key="item.id" class="process-card"
                @click="chooseOne(item.id)">
                <div class="card-icon">
                    <el-icon><Connection /></el-icon>
                </div>
                <div class="card-content">
                    <h3 class="process-name">{{ item.processName }}</h3>
                    <p class="process-key">{{ item.processKey }}</p>
                </div>
                <div class="card-arrow">
                    <el-icon><ArrowRight /></el-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { http } from '@/utils';
import { onMounted, ref } from 'vue';
import { Connection, ArrowRight, Warning } from '@element-plus/icons-vue';

const processDefinitionList = ref([]);
const loading = ref(false);
const emit = defineEmits(['choose']);

const deployListApi = () => {
    loading.value = true;
    http.result({
        url: '/processDefinition/deployList',
        method: 'POST',
        success: (result) => {
            processDefinitionList.value = result.data;
            loading.value = false;
        }
    });
};

const chooseOne = (processDefinitionId: number) => {
    emit('choose', processDefinitionId);
};

onMounted(() => {
    deployListApi();
});
</script>

<style scoped lang="scss">
.process-select-container {
    min-height: 400px;
    padding: 28px;
    background: var(--el-bg-color-page);
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 40px;
    text-align: center;

    .empty-icon {
        width: 96px;
        height: 96px;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(251, 191, 36, 0.12) 100%);
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
        font-size: 48px;
        color: #f59e0b;
        box-shadow: 0 4px 20px rgba(245, 158, 11, 0.1);
    }

    h3 {
        font-size: 20px;
        font-weight: 700;
        color: var(--el-text-color-primary);
        margin: 0 0 10px 0;
    }

    p {
        font-size: 15px;
        color: var(--el-text-color-secondary);
        margin: 0;
        max-width: 360px;
    }
}

/* Process Grid */
.process-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
}

.process-card {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 24px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        transform: scaleX(0);
        transition: transform 0.3s ease;
    }

    &:hover {
        border-color: #667eea;
        box-shadow: 0 12px 40px rgba(102, 126, 234, 0.18);
        transform: translateY(-4px);

        &::before {
            transform: scaleX(1);
        }

        .card-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .card-arrow {
            color: #667eea;
            transform: translateX(6px);
        }
    }
}

.card-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #667eea;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.card-content {
    flex: 1;
    min-width: 0;

    .process-name {
        font-size: 17px;
        font-weight: 700;
        color: var(--el-text-color-primary);
        margin: 0 0 6px 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .process-key {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        margin: 0;
        font-family: 'Consolas', 'Monaco', monospace;
        background: var(--el-fill-color-light);
        padding: 4px 10px;
        border-radius: 6px;
        width: fit-content;
    }
}

.card-arrow {
    font-size: 24px;
    color: var(--el-text-color-tertiary);
    transition: all 0.3s ease;
    flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
    .process-select-container {
        padding: 20px;
    }

    .process-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .process-card {
        padding: 20px;
    }

    .card-icon {
        width: 48px;
        height: 48px;
        font-size: 24px;
    }
}
</style>