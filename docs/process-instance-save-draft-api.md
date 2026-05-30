# 保存草稿接口文档

## 接口基本信息

| 项 | 内容 |
|---|---|
| **接口路径** | `/processInstance/saveDraft` |
| **请求方式** | `POST` |
| **Content-Type** | `application/json` |
| **接口作用** | 新建或更新草稿流程实例。不启动 Flowable 引擎，仅保存自建实例和表单数据 |

---

## 请求参数（RequestBody）

参数类型：`ProcessHandleParam`

### 必填字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `processDefinitionId` | Integer | 流程定义ID（`cat_process_definition.id`），用于确定草稿对应的流程 |

### 可选字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `processInstanceId` | Integer | 自建流程实例ID。不传表示**新建草稿**；传入表示**更新已有草稿** |
| `title` | String | 流程标题（如"请假申请-张三"）。不传则标题为空 |
| `nodeFormData` | Map<String, Object> | 节点表单数据。key 为 `fieldId`，value 为字段值。不传则不更新表单数据 |
| `globalFormData` | Map<String, Object> | 全局表单数据。仅当流程配置了 `inheritMainForm=1` 且全局表单与节点表单不同时传入 |

### saveDraft 场景下不需要的字段

以下字段在 `ProcessHandleParam` 中存在，但**保存草稿时无需传入**，接口内部不会使用：

| 字段 | 说明 |
|---|---|
| `taskId` | Flowable 任务ID，草稿状态尚无任务 |
| `remark` | 备注/审批意见，草稿场景无审批动作 |
| `targetNodeId` | 驳回目标节点ID，草稿场景不涉及 |

---

## 新建草稿 vs 更新草稿

### 新建草稿（`processInstanceId` 不传）

- 后端新建一条 `cat_process_instance` 记录
- `processStatus` 固定为 `"0"`（草稿）
- 创建表单实例并写入 `nodeFormData` / `globalFormData`
- 返回新生成的 `ProcessInstance`

### 更新草稿（`processInstanceId` 传入）

- 后端校验该草稿存在且属于当前登录人
- 更新 `processDefinitionId`、`title`、`updateTime`
- 更新表单数据（覆盖写入，未传的字段保持原值）
- 返回更新后的 `ProcessInstance`

---

## 请求示例

### 新建草稿（最小请求）

```json
{
  "processDefinitionId": 71
}
```

### 新建草稿（带标题和表单数据）

```json
{
  "processDefinitionId": 71,
  "title": "请假申请-2025-05-29",
  "nodeFormData": {
    "leaveType": "personal",
    "startDate": "2025-05-30",
    "reason": "家中有事"
  }
}
```

### 更新草稿（传入 processInstanceId）

```json
{
  "processInstanceId": 500,
  "processDefinitionId": 71,
  "title": "请假申请-2025-05-29（已修改）",
  "nodeFormData": {
    "leaveType": "sick",
    "reason": "感冒"
  }
}
```

---

## 响应结构

返回 `HttpResult<ProcessInstance>`

### ProcessInstance 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | Integer | 自建流程实例ID（`cat_process_instance.id`） |
| `processDefinitionId` | Integer | 流程定义ID |
| `title` | String | 流程标题（传入的值） |
| `code` | String | 流程编号。**草稿状态下为 `null`**，发起后才会生成 |
| `processInstanceId` | String | Flowable 流程实例ID。**草稿状态下为 `null`** |
| `processStatus` | String | 流程状态，固定为 `"0"`（草稿） |
| `createBy` | String | 创建人（申请人）用户ID |
| `createByName` | String | 创建人昵称（运行时回填） |
| `createTime` | String | 创建时间（`yyyy-MM-dd HH:mm:ss`） |
| `updateTime` | String | 更新时间 |
| `taskId` | String | 当前任务ID，草稿状态下为 `null` |
| `taskName` | String | 当前任务名称，草稿状态下为 `null` |
| `buttonActions` | List<String> | 可用按钮动作，草稿状态下为 `null` |
| `processHandleInfoList` | List<ProcessHandleInfo> | 处理记录，草稿状态下为 `null` |
| `timeline` | List<ProcessTimelineNode> | 时间线，草稿状态下为 `null` |
| `taskForm` | TaskFormVO | 任务表单，草稿状态下为 `null` |

---

## 响应示例

### 新建草稿响应

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 500,
    "processDefinitionId": 71,
    "title": "请假申请-2025-05-29",
    "code": null,
    "processInstanceId": null,
    "processStatus": "0",
    "createBy": "1",
    "createByName": "系统管理员",
    "createTime": "2025-05-29 09:30:00",
    "updateTime": "2025-05-29 09:30:00",
    "taskId": null,
    "taskName": null,
    "buttonActions": null,
    "processHandleInfoList": null,
    "timeline": null,
    "taskForm": null
  }
}
```

### 更新草稿响应

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 500,
    "processDefinitionId": 71,
    "title": "请假申请-2025-05-29（已修改）",
    "code": null,
    "processInstanceId": null,
    "processStatus": "0",
    "createBy": "1",
    "createByName": "系统管理员",
    "createTime": "2025-05-29 09:30:00",
    "updateTime": "2025-05-29 10:15:00",
    "taskId": null,
    "taskName": null,
    "buttonActions": null,
    "processHandleInfoList": null,
    "timeline": null,
    "taskForm": null
  }
}
```

---

## 异常说明

| 异常场景 | 错误提示 |
|---|---|
| 流程定义不存在 | `流程定义不存在: {processDefinitionId}` |
| 流程定义未发布 | `流程定义未发布: {processDefinitionId}` |
| 草稿不存在（更新时） | `草稿不存在: {processInstanceId}` |
| 草稿状态不对（更新时） | `该流程实例不是草稿状态: {processInstanceId}` |
| 无权更新他人草稿 | `无权更新他人草稿: {processInstanceId}` |
| 当前未登录 | `当前未登录` |

---

## 与 start 接口的区别

| 维度 | saveDraft | start |
|---|---|---|
| 是否启动 Flowable 引擎 | 否 | 是 |
| `processStatus` | `"0"` 草稿 | `"1"` 审批中 |
| `code` | `null` | 自动生成 |
| `processInstanceId` | `null` | Flowable 生成 |
| `processInstanceId` 入参 | 可选（传则更新） | 不需要 |
| 表单必填校验 | 不校验（`skipRequired=true`） | 校验必填（`skipRequired=false`） |
| 审批记录 | 无 | 生成一条 "申请" 记录 |

---

## 前端调用时序建议

1. 用户点击"保存草稿" → 调 `/processInstance/saveDraft`
   - 若 `processInstanceId` 有值则更新，无值则新建
2. 保存成功后前端保留返回的 `id`，用于后续更新同一份草稿
3. 用户后续点击"提交"时，用该 `id` 调 `/processInstance/start`（注意：start 目前入参是 `ProcessHandleParam`，需传入 `processDefinitionId`）
