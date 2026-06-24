<template>
    <!-- 折叠分组容器 —— 标题点击可展开/收起;比 el-divider 多语义,比 el-collapse 更轻 -->
    <section class="property-section" :class="{ 'is-collapsed': !open }">
        <header class="property-section__header" @click="toggle">
            <span class="property-section__arrow" :class="{ 'is-open': open }">▸</span>
            <span class="property-section__title">{{ title }}</span>
            <span v-if="badge" class="property-section__badge">{{ badge }}</span>
            <span v-if="hint && !open" class="property-section__hint">{{ hint }}</span>
        </header>
        <div v-show="open" class="property-section__body">
            <slot />
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
    title: string
    /** 默认是否展开 */
    defaultOpen?: boolean
    /** 标题旁的角标(例如 "已配置 3 项") */
    badge?: string | number
    /** 收起时显示在标题右侧的简短摘要,展开时隐藏 */
    hint?: string
    /** 强制保持展开 (外部驱动) */
    forceOpen?: boolean
}>(), {
    defaultOpen: true,
})

const open = ref(props.defaultOpen)

watch(() => props.forceOpen, (val) => {
    if (val) open.value = true
})

function toggle() {
    if (props.forceOpen) return // forceOpen 时禁止用户收起
    open.value = !open.value
}
</script>

<style scoped>
.property-section {
    margin-bottom: 6px;
}

.property-section + .property-section {
    border-top: 1px solid var(--el-border-color-lighter);
    padding-top: 4px;
}

.property-section__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 4px;
    cursor: pointer;
    user-select: none;
}

.property-section__arrow {
    display: inline-block;
    width: 10px;
    color: var(--el-text-color-secondary);
    transform: rotate(0deg);
    transition: transform 0.15s ease;
    font-size: 10px;
}

.property-section__arrow.is-open {
    transform: rotate(90deg);
}

.property-section__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    flex-shrink: 0;
}

.property-section__badge {
    padding: 1px 6px;
    border-radius: 10px;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-size: 11px;
    line-height: 1.5;
}

.property-section__hint {
    margin-left: auto;
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 60%;
}

.property-section__body {
    padding: 0 2px 4px;
}

/* 让 section body 内的 el-form-item 紧凑一点,避免每项都有 22px margin */
.property-section__body :deep(.el-form-item) {
    margin-bottom: 12px;
}

.property-section__body :deep(.el-form-item__label) {
    padding-bottom: 4px;
    line-height: 1.2;
    color: var(--el-text-color-regular);
    font-size: 12px;
}
</style>
