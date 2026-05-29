# 常用正则预设选择器实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 FieldEditor 和 LinkageEditor 中增加常用正则预设选择弹窗，选择后自动填入 pattern 和 patternTips。

**Architecture:** 新增 `PatternPresetPicker` 弹窗组件 + 预设数据常量文件，通过 Props/Emits 与父组件通信。FieldEditor 和 LinkageEditor 各自在 pattern 输入框旁增加触发按钮，点击打开弹窗，选择后回填数据。

**Tech Stack:** Vue 3 + Element Plus + TypeScript

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/dynamicForm/types/pattern-presets.ts` | 创建 | 预设数据结构和常量数组 |
| `src/components/dynamicForm/PatternPresetPicker.vue` | 创建 | 弹窗组件 |
| `src/components/dynamicForm/FieldEditor.vue` | 修改 | 集成预设选择按钮和弹窗 |
| `src/components/dynamicForm/LinkageEditor.vue` | 修改 | 集成预设选择按钮和弹窗 |

---

### Task 1: 创建预设数据文件

**Files:**
- Create: `src/components/dynamicForm/types/pattern-presets.ts`

- [ ] **Step 1: 编写预设数据文件**

```ts
export interface PatternPreset {
  id: string
  name: string
  category: string
  pattern: string
  patternTips: string
}

export const PATTERN_PRESETS: PatternPreset[] = [
  {
    id: 'cn_name',
    name: '汉字姓名',
    category: '基础信息',
    pattern: '^[一-龥·]{2,16}$',
    patternTips: '请输入2-16位汉字姓名',
  },
  {
    id: 'en_name',
    name: '英文姓名',
    category: '基础信息',
    pattern: "^[a-zA-Z\\s\\-']{2,32}$",
    patternTips: '请输入正确的英文姓名',
  },
  {
    id: 'mobile',
    name: '手机号',
    category: '联系方式',
    pattern: '^1[3-9]\\d{9}$',
    patternTips: '请输入正确的11位手机号',
  },
  {
    id: 'email',
    name: '邮箱',
    category: '联系方式',
    pattern: '^[\\w.-]+@[\\w.-]+\\.\\w+$',
    patternTips: '请输入正确的邮箱地址',
  },
  {
    id: 'idcard',
    name: '身份证号（18位）',
    category: '证件',
    pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$',
    patternTips: '请输入正确的18位身份证号',
  },
  {
    id: 'passport',
    name: '护照号',
    category: '证件',
    pattern: '^[a-zA-Z0-9]{5,20}$',
    patternTips: '请输入正确的护照号',
  },
  {
    id: 'zipcode',
    name: '邮编',
    category: '其他',
    pattern: '^\\d{6}$',
    patternTips: '请输入正确的6位邮编',
  },
  {
    id: 'bankcard',
    name: '银行卡号',
    category: '其他',
    pattern: '^\\d{16,19}$',
    patternTips: '请输入正确的银行卡号',
  },
]

export const PATTERN_PRESET_CATEGORIES: string[] = [
  '全部',
  ...Array.from(new Set(PATTERN_PRESETS.map(p => p.category))),
]
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dynamicForm/types/pattern-presets.ts
git commit -m "feat: add pattern preset data constants

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: 创建 PatternPresetPicker 弹窗组件

**Files:**
- Create: `src/components/dynamicForm/PatternPresetPicker.vue`

- [ ] **Step 1: 编写组件模板和脚本**

```vue
<template>
  <el-dialog v-model="visible" title="选择常用正则" width="560px" :close-on-click-modal="false" destroy-on-close>
    <div class="preset-search">
      <el-input v-model="searchKeyword" placeholder="搜索正则名称..." clearable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="preset-categories">
      <el-radio-group v-model="activeCategory" size="small">
        <el-radio-button v-for="cat in PATTERN_PRESET_CATEGORIES" :key="cat" :label="cat">
          {{ cat }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <div class="preset-list">
      <div
        v-for="preset in filteredPresets"
        :key="preset.id"
        class="preset-card"
        @click="onSelect(preset)"
      >
        <div class="preset-name">{{ preset.name }}</div>
        <div class="preset-meta">
          <code class="preset-pattern">{{ preset.pattern }}</code>
          <span class="preset-tips">{{ preset.patternTips }}</span>
        </div>
      </div>
      <el-empty v-if="filteredPresets.length === 0" description="未找到匹配的正则预设" />
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { PATTERN_PRESETS, PATTERN_PRESET_CATEGORIES, type PatternPreset } from './types/pattern-presets'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'select', preset: { pattern: string; patternTips: string }): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const searchKeyword = ref('')
const activeCategory = ref('全部')

watch(() => props.modelValue, open => {
  if (open) {
    searchKeyword.value = ''
    activeCategory.value = '全部'
  }
})

const filteredPresets = computed(() => {
  let list = PATTERN_PRESETS
  if (activeCategory.value !== '全部') {
    list = list.filter(p => p.category === activeCategory.value)
  }
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(kw) ||
      p.category.toLowerCase().includes(kw)
    )
  }
  return list
})

const onSelect = (preset: PatternPreset) => {
  emit('select', { pattern: preset.pattern, patternTips: preset.patternTips })
  visible.value = false
}
</script>

<style scoped>
.preset-search {
  margin-bottom: 12px;
}

.preset-categories {
  margin-bottom: 12px;
}

.preset-categories :deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preset-categories :deep(.el-radio-button__inner) {
  border-radius: 4px;
  border: 1px solid var(--el-border-color);
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 380px;
  overflow-y: auto;
}

.preset-card {
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--el-fill-color-blank);
}

.preset-card:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.preset-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
}

.preset-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preset-pattern {
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 2px 8px;
  border-radius: 4px;
  word-break: break-all;
}

.preset-tips {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dynamicForm/PatternPresetPicker.vue
git commit -m "feat: add PatternPresetPicker dialog component

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: 在 FieldEditor.vue 中集成

**Files:**
- Modify: `src/components/dynamicForm/FieldEditor.vue`

- [ ] **Step 1: 导入组件和图标**

在 `<script setup>` 顶部添加导入：

```ts
import { Collection } from '@element-plus/icons-vue'
import PatternPresetPicker from './PatternPresetPicker.vue'
```

- [ ] **Step 2: 添加弹窗状态**

在 `FormState` 接口之后，`buildEmpty` 之前，添加：

```ts
const patternPickerVisible = ref(false)
```

- [ ] **Step 3: 修改 pattern 输入框，增加触发按钮**

找到第 303 行的 `正则校验` 表单项（`hasPattern` 条件下的第一个），替换为：

```vue
<el-col :span="12" v-if="hasPattern">
  <el-form-item label="正则校验">
    <el-input v-model="form.pattern" placeholder="例：^[一-龥]{2,4}$">
      <template #append>
        <el-button @click="patternPickerVisible = true" title="选择常用正则">
          <el-icon><Collection /></el-icon>
        </el-button>
      </template>
    </el-input>
  </el-form-item>
</el-col>
```

- [ ] **Step 4: 在模板底部添加弹窗组件**

在 `</el-dialog>`（主对话框结束标签）之前，添加：

```vue
<PatternPresetPicker
  v-model="patternPickerVisible"
  @select="({ pattern, patternTips }) => {
    form.pattern = pattern
    form.patternTips = patternTips
  }"
/>
```

- [ ] **Step 5: 构建验证**

```bash
npm run build
```

Expected: 构建成功，无 TypeScript/Vue 编译错误。

- [ ] **Step 6: Commit**

```bash
git add src/components/dynamicForm/FieldEditor.vue
git commit -m "feat: integrate pattern preset picker in FieldEditor

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: 在 LinkageEditor.vue 中集成

**Files:**
- Modify: `src/components/dynamicForm/LinkageEditor.vue`

- [ ] **Step 1: 导入组件和图标**

在 `<script setup>` 顶部添加导入：

```ts
import { Collection } from '@element-plus/icons-vue'
import PatternPresetPicker from './PatternPresetPicker.vue'
```

- [ ] **Step 2: 添加弹窗状态和当前编辑项引用**

在 `const optionDialogVisible = ref(false)` 附近（或合适位置），添加：

```ts
const patternPickerVisible = ref(false)
const activePatternRule = ref<InternalRule | null>(null)
```

- [ ] **Step 3: 添加打开弹窗的方法**

在 `openOptionDialog` 方法附近，添加：

```ts
const openPatternPicker = (rule: InternalRule) => {
  activePatternRule.value = rule
  patternPickerVisible.value = true
}
```

- [ ] **Step 4: 修改 SET_PATTERN 模板，增加触发按钮**

找到第 81-85 行的 `SET_PATTERN` 模板块，替换为：

```vue
<template v-else-if="element.actionType === 'SET_PATTERN'">
  <el-input v-model="element.actionValue.pattern" placeholder="正则表达式" style="flex: 1">
    <template #append>
      <el-button @click="openPatternPicker(element)" title="选择常用正则">
        <el-icon><Collection /></el-icon>
      </el-button>
    </template>
  </el-input>
  <el-input v-model="element.actionValue.patternTips" placeholder="提示信息" style="flex: 1" />
</template>
```

- [ ] **Step 5: 在模板底部添加弹窗组件**

在 `</div>`（linkage-editor 根 div 结束标签）之前，添加：

```vue
<PatternPresetPicker
  v-model="patternPickerVisible"
  @select="({ pattern, patternTips }) => {
    if (activePatternRule.value) {
      activePatternRule.value.actionValue.pattern = pattern
      activePatternRule.value.actionValue.patternTips = patternTips
    }
  }"
/>
```

- [ ] **Step 6: 构建验证**

```bash
npm run build
```

Expected: 构建成功，无 TypeScript/Vue 编译错误。

- [ ] **Step 7: Commit**

```bash
git add src/components/dynamicForm/LinkageEditor.vue
git commit -m "feat: integrate pattern preset picker in LinkageEditor

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: 最终验证

- [ ] **Step 1: 完整构建检查**

```bash
npm run build
```

Expected: 构建成功，无错误。

- [ ] **Step 2: Lint 检查**

```bash
npm run lint
```

Expected: 无 lint 错误（或只有与本次改动无关的错误）。

- [ ] **Step 3: 最终提交（如 lint 有修复）**

```bash
git add -A
git commit -m "style: fix lint issues

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

### 1. Spec Coverage

| 设计文档需求 | 对应任务 |
|-------------|---------|
| 预设数据结构 | Task 1 |
| 弹窗组件（搜索+分类+卡片点击） | Task 2 |
| FieldEditor 集成 | Task 3 |
| LinkageEditor 集成 | Task 4 |
| 选择后回填 pattern + patternTips | Task 3 Step 4, Task 4 Step 5 |

### 2. Placeholder Scan

- [x] 无 TBD/TODO
- [x] 无 "implement later"
- [x] 所有步骤包含具体代码
- [x] 无 "Similar to Task N" 引用

### 3. Type Consistency

- [x] `PatternPreset` 接口在 Task 1 定义，Task 2 组件中使用
- [x] `select` 事件参数 `{ pattern: string, patternTips: string }` 在 Task 2/3/4 中一致
- [x] `PATTERN_PRESET_CATEGORIES` 在 Task 1 导出，Task 2 导入使用

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-30-pattern-preset-picker.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
