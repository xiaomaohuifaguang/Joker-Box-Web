# startInfo 接口文档

## 接口基本信息

| 项 | 内容 |
|---|---|
| **接口路径** | `/processDefinition/startInfo` |
| **请求方式** | `POST` |
| **Content-Type** | `application/x-www-form-urlencoded`（传参）或 query string |
| **接口作用** | 获取发起流程前的定义信息 + 表单模板配置，供前端渲染"新建申请"页面 |

---

## 请求参数

| 参数名 | 类型 | 是否必填 | 说明 |
|---|---|---|---|
| `processDefinitionId` | Integer | 是 | 流程定义主键（`cat_process_definition.id`） |

---

## 响应结构

返回 `HttpResult<ProcessDefinition>`，外层包装固定，实际业务数据在 `data` 中。

### 外层 HttpResult

```json
{
  "code": 200,
  "msg": "success",
  "data": { /* ProcessDefinition 对象 */ }
}
```

### ProcessDefinition 核心字段（startInfo 场景）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | Integer | 流程定义ID |
| `processKey` | String | Flowable 流程标识（BPMN 中 process 的 id） |
| `processName` | String | 流程名称 |
| `processDescription` | String | 流程描述 |
| `version` | String | 当前发布版本号，如 `"1"`、`"2"` |
| `status` | String | 流程定义状态：`"0"` 草稿 / `"1"` 已发布 / `"-1"` 已停用 |
| `createBy` | String | 创建人用户ID |
| `createByName` | String | 创建人昵称（运行时回填） |
| `createTime` | String | 创建时间（`yyyy-MM-dd HH:mm:ss`） |
| `updateTime` | String | 更新时间 |
| **`startForm`** | **TaskFormVO** | **发起流程时的表单配置（核心字段，见下文）** |

---

## TaskFormVO — 表单渲染数据

| 字段 | 类型 | 说明 |
|---|---|---|
| `editable` | boolean | 当前用户是否可编辑。**发起场景固定为 `true`** |
| `nodeForm` | DynamicForm | **节点表单**：startEvent 绑定的表单模板（含字段定义、权限、分组、联动规则） |
| `globalForm` | DynamicForm | **全局表单**：仅当 startEvent 配置了 `inheritMainForm=1` 且全局表单与节点表单**不是同一个表单**时才有值；否则为 `null` |

> **前端处理建议**：优先展示 `nodeForm`，如果 `globalForm` 不为空则同时展示（通常全局表单放在上方或折叠展示）。

---

## DynamicForm — 表单模板

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | String | 表单模板ID（UUID） |
| `name` | String | 表单名称 |
| `description` | String | 表单描述 |
| `version` | String | 表单版本号，如 `"1"`、`"DRAFT"` |
| `status` | String | 表单状态：`"0"` 草稿 / `"1"` 已发布 / `"-1"` 已停用 |
| `createBy` | String | 表单创建人ID |
| `createByName` | String | 创建人昵称（运行时回填） |
| `createTime` | String | 创建时间 |
| `updateTime` | String | 更新时间 |
| `formInstanceId` | String | 表单实例ID。**`startInfo` 中通常为 `null`**（尚未创建实例，发起后才会生成） |
| `formFields` | List<DynamicFormField> | **未分组字段列表** |
| `groups` | List<DynamicFormFieldGroup> | **字段分组列表**，每个分组内有自己的 `fields` |
| `linkageRules` | List<DynamicFormLinkageRule> | **联动规则列表**，控制字段间的显示/隐藏/必填等联动行为 |

---

## DynamicFormField — 表单项（字段）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | String | 字段数据库ID（UUID） |
| `fieldId` | String | **前端字段标识**，提交表单数据时的 key（如 `"amount"`、`"reason"`） |
| `formId` | String | 所属表单ID |
| `groupId` | String | 所属分组ID，未分组时为 `null` |
| `version` | String | 表单版本 |
| `title` | String | 字段标题（页面显示的 label） |
| `type` | String | 字段类型枚举，如 `INPUT`、`SELECT`、`RADIO`、`DATE`、`UPLOAD`、`TABLE` 等 |
| `required` | String | 是否必填：`"1"` 必填 / `"0"` 选填 |
| `defaultValue` | Object | 默认值 |
| `placeholder` | String | 占位提示文本 |
| `options` | List<DynamicFormOption> | 单选/多选/下拉选项配置（仅 SELECT/RADIO/CHECKBOX 等类型有效） |
| `optionSource` | DynamicFormOptionSource | 选项远程数据源配置（API 方式获取选项时使用） |
| `minLength` | Integer | 最小长度/最少字符数（INPUT/TEXTAREA 等） |
| `maxLength` | Integer | 最大长度/最多字符数 |
| `min` | Integer | 最小值（NUMBER/SLIDER/RATE 等） |
| `max` | Integer | 最大值 |
| `pattern` | String | 正则表达式校验规则 |
| `patternTips` | String | 正则校验失败时的提示文案 |
| `span` | Integer | 字段宽度，1-24（基于 24 栅格） |
| `columns` | List<DynamicFormTableColumn> | 表格列定义（仅 `TABLE` 类型有效） |
| `props` | Object | 组件额外配置（如级联组件的 `checkStrictly` 等） |
| **`permission`** | **String** | **字段权限（运行时注入，不持久化）**：<br>`"VISIBLE"` 可见可编辑（默认）<br>`"READONLY"` 只读<br>`"HIDDEN"` 隐藏<br>`"REQUIRED"` 可见且必填 |
| **`value`** | **Object** | **当前实例值（运行时注入，不持久化）**。`startInfo` 中通常为 `null` 或 `defaultValue`（新建场景无历史数据） |

---

## DynamicFormFieldGroup — 字段分组

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | String | 分组ID |
| `formId` | String | 所属表单ID |
| `name` | String | 分组名称 |
| `collapsed` | String | 是否默认折叠：`"0"` 展开 / `"1"` 折叠 |
| `sort` | Integer | 排序号 |
| `fields` | List<DynamicFormField> | 该分组下的字段列表 |

---

## DynamicFormLinkageRule — 联动规则

| 字段 | 类型 | 说明 |
|---|---|---|
| `targetFieldId` | String | 目标字段标识（被控制的字段） |
| `actionType` | String | 动作类型：`SHOW`、`HIDE`、`REQUIRED`、`DISABLED`、`ENABLED`、`SET_VALUE`、`SET_SPAN`、`SET_PATTERN`、`OPTION` |
| `actionValue` | Object | 动作值（如 `SET_VALUE` 时要设置的值） |
| `conditionTree` | List<DynamicFormLinkageNode> | 条件树（AND/OR 组合条件） |

---

## DynamicFormLinkageNode — 联动条件节点

| 字段 | 类型 | 说明 |
|---|---|---|
| `nodeType` | String | 节点类型：`"AND"` / `"OR"` / `"CONDITION"` |
| `triggerFieldId` | String | 触发字段标识（条件字段） |
| `triggerCondition` | String | 条件运算符：`EQ`、`NE`、`GT`、`LT`、`GE`、`LE`、`IN`、`NOT_IN`、`EMPTY`、`NOT_EMPTY`、`REGEX` |
| `triggerValue` | Object | 触发值 |
| `children` | List<DynamicFormLinkageNode> | 子节点（AND/OR 节点使用） |

---

## 响应示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 71,
    "processKey": "leave-approval",
    "processName": "请假审批",
    "processDescription": "员工请假申请流程",
    "version": "1",
    "status": "1",
    "createBy": "1",
    "createByName": "系统管理员",
    "createTime": "2025-05-20 10:30:00",
    "updateTime": "2025-05-28 14:20:00",
    "startForm": {
      "editable": true,
      "nodeForm": {
        "id": "form-uuid-001",
        "name": "请假申请表单",
        "version": "1",
        "status": "1",
        "formInstanceId": null,
        "formFields": [
          {
            "id": "field-uuid-001",
            "fieldId": "leaveType",
            "title": "请假类型",
            "type": "SELECT",
            "required": "1",
            "placeholder": "请选择请假类型",
            "options": [
              { "label": "事假", "value": "personal" },
              { "label": "病假", "value": "sick" }
            ],
            "span": 12,
            "permission": "VISIBLE",
            "value": null
          }
        ],
        "groups": [
          {
            "id": "group-uuid-001",
            "name": "基本信息",
            "collapsed": "0",
            "sort": 0,
            "fields": [
              {
                "id": "field-uuid-002",
                "fieldId": "startDate",
                "title": "开始日期",
                "type": "DATE",
                "required": "1",
                "span": 12,
                "permission": "VISIBLE",
                "value": null
              }
            ]
          }
        ],
        "linkageRules": [
          {
            "targetFieldId": "endDate",
            "actionType": "SHOW",
            "conditionTree": [
              {
                "nodeType": "CONDITION",
                "triggerFieldId": "leaveType",
                "triggerCondition": "EQ",
                "triggerValue": "sick"
              }
            ]
          }
        ]
      },
      "globalForm": null
    }
  }
}
```

---

## 前端使用要点

1. **表单渲染**：根据 `nodeForm.formFields` 和 `nodeForm.groups` 渲染表单。`formFields` 中的字段平铺展示，`groups` 中的字段按分组展示。
2. **字段权限**：根据每个字段的 `permission` 值控制组件状态：
   - `VISIBLE` / `REQUIRED` -> 正常展示，可编辑
   - `READONLY` -> 展示但禁用输入
   - `HIDDEN` -> 不渲染该字段
3. **联动规则**：解析 `linkageRules`，当用户操作触发字段时，根据条件树计算目标字段的显隐/必填/禁用等状态。
4. **数据提交**：用户填写完成后，将字段值按 `fieldId` 为 key 组装成 Map，通过 `nodeFormData` 提交到 `/processInstance/start`。
5. **全局表单**：如果 `globalForm` 有值，同样渲染展示；提交时放入 `globalFormData`。
