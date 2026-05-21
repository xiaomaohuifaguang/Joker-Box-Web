<template>
    <el-dialog v-model="visible" title="配置选项显隐" width="560px" :close-on-click-modal="false"
        destroy-on-close>
        <div class="opt-list">
            <div v-for="opt in displayOptions" :key="String(opt.value)" class="opt-row"
                :style="{ paddingLeft: opt.level * 24 + 12 + 'px' }">
                <span class="opt-label">{{ opt.label }}</span>
                <span class="opt-value">{{ opt.value }}</span>
                <el-switch
                    v-model="checkedMap[String(opt.value)]"
                    active-text="显示"
                    inactive-text="隐藏"
                    inline-prompt
                />
            </div>
            <div v-if="displayOptions.length === 0" class="opt-empty">暂无选项</div>
        </div>

        <template #footer>
            <el-button type="primary" @click="onSubmit">确定</el-button>
            <el-button @click="visible = false">取消</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FormFieldOption } from './types'

const props = defineProps<{
    modelValue: boolean
    options: FormFieldOption[]
    selectedValues: string[]
    isCascaderType: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void
    (e: 'submit', values: string[]): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v),
})

interface FlatOption extends FormFieldOption {
    level: number
}

const flattenWithLevel = (list: FormFieldOption[], level = 0): FlatOption[] => {
    const result: FlatOption[] = []
    list.forEach(opt => {
        result.push({ ...opt, level })
        if (opt.children && opt.children.length > 0) {
            result.push(...flattenWithLevel(opt.children, level + 1))
        }
    })
    return result
}

const displayOptions = computed(() => flattenWithLevel(props.options || []))

const checkedMap = ref<Record<string, boolean>>({})

watch(
    () => [props.modelValue, props.selectedValues, props.options],
    ([open]) => {
        if (!open) return
        const map: Record<string, boolean> = {}
        displayOptions.value.forEach(opt => {
            map[String(opt.value)] = props.selectedValues.includes(String(opt.value))
        })
        checkedMap.value = map
    },
    { immediate: true },
)

const onSubmit = () => {
    const selected = Object.entries(checkedMap.value)
        .filter(([, v]) => v)
        .map(([k]) => k)
    emit('submit', selected)
    visible.value = false
}
</script>

<style scoped>
.opt-list {
    max-height: 420px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    padding: 8px 0;
}

.opt-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    transition: background-color 0.15s;
}

.opt-row:hover {
    background-color: var(--el-fill-color-light);
}

.opt-label {
    font-weight: 500;
    color: var(--el-text-color-primary);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.opt-value {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    font-family: monospace;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.opt-empty {
    padding: 30px;
    text-align: center;
    color: var(--el-text-color-secondary);
    font-size: 14px;
}
</style>
