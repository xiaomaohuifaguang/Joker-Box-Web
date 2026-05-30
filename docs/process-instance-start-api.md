# 发起流程接口文档

## 接口基本信息

| 项 | 内容 |
|---|---|
| **接口路径** | `/processInstance/start` |
| **请求方式** | `POST` |
| **Content-Type** | `application/json` |
| **接口作用** | 根据流程定义发起一个新的流程实例，同时创建表单实例并写入表单数据 |

---

## 请求参数（RequestBody）

参数类型：`ProcessHandleParam`

### 必填字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `processDefinitionId` | Integer | 流程定义ID（`cat_process_definition.id`），用于确定发起哪个流程 |

### 可选字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `title` | String | 流程标题（如"请假申请-张三"）。不传则流程实例标题为空 |
| `nodeFormData` | Map<String, Object> | 节点表单数据。key 为 `fieldId`，value 为字段值。仅当 startEvent 绑定了表单且需要预填数据时传入 |
| `globalFormData` | Map<String, Object> | 全局表单数据。仅当 startEvent 配置了 `inheritMainForm=1` 且全局表单与节点表单不同时需要传入 |

### start 场景下不需要的字段

以下字段在 `ProcessHandleParam` 中存在，但**发起流程时无需传入**，接口内部不会使用：

| 字段 | 说明 |
|---|---|
| `processInstanceId` | 自建流程实例ID，start 场景下由后端生成 |
| `taskId` | Flowable 任务ID，start 场景下尚无任务 |
| `remark` | 备注/审批意见，start 场景无审批动作 |
| `targetNodeId` | 驳回目标节点ID，start 场景不涉及 |

---

## 请求示例

### 最小请求（无表单）

```json
{
  "processDefinitionId": 71
}
```

### 带标题和表单数据

```json
{
  "processDefinitionId": 71,
  "title": "请假申请-2025-05-29",
  "nodeFormData": {
    "leaveType": "personal",
    "startDate": "2025-05-30",
    "endDate": "2025-06-02",
    "reason": "家中有事"
  },
  "globalFormData": {
    "applicantName": "张三",
    "department": "技术部"
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
| `code` | String | 流程编号（后端自动生成，如 `LC-20250529-0001`） |
| `processInstanceId` | String | Flowable 流程实例ID（引擎生成） |
| `processStatus` | String | 流程状态：`"0"` 草稿 / `"1"` 审批中 / `"2"` 已完成 / `"3"` 已终止 |
| `createBy` | String | 创建人（申请人）用户ID |
| `createByName` | String | 创建人昵称（运行时回填） |
| `createTime` | String | 创建时间（`yyyy-MM-dd HH:mm:ss`） |
| `updateTime` | String | 更新时间 |
| `taskId` | String | 当前任务ID（发起时若无待办任务则为 `null`） |
| `taskName` | String | 当前任务名称 |
| `buttonActions` | List<String> | 当前任务可用的按钮动作（发起时通常为 `null`） |
| `processHandleInfoList` | List<ProcessHandleInfo> | 流程处理记录（发起时仅含申请记录） |
| `timeline` | List<ProcessTimelineNode> | 流程节点时间线 |
| `taskForm` | TaskFormVO | 任务表单渲染数据（发起时通常为 `null`，需调 `/info` 获取） |

---

## 响应示例

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

---

## 异常说明

| 异常场景 | 错误提示 |
|---|---|
| 流程定义不存在 | `流程定义不存在: {processDefinitionId}` |
| 流程定义未发布 | `流程定义未发布: {processDefinitionId}` |
| 当前未登录 | `当前未登录` |
| 表单数据校验失败（必填项未填） | `字段标题 必填` |

---

## 前端调用时序建议

1. 用户点击"发起流程" → 调 `/processDefinition/startInfo?processDefinitionId={id}` 获取表单模板
2. 用户填写表单 → 前端收集 `nodeFormData` 和 `globalFormData`
3. 用户点击"提交" → 调 `/processInstance/start` 传入 `processDefinitionId`、`title`、`nodeFormData`、`globalFormData`
4. 发起成功后跳转流程详情页 `/info?id={返回的id}`
