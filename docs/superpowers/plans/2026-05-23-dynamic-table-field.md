# 动态表格（TABLE）字段类型 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在动态表单系统中新增 TABLE 字段类型，支持设计者定义列、填表人增删行、纯文本单元格编辑。

**Architecture:** TABLE 作为第 19 种 FormFieldType，FormField 新增 `columns` 字段存列定义。单元格纯文本输入，提交值为对象数组。联动引擎对 TABLE 触发字段仅开放 EMPTY/NOT_EMPTY，目标字段动作与 UPLOAD 一致。

**Tech Stack:** Vue 3 + Element Plus + TypeScript

---

### Task 1: 类型系统扩展

**Files:**
- Modify: `src/components/dynamicForm/types/index.ts`

- [ ] **Step 1: 在 FormFieldType 联合类型中新增 'TABLE'**

在 `types/index.ts` 第 20 行 `| 'MULTICASCADER'` 之后追加：

```ts
| 'TABLE'
```

- [ ] **Step 2: 新增 FormTableColumn 接口**

在 `FormFieldOption` 接口之后添加：

```ts
export interface FormTableColumn {
    key: string
    title: string
}
```

- [ ] **Step 3: 在 FormField 接口中新增 columns 字段**

在 `props?: Record<string, any>` 之后追加：

```ts
columns?: FormTableColumn[]
```

- [ ] **Step 4: 更新 VALID_FIELD_TYPES 数组**

在数组末尾 `'MULTICASCADER'` 后追加 `'TABLE'`。

- [ ] **Step 5: 更新 FIELD_TYPE_OPTIONS 数组**

在末尾追加：

```ts
{ label: '动态表格', value: 'TABLE' },
```

- [ ] **Step 6: 更新 getValidActionsByFieldType 函数**

在现有 `if (fieldType === 'UPLOAD')` 分支后添加：

```ts
if (fieldType === 'TABLE') {
    return common
}
```

这使 TABLE 的可用联动动作与 UPLOAD 一致：`SHOW, HIDE, REQUIRED, DISABLED, ENABLED, SET_SPAN`。

- [ ] **Step 7: 更新 getDefaultCondition 函数**

在 `if (fieldType === 'UPLOAD') return 'EMPTY'` 之后追加：

```ts
if (fieldType === 'TABLE') return 'EMPTY'
```

- [ ] **Step 8: Commit**

```bash
git add src/components/dynamicForm/types/index.ts
git commit -m "feat(dynamic-form): add TABLE field type to type system"
```

---

### Task 2: 联动引擎适配

**Files:**
- Modify: `src/components/dynamicForm/linkage.ts`

- [ ] **Step 1: 更新 computeFieldStates 中 TABLE 的初始 options 处理**

在 `computeFieldStates` 函数内，`options` 初始化逻辑 `f.options?.filter(opt => opt.visible !== false) || f.options` 对 TABLE 类型会产出 `undefined`，这是正确的（TABLE 无 options）。无需改动，确认无副作用即可。

- [ ] **Step 2: 更新 validateTemplate 中 TABLE 字段校验**

在 `validateTemplate` 函数的"按类型差异化校验"区域（`OPTION_REQUIRED_TYPES` 检查之后），添加 TABLE 专用校验：

```ts
// TABLE 专用校验
if (f.type === 'TABLE') {
    if (!f.columns || f.columns.length === 0) {
        errors.push(`字段 "${f.title || f.fieldId}" 必须定义至少一列`)
    } else {
        const colKeys = new Set<string>()
        f.columns.forEach((col, ci) => {
            if (!col.key || !col.key.trim()) {
                errors.push(`字段 "${f.title || f.fieldId}" 列[${ci}] 标识不能为空`)
            } else if (!/^[a-zA-Z][a-zA-Z0-9_]{0,31}$/.test(col.key)) {
                errors.push(`字段 "${f.title || f.fieldId}" 列[${ci}] 标识格式错误：以字母开头，仅含字母数字下划线，最长32字符`)
            } else if (colKeys.has(col.key)) {
                errors.push(`字段 "${f.title || f.fieldId}" 列标识重复: ${col.key}`)
            } else {
                colKeys.add(col.key)
            }
            if (!col.title || !col.title.trim()) {
                errors.push(`字段 "${f.title || f.fieldId}" 列[${ci}] 标题不能为空`)
            } else if (col.title.trim().length > 32) {
                errors.push(`字段 "${f.title || f.fieldId}" 列[${ci}] 标题长度不能超过32字符`)
            }
        })
    }
    if (f.min != null && f.min < 0) {
        errors.push(`字段 "${f.title || f.fieldId}" 最少行数不能为负数`)
    }
    if (f.max != null && f.max < 1) {
        errors.push(`字段 "${f.title || f.fieldId}" 最多行数不能小于1`)
    }
    if (f.min != null && f.max != null && f.max < f.min) {
        errors.push(`字段 "${f.title || f.fieldId}" 最多行数不能小于最少行数`)
    }
    // defaultValue 校验
    if (f.defaultValue != null) {
        if (!Array.isArray(f.defaultValue)) {
            errors.push(`字段 "${f.title || f.fieldId}" 默认值应为行数组`)
        } else {
            const colKeys = f.columns?.map(c => c.key) || []
            f.defaultValue.forEach((row: any, ri: number) => {
                if (!row || typeof row !== 'object' || Array.isArray(row)) {
                    errors.push(`字段 "${f.title || f.fieldId}" 默认值行[${ri}] 必须是对象`)
                } else {
                    Object.keys(row).forEach(k => {
                        if (!colKeys.includes(k)) {
                            errors.push(`字段 "${f.title || f.fieldId}" 默认值行[${ri}] 包含未定义的列: ${k}`)
                        }
                    })
                }
            })
        }
    }
}
```

- [ ] **Step 3: 更新联动条件校验 — TABLE 触发字段仅允许 EMPTY/NOT_EMPTY**

在 `validateNode` 函数中，`nodeType === 'CONDITION'` 分支内，在 `triggerCondition` 校验之后追加：

```ts
// TABLE 触发字段仅允许 EMPTY / NOT_EMPTY
if (node.triggerFieldId && node.triggerCondition) {
    const triggerType = fieldIdToType.get(node.triggerFieldId)
    if (triggerType === 'TABLE' && !['EMPTY', 'NOT_EMPTY'].includes(node.triggerCondition)) {
        errors.push(`联动规则 #${ruleIdx + 1}${path} TABLE 字段仅支持 EMPTY/NOT_EMPTY 条件`)
    }
}
```

需要在 `validateTemplate` 函数开头构建 `fieldIdToType`（已有，在 Step 2 之前就存在）。

- [ ] **Step 4: 更新联动动作兼容性校验 — TABLE 目标字段**

现有 `validateActionCompatibility` 已通过 `getValidActionsByFieldType` 检查，Task 1 已添加 TABLE 返回 `common`（即 `SHOW, HIDE, REQUIRED, DISABLED, ENABLED, SET_SPAN`），无需额外改动。

- [ ] **Step 5: Commit**

```bash
git add src/components/dynamicForm/linkage.ts
git commit -m "feat(dynamic-form): add TABLE validation rules to linkage engine"
```

---

### Task 3: 字段编辑器适配（FieldEditor.vue）

**Files:**
- Modify: `src/components/dynamicForm/FieldEditor.vue`

- [ ] **Step 1: 在 FormState 接口中新增 columns 字段**

在 `props: Record<string, any>` 之后追加：

```ts
columns: FormTableColumn[]
```

- [ ] **Step 2: 在 buildEmpty 中初始化 columns**

在 `buildEmpty()` 返回对象中追加：

```ts
columns: [],
```

- [ ] **Step 3: 在 watch 中恢复 columns 字段**

在 watch 回调中 `form.value = { ... }` 赋值块内，`props: f.props || {}` 之后追加：

```ts
columns: f.columns ? JSON.parse(JSON.stringify(f.columns)) : [],
```

- [ ] **Step 4: 在 onTypeChange 中清空 columns**

在 `onTypeChange` 函数内 `form.value.props = {}` 之后追加：

```ts
form.value.columns = []
```

- [ ] **Step 5: 添加 hasColumns 计算属性**

在 `hasOptions` 和 `hasPattern` 计算属性之后添加：

```ts
const hasColumns = computed(() => form.value.type === 'TABLE')
```

- [ ] **Step 6: 在模板中添加列管理 UI**

在级联配置区域（`v-if="['CASCADER', 'MULTICASCADER']"` 的 `el-col`）之后，添加列管理区域：

```vue
<!-- 动态表格列管理 -->
<el-col :span="24" v-if="hasColumns">
    <el-form-item label="列管理">
        <el-button type="primary" plain @click="columnsDialog = true">
            <el-icon><Setting /></el-icon>
            <span>配置表格列（已配置 {{ form.columns?.length || 0 }} 列）</span>
        </el-button>
    </el-form-item>
</el-col>
```

- [ ] **Step 7: 添加 TABLE 的行数约束和默认值 UI**

在模板中，文件上传数量限制区域之后，添加 TABLE 行约束：

```vue
<!-- TABLE 行数约束 -->
<el-col :span="12" v-if="form.type === 'TABLE'">
    <el-form-item label="最少行数">
        <el-input-number v-model="form.min" :min="0" style="width: 100%" />
    </el-form-item>
</el-col>
<el-col :span="12" v-if="form.type === 'TABLE'">
    <el-form-item label="最多行数">
        <el-input-number v-model="form.max" :min="1" style="width: 100%" />
    </el-form-item>
</el-col>
<el-col :span="24" v-if="form.type === 'TABLE'">
    <el-form-item label="默认行数据">
        <el-button type="primary" plain @click="defaultRowsDialog = true">
            配置默认行（已配置 {{ Array.isArray(form.defaultValue) ? form.defaultValue.length : 0 }} 行）
        </el-button>
    </el-form-item>
</el-col>
```

- [ ] **Step 8: 添加列配置对话框和默认行对话框**

在模板底部（`optionsDialog` 对话框之后），添加两个嵌套对话框：

```vue
<!-- 列配置对话框 -->
<el-dialog v-model="columnsDialog" title="配置表格列" width="500px" append-to-body destroy-on-close>
    <div class="columns-editor">
        <div v-for="(col, idx) in form.columns" :key="idx" class="column-row">
            <el-input v-model="col.key" placeholder="列标识（如 name）" style="flex: 1" />
            <el-input v-model="col.title" placeholder="列标题（如 姓名）" style="flex: 1" />
            <el-button type="danger" :icon="Delete" circle @click="form.columns.splice(idx, 1)" />
        </div>
        <el-button type="primary" plain @click="addColumn" style="width: 100%">添加列</el-button>
    </div>
    <template #footer>
        <el-button type="primary" @click="columnsDialog = false">完成</el-button>
    </template>
</el-dialog>

<!-- 默认行数据对话框 -->
<el-dialog v-model="defaultRowsDialog" title="配置默认行数据" width="700px" append-to-body destroy-on-close>
    <div v-if="form.columns && form.columns.length > 0" class="default-rows-editor">
        <el-table :data="form.defaultValue || []" border style="width: 100%">
            <el-table-column v-for="col in form.columns" :key="col.key" :label="col.title" :prop="col.key" min-width="120">
                <template #default="{ row }">
                    <el-input v-model="row[col.key]" placeholder="可选" />
                </template>
            </el-table-column>
            <el-table-column label="操作" width="60" fixed="right">
                <template #default="{ $index }">
                    <el-button type="danger" :icon="Delete" circle size="small"
                        @click="(form.defaultValue as any[]).splice($index, 1)" />
                </template>
            </el-table-column>
        </el-table>
        <el-button type="primary" plain @click="addDefaultRow" style="margin-top: 10px; width: 100%">
            添加默认行
        </el-button>
    </div>
    <el-empty v-else description="请先配置表格列" />
    <template #footer>
        <el-button type="primary" @click="defaultRowsDialog = false">完成</el-button>
    </template>
</el-dialog>
```

- [ ] **Step 9: 添加列配置和默认行的辅助函数**

在 script setup 中添加：

```ts
import { Delete } from '@element-plus/icons-vue'
import { type FormTableColumn } from './types'

const columnsDialog = ref(false)
const defaultRowsDialog = ref(false)

const addColumn = () => {
    if (!form.value.columns) form.value.columns = []
    form.value.columns.push({ key: `col_${Date.now()}`, title: '' })
}

const addDefaultRow = () => {
    if (!form.value.columns || form.value.columns.length === 0) return
    if (!Array.isArray(form.value.defaultValue)) {
        form.value.defaultValue = []
    }
    const row: Record<string, string> = {}
    form.value.columns.forEach(col => {
        row[col.key] = ''
    })
    form.value.defaultValue.push(row)
}
```

- [ ] **Step 10: 在 onSubmit 中输出 columns**

在 `onSubmit` 函数中，构建 `FormField` 对象时，在 `props` 之后追加：

```ts
columns: hasColumns.value ? form.value.columns : undefined,
```

- [ ] **Step 11: 在 onSubmit 中添加列校验**

在 `hasOptions` 校验之后追加：

```ts
if (hasColumns.value && (!form.value.columns || form.value.columns.length === 0)) {
    alert('请添加至少一列', 'warning')
    return
}
```

- [ ] **Step 12: 添加列编辑器样式**

在 `<style>` 中追加：

```css
.columns-editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.column-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.default-rows-editor {
    width: 100%;
}
```

- [ ] **Step 13: Commit**

```bash
git add src/components/dynamicForm/FieldEditor.vue
git commit -m "feat(dynamic-form): add TABLE column config and row constraints to FieldEditor"
```

---

### Task 4: 字段渲染器适配（FieldRenderer.vue）

**Files:**
- Create: `src/components/dynamicForm/TableRenderer.vue`
- Modify: `src/components/dynamicForm/FieldRenderer.vue`

- [ ] **Step 1: 创建 TableRenderer.vue 组件**

新建 `src/components/dynamicForm/TableRenderer.vue`：

```vue
<template>
    <div class="table-renderer">
        <el-table :data="rows" border style="width: 100%" :max-height="500">
            <el-table-column type="index" label="#" width="50" />
            <el-table-column v-for="col in field.columns" :key="col.key" :label="col.title" :prop="col.key"
                min-width="140">
                <template #default="{ row }">
                    <el-input v-model="row[col.key]" :disabled="disabled" placeholder="请输入"
                        @input="onUpdate" />
                </template>
            </el-table-column>
            <el-table-column v-if="!disabled" label="操作" width="70" fixed="right">
                <template #default="{ $index }">
                    <el-button type="danger" :icon="Delete" circle size="small"
                        @click="removeRow($index)" />
                </template>
            </el-table-column>
        </el-table>
        <div v-if="!disabled" class="table-footer">
            <el-button type="primary" plain @click="addRow" :disabled="isMaxReached">
                <el-icon><Plus /></el-icon> 添加行
            </el-button>
            <span v-if="field.min || field.max" class="row-hint">
                {{ field.min ? `最少 ${field.min} 行` : '' }}
                {{ field.max ? `最多 ${field.max} 行` : '' }}
                {{ `当前 ${rows.length} 行` }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { FormField, FormTableColumn } from './types'

const props = defineProps<{
    field: FormField
    modelValue: any
    disabled?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void
}>()

const columns = computed<FormTableColumn[]>(() => props.field.columns || [])

const rows = computed<Record<string, string>[]>(() => {
    if (Array.isArray(props.modelValue)) return props.modelValue
    return []
})

const isMaxReached = computed(() => {
    if (props.field.max == null) return false
    return rows.value.length >= props.field.max
})

const createEmptyRow = (): Record<string, string> => {
    const row: Record<string, string> = {}
    columns.value.forEach(col => {
        row[col.key] = ''
    })
    return row
}

const addRow = () => {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    current.push(createEmptyRow())
    emit('update:modelValue', current)
}

const removeRow = (index: number) => {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    current.splice(index, 1)
    emit('update:modelValue', current)
}

const onUpdate = () => {
    emit('update:modelValue', [...rows.value])
}
</script>

<style scoped>
.table-renderer {
    width: 100%;
}

.table-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
}

.row-hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
}
</style>
```

- [ ] **Step 2: 在 FieldRenderer.vue 中注册 TABLE 渲染**

在 `FieldRenderer.vue` 模板中，`UPLOAD` 块之后、`v-else` 兜底之前添加：

```vue
<TableRenderer v-else-if="field.type === 'TABLE'" :field="field" :model-value="modelValue"
    @update:model-value="onUpdate" :disabled="disabled" />
```

在 script 中添加 import：

```ts
import TableRenderer from './TableRenderer.vue'
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dynamicForm/TableRenderer.vue src/components/dynamicForm/FieldRenderer.vue
git commit -m "feat(dynamic-form): add TABLE field renderer with row add/delete"
```

---

### Task 5: FormMaker 运行时适配

**Files:**
- Modify: `src/components/dynamicForm/FormMaker.vue`

- [ ] **Step 1: 在 getDefaultValue 中添加 TABLE 分支**

在 `getDefaultValue` 函数的 switch 中，`case 'SWITCH':` 之后追加：

```ts
case 'TABLE':
    return Array.isArray(field.defaultValue) ? field.defaultValue : []
```

- [ ] **Step 2: 在 ARRAY_VALUE_TYPES 中添加 TABLE**

将：

```ts
const ARRAY_VALUE_TYPES: FormFieldType[] = ['UPLOAD', 'CHECKBOX', 'MULTISELECT', 'CASCADER', 'MULTICASCADER']
```

改为：

```ts
const ARRAY_VALUE_TYPES: FormFieldType[] = ['UPLOAD', 'CHECKBOX', 'MULTISELECT', 'CASCADER', 'MULTICASCADER', 'TABLE']
```

- [ ] **Step 3: 在 buildItemRules 中添加 TABLE 行数校验**

在 `buildItemRules` 函数中，`minLength` / `maxLength` 校验之后，添加 TABLE 行数校验：

```ts
// TABLE 行数校验
if (field.type === 'TABLE') {
    if (field.min != null && field.min > 0) {
        itemRules.push({
            type: 'array',
            min: Number(field.min),
            message: `${field.title} 至少需要 ${field.min} 行`,
            trigger: 'change',
        })
    }
    if (field.max != null) {
        itemRules.push({
            type: 'array',
            max: Number(field.max),
            message: `${field.title} 最多 ${field.max} 行`,
            trigger: 'change',
        })
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/dynamicForm/FormMaker.vue
git commit -m "feat(dynamic-form): add TABLE runtime support in FormMaker"
```

---

### Task 6: 联动编辑器适配（LinkageEditor.vue）

**Files:**
- Modify: `src/components/dynamicForm/LinkageEditor.vue`

- [ ] **Step 1: 更新 LinkageValueInput 条件值输入**

当触发字段为 TABLE 时，条件只允许 EMPTY/NOT_EMPTY，这两个条件不需要 triggerValue，无需改 LinkageValueInput。但需要确保 ConditionTreeNode 中当 TABLE 字段被选为触发字段时，条件选项只显示 EMPTY/NOT_EMPTY。

检查 `ConditionTreeNode.vue` 中条件选项列表的过滤逻辑。如果已有按字段类型过滤条件的机制，在其中加入 TABLE → 仅 EMPTY/NOT_EMPTY 的映射；如果没有，需要在 `ConditionTreeNode.vue` 或 `types/index.ts` 中添加。

在 `types/index.ts` 中添加辅助函数：

```ts
/** 根据字段类型返回可用的联动条件 */
export const getValidConditionsByFieldType = (fieldType: FormFieldType): LinkageCondition[] => {
    if (fieldType === 'TABLE') return ['EMPTY', 'NOT_EMPTY']
    if (fieldType === 'UPLOAD') return ['EMPTY', 'NOT_EMPTY']
    return VALID_LINKAGE_CONDITIONS
}
```

- [ ] **Step 2: 更新 ConditionTreeNode.vue 使用条件过滤**

读取 `ConditionTreeNode.vue`，找到条件选择器 `<el-select>` 绑定的选项列表，将硬编码的 `LINKAGE_CONDITION_OPTIONS` 替换为基于触发字段类型过滤后的列表。

具体改动：在 `ConditionTreeNode.vue` 中引入 `getValidConditionsByFieldType`，添加计算属性：

```ts
const filteredConditionOptions = computed(() => {
    const triggerField = props.fields.find(f => f.fieldId === node.triggerFieldId)
    if (!triggerField) return LINKAGE_CONDITION_OPTIONS
    const validKeys = getValidConditionsByFieldType(triggerField.type)
    return LINKAGE_CONDITION_OPTIONS.filter(opt => validKeys.includes(opt.value))
})
```

将条件 `<el-select>` 中的 `LINKAGE_CONDITION_OPTIONS` 替换为 `filteredConditionOptions`。

- [ ] **Step 3: Commit**

```bash
git add src/components/dynamicForm/types/index.ts src/components/dynamicForm/ConditionTreeNode.vue
git commit -m "feat(dynamic-form): filter linkage conditions for TABLE field type"
```

---

### Task 7: 提交数据转换适配

**Files:**
- Modify: `src/views/main/dynamicForm/IndexView.vue`

- [ ] **Step 1: 在 convertSubmitData 中添加 TABLE 分支**

在 `switch (field.type)` 中，`case 'DATERANGE'` 之后追加：

```ts
case 'TABLE':
    result[field.fieldId] = val
    break
```

TABLE 的值是对象数组，直接透传，不做 String() 转换。

- [ ] **Step 2: Commit**

```bash
git add src/views/main/dynamicForm/IndexView.vue
git commit -m "feat(dynamic-form): handle TABLE type in submit data conversion"
```

---

### Task 8: 联动引擎运行时适配

**Files:**
- Modify: `src/components/dynamicForm/linkage.ts`

- [ ] **Step 1: 确保 evalCondition 对 TABLE 值的 EMPTY/NOT_EMPTY 判断正确**

现有 `isEmpty` 函数已处理数组：`if (Array.isArray(v)) return v.length === 0`。TABLE 的值是对象数组，`isEmpty([])` 返回 `true`，`isEmpty([{name: 'xx'}])` 返回 `false`。无需改动，确认即可。

- [ ] **Step 2: Commit（无改动则跳过）**

如果 Step 1 确认无需改动，跳过此 commit。

---

### Task 9: 测试 JSON 生成

**Files:**
- Create: `docs/dynamic-form-table-payload.json`

- [ ] **Step 1: 生成包含 TABLE 字段的测试 JSON**

```json
{
  "id": null,
  "name": "动态表格测试表单",
  "description": "包含 TABLE 字段的完整测试表单",
  "version": "1.0.0",
  "status": "1",
  "deleted": "0",
  "createBy": "admin",
  "createTime": "2026-05-23 10:00:00",
  "updateTime": "2026-05-23 10:00:00",
  "formFields": [],
  "groups": [
    {
      "id": "basic",
      "name": "基本信息",
      "description": "",
      "sort": 1,
      "collapsed": "0",
      "fields": [
        {
          "fieldId": "title",
          "title": "项目名称",
          "type": "INPUT",
          "required": "1",
          "placeholder": "请输入项目名称",
          "span": 24,
          "sort": 1,
          "groupId": "basic"
        },
        {
          "fieldId": "members",
          "title": "项目成员",
          "type": "TABLE",
          "required": "1",
          "min": 1,
          "max": 10,
          "span": 24,
          "sort": 2,
          "groupId": "basic",
          "columns": [
            { "key": "name", "title": "姓名" },
            { "key": "role", "title": "角色" },
            { "key": "phone", "title": "联系电话" }
          ],
          "defaultValue": [
            { "name": "", "role": "", "phone": "" }
          ]
        }
      ]
    }
  ],
  "linkageRules": [
    {
      "name": "无成员时隐藏备注",
      "targetFieldId": "title",
      "actionType": "HIDE",
      "enable": true,
      "sortOrder": 0,
      "conditionTree": [
        {
          "nodeType": "AND",
          "children": [
            {
              "nodeType": "CONDITION",
              "triggerFieldId": "members",
              "triggerCondition": "EMPTY",
              "triggerValue": ""
            }
          ]
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add docs/dynamic-form-table-payload.json
git commit -m "docs: add TABLE field test payload"
```
