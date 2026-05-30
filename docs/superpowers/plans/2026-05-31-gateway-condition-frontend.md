# 网关流向条件配置前端实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为流程设计器的排他/包容网关出线添加 NATIVE/CUSTOM/默认走向三种条件配置模式，包含属性面板扩展、弹窗规则树编辑器和数据持久化。

**Architecture:** 条件数据存储于 LogicFlow edge 的 `properties.gatewayCondition` 中，保存时由父组件从 `graphRawData` 遍历提取构建 `gatewayConditions` 数组。查询返回时回写到对应 edge。UI 采用"属性面板摘要 + 弹窗编辑器"的分层设计。

**Tech Stack:** Vue 3 (Composition API `<script setup>`) + Element Plus + TypeScript + LogicFlow

> **Note:** 本项目无单元测试框架，验证方式采用 `vue-tsc --noEmit` 编译检查 + 浏览器手动验证。

---

## 文件结构

```
src/components/process-designer/
├── types/
│   └── gateway-condition.ts              # 新增：类型定义
├── components/
│   ├── ConditionSummary.vue              # 新增：规则树文本摘要
│   ├── condition-editors/
│   │   ├── NativeConditionEditor.vue     # 新增：JUEL 表达式输入
│   │   └── CustomConditionEditor.vue     # 新增：卡片式规则树
│   ├── GatewayConditionDialog.vue        # 新增：条件配置弹窗
│   └── PropertyPanels/
│       ├── EdgePropertyPanel.vue         # 修改：增加条件配置区块
│       └── GatewayProperty.vue           # 修改：同步 gatewayCondition
├── core/
│   └── validators.ts                     # 修改：增加网关条件校验
└── utils/
    └── gateway-condition.ts              # 新增：构建/回写工具函数

src/views/console/processManager/
├── ProcessDefinitionAddView.vue          # 修改：保存时构建 gatewayConditions
└── ProcessDefinitionInfoView.vue         # 修改：查询时回写 gatewayConditions
```

---

### Task 1: TypeScript 类型定义

**Files:**
- Create: `src/components/process-designer/types/gateway-condition.ts`

- [ ] **Step 1: 创建类型文件**

```typescript
// src/components/process-designer/types/gateway-condition.ts

export type ConditionType = 'NATIVE' | 'CUSTOM' | null

export type NodeType = 'AND' | 'OR' | 'CONDITION'

export type Category =
  | 'FORM_FIELD'
  | 'HANDLER_DEPT'
  | 'HANDLER_ROLE'
  | 'PREV_HANDLER_DEPT'
  | 'PREV_HANDLER_ROLE'

export type Operator =
  | 'EQ' | 'NE' | 'GT' | 'LT' | 'GE' | 'LE'
  | 'IN' | 'NOT_IN' | 'EMPTY' | 'NOT_EMPTY' | 'REGEX'

export interface RuleTreeNode {
  nodeType: NodeType
  sort: number
  category?: Category
  fieldKey?: string
  operator?: Operator
  value?: string
  children?: RuleTreeNode[]
}

export interface GatewayConditionData {
  conditionType: ConditionType
  isDefault: boolean
  nativeExpression?: string
  ruleTree?: RuleTreeNode
}

export interface GatewayConditionSaveItem {
  sequenceFlowId: string
  sourceNodeId: string
  targetNodeId: string
  conditionType: ConditionType
  isDefault: boolean
  nativeExpression?: string
  ruleTree?: RuleTreeNode
}

export const CATEGORY_OPTIONS: { label: string; value: Category; fieldKey: string }[] = [
  { label: '表单字段', value: 'FORM_FIELD', fieldKey: '' },
  { label: '当前部门', value: 'HANDLER_DEPT', fieldKey: 'deptId' },
  { label: '当前角色', value: 'HANDLER_ROLE', fieldKey: 'roleId' },
  { label: '上一级部门', value: 'PREV_HANDLER_DEPT', fieldKey: 'deptId' },
  { label: '上一级角色', value: 'PREV_HANDLER_ROLE', fieldKey: 'roleId' },
]

export const OPERATOR_OPTIONS: { label: string; value: Operator }[] = [
  { label: '等于', value: 'EQ' },
  { label: '不等于', value: 'NE' },
  { label: '大于', value: 'GT' },
  { label: '小于', value: 'LT' },
  { label: '大于等于', value: 'GE' },
  { label: '小于等于', value: 'LE' },
  { label: '在列表中', value: 'IN' },
  { label: '不在列表中', value: 'NOT_IN' },
  { label: '为空', value: 'EMPTY' },
  { label: '不为空', value: 'NOT_EMPTY' },
  { label: '正则匹配', value: 'REGEX' },
]

export const VALUELESS_OPERATORS: Operator[] = ['EMPTY', 'NOT_EMPTY']
```

- [ ] **Step 2: 编译检查**

Run: `npx vue-tsc --noEmit`
Expected: 无错误（类型文件不引用其他文件，应直接通过）

- [ ] **Step 3: Commit**

```bash
git add src/components/process-designer/types/gateway-condition.ts
git commit -m "types: add gateway condition type definitions

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: ConditionSummary 组件

**Files:**
- Create: `src/components/process-designer/components/ConditionSummary.vue`

- [ ] **Step 1: 创建组件**

```vue
<!-- src/components/process-designer/components/ConditionSummary.vue -->
<template>
  <span class="condition-summary">{{ summaryText }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RuleTreeNode } from '../types/gateway-condition'

const props = defineProps<{
  ruleTree?: RuleTreeNode
}>()

const summaryText = computed(() => {
  if (!props.ruleTree) return '未配置条件'
  return buildNodeText(props.ruleTree)
})

function buildNodeText(node: RuleTreeNode): string {
  if (node.nodeType === 'CONDITION') {
    const opLabel = operatorLabel(node.operator)
    return `${categoryLabel(node.category)} ${node.fieldKey} ${opLabel} ${node.value ?? ''}`
  }

  if (!node.children || node.children.length === 0) {
    return node.nodeType === 'AND' ? '[AND]' : '[OR]'
  }

  const joiner = node.nodeType === 'AND' ? ' AND ' : ' OR '
  const childrenText = node.children
    .sort((a, b) => a.sort - b.sort)
    .map(buildNodeText)
    .join(joiner)

  if (node.children.length === 1) return childrenText
  return `(${childrenText})`
}

function categoryLabel(category?: string): string {
  const map: Record<string, string> = {
    FORM_FIELD: '表单字段',
    HANDLER_DEPT: '当前部门',
    HANDLER_ROLE: '当前角色',
    PREV_HANDLER_DEPT: '上一级部门',
    PREV_HANDLER_ROLE: '上一级角色',
  }
  return map[category ?? ''] || category || ''
}

function operatorLabel(op?: string): string {
  const map: Record<string, string> = {
    EQ: '==', NE: '!=', GT: '>', LT: '<', GE: '>=', LE: '<=',
    IN: 'IN', NOT_IN: 'NOT IN', EMPTY: '为空', NOT_EMPTY: '不为空', REGEX: '匹配',
  }
  return map[op ?? ''] || op || ''
}
</script>

<style scoped>
.condition-summary {
  color: var(--el-text-color-regular);
  font-size: 13px;
  word-break: break-all;
}
</style>
```

- [ ] **Step 2: 编译检查**

Run: `npx vue-tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/components/process-designer/components/ConditionSummary.vue
git commit -m "feat: add ConditionSummary component for rule tree preview

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: NativeConditionEditor 组件

**Files:**
- Create: `src/components/process-designer/components/condition-editors/NativeConditionEditor.vue`

- [ ] **Step 1: 创建目录和组件**

```bash
mkdir -p src/components/process-designer/components/condition-editors
```

```vue
<!-- src/components/process-designer/components/condition-editors/NativeConditionEditor.vue -->
<template>
  <div class="native-condition-editor">
    <el-form label-position="top">
      <el-form-item label="JUEL 表达式">
        <el-input
          v-model="expression"
          placeholder="${amount > 10000}"
          :disabled="readonly"
          style="font-family: monospace"
        />
      </el-form-item>
    </el-form>

    <div class="variable-hints">
      <div class="hint-label">可用变量（点击插入）：</div>
      <div class="hint-tags">
        <el-tag
          v-for="v in availableVariables"
          :key="v"
          size="small"
          class="hint-tag"
          @click="insertVariable(v)"
        >
          {{ v }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: string
  formFieldIds?: string[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const expression = computed({
  get: () => props.modelValue ?? '',
  set: (v) => emit('update:modelValue', v),
})

const builtinVariables = [
  'formData',
  '__handler_dept',
  '__handler_role',
  '__prev_handler_dept',
  '__prev_handler_role',
]

const availableVariables = computed(() => {
  return [...(props.formFieldIds ?? []), ...builtinVariables]
})

function insertVariable(variable: string) {
  const prefix = variable.startsWith('__') || variable === 'formData' ? '' : '${'
  const suffix = prefix ? '}' : ''
  expression.value = expression.value + prefix + variable + suffix
}
</script>

<style scoped>
.native-condition-editor {
  padding: 8px 0;
}

.variable-hints {
  margin-top: 12px;
}

.hint-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.hint-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hint-tag {
  cursor: pointer;
  font-family: monospace;
}

.hint-tag:hover {
  opacity: 0.8;
}
</style>
```

- [ ] **Step 2: 编译检查**

Run: `npx vue-tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/components/process-designer/components/condition-editors/NativeConditionEditor.vue
git commit -m "feat: add NativeConditionEditor for JUEL expression input

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: CustomConditionEditor 组件

**Files:**
- Create: `src/components/process-designer/components/condition-editors/CustomConditionEditor.vue`

- [ ] **Step 1: 创建组件**

```vue
<!-- src/components/process-designer/components/condition-editors/CustomConditionEditor.vue -->
<template>
  <div class="custom-condition-editor">
    <RuleGroup
      :node="localTree"
      :depth="0"
      :is-root="true"
      :form-fields="formFields"
      :readonly="readonly"
      @update="onRootUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RuleTreeNode } from '../../types/gateway-condition'
import RuleGroup from './RuleGroup.vue'

const props = defineProps<{
  modelValue?: RuleTreeNode
  formFields?: { fieldId: string; title: string }[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: RuleTreeNode): void
}>()

const defaultTree = (): RuleTreeNode => ({
  nodeType: 'AND',
  sort: 0,
  children: [],
})

const localTree = computed({
  get: () => props.modelValue ?? defaultTree(),
  set: (v) => emit('update:modelValue', v),
})

function onRootUpdate(updated: RuleTreeNode) {
  emit('update:modelValue', updated)
}
</script>
```

- [ ] **Step 2: 创建 RuleGroup 子组件**

```vue
<!-- src/components/process-designer/components/condition-editors/RuleGroup.vue -->
<template>
  <div
    class="rule-group"
    :class="[node.nodeType === 'AND' ? 'and-group' : 'or-group']"
  >
    <div class="group-header">
      <span class="group-badge">{{ node.nodeType }}</span>
      <span class="group-desc">{{ node.nodeType === 'AND' ? '以下全部满足' : '以下任一满足' }}</span>
      <el-button
        v-if="!isRoot"
        link
        type="danger"
        size="small"
        :disabled="readonly"
        @click="$emit('delete')"
      >
        删除
      </el-button>
    </div>

    <div class="group-body">
      <template v-for="(child, index) in sortedChildren" :key="index">
        <ConditionRow
          v-if="child.nodeType === 'CONDITION'"
          :node="child"
          :form-fields="formFields"
          :readonly="readonly"
          @update="(v) => updateChild(index, v)"
          @delete="removeChild(index)"
        />
        <RuleGroup
          v-else
          :node="child"
          :depth="depth + 1"
          :is-root="false"
          :form-fields="formFields"
          :readonly="readonly"
          @update="(v) => updateChild(index, v)"
          @delete="removeChild(index)"
        />
      </template>
    </div>

    <div v-if="!readonly" class="group-actions">
      <el-button size="small" @click="addCondition">+ 添加条件</el-button>
      <el-button size="small" @click="addGroup('AND')">+ 添加 AND 组</el-button>
      <el-button size="small" @click="addGroup('OR')">+ 添加 OR 组</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RuleTreeNode, NodeType } from '../../types/gateway-condition'
import ConditionRow from './ConditionRow.vue'

const props = defineProps<{
  node: RuleTreeNode
  depth: number
  isRoot: boolean
  formFields?: { fieldId: string; title: string }[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', value: RuleTreeNode): void
  (e: 'delete'): void
}>()

const sortedChildren = computed(() => {
  return [...(props.node.children ?? [])].sort((a, b) => a.sort - b.sort)
})

function updateChild(index: number, updated: RuleTreeNode) {
  const children = [...(props.node.children ?? [])]
  children[index] = updated
  emit('update', { ...props.node, children })
}

function removeChild(index: number) {
  const children = [...(props.node.children ?? [])]
  children.splice(index, 1)
  emit('update', { ...props.node, children })
}

function addCondition() {
  const children = [...(props.node.children ?? [])]
  children.push({
    nodeType: 'CONDITION',
    sort: children.length,
    category: 'FORM_FIELD',
    fieldKey: '',
    operator: 'EQ',
    value: '',
  })
  emit('update', { ...props.node, children })
}

function addGroup(type: NodeType) {
  const children = [...(props.node.children ?? [])]
  children.push({
    nodeType: type,
    sort: children.length,
    children: [],
  })
  emit('update', { ...props.node, children })
}
</script>

<style scoped>
.rule-group {
  border: 2px solid;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}

.and-group {
  border-color: #f0a030;
  background: rgba(240, 160, 48, 0.06);
}

.or-group {
  border-color: #4a9eff;
  background: rgba(74, 158, 255, 0.06);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.group-badge {
  padding: 3px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.and-group .group-badge {
  background: #f0a030;
  color: #000;
}

.or-group .group-badge {
  background: #4a9eff;
  color: #fff;
}

.group-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.group-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}
</style>
```

- [ ] **Step 3: 创建 ConditionRow 子组件**

```vue
<!-- src/components/process-designer/components/condition-editors/ConditionRow.vue -->
<template>
  <div class="condition-row">
    <el-select
      v-model="localNode.category"
      size="small"
      style="width: 100px"
      :disabled="readonly"
      @change="onCategoryChange"
    >
      <el-option
        v-for="opt in CATEGORY_OPTIONS"
        :key="opt.value"
        :label="opt.label"
        :value="opt.value"
      />
    </el-select>

    <!-- FORM_FIELD 时显示下拉，其他显示固定文本 -->
    <el-select
      v-if="localNode.category === 'FORM_FIELD'"
      v-model="localNode.fieldKey"
      size="small"
      style="width: 100px"
      :disabled="readonly"
      placeholder="选择字段"
    >
      <el-option
        v-for="f in formFields"
        :key="f.fieldId"
        :label="f.title"
        :value="f.fieldId"
      />
    </el-select>
    <span v-else class="fixed-field">{{ fixedFieldKey }}</span>

    <el-select
      v-model="localNode.operator"
      size="small"
      style="width: 80px"
      :disabled="readonly"
    >
      <el-option
        v-for="opt in OPERATOR_OPTIONS"
        :key="opt.value"
        :label="opt.label"
        :value="opt.value"
      />
    </el-select>

    <el-input
      v-if="!isValuelessOperator"
      v-model="localNode.value"
      size="small"
      style="width: 120px"
      :disabled="readonly"
      :placeholder="valuePlaceholder"
    />
    <span v-else class="value-placeholder">—</span>

    <el-button
      v-if="!readonly"
      link
      type="danger"
      size="small"
      @click="$emit('delete')"
    >
      删除
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CATEGORY_OPTIONS,
  OPERATOR_OPTIONS,
  VALUELESS_OPERATORS,
  type RuleTreeNode,
} from '../../types/gateway-condition'

const props = defineProps<{
  node: RuleTreeNode
  formFields?: { fieldId: string; title: string }[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', value: RuleTreeNode): void
  (e: 'delete'): void
}>()

const localNode = computed({
  get: () => props.node,
  set: (v) => emit('update', v),
})

const fixedFieldKey = computed(() => {
  const opt = CATEGORY_OPTIONS.find((o) => o.value === props.node.category)
  return opt?.fieldKey ?? ''
})

const isValuelessOperator = computed(() => {
  return VALUELESS_OPERATORS.includes(props.node.operator as any)
})

const valuePlaceholder = computed(() => {
  if (props.node.operator === 'IN' || props.node.operator === 'NOT_IN') {
    return '["1","2"]'
  }
  return ''
})

function onCategoryChange() {
  const opt = CATEGORY_OPTIONS.find((o) => o.value === props.node.category)
  emit('update', {
    ...props.node,
    fieldKey: opt?.fieldKey ?? '',
  })
}
</script>

<style scoped>
.condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg-elevated, #1e1e2e);
  border-radius: 6px;
}

.fixed-field {
  width: 100px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.value-placeholder {
  width: 120px;
  text-align: center;
  color: var(--el-text-color-secondary);
}
</style>
```

- [ ] **Step 4: 编译检查**

Run: `npx vue-tsc --noEmit`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add src/components/process-designer/components/condition-editors/
git commit -m "feat: add CustomConditionEditor with recursive RuleGroup and ConditionRow

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: GatewayConditionDialog 弹窗组件

**Files:**
- Create: `src/components/process-designer/components/GatewayConditionDialog.vue`

- [ ] **Step 1: 创建组件**

```vue
<!-- src/components/process-designer/components/GatewayConditionDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="720px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div v-loading="loading" class="dialog-body">
      <!-- 模式切换 -->
      <div class="mode-switch">
        <div
          v-for="mode in modes"
          :key="mode.value"
          class="mode-item"
          :class="{ active: currentMode === mode.value }"
          @click="switchMode(mode.value)"
        >
          {{ mode.label }}
        </div>
      </div>

      <!-- NATIVE -->
      <div v-if="currentMode === 'NATIVE'" class="mode-panel">
        <NativeConditionEditor
          v-model="form.nativeExpression"
          :form-field-ids="formFieldIds"
          :readonly="readonly"
        />
      </div>

      <!-- CUSTOM -->
      <div v-else-if="currentMode === 'CUSTOM'" class="mode-panel">
        <CustomConditionEditor
          v-model="form.ruleTree"
          :form-fields="formFields"
          :readonly="readonly"
        />
      </div>

      <!-- DEFAULT -->
      <div v-else-if="currentMode === 'DEFAULT'" class="mode-panel default-panel">
        <el-icon :size="48" color="#67c23a"><CircleCheck /></el-icon>
        <div class="default-title">此连线已设为默认走向</div>
        <div class="default-desc">当所有其他条件都不满足时，流程将自动走此分支</div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :disabled="readonly" @click="onConfirm">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'
import type { GatewayConditionData, RuleTreeNode } from '../types/gateway-condition'
import NativeConditionEditor from './condition-editors/NativeConditionEditor.vue'
import CustomConditionEditor from './condition-editors/CustomConditionEditor.vue'

const props = defineProps<{
  modelValue: boolean
  edgeData?: {
    id: string
    sourceNodeId: string
    targetNodeId: string
  }
  initialData?: GatewayConditionData
  formFields?: { fieldId: string; title: string }[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: GatewayConditionData): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const dialogTitle = computed(() => {
  const e = props.edgeData
  if (!e) return '条件配置'
  return `条件配置 — ${e.id}（${e.sourceNodeId} → ${e.targetNodeId}）`
})

const formFieldIds = computed(() => props.formFields?.map((f) => f.fieldId) ?? [])

const modes = [
  { label: 'NATIVE 表达式', value: 'NATIVE' as const },
  { label: 'CUSTOM 规则', value: 'CUSTOM' as const },
  { label: '默认走向', value: 'DEFAULT' as const },
]

const currentMode = ref<'NATIVE' | 'CUSTOM' | 'DEFAULT'>('CUSTOM')
const loading = ref(false)

const defaultForm = (): GatewayConditionData => ({
  conditionType: 'CUSTOM',
  isDefault: false,
  nativeExpression: '',
  ruleTree: {
    nodeType: 'AND',
    sort: 0,
    children: [],
  },
})

const form = ref<GatewayConditionData>(defaultForm())

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      const init = props.initialData
      if (init) {
        form.value = { ...init }
        if (init.isDefault) {
          currentMode.value = 'DEFAULT'
        } else if (init.conditionType === 'NATIVE') {
          currentMode.value = 'NATIVE'
        } else {
          currentMode.value = 'CUSTOM'
        }
      } else {
        form.value = defaultForm()
        currentMode.value = 'CUSTOM'
      }
    }
  }
)

async function switchMode(mode: 'NATIVE' | 'CUSTOM' | 'DEFAULT') {
  if (currentMode.value === mode) return

  // 检查当前模式是否有数据
  const hasData =
    currentMode.value === 'NATIVE'
      ? !!form.value.nativeExpression
      : currentMode.value === 'CUSTOM'
        ? (form.value.ruleTree?.children?.length ?? 0) > 0
        : false

  if (hasData) {
    try {
      await ElMessageBox.confirm('切换模式将清空当前条件，是否继续？', '提示', {
        confirmButtonText: '继续',
        cancelButtonText: '取消',
        type: 'warning',
      })
    } catch {
      return
    }
  }

  currentMode.value = mode
  if (mode === 'NATIVE') {
    form.value = { conditionType: 'NATIVE', isDefault: false, nativeExpression: '' }
  } else if (mode === 'CUSTOM') {
    form.value = {
      conditionType: 'CUSTOM',
      isDefault: false,
      ruleTree: { nodeType: 'AND', sort: 0, children: [] },
    }
  } else {
    form.value = { conditionType: null, isDefault: true }
  }
}

function onConfirm() {
  // 基础校验
  if (currentMode.value === 'NATIVE') {
    if (!form.value.nativeExpression?.trim()) {
      ElMessageBox.alert('请填写 JUEL 表达式', '校验失败', { type: 'error' })
      return
    }
  } else if (currentMode.value === 'CUSTOM') {
    const tree = form.value.ruleTree
    if (!tree || !tree.children || tree.children.length === 0) {
      ElMessageBox.alert('请至少添加一个条件', '校验失败', { type: 'error' })
      return
    }
    // 递归校验每个 CONDITION 节点
    const errors = validateTree(tree)
    if (errors.length > 0) {
      ElMessageBox.alert(errors[0], '校验失败', { type: 'error' })
      return
    }
  }

  emit('confirm', { ...form.value })
  visible.value = false
}

function validateTree(node: RuleTreeNode): string[] {
  const errors: string[] = []
  if (node.nodeType === 'CONDITION') {
    if (!node.category) errors.push('存在未选择条件来源的条件')
    if (!node.fieldKey) errors.push('存在未选择字段的条件')
    if (!node.operator) errors.push('存在未选择运算符的条件')
    if (!VALUELESS_OPERATORS.includes(node.operator as any) && !node.value) {
      errors.push('存在未填写比较值的条件')
    }
    if ((node.operator === 'IN' || node.operator === 'NOT_IN') && node.value) {
      try {
        JSON.parse(node.value)
      } catch {
        errors.push(`"在列表中/不在列表中"的值必须是有效的 JSON 数组格式`)
      }
    }
  }
  if (node.children) {
    for (const child of node.children) {
      errors.push(...validateTree(child))
    }
  }
  return errors
}
</script>

<style scoped>
.dialog-body {
  min-height: 200px;
}

.mode-switch {
  display: flex;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
}

.mode-item {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 13px;
  cursor: pointer;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  transition: all 0.2s;
}

.mode-item:hover {
  background: var(--el-fill-color);
}

.mode-item.active {
  background: var(--el-color-primary);
  color: #fff;
  font-weight: bold;
}

.mode-panel {
  padding: 8px 0;
}

.default-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  gap: 12px;
}

.default-title {
  font-size: 15px;
  color: #67c23a;
}

.default-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
```

- [ ] **Step 2: 编译检查**

Run: `npx vue-tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/components/process-designer/components/GatewayConditionDialog.vue
git commit -m "feat: add GatewayConditionDialog with mode switcher and validation

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: EdgePropertyPanel 扩展

**Files:**
- Modify: `src/components/process-designer/components/PropertyPanels/EdgePropertyPanel.vue`

- [ ] **Step 1: 读取现有文件**

Read: `src/components/process-designer/components/PropertyPanels/EdgePropertyPanel.vue`

- [ ] **Step 2: 修改 EdgePropertyPanel**

在现有 `<template>` 中的 `condition` 表单项之后（或替换），添加条件配置区块：

```vue
<!-- 新增：条件配置区块（仅网关出线） -->
<template v-if="isGatewayOutgoing">
  <el-divider />
  <div class="condition-section">
    <div class="section-label">条件配置</div>

    <!-- 模式切换 -->
    <div class="mode-pills">
      <span
        v-for="mode in conditionModes"
        :key="mode.value"
        class="mode-pill"
        :class="{ active: conditionMode === mode.value }"
        @click="setConditionMode(mode.value)"
      >
        {{ mode.label }}
      </span>
    </div>

    <!-- NATIVE 模式 -->
    <template v-if="conditionMode === 'NATIVE'">
      <el-form-item label="JUEL 表达式">
        <el-input
          v-model="nativeExpression"
          placeholder="${amount > 10000}"
          :disabled="readonly"
          style="font-family: monospace"
        />
      </el-form-item>
      <div class="var-hint">
        <el-tag
          v-for="v in availableVars"
          :key="v"
          size="small"
          @click="insertVar(v)"
        >
          {{ v }}
        </el-tag>
      </div>
    </template>

    <!-- CUSTOM 模式 -->
    <template v-else-if="conditionMode === 'CUSTOM'">
      <div class="condition-preview">
        <ConditionSummary :rule-tree="gatewayCondition?.ruleTree" />
      </div>
      <el-button
        type="primary"
        size="small"
        :disabled="readonly"
        @click="openConditionDialog"
      >
        配置条件
      </el-button>
    </template>

    <!-- 默认走向 -->
    <template v-else-if="conditionMode === 'DEFAULT'">
      <el-alert
        title="此连线已设为默认走向"
        description="当所有其他条件都不满足时，流程将自动走此分支"
        type="success"
        :closable="false"
        show-icon
      />
    </template>
  </div>

  <!-- 弹窗 -->
  <GatewayConditionDialog
    v-model="dialogVisible"
    :edge-data="edgeData"
    :initial-data="gatewayCondition"
    :form-fields="formFields"
    :readonly="readonly"
    @confirm="onDialogConfirm"
  />
</template>
```

在 `<script setup>` 中新增逻辑：

```typescript
import { computed, ref } from 'vue'
import ConditionSummary from '../ConditionSummary.vue'
import GatewayConditionDialog from '../GatewayConditionDialog.vue'
import type { GatewayConditionData } from '../../types/gateway-condition'

// ... existing code ...

const isGatewayOutgoing = computed(() => {
  // 需要从 LogicFlow 实例获取 source 节点类型
  // 暂时通过 props.data.sourceNodeId 判断（如果可用）
  // 或通过 lf.value.getNodeModelById(props.data.sourceNodeId) 获取
  const sourceId = props.data.sourceNodeId
  if (!sourceId || !lf.value) return false
  const node = lf.value.getNodeModelById(sourceId)
  if (!node) return false
  return ['exclusiveGateway', 'inclusiveGateway'].includes(node.type)
})

const gatewayCondition = computed<GatewayConditionData | undefined>({
  get: () => props.data.properties?.gatewayCondition,
  set: (v) => doUpdateProperty('gatewayCondition', v),
})

const conditionMode = computed(() => {
  const gc = gatewayCondition.value
  if (gc?.isDefault) return 'DEFAULT'
  if (gc?.conditionType === 'NATIVE') return 'NATIVE'
  if (gc?.conditionType === 'CUSTOM') return 'CUSTOM'
  return 'CUSTOM'
})

const conditionModes = [
  { label: 'NATIVE', value: 'NATIVE' },
  { label: 'CUSTOM', value: 'CUSTOM' },
  { label: '默认走向', value: 'DEFAULT' },
]

function setConditionMode(mode: string) {
  if (mode === 'NATIVE') {
    gatewayCondition.value = {
      conditionType: 'NATIVE',
      isDefault: false,
      nativeExpression: gatewayCondition.value?.nativeExpression ?? '',
    }
  } else if (mode === 'CUSTOM') {
    gatewayCondition.value = {
      conditionType: 'CUSTOM',
      isDefault: false,
      ruleTree: gatewayCondition.value?.ruleTree ?? { nodeType: 'AND', sort: 0, children: [] },
    }
  } else if (mode === 'DEFAULT') {
    gatewayCondition.value = { conditionType: null, isDefault: true }
    // 同步更新 isDefaultFlow
    doUpdateProperty('isDefaultFlow', true)
  }
}

const nativeExpression = computed({
  get: () => gatewayCondition.value?.nativeExpression ?? '',
  set: (v) => {
    gatewayCondition.value = {
      ...(gatewayCondition.value ?? {}),
      conditionType: 'NATIVE',
      isDefault: false,
      nativeExpression: v,
    }
  },
})

const dialogVisible = ref(false)
const formFields = ref<{ fieldId: string; title: string }[]>([])

const edgeData = computed(() => ({
  id: props.data.id,
  sourceNodeId: props.data.sourceNodeId,
  targetNodeId: props.data.targetNodeId,
}))

function openConditionDialog() {
  // TODO: 加载表单字段（从 ProcessEditor 传入或自行获取）
  dialogVisible.value = true
}

function onDialogConfirm(data: GatewayConditionData) {
  gatewayCondition.value = data
  // 如果是默认走向，同步 isDefaultFlow
  if (data.isDefault) {
    doUpdateProperty('isDefaultFlow', true)
  }
}
```

- [ ] **Step 3: 编译检查**

Run: `npx vue-tsc --noEmit`
Expected: 无错误（可能需要根据实际文件结构调整导入路径）

- [ ] **Step 4: Commit**

```bash
git add src/components/process-designer/components/PropertyPanels/EdgePropertyPanel.vue
git commit -m "feat: extend EdgePropertyPanel with gateway condition configuration

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: GatewayProperty 默认流向同步

**Files:**
- Modify: `src/components/process-designer/components/PropertyPanels/GatewayProperty.vue`

- [ ] **Step 1: 读取现有文件**

Read: `src/components/process-designer/components/PropertyPanels/GatewayProperty.vue`

- [ ] **Step 2: 修改默认流向变更处理**

在设置/清除默认流向的逻辑中，同步更新对应 edge 的 `gatewayCondition`：

```typescript
// 在设置默认流向时
function onDefaultFlowChange(edgeId: string | null) {
  const edges = lf.value?.getEdgeModels() ?? []

  // 清除旧的默认流向
  edges.forEach((edge: any) => {
    if (edge.sourceNodeId === props.data.id && edge.properties?.isDefaultFlow) {
      lf.value?.setProperties(edge.id, {
        ...edge.properties,
        isDefaultFlow: false,
        gatewayCondition: undefined,
      })
    }
  })

  // 设置新的默认流向
  if (edgeId) {
    const edge = edges.find((e: any) => e.id === edgeId)
    if (edge) {
      lf.value?.setProperties(edgeId, {
        ...edge.properties,
        isDefaultFlow: true,
        gatewayCondition: { conditionType: null, isDefault: true },
      })
    }
  }

  // 触发更新
  emit('change')
}
```

- [ ] **Step 3: 编译检查**

Run: `npx vue-tsc --noEmit`
Expected: 无错误

- [ ] **Step 4: Commit**

```bash
git add src/components/process-designer/components/PropertyPanels/GatewayProperty.vue
git commit -m "feat: sync GatewayProperty default flow with gatewayCondition

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: 父组件数据流集成

**Files:**
- Create: `src/components/process-designer/utils/gateway-condition.ts`
- Modify: `src/views/console/processManager/ProcessDefinitionAddView.vue`
- Modify: `src/views/console/processManager/ProcessDefinitionInfoView.vue`

- [ ] **Step 1: 创建工具函数**

```typescript
// src/components/process-designer/utils/gateway-condition.ts
import type { GatewayConditionSaveItem } from '../types/gateway-condition'

const GATEWAY_TYPES = ['bpmn:exclusiveGateway', 'bpmn:inclusiveGateway']

export function buildGatewayConditions(graphRawData: any): GatewayConditionSaveItem[] {
  const edges = graphRawData?.edges ?? []
  const nodes = graphRawData?.nodes ?? []

  return edges
    .filter((edge: any) => {
      const sourceNode = nodes.find((n: any) => n.id === edge.sourceNodeId)
      return sourceNode && GATEWAY_TYPES.includes(sourceNode.type)
    })
    .map((edge: any) => {
      const data = edge.properties?.gatewayCondition
      return {
        sequenceFlowId: edge.id,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        conditionType: data?.conditionType ?? null,
        isDefault: data?.isDefault ?? false,
        nativeExpression: data?.nativeExpression,
        ruleTree: data?.ruleTree,
      }
    })
}

export function applyGatewayConditions(graphRawData: any, gatewayConditions: any[]) {
  if (!gatewayConditions?.length) return

  const conditionMap = new Map(gatewayConditions.map((c) => [c.sequenceFlowId, c]))

  graphRawData.edges?.forEach((edge: any) => {
    const condition = conditionMap.get(edge.id)
    if (condition) {
      edge.properties = edge.properties || {}
      edge.properties.gatewayCondition = {
        conditionType: condition.conditionType,
        isDefault: condition.isDefault,
        nativeExpression: condition.nativeExpression,
        ruleTree: condition.ruleTree,
      }
      if (condition.isDefault) {
        edge.properties.isDefaultFlow = true
      }
    }
  })
}
```

- [ ] **Step 2: 修改 AddView**

在 `ProcessDefinitionAddView.vue` 的 save 方法中，构建 payload 时加入 `gatewayConditions`：

```typescript
import { buildGatewayConditions } from '@/components/process-designer/utils/gateway-condition'

// 在 save 方法中
const payload = {
  ...info.value,
  globalFormBinding: nodeConfig.value.globalFormBinding,
  nodeFormBindings: nodeConfig.value.nodeFormBindings,
  nodeFieldPermissions: nodeConfig.value.nodeFieldPermissions,
  gatewayConditions: buildGatewayConditions(info.value.rawData),
}

await http.post('/processDefinition/save', payload)
```

- [ ] **Step 3: 修改 InfoView**

在 `ProcessDefinitionInfoView.vue` 加载数据后，回写 gatewayConditions：

```typescript
import { applyGatewayConditions } from '@/components/process-designer/utils/gateway-condition'

// 在 onMounted 或 loadData 中，收到响应后
applyGatewayConditions(info.value.rawData, res.gatewayConditions)
```

- [ ] **Step 4: 编译检查**

Run: `npx vue-tsc --noEmit`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add src/components/process-designer/utils/gateway-condition.ts
git add src/views/console/processManager/ProcessDefinitionAddView.vue
git add src/views/console/processManager/ProcessDefinitionInfoView.vue
git commit -m "feat: integrate gateway conditions into save/load flow

- buildGatewayConditions: extract from graphRawData.edges
- applyGatewayConditions: write back to edge properties on load

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: 流程保存前校验扩展

**Files:**
- Modify: `src/components/process-designer/core/validators.ts`

- [ ] **Step 1: 读取现有文件**

Read: `src/components/process-designer/core/validators.ts`

- [ ] **Step 2: 添加网关条件校验**

在 `validateFlow()` 函数中，添加对网关出线的条件检查：

```typescript
// 在 validateFlow 函数中
const gatewayWarnings: FlowWarning[] = []

const gatewayNodes = nodes.filter((n) =>
  ['bpmn:exclusiveGateway', 'bpmn:inclusiveGateway'].includes(n.type)
)

for (const gw of gatewayNodes) {
  const outgoingEdges = edges.filter((e) => e.sourceNodeId === gw.id)
  const hasDefault = outgoingEdges.some(
    (e) => e.properties?.isDefaultFlow || e.properties?.gatewayCondition?.isDefault
  )

  for (const edge of outgoingEdges) {
    const gc = edge.properties?.gatewayCondition
    const hasCondition =
      gc?.conditionType === 'NATIVE' || gc?.conditionType === 'CUSTOM'

    if (!hasCondition && !hasDefault) {
      gatewayWarnings.push({
        type: 'gateway_condition',
        level: 'warning',
        message: `网关 ${gw.text?.value || gw.id} 的出线 ${edge.text?.value || edge.id} 未配置条件且未设置默认走向`,
        nodeId: gw.id,
      })
    }
  }
}

return [...existingWarnings, ...gatewayWarnings]
```

- [ ] **Step 3: 编译检查**

Run: `npx vue-tsc --noEmit`
Expected: 无错误

- [ ] **Step 4: Commit**

```bash
git add src/components/process-designer/core/validators.ts
git commit -m "feat: add gateway condition validation before save

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## 自审检查

### Spec 覆盖检查

| 设计文档章节 | 实现任务 |
|---|---|
| 5 EdgePropertyPanel 扩展 | Task 6 |
| 6 GatewayConditionDialog | Task 5 |
| 6.3 NativeConditionEditor | Task 3 |
| 6.4 CustomConditionEditor | Task 4 |
| 6.4.3 表单字段加载 | Task 5 (通过 props 传入) + Task 6 (openConditionDialog 时加载) |
| 7 数据流与持久化 | Task 8 |
| 8 默认走向整合 | Task 7 |
| 9 校验规则 | Task 5 (弹窗内) + Task 9 (流程保存前) |
| 10 样式规范 | 各组件 `<style>` 中实现 |
| 11 测试要点 | 手动验证清单见下方 |

### Placeholder 扫描

- 无 TBD/TODO/"implement later"
- 无 "Add appropriate error handling"
- 无 "Write tests for the above"
- 无 "Similar to Task N"

### 类型一致性

- `GatewayConditionData` 定义在 Task 1，被 Task 2-9 一致引用
- `RuleTreeNode` 定义在 Task 1，被 Task 2, 4, 5 一致引用
- `buildGatewayConditions` / `applyGatewayConditions` 定义在 Task 8，与 Task 7 中同步逻辑字段名一致

---

## 手动验证清单

启动 dev server：`npm run dev`

1. **打开流程设计器**，创建一个排他网关，拉出两条出线
2. **点击第一条线**：右侧属性面板应显示"条件配置"区块，三个 pill 按钮
3. **切换到 NATIVE**：输入 `${amount > 1000}`，点击确定，保存后刷新应恢复
4. **切换到 CUSTOM**：点击"配置条件"，弹窗显示 AND 根节点，添加一个 CONDITION（表单字段 amount > 5000），确定后面板显示摘要
5. **点击第二条线**：切换到"默认走向"，显示绿色提示，保存后刷新应恢复
6. **点击网关**：GatewayProperty 中默认流向应显示第二条线
7. **删除默认走向**：从 EdgePropertyPanel 切回 CUSTOM，GatewayProperty 默认流向应清空
8. **未配置警告**：删除所有条件配置后点击保存，FlowWarningDialog 应提示网关出线未配置条件
9. **查询恢复**：保存后重新打开流程，条件配置应正确显示
