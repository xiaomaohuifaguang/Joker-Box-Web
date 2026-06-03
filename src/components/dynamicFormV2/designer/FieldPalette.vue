<script setup lang="ts">
import { computed } from 'vue'
import type { FormFieldType } from '../types'
import { FIELD_TYPE_OPTIONS } from '../types'
import { FIELD_TYPE_COLORS } from '../constants'

interface Props {
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const emit = defineEmits<{
  (e: 'addField', type: FormFieldType): void
}>()

const fieldList = computed(() => FIELD_TYPE_OPTIONS)

function handleDragStart(event: DragEvent, type: FormFieldType) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('fieldType', type)
    event.dataTransfer.effectAllowed = 'copy'
  }
}

function handleClick(type: FormFieldType) {
  emit('addField', type)
}
</script>

<template>
  <div class="field-palette" :class="{ 'field-palette--collapsed': props.collapsed }">
    <div class="field-palette__header">
      <span class="field-palette__title">字段工具箱</span>
      <span class="field-palette__count">{{ fieldList.length }} 种</span>
    </div>

    <div class="field-palette__list">
      <div
        v-for="item in fieldList"
        :key="item.value"
        class="field-palette__item"
        draggable="true"
        @dragstart="handleDragStart($event, item.value)"
        @click="handleClick(item.value)"
      >
        <span
          class="field-palette__dot"
          :style="{ backgroundColor: FIELD_TYPE_COLORS[item.value] ?? '#94a3b8' }"
        />
        <span class="field-palette__label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-palette {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--df-bg-card);
  border-right: 1px solid var(--df-border);
  height: 100%;
  overflow: hidden;
}

.field-palette--collapsed {
  width: 48px;
}

.field-palette__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--df-space-md);
  border-bottom: 1px solid var(--df-border);
  flex-shrink: 0;
}

.field-palette__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--df-text-primary);
}

.field-palette__count {
  font-size: 12px;
  color: var(--df-text-tertiary);
}

.field-palette__list {
  flex: 1;
  overflow-y: auto;
  padding: var(--df-space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--df-space-xs);
}

.field-palette__item {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
  padding: var(--df-space-sm) var(--df-space-md);
  border-radius: var(--df-radius-md);
  cursor: pointer;
  transition: all var(--df-transition-fast);
  user-select: none;
}

.field-palette__item:hover {
  background: var(--df-bg-hover);
  transform: translateX(2px);
}

.field-palette__item:active {
  background: var(--df-primary-light);
}

.field-palette__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.field-palette__label {
  font-size: 13px;
  color: var(--df-text-secondary);
  white-space: nowrap;
}

.field-palette__item:hover .field-palette__label {
  color: var(--df-text-primary);
}
</style>
