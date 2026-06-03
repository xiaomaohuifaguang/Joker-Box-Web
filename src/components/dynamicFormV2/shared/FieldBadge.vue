<script setup lang="ts">
import { computed } from 'vue'
import type { FormFieldType } from '../types'
import { FIELD_TYPE_OPTIONS } from '../types'
import { FIELD_TYPE_COLORS } from '../constants'

interface Props {
  type: FormFieldType
  size?: 'small' | 'default'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
})

const label = computed(() => {
  const found = FIELD_TYPE_OPTIONS.find(opt => opt.value === props.type)
  return found?.label ?? props.type
})

const color = computed(() => FIELD_TYPE_COLORS[props.type] ?? '#94a3b8')
</script>

<template>
  <span class="field-badge" :class="[`field-badge--${size}`]">
    <span class="field-badge__dot" :style="{ backgroundColor: color }" />
    <span class="field-badge__label">{{ label }}</span>
  </span>
</template>

<style scoped>
.field-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: var(--df-radius-sm);
  background: var(--df-bg-hover);
  font-size: 13px;
  line-height: 20px;
  color: var(--df-text-secondary);
  transition: background var(--df-transition-fast);
}

.field-badge--small {
  padding: 0px 6px;
  font-size: 12px;
  line-height: 18px;
  gap: 4px;
}

.field-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.field-badge--small .field-badge__dot {
  width: 6px;
  height: 6px;
}

.field-badge__label {
  white-space: nowrap;
}
</style>
