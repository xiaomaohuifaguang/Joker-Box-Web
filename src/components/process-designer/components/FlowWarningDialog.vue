<template>
    <el-dialog v-model="visible" title="" width="520px" :close-on-click-modal="false" :show-close="false"
        class="flow-warning-dialog" align-center>
        <div class="warning-header">
            <div class="warning-icon">
                <el-icon :size="28" color="var(--el-color-warning)">
                    <WarningFilled />
                </el-icon>
            </div>
            <div class="warning-title">
                <h3>流程存在 {{ warnings.length }} 个警告</h3>
                <p>建议修复后再保存，避免流程运行时卡住</p>
            </div>
        </div>

        <div class="warning-list">
            <div v-for="(w, idx) in warnings" :key="idx" class="warning-card">
                <div class="warning-card-icon">
                    <el-icon :size="16" color="var(--el-color-warning)">
                        <Warning />
                    </el-icon>
                </div>
                <div class="warning-card-content">
                    <div class="warning-card-name">{{ w.nodeName }}</div>
                    <div class="warning-card-message">{{ w.message }}</div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="onCancel" size="large">返回修改</el-button>
                <el-button type="primary" @click="onConfirm" size="large">确认保存</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Warning, WarningFilled } from '@element-plus/icons-vue'
import type { FlowWarning } from '../types/flow-validation'

const props = defineProps<{
    modelValue: boolean
    warnings: FlowWarning[]
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void
    (e: 'confirm'): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v),
})

const onCancel = () => {
    visible.value = false
}

const onConfirm = () => {
    visible.value = false
    emit('confirm')
}
</script>

<style scoped>
.warning-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 8px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    margin-bottom: 16px;
}

.warning-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--el-color-warning-light-9);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.warning-title h3 {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
}

.warning-title p {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
}

.warning-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
    padding: 0 4px;
}

.warning-card {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 8px;
    background: var(--el-color-warning-light-9);
    border: 1px solid var(--el-color-warning-light-7);
}

.warning-card-icon {
    margin-top: 2px;
    flex-shrink: 0;
}

.warning-card-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.warning-card-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--el-text-color-primary);
}

.warning-card-message {
    font-size: 13px;
    color: var(--el-text-color-regular);
    line-height: 1.5;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 8px;
}
</style>

<style>
.flow-warning-dialog .el-dialog__header {
    display: none;
}

.flow-warning-dialog .el-dialog__body {
    padding: 24px 24px 12px;
}

.flow-warning-dialog .el-dialog__footer {
    padding: 12px 24px 24px;
    border-top: 1px solid var(--el-border-color-lighter);
}
</style>
