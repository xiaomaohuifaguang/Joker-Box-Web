# 动态表单系统 —— 现有实现文档

> 本文档整理自 `src/components/dynamicForm/` 及关联视图代码，用于后续重构参考。

---

## 1. 数据模型

### 1.1 FormField —— 字段定义

| 属性 | 类型 | 说明 |
|------|------|------|
| `fieldId` | `string` | 唯一标识，规则：`^[a-zA-Z][a-zA-Z0-9_]{0,31}$` |
| `title` | `string` | 显示标题，≤32 字符 |
| `type` | `FormFieldType` | 字段类型（见下文 19 种） |
| `required` | `'1' \| '0'` | `'1'` = 必填 |
| `defaultValue` | `any` | 默认值 |
| `placeholder` | `string` | 占位提示 |
| `options` | `FormFieldOption[]` | 静态选项（含级联子选项） |
| `minLength` / `maxLength` | `number` | INPUT/TEXTAREA/UPLOAD 用 |
| `min` / `max` | `number` | NUMBER/SLIDER/RATE/CHECKBOX/TEXTAREA/TABLE 用 |
| `pattern` / `patternTips` | `string` | 正则校验及提示 |
| `span` | `number` | 布局宽度 1-24，默认 24 |
| `sort` | `number` | 排序序号 |
| `groupId` | `string` | 所属分组 ID |
| `props` | `Record<string, any>` | 扩展属性（如级联的 `checkStrictly`） |
| `columns` | `FormTableColumn[]` | TABLE 类型的列定义 `{ key, title }` |
| `optionSource` | `FormOptionSource` | 远程选项数据源配置 |

#### FormFieldOption —— 选项结构

```ts
interface FormFieldOption {
    label: string
    value: string | number | boolean
    children?: FormFieldOption[]   // 级联用
    visible?: boolean              // 静态选项可见性
}
```

#### FormOptionSource —— 远程选项配置

```ts
interface FormOptionSource {
    type?: 'STATIC' | 'API'
    url?: string                   // 仅支持同源相对路径，必须以 / 开头
    method?: 'GET' | 'POST'
    params?: Record<string, any>   // 支持 {"$field": "fieldId"} 引用其他字段值
    mapping?: {
        listPath: string           // 响应体列表路径
        labelPath: string
        valuePath: string
        childrenPath?: string
    }
}
```

### 1.2 FormFieldGroup —— 分组定义

```ts
interface FormFieldGroup {
    id: string
    name: string
    description?: string
    sort?: number
    collapsed?: '0' | '1'         // '1' = 默认折叠
    fields: FormField[]
}
```

> 数据库存储为平铺字段（带 `groupId`），UI 渲染时按分组组织。

### 1.3 FormLinkageRule —— 联动规则

```ts
interface FormLinkageRule {
    id: string
    formId: string
    version: string
    name: string                  // 规则名称（展示用）
    targetFieldId: string         // 目标字段
    actionType: LinkageAction     // 动作类型
    actionValue?: any             // 动作参数
    enable?: boolean
    sortOrder?: number
    conditionTree: FormLinkageNode[]   // 条件树，根节点必须是 AND/OR
}
```

#### LinkageCondition —— 11 种条件运算符

`EQ | NE | GT | LT | GE | LE | IN | NOT_IN | EMPTY | NOT_EMPTY | REGEX`

#### LinkageAction —— 9 种动作类型

| 动作 | 参数类型 | 说明 |
|------|----------|------|
| `SHOW` | — | 显示目标字段 |
| `HIDE` | — | 隐藏目标字段 |
| `REQUIRED` | `boolean`（默认 true） | 设置必填/选填 |
| `DISABLED` | `boolean`（默认 true） | 设置禁用 |
| `ENABLED` | — | 设置启用 |
| `SET_PATTERN` | `{ pattern, patternTips }` 或 `string` | 设置正则校验 |
| `SET_SPAN` | `number`（1-24） | 设置布局宽度 |
| `OPTION` | `string[]`（value 列表） | 过滤可选项 |
| `VALUE` | `any` | 自动填充值 |

#### FormLinkageNode —— 条件树节点

```ts
type FormLinkageNode =
    | { nodeType: 'AND' | 'OR'; children: FormLinkageNode[] }
    | { nodeType: 'CONDITION'; triggerFieldId: string; triggerCondition: LinkageCondition; triggerValue?: any }
```

### 1.4 FieldRuntimeState —— 运行时状态

```ts
interface FieldRuntimeState {
    visible: boolean
    required: boolean
    disabled: boolean
    pattern?: string
    patternTips?: string
    span?: number
    options?: FormFieldOption[]
    value?: any
}
```

> 由 `computeFieldStates()` 根据字段配置 + 联动规则 + 当前表单数据计算得出。

---

## 2. 支持的字段类型（19 种）

| 类型 | Element Plus 组件 | 特殊配置 |
|------|-------------------|----------|
| `INPUT` | `el-input` | `minlength`, `maxlength`, `clearable` |
| `NUMBER` | `el-input-number` | `min`, `max` |
| `TEXTAREA` | `el-input` (type=textarea) | `autosize: { minRows, maxRows }` |
| `SELECT` | `el-select` | `clearable` |
| `MULTISELECT` | `el-select` (multiple) | `multiple`, `clearable` |
| `RADIO` | `el-radio-group` | 含"清空"按钮 |
| `CHECKBOX` | `el-checkbox-group` | `min`, `max` 约束 |
| `CASCADER` | `el-cascader` | `props.checkStrictly`, `showAllLevels` |
| `MULTICASCADER` | `el-cascader` (multiple) | `multiple: true` |
| `SWITCH` | `el-switch` | 值归一化为 `boolean` |
| `COLOR` | `el-color-picker` | `show-alpha`，含"清空"按钮 |
| `SLIDER` | `el-slider` | `min`, `max`, `show-input`, `show-stops` |
| `DATE` | `el-date-picker` (date) | `value-format="YYYY-MM-DD"` |
| `DATETIME` | `el-date-picker` (datetime) | `value-format="YYYY-MM-DD HH:mm:ss"` |
| `TIME` | `el-time-picker` | `value-format="HH:mm:ss"` |
| `DATERANGE` | `el-date-picker` (daterange) | `unlink-panels`，分隔符"至" |
| `UPLOAD` | `el-upload` | 拖拽上传，文件卡片（类型图标、下载、删除） |
| `RATE` | `el-rate` | `max`（默认 5） |
| `TABLE` | `TableRenderer`（内部组件） | `columns` 定义列，`min`/`max` 行数限制 |

---

## 3. 后端 API 接口

### 3.1 表单模板管理

| 接口 | 方法 | 请求体 | 响应 |
|------|------|--------|------|
| `/dynamicForm/queryPage` | POST | `{ page, size, ...filters }` | 分页列表 |
| `/dynamicForm/info` | POST | `{ id }` | 完整表单配置（含 fields、rules、groups） |
| `/dynamicForm/update` | POST | `{ id, name, description, formFields, linkageRules, groups, ... }` | 更新结果 |
| `/dynamicForm/remove` | POST | `{ id }` | 删除结果 |
| `/dynamicForm/deploy` | POST | `{ formId }` | 发布表单 |
| `/dynamicForm/stop` | POST | `{ formId }` | 停用表单 |

### 3.2 文件上传/下载

| 接口 | 方法 | 说明 |
|------|------|------|
| `/file/uploadDynamicForm` | POST | 文件上传，multipart/form-data |
| `/file/downloadDynamicForm?fileId={id}` | GET | 文件下载 |

---

## 4. 组件接口

### 4.1 FormMaker —— 表单设计器/运行时容器

```vue
<FormMaker
    :form-fields="formFields"
    :linkage-rules="linkageRules"
    :groups="groups"
    v-model="formData"
    :type="'create' | 'view' | 'edit'"
    @update:fields="..."
    @update:groups="..."
    @update:rules="..."
/>
```

**两种模式：**
- `type === 'create'`：设计模式，含三个 Tab（字段设计 / 联动规则 / 表单预览）
- `type === 'view' | 'edit'`：运行模式，仅渲染表单

**暴露方法：**
- `verify()` —— 运行时表单校验
- `validateTpl(name?)` —— 模板预校验（保存前）
- `runtimeStates` —— 当前字段运行时状态

### 4.2 FieldRenderer —— 字段渲染器

```vue
<FieldRenderer
    :field="field"
    :model-value="modelValue"
    :disabled="disabled"
    :runtime-options="runtimeOptions"
    :option-loading="optionLoading"
    :option-error="optionError"
    @update:model-value="..."
    @retry-options="..."
/>
```

> 纯渲染组件，根据 `field.type` 渲染对应的 Element Plus 组件。

### 4.3 TableRenderer —— 表格渲染器

```vue
<TableRenderer
    :field="field"
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="..."
/>
```

> 内部使用 `el-table`，每行各列均为 `el-input`。支持增删行。

### 4.4 FieldEditor —— 字段编辑器

```vue
<FieldEditor
    v-model="dialogVisible"
    :field="editingField"
    :existing-field-ids="fieldIds"
    :groups="groupOptions"
    :default-group-id="defaultGroupId"
    @submit="..."
/>
```

### 4.5 LinkageEditor —— 联动规则编辑器

```vue
<LinkageEditor
    :rules="linkageRules"
    :fields="fields"
    @update:rules="..."
/>
```

---

## 5. 联动执行流程

```
表单数据变化 (formData)
    ↓
computeFieldStates(fields, linkages, formData)
    ↓
FieldRuntimeState { visible, required, disabled, span, options, value }
    ↓
FormMaker.vue VALUE watcher 检测到 state.value 变化
    ↓
自动填充到 previewData.value / props.modelValue
    ↓
表单数据再次变化（如果 VALUE 动作触发了新的联动条件）
```

**条件求值规则：**
- `EQ/NE`：字符串比较，支持数组归一化（`[a,b]` ↔ `"a,b"`）
- `GT/LT/GE/LE`：数值比较
- `IN/NOT_IN`：成员检测，支持逗号分隔字符串
- `EMPTY/NOT_EMPTY`：`null`/`undefined`/空字符串/空数组视为空
- `REGEX`：全字符串正则匹配

**关键设计：** 联动条件不满足时**不自动恢复默认值**，避免 A→B→A 振荡。

---

## 6. 数据流

### 6.1 加载流程

```
后端 /dynamicForm/info
    ↓
InfoState { id, name, formFields[], linkageRules[], groups[] }
    ↓
DynamicFormInfoView.vue 将 groups 展平到 formFields（保留 groupId）
    ↓
FormMaker.vue props: formFields, linkageRules, groups
    ↓
设计模式：渲染字段卡片 + 联动规则编辑器 + 预览
运行模式：computeFieldStates → FieldRenderer
```

### 6.2 保存流程

```
validateTemplate(name, fields, linkages, groups)
    ↓
校验通过
    ↓
/dynamicForm/update
    请求体含：groups, formFields（仅未分组字段）, linkageRules
```

---

## 7. 已知设计缺陷（重构需关注）

1. **组件频繁重建**：`previewStates` 变化 → `v-for` 数组 `.filter()`/`.sort()` 返回新引用 → Vue 销毁/重建所有 `FieldRenderer` → Element Plus 组件 mounted 时 auto-emit → 无限循环
2. **状态流耦合**：`FieldRenderer` 通过 `nextTick` 延迟 `emit`，父组件修改 `previewData.value` → `previewStates` 重新计算 → 再次触发重建
3. **模块级缓存共享**：`computeFieldStates` 原使用模块级全局缓存，被 `previewStates`/`runtimeStates` 共享导致互相覆盖
4. **Fragment 模板**：`FieldRenderer` 原使用多根节点 `v-if`/`v-else-if` 链，与 Vue 3 `patchKeyedChildren` 存在兼容性问题
5. **联动 VALUE 动作无防护**：`previewStates` 的 VALUE watcher 在 `isApplyingPreviewValues` 为 false 时无条件执行，容易与初始化 watch 冲突

---

*文档整理时间：2025-06-02*
*覆盖范围：`src/components/dynamicForm/*`、`src/views/console/dynamicForm/*`*
