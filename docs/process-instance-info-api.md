# 流程实例详情接口文档

## 接口基本信息

| 项 | 内容 |
|---|---|
| **接口路径** | `/processInstance/info` |
| **请求方式** | `POST` |
| **Content-Type** | `application/x-www-form-urlencoded`（传参）或 query string |
| **接口作用** | 查询流程实例详情，含审批轨迹、时间线、当前任务及表单数据 |

---

## 请求参数

| 参数名 | 类型 | 是否必填 | 说明 |
|---|---|---|---|
| `id` | Integer | **是** | 自建流程实例ID（`cat_process_instance.id`） |
| `taskId` | String | 否 | Flowable 任务ID。传与不传，返回内容差异极大（见下文） |

---

## 传值影响范围（核心）

`taskId` 传与不传，决定了接口返回的内容边界，是调用本接口时最需要关注的点。

### 场景一：传了 `taskId`（审批中任务查看）

适用场景：用户从待办列表点击进入审批页面。

后端行为：
1. 校验 `taskId` 对应的任务是否存在
2. 校验该任务是否属于当前流程实例（防止串改）
3. 判断当前登录人是否为该任务的 **办理人（assignee）** 或 **候选人（candidate）**
4. 如果是，设置 `taskId`、`taskName`，并返回 `taskForm`（含字段定义、权限、已填值）
5. `taskForm.editable = true`，前端可渲染为可编辑表单

返回内容：
- ✅ 基本信息（`id`、`title`、`code`、`processStatus` 等）
- ✅ 审批记录（`processHandleInfoList`）
- ✅ 时间线（`timeline`）
- ✅ 当前任务信息（`taskId`、`taskName`）
- ✅ **任务表单（`taskForm`）**

### 场景二：不传 `taskId`，且流程状态为 **草稿（`processStatus = "0"`）**

适用场景：用户从草稿列表点击进入继续编辑。

后端行为：
1. 解析 BPMN 获取 startEvent 的 `nodeId`
2. 调用 `buildTaskForm` 加载 startEvent 绑定的表单模板
3. 回填草稿已保存的表单实例数据
4. `taskForm.editable = true`

返回内容：
- ✅ 基本信息
- ❌ 审批记录（草稿无审批动作，为 `null`）
- ❌ 时间线（草稿无节点流转，为 `null`）
- ❌ 当前任务信息（草稿无任务，为 `null`）
- ✅ **草稿表单（`taskForm`）**

### 场景三：不传 `taskId`，且流程状态为 **审批中（`processStatus = "1"`）**

适用场景：用户查看流程详情（非处理人，或仅想看基本信息）。

后端行为：
1. 不校验任务权限
2. 不组装表单数据

返回内容：
- ✅ 基本信息
- ✅ 审批记录
- ✅ 时间线
- ❌ 当前任务信息（为 `null`）
- ❌ **任务表单（`taskForm` 为 `null`）**

### 场景四：不传 `taskId`，且流程状态为 **已完成（`processStatus = "2"`）** 或 **已终止（`processStatus = "3"`）**

返回内容同场景三，表单为 `null`。

---

## 响应结构

返回 `HttpResult<ProcessInstance>`

### ProcessInstance 字段详解

| 字段 | 类型 | 说明 | 不同场景下的表现 |
|---|---|---|---|
| `id` | Integer | 自建流程实例ID | 始终有值 |
| `processDefinitionId` | Integer | 流程定义ID | 始终有值 |
| `title` | String | 流程标题 | 始终有值（发起/保存时传入） |
| `code` | String | 流程编号（如 `LC-20250529-0001`） | 草稿为 `null`，发起后生成 |
| `processInstanceId` | String | Flowable 流程实例ID | 草稿为 `null`，发起后生成 |
| `processStatus` | String | 流程状态：`"0"` 草稿 / `"1"` 审批中 / `"2"` 已完成 / `"3"` 已终止 | 始终有值 |
| `processDefinitionName` | String | 流程定义名称（运行时回填） | 始终有值 |
| `createBy` | String | 创建人（申请人）用户ID | 始终有值 |
| `createByName` | String | 创建人昵称（运行时回填） | 始终有值 |
| `createTime` | String | 创建时间（`yyyy-MM-dd HH:mm:ss`） | 始终有值 |
| `updateTime` | String | 更新时间 | 始终有值 |
| `taskId` | String | 当前任务ID | **仅传 `taskId` 且当前用户有权限时有值**；否则 `null` |
| `taskName` | String | 当前任务名称 | **仅传 `taskId` 且当前用户有权限时有值**；否则 `null` |
| `buttonActions` | List<String> | 当前任务可用的按钮动作 | 任务场景下由 BPMN 配置决定；其他场景 `null` |
| `processHandleInfoList` | List<ProcessHandleInfo> | 流程处理记录（申请、通过、拒绝、驳回、认领等） | 草稿为 `null`；有审批动作后回填 |
| `timeline` | List<ProcessTimelineNode> | 流程节点时间线，按节点分组展示审批轨迹 | 草稿为 `null`；有审批动作后回填 |
| `taskForm` | TaskFormVO | **任务/草稿表单渲染数据** | 见上文的四种场景分析 |

---

## ProcessHandleInfo — 审批处理记录

`processHandleInfoList` 中的单条记录：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | Integer | 记录ID |
| `processInstanceId` | Integer | 自建流程实例ID |
| `taskId` | String | Flowable 任务ID |
| `taskName` | String | 任务名称 |
| `taskDefinitionKey` | String | 任务节点定义Key |
| `handleType` | String | 处理类型：`apply`（申请）、`pass`（通过）、`reject`（拒绝）、`back`（驳回）、`claim`（认领） |
| `handleUser` | String | 处理人用户ID |
| `handleUserName` | String | 处理人昵称 |
| `handleTime` | String | 处理时间 |
| `remark` | String | 备注/审批意见 |
| `round` | Integer | 节点轮次（驳回后重新经过该节点时递增） |

---

## ProcessTimelineNode — 时间线节点

`timeline` 中的单条记录：

| 字段 | 类型 | 说明 |
|---|---|---|
| `nodeId` | String | 节点定义Key（startEvent 为 `"_start"`） |
| `nodeName` | String | 节点名称 |
| `round` | Integer | 轮次 |
| `nodeStatus` | String | 节点状态：`"completed"`（已处理完）/ `"active"`（待处理中） |
| `startTime` | String | 节点开始时间 |
| `endTime` | String | 节点结束时间（无结束动作时为 `null`） |
| `handlers` | List<ProcessHandleInfo> | 该节点下的所有处理记录 |

---

## TaskFormVO — 表单渲染数据

`taskForm` 的结构详见 [startInfo 接口文档](process-definition-start-info-api.md)，此处仅列出关键差异：

| 场景 | `editable` | `nodeForm` | `globalForm` |
|---|---|---|---|
| 传 `taskId` + 有权限 | `true` | 当前任务节点表单（含已填值） | 继承的全局表单（含已填值） |
| 草稿（不传 `taskId`） | `true` | startEvent 节点表单（含草稿值） | 继承的全局表单（含草稿值） |
| 其他（不传 `taskId`） | — | `null` | `null` |

---

## 响应示例

### 示例一：审批中，传 `taskId`（办理人视角）

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 501,
    "processDefinitionId": 71,
    "title": "请假申请-2025-05-29",
    "code": "LC-20250529-0005",
    "processInstanceId": "a1b2c3d4-59fc-11f1-8b01-00ffe9eaf737",
    "processStatus": "1",
    "processDefinitionName": "请假审批",
    "createBy": "1",
    "createByName": "张三",
    "createTime": "2025-05-29 09:30:00",
    "updateTime": "2025-05-29 10:00:00",
    "taskId": "e83f9eb7-59fc-11f1-8b01-00ffe9eaf737",
    "taskName": "部门经理审批",
    "buttonActions": ["pass", "reject", "back"],
    "processHandleInfoList": [
      {
        "id": 1,
        "taskName": "申请",
        "handleType": "apply",
        "handleUserName": "张三",
        "handleTime": "2025-05-29 09:30:00",
        "remark": "申请请假"
      }
    ],
    "timeline": [
      {
        "nodeId": "_start",
        "nodeName": "申请",
        "round": 1,
        "nodeStatus": "completed",
        "handlers": [ { "handleType": "apply", "handleUserName": "张三" } ]
      },
      {
        "nodeId": "manager_approval",
        "nodeName": "部门经理审批",
        "round": 1,
        "nodeStatus": "active",
        "handlers": []
      }
    ],
    "taskForm": {
      "editable": true,
      "nodeForm": { /* 当前任务节点绑定的表单 */ },
      "globalForm": null
    }
  }
}
```

### 示例二：草稿，不传 `taskId`（继续编辑视角）

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 500,
    "processDefinitionId": 71,
    "title": "请假申请-2025-05-29（草稿）",
    "code": null,
    "processInstanceId": null,
    "processStatus": "0",
    "processDefinitionName": "请假审批",
    "createBy": "1",
    "createByName": "张三",
    "createTime": "2025-05-29 09:30:00",
    "updateTime": "2025-05-29 09:30:00",
    "taskId": null,
    "taskName": null,
    "buttonActions": null,
    "processHandleInfoList": null,
    "timeline": null,
    "taskForm": {
      "editable": true,
      "nodeForm": {
        "id": "form-uuid-001",
        "name": "请假申请表单",
        "formFields": [
          {
            "fieldId": "leaveType",
            "title": "请假类型",
            "type": "SELECT",
            "permission": "VISIBLE",
            "value": "personal"
          }
        ]
      },
      "globalForm": null
    }
  }
}
```

### 示例三：审批中，不传 `taskId`（仅查看基本信息）

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 501,
    "processDefinitionId": 71,
    "title": "请假申请-2025-05-29",
    "code": "LC-20250529-0005",
    "processInstanceId": "a1b2c3d4-59fc-11f1-8b01-00ffe9eaf737",
    "processStatus": "1",
    "processDefinitionName": "请假审批",
    "createBy": "1",
    "createByName": "张三",
    "createTime": "2025-05-29 09:30:00",
    "updateTime": "2025-05-29 10:00:00",
    "taskId": null,
    "taskName": null,
    "buttonActions": null,
    "processHandleInfoList": [ /* 审批记录 */ ],
    "timeline": [ /* 时间线 */ ],
    "taskForm": null
  }
}
```

---

## 前端调用时序建议

### 草稿列表 → 草稿详情

```
草稿列表页 → 点击草稿
  ↓
调 /processInstance/info?id={draftId}（不传 taskId）
  ↓
展示 taskForm（可编辑）+ "保存草稿"/"提交" 按钮
```

### 待办列表 → 审批页面

```
待办列表页 → 点击任务
  ↓
调 /processInstance/info?id={instanceId}&taskId={taskId}
  ↓
展示 taskForm（editable=true 时可编辑）+ 审批按钮（pass/reject/back）
```

### 已办/我发起的 → 流程详情（仅查看）

```
列表页 → 点击记录
  ↓
调 /processInstance/info?id={instanceId}（不传 taskId）
  ↓
展示基本信息 + timeline + processHandleInfoList
  ↓
taskForm 为 null，不展示表单编辑区域
```

---

## 异常说明

| 异常场景 | 错误提示 |
|---|---|
| 流程实例不存在 | `流程实例不存在: {id}` |
| 任务不存在（taskId 传错） | `任务不存在: {taskId}` |
| 任务不属于该实例 | 不抛错，但不返回 taskForm |
| 当前用户无任务权限 | 不抛错，但不设置 taskId/taskName，仍返回 taskForm（只读） |
| 当前未登录 | `当前未登录` |
