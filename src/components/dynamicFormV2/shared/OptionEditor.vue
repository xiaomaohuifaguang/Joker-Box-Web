<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElDialog, ElButton, ElIcon, ElMessage } from 'element-plus'
import { Plus, DocumentChecked, TopRight } from '@element-plus/icons-vue'
import type { FormFieldOption } from '../types'
import OptionNode from './OptionNode.vue'

interface Props {
  modelValue: FormFieldOption[]
  fieldType?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: FormFieldOption[]): void
}>()

const visible = ref(false)
const editingList = ref<FormFieldOption[]>([])
const importText = ref('')
const importMode = ref(false)

const summary = computed(() => {
  const count = countOptions(props.modelValue)
  if (count === 0) return '暂无选项'
  const preview = props.modelValue
    .slice(0, 3)
    .map(o => o.label || o.value)
    .filter(Boolean)
    .join('、')
  return `已配置 ${count} 个选项${preview ? ` · ${preview}${count > 3 ? '…' : ''}` : ''}`
})

function countOptions(list: FormFieldOption[]): number {
  let n = 0
  for (const o of list) {
    n++
    if (o.children?.length) n += countOptions(o.children)
  }
  return n
}

function open() {
  editingList.value = JSON.parse(JSON.stringify(props.modelValue))
  importMode.value = false
  importText.value = ''
  visible.value = true
}

function save() {
  const cleaned = cleanOptions(editingList.value)
  emit('update:modelValue', cleaned)
  visible.value = false
}

function cleanOptions(list: FormFieldOption[]): FormFieldOption[] {
  return list
    .filter(o => String(o.label).trim() || String(o.value).trim())
    .map(o => ({
      ...o,
      children: o.children?.length ? cleanOptions(o.children) : undefined,
    }))
}

function updateOptions(list: FormFieldOption[]) {
  editingList.value = list
}

/* ── 添加顶级选项 ── */
function addTopOption() {
  editingList.value.push({ label: `选项 ${editingList.value.length + 1}`, value: genId(), visible: true })
}

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'
function genId(): string {
  let s = ''
  for (let i = 0; i < 6; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)]
  return s
}

/* ── 批量导入 ── */
function openImport() {
  importText.value = JSON.stringify(props.modelValue, null, 2)
  importMode.value = true
}

function applyImport() {
  try {
    const parsed = JSON.parse(importText.value)
    if (!Array.isArray(parsed)) {
      ElMessage.error('JSON 格式错误：必须是数组')
      return
    }
    editingList.value = parsed
    importMode.value = false
    ElMessage.success('导入成功')
  } catch {
    ElMessage.error('JSON 解析失败')
  }
}
</script>

<template>
  <div class="option-editor-trigger">
    <div class="option-editor-trigger__summary">{{ summary }}</div>
    <ElButton size="small" @click="open">
      <ElIcon><DocumentChecked /></ElIcon>
      <span>配置选项</span>
    </ElButton>
  </div>

  <ElDialog v-model="visible" title="配置选项" width="700px" destroy-on-close>
    <!-- 工具栏 -->
    <div class="oe-toolbar">
      <ElButton size="small" @click="addTopOption">
        <ElIcon><Plus /></ElIcon> 添加选项
      </ElButton>
      <ElButton size="small" text @click="openImport">
        <ElIcon><TopRight /></ElIcon> 批量导入/导出
      </ElButton>
    </div>

    <!-- 批量导入面板 -->
    <div v-if="importMode" class="oe-import">
      <ElInput
        v-model="importText"
        type="textarea"
        :rows="10"
        placeholder='[&#10;  { &quot;label&quot;: &quot;选项A&quot;, &quot;value&quot;: &quot;a&quot; },&#10;  { &quot;label&quot;: &quot;选项B&quot;, &quot;value&quot;: &quot;b&quot;, &quot;children&quot;: [...] }&#10;]'
      />
      <div class="oe-import__actions">
        <ElButton size="small" @click="importMode = false">取消</ElButton>
        <ElButton size="small" type="primary" @click="applyImport">应用</ElButton>
      </div>
    </div>

    <!-- 选项列表（递归组件） -->
    <div v-else class="oe-list">
      <OptionNode :options="editingList" @update:options="updateOptions" />
      <div v-if="editingList.length === 0" class="oe-empty">
        暂无选项，点击上方「添加选项」开始配置
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <ElButton size="small" @click="visible = false">取消</ElButton>
      <ElButton size="small" type="primary" @click="save">保存</ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.option-editor-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--df-space-sm);
  padding: var(--df-space-sm) var(--df-space-md);
  border-radius: var(--df-radius-md);
  background: var(--df-bg-hover);
  border: 1px solid var(--df-border-light);
}

.option-editor-trigger__summary {
  font-size: 13px;
  color: var(--df-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.oe-toolbar {
  display: flex;
  gap: var(--df-space-sm);
  margin-bottom: var(--df-space-md);
  padding-bottom: var(--df-space-sm);
  border-bottom: 1px solid var(--df-border-light);
}

.oe-import {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-sm);
}

.oe-import__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--df-space-sm);
}

.oe-list {
  display: flex;
  flex-direction: column;
  gap: var(--df-space-xs);
  max-height: 460px;
  overflow-y: auto;
}

.oe-empty {
  text-align: center;
  padding: var(--df-space-3xl);
  color: var(--df-text-placeholder);
  font-size: 14px;
}
</style>
