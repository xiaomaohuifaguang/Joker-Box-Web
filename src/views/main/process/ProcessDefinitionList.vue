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

const processDefinitionList = ref<any[]>([]);
const loading = ref(false);
const emit = defineEmits(['choose']);

const deployListApi = async () => {
    loading.value = true;
    processDefinitionList.value = await http.post('/processDefinition/deployList');
    loading.value = false;
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
    background: var(--bg-page);
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
        background: var(--warning-bg);
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
        font-size: 48px;
        color: var(--warning);
        box-shadow: var(--shadow-md);
    }

    h3 {
        font-size: 20px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 10px 0;
    }

    p {
        font-size: 15px;
        color: var(--text-secondary);
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
    background: var(--bg-container);
    border: 1px solid var(--border-light);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-sm);

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--brand-primary), var(--brand-secondary));
        transform: scaleX(0);
        transition: transform 0.3s ease;
    }

    &:hover {
        border-color: var(--brand-primary);
        box-shadow: var(--shadow-glow-strong);
        transform: translateY(-4px);

        &::before {
            transform: scaleX(1);
        }

        .card-icon {
            background: var(--brand-gradient);
            color: var(--text-on-brand);
            box-shadow: var(--shadow-glow);
        }

        .card-arrow {
            color: var(--brand-primary);
            transform: translateX(6px);
        }
    }
}

.card-icon {
    width: 56px;
    height: 56px;
    background: var(--brand-gradient-soft);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: var(--brand-primary);
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.card-content {
    flex: 1;
    min-width: 0;

    .process-name {
        font-size: 17px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 6px 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .process-key {
        font-size: 13px;
        color: var(--text-secondary);
        margin: 0;
        font-family: 'Consolas', 'Monaco', monospace;
        background: var(--bg-overlay);
        padding: 4px 10px;
        border-radius: 6px;
        width: fit-content;
    }
}

.card-arrow {
    font-size: 24px;
    color: var(--text-secondary);
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