<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  Plus, ArrowDown, ArrowUp, Delete, EditPen,
  CaretBottom, CaretRight, Setting, Rank,
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import type { FormField, FormFieldGroup, FormLinkageRule, FormFieldType } from '../types'
import { FIELD_TYPE_OPTIONS, flattenGroups } from '../types'
import { FIELD_TYPE_COLORS } from '../constants'
import { createDefaultField, generateGroupId } from '../utils/helpers'
import { validateTemplate } from '../utils/validation'
import type { TemplateCheckResult } from '../utils/validation'
import { confirm } from '@/utils'
import FieldConfigPanel from './FieldConfigPanel.vue'
import LinkageDesigner from './LinkageDesigner.vue'
import PreviewPanel from './PreviewPanel.vue'
import FieldBadge from '../shared/FieldBadge.vue'
import FieldRenderer from '../core/FieldRenderer.vue'

/* ── Props ── */
interface Props {
  fields: FormField[]
  groups: FormFieldGroup[]
  linkageRules: FormLinkageRule[]
  formName?: string
  formDescription?: string
}
const props = withDefaults(defineProps<Props>(), {
  formName: '',
  formDescription: '',
})
const emit = defineEmits<{
  (e: 'update:fields', fields: FormField[]): void
  (e: 'update:groups', groups: FormFieldGroup[]): void
  (e: 'update:linkageRules', rules: FormLinkageRule[]): void
}>()

/* ── 深拷贝内部状态 ── */
const localGroups = ref<FormFieldGroup[]>([])
const localLinkageRules = ref<FormLinkageRule[]>([])

function initGroups() {
  // 深拷贝 groups，避免修改 props
  let cloned: FormFieldGroup[] = JSON.parse(JSON.stringify(props.groups))

  // 如果 groups 中确实没有字段数据，但 fields prop 有数据，
  // 将 fields 按 groupId 分配回 groups，保留 groups 的元数据
  const groupsHaveFields = cloned.some(g => g.fields?.length > 0)
  if (!groupsHaveFields && props.fields.length > 0) {
    const fields = JSON.parse(JSON.stringify(props.fields)) as FormField[]
    const groupMap = new Map<string, FormFieldGroup>()

    // 先建立 groupId -> group 的映射（保留元数据）
    cloned.forEach(g => {
      groupMap.set(g.id, { ...g, fields: [] })
    })

    // 按 groupId 分配字段
    const noGroupFields: FormField[] = []
    fields.forEach(f => {
      const gid = f.groupId
      if (gid && groupMap.has(gid)) {
        groupMap.get(gid)!.fields.push(f)
      } else {
        noGroupFields.push(f)
      }
    })

    // 没有 groupId 的字段放入 _ungrouped
    if (noGroupFields.length > 0) {
      if (!groupMap.has('_ungrouped')) {
        groupMap.set('_ungrouped', {
          id: '_ungrouped',
          name: '未分组',
          fields: [],
          sort: -1,
          collapsed: '0',
        })
      }
      groupMap.get('_ungrouped')!.fields.push(...noGroupFields)
    }

    cloned = Array.from(groupMap.values())
  }

  // 始终保证存在「未分组】，排在最前面
  if (!cloned.find(g => g.id === '_ungrouped')) {
    cloned.push({
      id: '_ungrouped',
      name: '未分组',
      fields: [],
      sort: -1,
      collapsed: '0',
    })
  }
  // 按 sort 排序
  cloned.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  localGroups.value = cloned
}

watch(() => props.groups, () => initGroups(), { deep: true, immediate: true })
watch(() => props.fields, () => initGroups(), { deep: true, immediate: true })
watch(() => props.linkageRules, (val) => {
  localLinkageRules.value = JSON.parse(JSON.stringify(val))
}, { deep: true, immediate: true })

function sync() {
  const groups = JSON.parse(JSON.stringify(localGroups.value)) as FormFieldGroup[]
  const fields: FormField[] = []
  groups.forEach((g) => {
    g.fields.forEach((f) => {
      fields.push({ ...f, groupId: g.id })
    })
  })
  emit('update:groups', groups)
  emit('update:fields', fields)
}

function normalizeSorts() {
  let groupIdx = 0
  localGroups.value.forEach(g => {
    if (g.id !== '_ungrouped') {
      g.sort = groupIdx++
    }
  })
  localGroups.value.forEach(g => {
    g.fields.forEach((f, i) => {
      f.sort = i
      f.groupId = g.id
    })
  })
  sync()
}

function syncRules() {
  emit('update:linkageRules', JSON.parse(JSON.stringify(localLinkageRules.value)))
}

/* ── Tab / 选中 ── */
const activeTab = ref<'design' | 'linkage' | 'preview'>('design')
const previewKey = ref(0)
watch(activeTab, (tab) => {
  if (tab === 'preview') {
    previewKey.value++
  }
})
const selectedFieldId = ref<string | null>(null)
const freshFieldId = ref<string | null>(null)

const allFields = computed<FormField[]>(() => {
  const list: FormField[] = []
  localGroups.value.forEach(g => g.fields.forEach(f => list.push(f)))
  return list
})

const selectedField = computed<FormField | undefined>(() => {
  if (!selectedFieldId.value) return undefined
  for (const g of localGroups.value) {
    const f = g.fields.find(x => x.fieldId === selectedFieldId.value)
    if (f) return f
  }
  return undefined
})

const ungroupedGroup = computed(() =>
  localGroups.value.find(g => g.id === '_ungrouped')
)

const realGroups = computed<FormFieldGroup[]>({
  get: () => localGroups.value.filter(g => g.id !== '_ungrouped'),
  set: (val) => {
    const ungrouped = localGroups.value.find(g => g.id === '_ungrouped')
    localGroups.value = ungrouped ? [ungrouped, ...val] : val
  },
})

/* ── 分组折叠（优先读 group.collapsed） ── */
function isCollapsed(g: FormFieldGroup): boolean {
  return g.collapsed === '1'
}
function toggleCollapse(g: FormFieldGroup) {
  g.collapsed = isCollapsed(g) ? '0' : '1'
  sync()
}
function toggleDefaultCollapsed(g: FormFieldGroup) {
  g.collapsed = isCollapsed(g) ? '0' : '1'
  sync()
}

/* ── 添加字段 ── */
const addFieldVisible = ref(false)
const targetGroupId = ref<string>('_ungrouped')

function getAllIds(): string[] {
  const ids: string[] = []
  localGroups.value.forEach(g => g.fields.forEach(f => ids.push(f.fieldId)))
  return ids
}

function getDefaultSpan(_type: FormFieldType): number {
  return 8
}

function handleAddField(type: FormFieldType) {
  addFieldVisible.value = false

  // 自动创建「未分组」兜底
  if (localGroups.value.length === 0) ensureUngrouped()

  const group = localGroups.value.find(g => g.id === targetGroupId.value)
    || localGroups.value.find(g => g.id === '_ungrouped')
    || localGroups.value[0]
  if (!group) return

  const f = createDefaultField(type, getAllIds())
  f.groupId = group.id
  f.span = getDefaultSpan(type)

  group.fields.push(f)
  group.fields.forEach((x, i) => { x.sort = i })
  group.collapsed = '0'          // 展开

  selectedFieldId.value = f.fieldId
  freshFieldId.value = f.fieldId
  sync()

  nextTick(() => {
    const el = document.querySelector('.field-card--fresh')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    setTimeout(() => { freshFieldId.value = null }, 2000)
  })
}

/* ── 添加分组 ── */
function ensureUngrouped() {
  if (!localGroups.value.find(g => g.id === '_ungrouped')) {
    localGroups.value.push({
      id: '_ungrouped', name: '未分组', fields: [], sort: 9999, collapsed: '0',
    })
  }
}

function handleAddGroup() {
  ensureUngrouped()
  const maxSort = Math.max(0, ...localGroups.value.map(g => g.sort ?? 0))
  const g: FormFieldGroup = {
    id: generateGroupId(localGroups.value.map(x => x.id)),
    name: `分组 ${localGroups.value.filter(x => x.id !== '_ungrouped').length + 1}`,
    fields: [],
    sort: maxSort + 1,
    collapsed: '0',
  }
  localGroups.value.push(g)
  localGroups.value.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  sync()
}

/* ── 分组改名 / 删除 ── */
const editingGroupId = ref<string | null>(null)
const editingName = ref('')
const editingDesc = ref('')

function startEdit(g: FormFieldGroup) {
  editingGroupId.value = g.id
  editingName.value = g.name
  editingDesc.value = g.description ?? ''
}
function finishEdit(g: FormFieldGroup, evt?: FocusEvent) {
  // 如果焦点转移到了同一编辑表单内的其他输入框，不关闭编辑
  const related = evt?.relatedTarget as HTMLElement | null
  if (related?.closest('.group-block__edit-form')) {
    return
  }

  const name = editingName.value.trim()
  const desc = editingDesc.value.trim()
  if (name) {
    g.name = name
    g.description = desc || undefined
    sync()
  }
  editingGroupId.value = null
}
function deleteGroup(gid: string) {
  const idx = localGroups.value.findIndex(g => g.id === gid)
  if (idx === -1) return
  const g = localGroups.value[idx]

  // 字段移到「未分组」
  const ungrouped = localGroups.value.find(x => x.id === '_ungrouped')
  if (ungrouped && g.fields.length) {
    ungrouped.fields.push(...g.fields)
    ungrouped.fields.forEach((f, i) => { f.sort = i })
  }

  localGroups.value.splice(idx, 1)
  if (selectedFieldId.value && !selectedField.value) {
    selectedFieldId.value = null
  }
  sync()
}

/* ── 字段操作 ── */
function selectField(id: string) { selectedFieldId.value = id }

function updateField(patch: Partial<FormField>) {
  if (!selectedField.value) return
  const id = selectedField.value.fieldId
  for (const g of localGroups.value) {
    const idx = g.fields.findIndex(f => f.fieldId === id)
    if (idx !== -1) { g.fields[idx] = { ...g.fields[idx], ...patch }; break }
  }
  sync()
}

function moveField(fieldId: string, targetGid: string) {
  let srcG: FormFieldGroup | undefined, srcIdx = -1, field: FormField | undefined
  for (const g of localGroups.value) {
    const i = g.fields.findIndex(f => f.fieldId === fieldId)
    if (i !== -1) { srcG = g; srcIdx = i; field = g.fields[i]; break }
  }
  const tgtG = localGroups.value.find(g => g.id === targetGid)
  if (!srcG || !tgtG || !field || srcG.id === tgtG.id) return

  srcG.fields.splice(srcIdx, 1)
  field.groupId = tgtG.id
  tgtG.fields.push(field)
  srcG.fields.forEach((f, i) => { f.sort = i })
  tgtG.fields.forEach((f, i) => { f.sort = i })
  sync()
}

function deleteField(fieldId: string) {
  for (const g of localGroups.value) {
    const i = g.fields.findIndex(f => f.fieldId === fieldId)
    if (i !== -1) { g.fields.splice(i, 1); break }
  }
  if (selectedFieldId.value === fieldId) selectedFieldId.value = null
  sync()
}

function confirmDeleteField(fieldId: string) {
  confirm('提示', '确定删除该字段吗？', () => {
    deleteField(fieldId)
  })
}

/* ── 联动规则 ── */
function updateRules(rules: FormLinkageRule[]) {
  localLinkageRules.value = rules
  syncRules()
}

/* ── 暴露 ── */
function validate(): TemplateCheckResult {
  const allFields: FormField[] = []
  localGroups.value.forEach(g =>
    g.fields.forEach(f => allFields.push({ ...f, groupId: f.groupId ?? g.id })))
  return validateTemplate(
    props.formName, allFields, localLinkageRules.value,
    localGroups.value.filter(g => g.id !== '_ungrouped'),
    props.formDescription,
  )
}
function getConfig() {
  const allGroups = JSON.parse(JSON.stringify(localGroups.value))
  const realGroups = allGroups.filter((g: FormFieldGroup) => g.id !== '_ungrouped')
  return {
    fields: flattenGroups(allGroups),
    groups: realGroups,
    linkageRules: JSON.parse(JSON.stringify(localLinkageRules.value)),
  }
}
defineExpose({ validate, getConfig })
</script>

<template>
  <div class="form-designer">
    <!-- 主内容 -->
    <div class="form-designer__main">
      <ElTabs v-model="activeTab" class="design-tabs">
        <!-- ═══════ 字段设计 ═══════ -->
        <ElTabPane label="字段设计" name="design">
          <!-- 工具栏 -->
          <div class="design-toolbar">
            <ElDropdown v-model:visible="addFieldVisible" trigger="click">
              <ElButton type="primary">
                <ElIcon>
                  <Plus />
                </ElIcon>
                <span>添加字段</span>
                <ElIcon class="el-icon--right">
                  <ArrowDown />
                </ElIcon>
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu class="field-type-menu">
                  <ElDropdownItem v-for="opt in FIELD_TYPE_OPTIONS" :key="opt.value" @click="handleAddField(opt.value)">
                    <span class="ft-dot" :style="{ backgroundColor: FIELD_TYPE_COLORS[opt.value] }" />
                    <span>{{ opt.label }}</span>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>

            <ElSelect v-model="targetGroupId" size="small" style="width:140px">
              <ElOption v-for="g in localGroups.filter(x => x.id !== '_ungrouped')" :key="g.id" :label="g.name"
                :value="g.id" />
              <ElOption label="未分组" value="_ungrouped" />
            </ElSelect>

            <ElButton @click="handleAddGroup">
              <ElIcon>
                <Plus />
              </ElIcon>
              <span>添加分组</span>
            </ElButton>
          </div>

          <!-- 画布 -->
          <div class="design-canvas">
            <!-- _ungrouped 单独渲染 -->
            <template v-if="ungroupedGroup">
              <div class="group-block group-block--ungrouped">
                <div class="group-block__header" @click="toggleCollapse(ungroupedGroup)">
                  <div class="group-block__indicator" />
                  <ElIcon class="group-block__arrow">
                    <CaretBottom v-if="!isCollapsed(ungroupedGroup)" />
                    <CaretRight v-else />
                  </ElIcon>
                  <div class="group-block__meta">
                    <span class="group-block__name">{{ ungroupedGroup.name }}</span>
                  </div>
                  <span class="group-block__count">{{ ungroupedGroup.fields.length }} 个字段</span>
                  <div class="group-block__actions" @click.stop>
                    <ElButton :type="isCollapsed(ungroupedGroup) ? 'warning' : 'info'" link size="small"
                      @click="toggleDefaultCollapsed(ungroupedGroup)">
                      <ElIcon>
                        <ArrowDown v-if="isCollapsed(ungroupedGroup)" />
                        <ArrowUp v-else />
                      </ElIcon>
                      <span>{{ isCollapsed(ungroupedGroup) ? '已折叠' : '已展开' }}</span>
                    </ElButton>
                  </div>
                </div>
                <ElCollapseTransition>
                  <div v-show="!isCollapsed(ungroupedGroup)" class="group-block__body">
                    <ElRow v-if="ungroupedGroup.fields.length" :gutter="16">
                      <draggable v-model="ungroupedGroup.fields" tag="div" class="field-list" item-key="fieldId"
                        handle=".field-drag-handle" :group="{ name: 'fields', pull: true, put: true }"
                        @end="normalizeSorts" ghost-class="dragging-ghost">
                        <template #item="{ element: field }">
                          <el-col :span="field.span || 24" :xs="24">
                            <div class="field-card"
                              :class="{ 'field-card--active': selectedFieldId === field.fieldId, 'field-card--fresh': freshFieldId === field.fieldId }"
                              @click="selectField(field.fieldId)">
                              <div class="field-card__hd">
                                <el-icon class="field-drag-handle" @click.stop>
                                  <Rank />
                                </el-icon>
                                <FieldBadge :type="field.type" size="small" />
                                <span class="field-card__title">{{ field.title }}</span>
                                <span v-if="field.required === '1'" class="field-card__required">*</span>
                                <el-icon class="field-delete-btn" @click.stop="confirmDeleteField(field.fieldId)">
                                  <Delete />
                                </el-icon>
                              </div>
                              <div class="field-card__preview">
                                <FieldRenderer :field="field" :model-value="field.defaultValue" disabled />
                              </div>
                              <div class="field-card__meta">
                                <span>{{ field.fieldId }}</span>
                                <span>span:{{ field.span || 24 }}</span>
                              </div>
                            </div>
                          </el-col>
                        </template>
                      </draggable>
                    </ElRow>
                    <div v-else class="group-block__empty">
                      暂无字段，点击上方「添加字段」按钮
                    </div>
                  </div>
                </ElCollapseTransition>
              </div>
            </template>

            <!-- 真实分组 draggable -->
            <draggable v-model="realGroups" tag="div" class="real-groups-list" item-key="id" handle=".group-drag-handle"
              @end="normalizeSorts" ghost-class="dragging-ghost">
              <template #item="{ element: group }">
                <div class="group-block">
                  <div class="group-block__header" @click="toggleCollapse(group)">
                    <div class="group-block__indicator" />
                    <el-icon class="group-drag-handle" @click.stop>
                      <Rank />
                    </el-icon>
                    <ElIcon class="group-block__arrow">
                      <CaretBottom v-if="!isCollapsed(group)" />
                      <CaretRight v-else />
                    </ElIcon>

                    <div class="group-block__meta">
                      <template v-if="editingGroupId !== group.id">
                        <span class="group-block__name">{{ group.name }}</span>
                        <span v-if="group.description" class="group-block__desc">{{ group.description }}</span>
                      </template>
                      <div v-else class="group-block__edit-form" @click.stop>
                        <ElInput v-model="editingName" size="small" placeholder="分组名称" style="width:180px"
                          @blur="finishEdit(group, $event)" @keyup.enter="finishEdit(group)" />
                        <ElInput v-model="editingDesc" size="small" placeholder="分组描述（可选）" style="width:200px"
                          @blur="finishEdit(group, $event)" @keyup.enter="finishEdit(group)" />
                      </div>
                    </div>

                    <span class="group-block__count">{{ group.fields.length }} 个字段</span>

                    <div class="group-block__actions" @click.stop>
                      <ElButton :type="isCollapsed(group) ? 'warning' : 'info'" link size="small"
                        @click="toggleDefaultCollapsed(group)">
                        <ElIcon>
                          <ArrowDown v-if="isCollapsed(group)" />
                          <ArrowUp v-else />
                        </ElIcon>
                        <span>{{ isCollapsed(group) ? '已折叠' : '已展开' }}</span>
                      </ElButton>
                      <ElButton type="primary" link size="small" @click="startEdit(group)">
                        <ElIcon>
                          <EditPen />
                        </ElIcon>
                      </ElButton>
                      <ElButton type="danger" link size="small" @click="deleteGroup(group.id)">
                        <ElIcon>
                          <Delete />
                        </ElIcon>
                      </ElButton>
                    </div>
                  </div>

                  <ElCollapseTransition>
                    <div v-show="!isCollapsed(group)" class="group-block__body">
                      <ElRow v-if="group.fields.length" :gutter="16">
                        <draggable v-model="group.fields" tag="div" class="field-list" item-key="fieldId"
                          handle=".field-drag-handle" :group="{ name: 'fields', pull: true, put: true }"
                          @end="normalizeSorts" ghost-class="dragging-ghost">
                          <template #item="{ element: field }">
                            <el-col :span="field.span || 24" :xs="24">
                              <div class="field-card"
                                :class="{ 'field-card--active': selectedFieldId === field.fieldId, 'field-card--fresh': freshFieldId === field.fieldId }"
                                @click="selectField(field.fieldId)">
                                <div class="field-card__hd">
                                  <el-icon class="field-drag-handle" @click.stop>
                                    <Rank />
                                  </el-icon>
                                  <FieldBadge :type="field.type" size="small" />
                                  <span class="field-card__title">{{ field.title }}</span>
                                  <span v-if="field.required === '1'" class="field-card__required">*</span>
                                  <el-icon class="field-delete-btn" @click.stop="confirmDeleteField(field.fieldId)">
                                    <Delete />
                                  </el-icon>
                                </div>
                                <div class="field-card__preview">
                                  <FieldRenderer :field="field" :model-value="field.defaultValue" disabled />
                                </div>
                                <div class="field-card__meta">
                                  <span>{{ field.fieldId }}</span>
                                  <span>span:{{ field.span || 24 }}</span>
                                </div>
                              </div>
                            </el-col>
                          </template>
                        </draggable>
                      </ElRow>
                      <div v-else class="group-block__empty">
                        暂无字段，点击上方「添加字段」按钮
                      </div>
                    </div>
                  </ElCollapseTransition>
                </div>
              </template>
            </draggable>

            <!-- 空状态：无真实分组时 -->
            <div v-if="realGroups.length === 0" class="canvas-empty">
              <ElIcon :size="48">
                <Setting />
              </ElIcon>
              <p>暂无分组，点击「添加分组」开始设计表单</p>
              <ElButton type="primary" @click="handleAddGroup">添加分组</ElButton>
            </div>
          </div>
        </ElTabPane>

        <!-- ═══════ 联动规则 ═══════ -->
        <ElTabPane label="联动规则" name="linkage">
          <LinkageDesigner :rules="localLinkageRules" :fields="allFields" @update:rules="updateRules" />
        </ElTabPane>

        <!-- ═══════ 预览 ═══════ -->
        <ElTabPane label="表单预览" name="preview">
          <PreviewPanel :key="previewKey" :fields="allFields" :groups="localGroups"
            :linkage-rules="localLinkageRules" />
        </ElTabPane>
      </ElTabs>
    </div>

    <!-- 右侧配置（仅在字段设计 Tab 显示） -->
    <div v-if="activeTab === 'design'" class="form-designer__config">
      <FieldConfigPanel :field="selectedField" :groups="localGroups" @update:field="updateField" @move-field="moveField"
        @delete-field="deleteField" />
    </div>
  </div>
</template>

<style scoped>
/* ── 根 ── */
.form-designer {
  display: flex;
  width: 100%;
  height: 100%;
  background: var(--df-bg-page);
  overflow: hidden;
}

/* ── 主内容区 ── */
.form-designer__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* ── Tabs：用 Grid 固定 header 在顶部 ── */
.design-tabs {
  flex: 1;
  overflow: hidden;
}

.design-tabs :deep(.el-tabs) {
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
}

.design-tabs :deep(.el-tabs__header) {
  margin: 0;
  background: var(--df-bg-card);
  border-bottom: 1px solid var(--df-border);
  padding: 0 var(--df-space-md);
}

.design-tabs :deep(.el-tabs__content) {
  overflow: hidden;
}

.design-tabs :deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── 工具栏 ── */
.design-toolbar {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
  padding: var(--df-space-sm) var(--df-space-md);
  background: var(--df-bg-card);
  border-bottom: 1px solid var(--df-border-light);
  flex-shrink: 0;
}

/* ── 画布 ── */
.design-canvas {
  flex: 1;
  overflow-y: auto;
  padding: var(--df-space-lg);
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* ── 分组块：统一 Card 外观 ── */
.group-block {
  background: var(--df-bg-card);
  border: 1px solid var(--df-border);
  border-radius: var(--df-radius-lg);
  overflow: hidden;
  box-shadow: var(--df-shadow-card);
  transition: box-shadow 0.2s, transform 0.2s;
}

.group-block:hover {
  box-shadow: var(--df-shadow-card-hover);
  transform: translateY(-1px);
}

/* 未分组：视觉降级 */
.group-block--ungrouped {
  border-style: dashed;
  border-color: #cbd5e1;
  box-shadow: none;
}

.group-block--ungrouped:hover {
  box-shadow: none;
  transform: none;
  border-color: #94a3b8;
}

/* 分组头部 */
.group-block__header {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
  padding: 14px 20px;
  background: #f8fafc;
  border-bottom: 1px solid var(--df-border-light);
  cursor: pointer;
  user-select: none;
  position: relative;
}

/* 普通分组头部 */
.group-block:not(.group-block--ungrouped) .group-block__header {
  background: #f1f5f9;
}

/* 未分组头部更浅 */
.group-block--ungrouped .group-block__header {
  background: #f8fafc;
}

/* 左侧彩色指示条 */
.group-block__indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  border-radius: 3px;
  background: var(--df-primary);
}

.group-block--ungrouped .group-block__indicator {
  background: #94a3b8;
}

.group-block__arrow {
  font-size: 14px;
  color: var(--df-text-secondary);
}

.group-block__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.group-block__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--df-text-primary);
  line-height: 22px;
}

.group-block__desc {
  font-size: 12px;
  color: var(--df-text-tertiary);
  line-height: 18px;
}

.group-block__count {
  margin-left: auto;
  font-size: 12px;
  color: var(--df-text-tertiary);
  background: var(--df-bg-card);
  padding: 2px 10px;
  border-radius: 10px;
  border: 1px solid var(--df-border-light);
  flex-shrink: 0;
}

.group-block__edit-form {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
}

.group-block__actions {
  display: flex;
  gap: var(--df-space-xs);
  margin-left: var(--df-space-sm);
  flex-shrink: 0;
}

/* 分组内容 */
.group-block__body {
  padding: var(--df-space-md);
}

.group-block__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--df-space-xl);
  color: var(--df-text-tertiary);
  font-size: 13px;
}

/* ── 字段卡片 ── */
.field-card {
  background: var(--df-bg-card);
  border: 1px solid var(--df-border-light);
  border-radius: var(--df-radius-md);
  padding: 16px;
  cursor: pointer;
  transition: all var(--df-transition-fast);
}

.field-card:hover {
  border-color: var(--df-primary);
  box-shadow: var(--df-shadow-card-hover);
  transform: translateY(-2px);
}

.field-card--active {
  border: 2px solid var(--df-primary);
  box-shadow: 0 0 0 4px var(--df-primary-light);
}

.field-card--fresh {
  animation: field-fresh-glow 1.8s ease-out forwards;
}

@keyframes field-fresh-glow {
  0% {
    box-shadow: 0 0 0 4px var(--df-primary-light);
    transform: translateY(0);
  }

  20% {
    box-shadow: 0 0 0 10px var(--df-primary-light);
    transform: translateY(-3px);
  }

  100% {
    box-shadow: 0 0 0 4px var(--df-primary-light);
    transform: translateY(0);
  }
}

.field-card__hd {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: var(--df-space-xs);
}

.field-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--df-text-primary);
}

.field-card__required {
  color: var(--df-danger);
  font-weight: 700;
}

.field-delete-btn {
  margin-left: auto;
  font-size: 14px;
  color: var(--df-text-tertiary);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  opacity: 0;
  transition: all var(--df-transition-fast);
}

.field-card:hover .field-delete-btn {
  opacity: 1;
}

.field-delete-btn:hover {
  color: var(--df-danger);
  background: rgba(239, 68, 68, 0.1);
}

.field-card__preview {
  pointer-events: none;
  margin-bottom: var(--df-space-xs);
}

/* 覆盖 disabled 状态的灰色背景，让设计器预览更接近实际效果 */
.field-card__preview :deep(.is-disabled .el-input__wrapper),
.field-card__preview :deep(.is-disabled .el-textarea__inner) {
  background: var(--df-bg-card);
}

.field-card__meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--df-text-tertiary);
}

/* ── 空状态 ── */
.canvas-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--df-space-xl);
  gap: var(--df-space-md);
  color: var(--df-text-tertiary);
}

/* ── 右侧配置 ── */
.form-designer__config {
  width: 360px;
  flex-shrink: 0;
  background: var(--df-bg-card);
  border-left: 1px solid var(--df-border);
  overflow-y: auto;
  overflow-x: hidden;
}

/* ── 字段类型下拉 ── */
.field-type-menu {
  max-height: 400px;
  overflow-y: auto;
}

.ft-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}

/* ── 字段列表 draggable 布局修复 ── */
.field-list {
  display: contents;
}

/* ── 真实分组列表 ── */
.real-groups-list {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* ── 拖拽把手 ── */
.field-drag-handle,
.group-drag-handle {
  cursor: grab;
  color: var(--df-text-tertiary);
  padding: 4px;
  border-radius: 4px;
  transition: all var(--df-transition-fast);
  flex-shrink: 0;
}

.field-drag-handle:hover,
.group-drag-handle:hover {
  color: var(--df-primary);
  background: var(--df-bg-hover);
}

.field-drag-handle:active,
.group-drag-handle:active {
  cursor: grabbing;
}

/* ── 拖拽幽灵元素（放置占位符）── */
.dragging-ghost {
  opacity: 0.5;
  background: var(--df-primary-light) !important;
  border: 2px dashed var(--df-primary) !important;
}

/* ── 分组把手位置微调 ── */
.group-block__header {
  gap: 10px;
}
</style>