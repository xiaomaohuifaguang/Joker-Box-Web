<script setup lang="ts">
import { computed } from 'vue'
import { ElCollapseTransition } from 'element-plus'
import type { FormFieldGroup } from '../types'

interface Props {
  group: FormFieldGroup
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const isExpanded = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function toggle() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="form-group">
    <div class="form-group__header" @click="toggle">
      <div class="form-group__indicator" />
      <div class="form-group__meta">
        <div class="form-group__title-row">
          <span class="form-group__title">{{ group.name }}</span>
          <span v-if="group.fields?.length" class="form-group__count">
            {{ group.fields.length }} 个字段
          </span>
        </div>
        <p v-if="group.description" class="form-group__desc">
          {{ group.description }}
        </p>
      </div>
      <div class="form-group__arrow" :class="{ 'is-expanded': isExpanded }">
        <el-icon><arrow-down /></el-icon>
      </div>
    </div>

    <el-collapse-transition>
      <div v-show="isExpanded" class="form-group__body">
        <slot />
      </div>
    </el-collapse-transition>
  </div>
</template>

<style scoped>
.form-group {
  background: var(--df-bg-card);
  border: 1px solid var(--df-border);
  border-radius: var(--df-radius-lg);
  overflow: hidden;
  box-shadow: var(--df-shadow-card);
  transition: box-shadow var(--df-transition-normal), transform var(--df-transition-normal);
}

.form-group:hover {
  box-shadow: var(--df-shadow-card-hover);
  transform: translateY(-1px);
}

.form-group__header {
  display: flex;
  align-items: flex-start;
  gap: var(--df-space-sm);
  padding: var(--df-space-md) var(--df-space-lg);
  cursor: pointer;
  user-select: none;
  position: relative;
  background: #f1f5f9;
}

.form-group__indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  border-radius: 3px;
  background: var(--df-primary);
}

.form-group__meta {
  flex: 1;
  min-width: 0;
}

.form-group__title-row {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
}

.form-group__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--df-text-primary);
  line-height: 22px;
}

.form-group__count {
  font-size: 12px;
  color: var(--df-text-tertiary);
  line-height: 18px;
  padding: 1px 6px;
  background: var(--df-bg-hover);
  border-radius: var(--df-radius-sm);
}

.form-group__desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--df-text-secondary);
  line-height: 20px;
}

.form-group__arrow {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--df-radius-sm);
  color: var(--df-text-tertiary);
  transition: transform var(--df-transition-fast), background var(--df-transition-fast);
}

.form-group__arrow.is-expanded {
  transform: rotate(180deg);
}

.form-group__header:hover .form-group__arrow {
  background: var(--df-bg-hover);
  color: var(--df-text-secondary);
}

.form-group__body {
  padding: 0 var(--df-space-lg) var(--df-space-lg);
}
</style>
