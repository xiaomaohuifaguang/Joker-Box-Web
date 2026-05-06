# 动态表单 - 接口文档

> 作者：小猫会发光
> 日期：2026-05-05

## 基本信息

| 项 | 值 |
| --- | --- |
| 接口前缀 | `/dynamicForm` |
| Tag | dynamicForm |

---

## 1. 添加表单

### 基本信息

| 项 | 值 |
| --- | --- |
| 接口路径 | `/dynamicForm/add` |
| 请求方式 | `POST` |
| Content-Type | `application/json`（`@RequestBody`） |
| Service | `DynamicFormService#add` |
| 事务 | `@Transactional(rollbackFor = Exception.class)` |

### 请求参数（DynamicForm）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | String | 是 | 表单名称 |
| description | String | 否 | 描述 |
| formFields | List<DynamicFormField> | 否 | 表单项定义 |
| linkageRules | List<DynamicFormLinkage> | 否 | 字段联动规则 |

#### DynamicFormField 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| fieldId | String | 是 | 前端设计id，同一表单内不可重复 |
| title | String | 是 | 标题 |
| type | DynamicFormFieldType | 是 | 类型：INPUT/NUMBER/SELECT/MULTISELECT/RADIO/CHECKBOX/DATE/DATETIME/TIME/SWITCH/TEXTAREA/UPLOAD/RATE/SLIDER/COLOR/CASCADER/MULTICASCADER |
| required | String | 否 | `1` 必填，`0` 非必填 |
| defaultValue | String | 否 | 默认值 |
| placeholder | String | 否 | 提示文案 |
| options | List<DynamicFormOption> | 否 | 单选/多选/下拉选项 |
| minLength | Integer | 否 | 最小长度 |
| maxLength | Integer | 否 | 最大长度 |
| min | Integer | 否 | 最小值（NUMBER类型） |
| max | Integer | 否 | 最大值（NUMBER类型） |
| pattern | String | 否 | 正则表达式 |
| patternTips | String | 否 | 正则校验失败提示 |
| span | Integer | 否 | 宽度 1-24，默认24 |

#### DynamicFormLinkage（联动规则）字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| triggerFieldId | String | 是 | 触发字段 fieldId |
| triggerCondition | String | 是 | 条件：EQ/NE/GT/LT/GE/LE/IN/NOT_IN/EMPTY/NOT_EMPTY/REGEX |
| triggerValue | Object | 否 | 触发值 |
| actionType | String | 是 | 动作：SHOW/HIDE/REQUIRED/DISABLED/ENABLED |
| targetFieldId | String | 是 | 目标字段 fieldId |
| actionValue | Object | 否 | 动作参数 |
| sortOrder | Integer | 否 | 执行顺序，默认按数组索引 |

### 请求示例

```http
POST /dynamicForm/add
Content-Type: application/json

{
  "name": "入职申请表",
  "description": "新员工入职信息登记",
  "formFields": [
    {
      "fieldId": "name",
      "title": "姓名",
      "type": "INPUT",
      "required": "1",
      "span": 12
    },
    {
      "fieldId": "age",
      "title": "年龄",
      "type": "NUMBER",
      "required": "1",
      "min": 18,
      "max": 60,
      "span": 12
    }
  ],
  "linkageRules": [
    {
      "triggerFieldId": "type",
      "triggerCondition": "EQ",
      "triggerValue": "其他",
      "actionType": "SHOW",
      "targetFieldId": "remark",
      "sortOrder": 0
    }
  ]
}
```

### 响应数据（HttpResult<Void>）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | long | `200` 成功，`-1` 失败 |
| data | Void | 无业务数据 |

### 异常情况

| 触发条件 | 异常 |
| --- | --- |
| fieldId 重复 | `IllegalArgumentException("表单项 fieldId 存在重复")` |
| 表单项校验失败 | `IllegalArgumentException("表单项校验失败: {title}")` |
| 未登录 | `IllegalStateException("当前未登录")` |

---

## 2. 删除表单

### 基本信息

| 项 | 值 |
| --- | --- |
| 接口路径 | `/dynamicForm/remove` |
| 请求方式 | `POST` |
| Content-Type | `application/json`（`@RequestBody`） |
| Service | `DynamicFormService#delete` |
| 事务 | `@Transactional(rollbackFor = Exception.class)` |

### 请求参数

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | String | 是 | 表单id |

### 请求示例

```http
POST /dynamicForm/remove
Content-Type: application/json

{
  "id": "abc123"
}
```

### 响应数据（HttpResult<Void>）

### 异常情况

| 触发条件 | 说明 |
| --- | --- |
| 表单不存在 | 返回失败 |
| 表单已发布 | 只有草稿(status=0)可删除 |
| 非本人创建 | 返回失败 |

---

## 3. 修改表单

### 基本信息

| 项 | 值 |
| --- | --- |
| 接口路径 | `/dynamicForm/update` |
| 请求方式 | `POST` |
| Content-Type | `application/json`（`@RequestBody`） |
| Service | `DynamicFormService#update` |
| 事务 | `@Transactional(rollbackFor = Exception.class)` |

### 请求参数（DynamicForm）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | String | 是 | 表单id |
| name | String | 否 | 新名称 |
| description | String | 否 | 新描述 |
| formFields | List<DynamicFormField> | 否 | 新表单项（覆盖旧版本） |
| linkageRules | List<DynamicFormLinkage> | 否 | 新联动规则（覆盖旧版本） |

> 更新时会自动将版本号+1，旧版本的表单项和联动规则会被软删除。

### 请求示例

```http
POST /dynamicForm/update
Content-Type: application/json

{
  "id": "abc123",
  "name": "入职申请表V2",
  "formFields": [
    {
      "fieldId": "name",
      "title": "姓名",
      "type": "INPUT",
      "required": "1"
    }
  ]
}
```

### 异常情况

| 触发条件 | 说明 |
| --- | --- |
| 表单不存在 | 返回失败 |
| 表单已发布 | 只有草稿(status=0)可修改 |
| 非本人创建 | 返回失败 |

---

## 4. 表单详情

### 基本信息

| 项 | 值 |
| --- | --- |
| 接口路径 | `/dynamicForm/info` |
| 请求方式 | `POST` |
| Content-Type | `application/json`（`@RequestBody`） |
| Service | `DynamicFormService#info` |

### 请求参数

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | String | 是 | 表单id |
| version | String | 否 | 版本号，不传返回最新版本 |

### 请求示例

```http
POST /dynamicForm/info
Content-Type: application/json

{
  "id": "abc123",
  "version": "2"
}
```

### 响应数据（HttpResult<DynamicForm>）

返回的 `DynamicForm` 包含 `formFields`（表单项列表）和 `linkageRules`（联动规则列表）。

### 响应示例

```json
{
  "code": 200,
  "data": {
    "id": "abc123",
    "name": "入职申请表V2",
    "version": "2",
    "status": "0",
    "formFields": [
      {
        "fieldId": "name",
        "title": "姓名",
        "type": "INPUT",
        "required": "1"
      }
    ],
    "linkageRules": [
      {
        "triggerFieldId": "type",
        "triggerCondition": "EQ",
        "triggerValue": "其他",
        "actionType": "SHOW",
        "targetFieldId": "remark",
        "sortOrder": 0
      }
    ]
  }
}
```

---

## 5. 分页查询

### 基本信息

| 项 | 值 |
| --- | --- |
| 接口路径 | `/dynamicForm/queryPage` |
| 请求方式 | `POST` |
| Content-Type | `application/json`（`@RequestBody`） |
| Service | `DynamicFormService#queryPage` |

### 请求参数（PageParam）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| pageNum | long | 否 | 页码，默认1 |
| pageSize | long | 否 | 页大小，默认10 |

### 请求示例

```http
POST /dynamicForm/queryPage
Content-Type: application/json

{
  "pageNum": 1,
  "pageSize": 10
}
```

### 响应数据（HttpResult<Page<DynamicForm>>）

---

## 6. 发布表单

### 基本信息

| 项 | 值 |
| --- | --- |
| 接口路径 | `/dynamicForm/deploy` |
| 请求方式 | `POST` |
| Content-Type | `application/x-www-form-urlencoded`（`@RequestParam`） |
| Service | `DynamicFormService#deploy` |
| 事务 | `@Transactional(rollbackFor = Exception.class)` |

### 请求参数

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| formId | String | 是 | 表单id |

### 请求示例

```http
POST /dynamicForm/deploy?formId=abc123
```

### 异常情况

| 触发条件 | 说明 |
| --- | --- |
| 表单不存在 | 返回失败 |
| 非草稿状态 | 只有 status=0 可发布 |
| 非本人创建 | 返回失败 |

---

## 7. 停用表单

### 基本信息

| 项 | 值 |
| --- | --- |
| 接口路径 | `/dynamicForm/stop` |
| 请求方式 | `POST` |
| Content-Type | `application/x-www-form-urlencoded`（`@RequestParam`） |
| Service | `DynamicFormService#stop` |
| 事务 | `@Transactional(rollbackFor = Exception.class)` |

### 请求参数

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| formId | String | 是 | 表单id |

### 请求示例

```http
POST /dynamicForm/stop?formId=abc123
```

### 异常情况

| 触发条件 | 说明 |
| --- | --- |
| 表单不存在 | 返回失败 |
| 非发布状态 | 只有 status=1 可停用 |
| 非本人创建 | 返回失败 |

---

## 8. 提交表单数据

### 基本信息

| 项 | 值 |
| --- | --- |
| 接口路径 | `/dynamicForm/submit` |
| 请求方式 | `POST` |
| Content-Type | `application/json`（`@RequestBody`） |
| Service | `DynamicFormService#submit` |
| 事务 | `@Transactional(rollbackFor = Exception.class)` |

### 请求参数（FormData）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| formId | String | 是 | 表单id |
| version | String | 否 | 版本号，不传使用表单最新版本 |
| formInstanceId | String | 否 | 表单实例id，传则更新，不传则新建 |
| data | Map<String, Object> | 是 | 表单数据，key 为 fieldId |

### 请求示例

```http
POST /dynamicForm/submit
Content-Type: application/json

{
  "formId": "abc123",
  "version": "2",
  "formInstanceId": "inst-001",
  "data": {
    "name": "张三",
    "age": 25,
    "type": "其他",
    "remark": "特殊情况说明"
  }
}
```

### 业务流程

1. 校验表单存在且已发布（status=1）
2. 获取对应版本的表单项和联动规则
3. 执行联动规则计算字段最终状态（显隐/必填/禁用）
4. 字段级校验：必填、长度、数值范围、正则
5. 被 `HIDE` 或 `DISABLED` 的字段跳过必填校验
6. 新建或更新表单实例和字段值

### 响应数据（HttpResult<Void>）

### 异常情况

| 触发条件 | 异常 |
| --- | --- |
| 表单不存在 | `IllegalArgumentException("表单不存在: {id}")` |
| 表单未发布 | `IllegalStateException("表单未发布, 无法提交: {id}")` |
| 表单模板为空 | `IllegalStateException("表单模板为空, 无法提交: {id}")` |
| 必填字段为空 | `IllegalArgumentException("{title} 必填")` |
| 长度超限 | `IllegalArgumentException("{title} 长度不能大于/小于 {n}")` |
| 数值超限 | `IllegalArgumentException("{title} 不能大于/小于 {n}")` |
| 正则不匹配 | `IllegalArgumentException("{patternTips}")` |
| 未登录 | `IllegalStateException("当前未登录")` |
