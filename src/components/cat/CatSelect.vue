<template>
    <div class="relative">
        <select v-model="selectedOption" class="custom-select select w-full max-w-xs">
            <option value="" selected>{{ placeholder && placeholder !='' ? placeholder : '请选择' }}</option>
            <option v-for="option in options" :key="option.key" :value="option.key">
                {{ option.value }}
            </option>
        </select>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps<{
    modelValue: any,
    options: Option[],
    placeholder: string
}>();

interface Option {
    key: any,
    value: any
}

const emit = defineEmits(['update:modelValue','change']);

const selectedOption = ref(props.modelValue);

watch(selectedOption, (newValue) => {
    emit('update:modelValue', newValue);
    emit('change', newValue);
});
</script>

<style lang="scss" scoped>
.custom-select {
    border: 2px solid oklch(var(--in));
    /* 边框颜色 */
    border-radius: 0.375rem;
    /* 圆角 */
    padding: 0.5rem 1rem;
    /* 内边距 */
    font-weight: bold;
    /* 字体粗细 */
    transition: all 0.3s ease;
    /* 过渡效果 */
    appearance: none;
    /* 隐藏默认箭头 */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23000'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.707a1 1 0 011.414 0L10 11.414l3.293-3.707a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1.5em 1.5em;
}

.custom-select:focus {
    outline: none;
    /* 移除焦点样式 */
    border-color: oklch(var(--in));
    /* 焦点时边框颜色 */
    // box-shadow: 0 0 0 3px oklch(var(--inc));
    /* 焦点时阴影 */
}

.custom-select option {
    padding: 0.5rem 1rem; /* 内边距 */
    line-height: 2rem; /* 行高 */
    height: 2.5rem; /* 高度 */
    font-size: 1rem; /* 字体大小 */
}
</style>