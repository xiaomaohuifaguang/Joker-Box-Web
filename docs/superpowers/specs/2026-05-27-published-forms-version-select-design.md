# 表单版本选择设计

## 目标

用 `/dynamicForm/publishedForms` 接口替换当前 `/dynamicForm/queryPage`，为流程设计器的表单绑定增加版本选择功能。新增页面和编辑页面均需支持。

## 现状问题

1. `FormSelector` 通过 `/dynamicForm/queryPage` 加载表单列表，需手动过滤 `status === '1'`，无版本信息
2. 选中表单后 `formVersion` 来自 `/dynamicForm/info` 的单个值，无法选择历史版本
3. `FieldPermissionDialog` 调 `/dynamicForm/info` 不传版本，获取的始终是最新版本字段
4. 版本切换时权限配置未清空（已有 bug：`updateNodeBinding` 只在 formId 变化时清权限，版本变化不清）

## 改动范围

### 1. FormSelector.vue 重构

**API 替换**：`/dynamicForm/queryPage` → `/dynamicForm/publishedForms`

- 一次加载全量已发布表单，去掉 remote 搜索，改为本地 filterable
- 无搜索参数，接口返回所有已发布表单及版本列表

**模板改动**：表单下拉 + 版本下拉并排

```
全局表单
┌──────────────────┐ ┌─────────────┐
│ 请假申请表单    ▼│ │ V3 (最新) ▼ │
└──────────────────┘ └─────────────┘
```

- 表单下拉：展示 `formName`，值为 `formId`，本地 filterable
- 版本下拉：选中表单后出现，选项来自 `versions[]`，默认选中 `latestVersion`
- 清空表单时版本下拉隐藏，`formVersion` 清空

**Props 变更**：

```ts
defineProps<{
    modelValue?: string          // formId
    modelVersion?: string        // formVersion
    disabled?: boolean
}>()
```

**Emit 变更**：

```ts
defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'update:modelVersion', value: string): void
    (e: 'change', form: { id: string; name: string; version: string } | null): void
}>()
```

- 新增 `update:modelVersion` 双向绑定版本
- `change` 事件结构不变，`version` 为当前选中版本

### 2. ProcessPropertyPanel.vue（全局表单）

- 模板：`FormSelector` 增加 `v-model:model-version="globalFormVersion"`
- 逻辑：无需额外改动，`onFormChange` 已处理 version 更新

### 3. UserTaskProperty.vue / StartEventProperty.vue（节点表单）

- 模板：`FormSelector` 增加 `v-model:model-version="nodeFormVersion"`
- 逻辑：`onNodeFormChange` 已处理 version 更新

### 4. 版本切换清空权限配置

**核心规则**：

| 场景 | 清空范围 |
|---|---|
| 节点表单切换版本 | 该节点的 `nodeFieldPermissions` |
| 全局表单切换版本 | 所有继承节点的 `nodeFieldPermissions` |
| 全局表单切换表单 | 所有继承节点的权限（已有逻辑） |
| 节点表单切换表单 | 该节点的权限（已有逻辑） |

**节点表单版本切换**：修改 `updateNodeBinding`，将版本变化也纳入权限清空判断：

```ts
const oldVersion = idx >= 0 ? bindings[idx].formVersion : ''
if (oldFormId !== newFormId || oldVersion !== nodeFormVersion.value) {
    newPermissions = newPermissions.filter(...)
}
```

**全局表单版本切换**：`ProcessPropertyPanel` 的 `onFormChange` 需要检测版本变化，清空所有继承节点的权限：

```ts
const onFormChange = (form) => {
    const oldVersion = globalFormVersion.value
    globalFormVersion.value = form?.version ?? ''
    const versionChanged = oldVersion && oldVersion !== globalFormVersion.value
    updateGlobalFormBinding(versionChanged)
}

const updateGlobalFormBinding = (clearInheritedPermissions = false) => {
    let newPermissions = props.nodeConfig.nodeFieldPermissions
    if (clearInheritedPermissions) {
        const inheritedNodeIds = props.nodeConfig.nodeFormBindings
            .filter(b => b.inheritMainForm === '1')
            .map(b => String(b.nodeId))
        newPermissions = newPermissions.filter(
            p => !inheritedNodeIds.includes(String(p.nodeId))
        )
    }
    emit('update:nodeConfig', {
        ...props.nodeConfig,
        globalFormBinding: binding,
        nodeFieldPermissions: newPermissions,
    })
}
```

### 5. FieldPermissionDialog.vue

- `/dynamicForm/info` 调用时加传 `version` 参数
- 节点自有表单：传 `{ id: formId, version: formVersion }`
- 全局表单（继承）：传 `{ id: globalFormId, version: globalFormVersion }`
- 需要新增 prop 接收 `formVersion` 和 `globalFormVersion`

## 文件清单

| 文件 | 改动类型 |
|---|---|
| `FormSelector.vue` | 重构：换 API、加版本下拉、改 props/emit |
| `ProcessPropertyPanel.vue` | 小改：加 modelVersion 绑定、版本切换清继承权限 |
| `UserTaskProperty.vue` | 小改：加 modelVersion 绑定、updateNodeBinding 清权限逻辑 |
| `StartEventProperty.vue` | 小改：同 UserTaskProperty |
| `FieldPermissionDialog.vue` | 小改：info 接口加 version 参数 |
