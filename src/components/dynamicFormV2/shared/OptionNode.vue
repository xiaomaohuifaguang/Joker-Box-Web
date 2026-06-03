<script setup lang="ts">
import { ref } from 'vue'
import { ElInput, ElButton, ElIcon, ElSwitch } from 'element-plus'
import { Plus, Delete, Rank } from '@element-plus/icons-vue'
import type { FormFieldOption } from '../types'

interface Props {
  options: FormFieldOption[]
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
})

const emit = defineEmits<{
  (e: 'update:options', value: FormFieldOption[]): void
}>()

const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const expandedIndices = ref<Set<number>>(new Set())

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'
function genId(): string {
  let s = ''
  for (let i = 0; i < 6; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)]
  return s
}
function nextLabel(list: FormFieldOption[]): string {
  return `选项 ${list.length + 1}`
}

function addOption(parent?: FormFieldOption[]) {
  const target = parent ?? props.options
  target.push({ label: nextLabel(target), value: genId(), visible: true })
}

function removeOption(idx: number, parent?: FormFieldOption[]) {
  const target = parent ?? props.options
  target.splice(idx, 1)
}

function toggleVisible(opt: FormFieldOption) {
  opt.visible = opt.visible !== false ? false : true
}

function toggleChildren(idx: number) {
  if (expandedIndices.value.has(idx)) {
    expandedIndices.value.delete(idx)
  } else {
    expandedIndices.value.add(idx)
    const opt = props.options[idx]
    if (!opt.children) {
      opt.children = []
    }
  }
}

function updateChildren(idx: number, children: FormFieldOption[]) {
  props.options[idx] = { ...props.options[idx], children }
}

/* ── 拖拽排序 ── */
function onDragStart(idx: number) {
  dragIndex.value = idx
}
function onDragOver(e: DragEvent, idx: number) {
  e.preventDefault()
  dragOverIndex.value = idx
}
function onDragEnd() {
  if (dragIndex.value !== null && dragOverIndex.value !== null && dragIndex.value !== dragOverIndex.value) {
    const list = [...props.options]
    const [moved] = list.splice(dragIndex.value, 1)
    list.splice(dragOverIndex.value, 0, moved)
    emit('update:options', list)
  }
  dragIndex.value = null
  dragOverIndex.value = null
}
</script>

<template>
  <div class="on-list" :style="{ paddingLeft: level > 0 ? '20px' : '0' }">
    <div
      v-for="(opt, idx) in options"
      :key="idx"
      class="on-item"
      :class="{
        'is-dragging': dragIndex === idx,
        'is-drag-over': dragOverIndex === idx,
      }"
      draggable="true"
      @dragstart="onDragStart(idx)"
      @dragover="onDragOver($event, idx)"
      @dragend="onDragEnd"
    >
      <!-- 行内容 -->
      <div class="on-row">
        <!-- 拖拽手柄 -->
        <div class="on-handle">
          <ElIcon><Rank /></ElIcon>
        </div>

        <!-- 输入区 -->
        <div class="on-inputs">
          <ElInput
            v-model="opt.label"
            placeholder="显示名称"
            size="small"
            class="on-input"
          />
          <ElInput
            v-model="opt.value"
            placeholder="值"
            size="small"
            class="on-input"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="on-actions">
          <ElSwitch
            :model-value="opt.visible !== false"
            @update:model-value="toggleVisible(opt)"
            active-text="显"
            inactive-text="隐"
            inline-prompt
            size="small"
          />
          <ElButton
            size="small"
            text
            :type="expandedIndices.has(idx) ? 'primary' : undefined"
            @click="toggleChildren(idx)"
          >
            {{ expandedIndices.has(idx) ? '收起' : '子项' }}
          </ElButton>
          <ElButton size="small" text type="danger" @click="removeOption(idx)">
            <ElIcon><Delete /></ElIcon>
          </ElButton>
        </div>
      </div>

      <!-- 递归子选项 -->
      <div v-if="expandedIndices.has(idx)" class="on-children">
        <OptionNode
          v-if="opt.children?.length"
          :options="opt.children"
          :level="level + 1"
          @update:options="updateChildren(idx, $event)"
        />
        <ElButton size="small" text @click="addOption(opt.children)">
          <ElIcon><Plus /></ElIcon> 添加子选项
        </ElButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.on-list {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-xs);
}

.on-item {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-xs);
}

.on-row {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center;
  gap: var(--df-space-xs);
  padding: var(--df-space-sm) var(--df-space-md);
  border-radius: var(--df-radius-md);
  background: var(--df-bg-hover);
  border: 1px solid transparent;
  transition: all var(--df-transition-fast);
}

.on-row:hover {
  background: var(--df-bg-card);
  border-color: var(--df-border-light);
  box-shadow: var(--df-shadow-sm);
}

.on-item.is-dragging .on-row {
  opacity: 0.5;
}

.on-item.is-drag-over .on-row {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.on-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--df-text-placeholder);
  cursor: grab;
  user-select: none;
}

.on-handle:active {
  cursor: grabbing;
}

.on-inputs {
  display: flex;
  gap: var(--df-space-sm);
  flex: 1;
}

.on-input {
  flex: 1;
}

.on-actions {
  display: flex;
  align-items: center;
  gap: var(--df-space-xs);
}

.on-children {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-xs);
  padding: var(--df-space-xs) 0;
}
</style>
