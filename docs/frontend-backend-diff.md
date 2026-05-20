# 动态表单前后端实现差异对照文档

> 基于后端文档 `dynamic-form-spec.md`（master 分支 2026-05-21）与前端实现代码对比整理
> 供前后端对齐修复使用

---

## 1. 字段值数据类型不一致（影响提交和回显）

### 1.1 SWITCH 字段

| 项目 | 后端期望 | 前端实际 |
|------|---------|---------|
| **数据类型** | 字符串 `"true"` / `"false"` / `"1"` / `"0"` | boolean `true` / `false` |
| **默认值初始化** | `"true"` / `"false"` | `!!field.defaultValue` → boolean |
| **组件绑定** | — | `el-switch` 绑定 boolean |
| **提交时** | — | data 中直接放入 boolean |

**问题**：后端收到 boolean 后可能无法正确解析。

**建议**：前端在 `onRuntimeFieldUpdate` 和 `syncDefaultValues` 中将 SWITCH 值统一转为字符串 `"true"`/`"false"` 后传给后端；回显时再转回 boolean 给 `el-switch`。

---

### 1.2 NUMBER / SLIDER / RATE 字段

| 项目 | 后端期望 | 前端实际 |
|------|---------|---------|
| **数据类型** | 字符串（如 `"123.45"`、`"4"`、`"50"`） | number（如 `123.45`、`4`、`50`） |
| **默认值初始化** | `"100.5"` | `Number(field.defaultValue) \|\| 0` |
| **组件绑定** | — | `el-input-number` / `el-slider` / `el-rate` 绑定 number |
| **提交时** | — | data 中直接放入 number |

**问题**：后端解析为 `double` 的字段收到 number 类型，可能解析失败或行为不一致。

**建议**：前端在 `onRuntimeFieldUpdate` 中将 number 转为字符串后 emit；回显时 `String()` 后再传给组件。

---

### 1.3 CASCADER（级联单选）字段

| 项目 | 后端期望 | 前端实际 |
|------|---------|---------|
| **数据类型** | 逗号分隔字符串，如 `"zhejiang,hangzhou,xihu"` | 数组，如 `["zhejiang", "hangzhou", "xihu"]` |
| **组件绑定** | — | `el-cascader` 未设置 `value-format`，默认返回数组 |

**问题**：`el-cascader` 默认返回数组，与后端期望的字符串不一致。

**建议**：前端为 CASCADER 设置 `value-format` 或在 `onRuntimeFieldUpdate` 中将数组 `join(',')` 转为字符串。

---

## 2. UPLOAD 字段存储格式不一致

### 2.1 字段命名差异

后端文档 9.3 节期望的格式：
```json
[
  {
    "fileId": "file-uuid",
    "name": "合同.pdf",
    "size": 1048576,
    "type": "application/pdf"
  }
]
```

前端当前实际存储的格式（后端上传接口返回的完整对象）：
```json
[
  {
    "id": "file-uuid",
    "filename": "合同.pdf",
    "contentType": "application/pdf",
    "type": "file",
    "parentId": "/动态表单/",
    "size": 2047771,
    "userId": 1,
    "createTime": "2026-05-21 00:24:01",
    "updateTime": null
  }
]
```

| 后端字段名 | 前端字段名 | 说明 |
|-----------|-----------|------|
| `fileId` | `id` | 不一致 |
| `name` | `filename` | 不一致 |
| `type` | `contentType` | 不一致（且前端还有另一个 `type: "file"`） |
| — | `parentId`, `userId`, `createTime`, `updateTime` | 前端多存了这些字段 |

### 2.2 `type` 字段含义不一致

后端文档 8.2 节示例：`"type": "pdf"`（扩展名），但 9.3 节表格说 `type` 是 MIME 类型（如 `application/pdf`）。

前端存储的是后端上传接口返回的 `contentType`（MIME 类型）。

**建议**：
- **方案 A（推荐）**：后端确认 `type` 字段的规范，前端按规范调整存储格式。如后端只需要 `{fileId, name, size, type}`，前端可以在 `onUploadSuccess` 中提取这 4 个字段存储。
- **方案 B**：后端兼容前端存储的完整对象，读取 `id` → `fileId`、`filename` → `name`、`contentType` → `type`。

---

## 3. UPLOAD 字段 minLength 未支持

| 项目 | 后端 | 前端 |
|------|------|------|
| **minLength 含义** | 最少上传数量 | 未在 UI 中暴露配置入口 |
| **校验** | 支持 | `buildItemRules` 已支持 `min` 规则对数组校验，但用户无法配置 |

后端文档 5 节通用属性表格：`minLength` 对 UPLOAD 表示最少上传数。但前端 `FieldEditor.vue` 中 UPLOAD 类型只有 `maxLength`（最多上传数量）配置，没有 `minLength` 配置。

**建议**：在 `FieldEditor.vue` 中为 UPLOAD 类型增加 "最少上传数量" 配置项（类似 `maxLength`）。

---

## 4. 表单编辑更新功能缺失

后端文档 8.1 节：提交格式包含 `formInstanceId`，首次提交传 `null`，更新时传已有实例 ID。

前端 `IndexView.vue` 中：
```js
await http.post("/dynamicForm/submit", {
    formId: info.value.id,
    version: route.params.version,
    formInstanceId: null,  // 始终为 null
    data: formData.value
})
```

`formInstanceId` 始终为 `null`，说明编辑更新（更新已有实例）功能未实现。

**建议**：确认是否需要支持表单实例的编辑更新功能，如需要，前端需要传入已有的 `formInstanceId`。

---

## 5. fieldId 格式校验缺失

后端文档 5 节：`fieldId` 格式限制为 `^[a-zA-Z][a-zA-Z0-9_]{0,31}$`。

前端 `FieldEditor.vue` 中没有对此格式的校验。用户可以输入任意字符作为 `fieldId`。

**建议**：前端在字段编辑器中添加 `fieldId` 格式校验，或使用后端提供的正则表达式进行校验。

---

## 6. 已实现一致的功能

以下功能前后端已实现一致，无需调整：

| 功能 | 说明 |
|------|------|
| **表单提交结构** | `formId`, `version`, `formInstanceId`, `data` 格式一致 |
| **联动规则数据结构** | `conditionTree`, `actionType`, `actionValue` 等结构一致 |
| **UPLOAD 字段类型兼容性** | UPLOAD 不支持 VALUE、SET_PATTERN，前后端一致 |
| **字段分组与折叠** | `groupId`, `collapsed` 等逻辑一致 |
| **版本管理状态流转** | 草稿/发布/停用的流转逻辑由后端控制，前端按状态渲染 |
| **文件上传接口** | `/file/uploadDynamicForm` 和 `/file/downloadDynamicForm` 使用一致 |
| **联动规则动作类型** | SHOW/HIDE/REQUIRED/DISABLED/ENABLED/SET_PATTERN/SET_SPAN/OPTION/VALUE 定义一致 |
| **条件运算符** | EQ/NE/GT/LT/GE/LE/IN/NOT_IN/EMPTY/NOT_EMPTY/REGEX 定义一致 |

---

## 7. 建议修复优先级

| 优先级 | 问题 | 影响 |
|--------|------|------|
| **P0（高）** | SWITCH/NUMBER/SLIDER/RATE 值类型不一致 | 提交后后端解析失败或数据错误 |
| **P0（高）** | UPLOAD 存储格式字段名不一致 | 后端无法正确读取文件信息 |
| **P1（中）** | CASCADER 值格式不一致 | 级联选择提交格式错误 |
| **P1（中）** | 表单编辑更新缺失（formInstanceId） | 无法更新已有表单实例 |
| **P2（低）** | UPLOAD minLength 配置缺失 | 用户无法配置最少上传数量 |
| **P2（低）** | fieldId 格式校验缺失 | 可能传入非法字段 ID |
