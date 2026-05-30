# 动态表单远程选项数据源设计方案

## 1. 背景

当前动态表单中，`SELECT`、`MULTISELECT`、`RADIO`、`CHECKBOX`、`CASCADER`、`MULTICASCADER` 等字段依赖字段自身的 `options` 存储候选项。

后续存在用户、部门、字典、项目、业务对象等候选项来自接口的场景。当前阶段不做用户/部门专用字段，也不做固定模板能力，先实现一套通用的远程选项数据源配置，供适用字段复用。

用户/部门后期可以作为字段模板预置一份远程数据源配置，而不是新增特殊字段类型。

## 2. 目标

- 为适用字段支持 API 远程获取候选项。
- 保持现有静态 `options` 能力不变。
- 第一版不做用户/部门专用逻辑。
- 第一版不让后端表单提交强依赖远程接口可用性。
- 前端可根据统一配置加载 API 数据，并映射为现有 `DynamicFormOption[]`。
- 后端负责发布前配置校验和提交值结构校验。

## 3. 不做范围

第一版不做以下能力：

- 用户/部门专用字段类型。
- 用户/部门专用模板。
- 后端代理请求远程 API。
- 后端缓存远程候选项。
- 后端校验提交值是否存在于远程 API 返回值中。
- 远程接口鉴权配置。
- URL 白名单。
- 定时同步远程 options。

这些能力可以在远程选项数据源稳定后按需扩展。

## 4. 适用字段

远程选项数据源仅适用于有候选项概念的字段：

- `SELECT`
- `MULTISELECT`
- `RADIO`
- `CHECKBOX`
- `CASCADER`
- `MULTICASCADER`

不适用于：

- `INPUT`
- `NUMBER`
- `TEXTAREA`
- `DATE`
- `DATETIME`
- `TIME`
- `DATERANGE`
- `UPLOAD`
- `TABLE`
- `SWITCH`
- `RATE`
- `SLIDER`
- `COLOR`

## 5. 推荐数据模型

建议在 `DynamicFormField` 上新增独立字段 `optionSource`，不要放入 `props`。

原因：

- `props` 更适合组件行为配置，例如级联字段的 `checkStrictly`。
- `optionSource` 表达的是候选项数据来源，语义更清晰。
- 后端发布校验、提交校验、版本复制更容易独立处理。
- 后期字段模板可以直接复用该配置。

### 5.1 DynamicFormOptionSource

```java
public class DynamicFormOptionSource {
    private String type; // STATIC / API
    private String url;
    private String method; // GET / POST
    private Map<String, Object> params;
    private Map<String, String> headers;
    private DynamicFormOptionMapping mapping;
}
```

### 5.2 DynamicFormOptionMapping

```java
public class DynamicFormOptionMapping {
    private String listPath;
    private String labelPath;
    private String valuePath;
    private String childrenPath;
}
```

字段说明：

| 字段 | 说明 | 是否必填 |
| --- | --- | --- |
| `type` | 选项来源类型，`STATIC` 或 `API` | 否，空值按 `STATIC` 处理 |
| `url` | API 地址 | `API` 模式必填 |
| `method` | 请求方式，`GET` 或 `POST` | `API` 模式必填 |
| `params` | 请求参数 | 否 |
| `headers` | 请求头 | 否，第一版可以先不开放 |
| `mapping` | API 返回数据到选项结构的映射规则 | `API` 模式必填 |
| `listPath` | 候选项数组在响应中的路径 | 必填 |
| `labelPath` | 选项显示文本字段路径 | 必填 |
| `valuePath` | 选项值字段路径 | 必填 |
| `childrenPath` | 子选项字段路径 | 级联字段建议填写 |

## 6. 配置示例

### 6.1 静态选项

```json
{
  "type": "SELECT",
  "title": "性别",
  "optionSource": {
    "type": "STATIC"
  },
  "options": [
    {
      "label": "男",
      "value": "male"
    },
    {
      "label": "女",
      "value": "female"
    }
  ]
}
```

静态模式保持当前逻辑：

- 使用字段自身 `options`。
- 发布时校验 `options`。
- 提交时校验值必须存在于 `options`。

### 6.2 普通远程选项

```json
{
  "type": "SELECT",
  "title": "项目类型",
  "optionSource": {
    "type": "API",
    "url": "/api/common/options/project-types",
    "method": "GET",
    "params": {
      "enabled": true
    },
    "mapping": {
      "listPath": "data",
      "labelPath": "name",
      "valuePath": "code"
    }
  },
  "options": []
}
```

API 返回示例：

```json
{
  "code": 200,
  "data": [
    {
      "name": "研发项目",
      "code": "dev"
    },
    {
      "name": "实施项目",
      "code": "delivery"
    }
  ]
}
```

前端根据 `mapping` 转换为：

```json
[
  {
    "label": "研发项目",
    "value": "dev"
  },
  {
    "label": "实施项目",
    "value": "delivery"
  }
]
```

### 6.3 级联远程选项

```json
{
  "type": "CASCADER",
  "title": "组织",
  "optionSource": {
    "type": "API",
    "url": "/api/common/options/org-tree",
    "method": "GET",
    "mapping": {
      "listPath": "data",
      "labelPath": "name",
      "valuePath": "id",
      "childrenPath": "children"
    }
  },
  "options": [],
  "props": {
    "checkStrictly": false
  }
}
```

API 返回示例：

```json
{
  "code": 200,
  "data": [
    {
      "id": "1",
      "name": "总部",
      "children": [
        {
          "id": "1-1",
          "name": "研发部"
        }
      ]
    }
  ]
}
```

前端根据 `mapping` 转换为现有树形 `DynamicFormOption[]`。

## 7. 静态 options 与远程 optionSource 的关系

### 7.1 默认行为

`optionSource` 为空时，按现有静态 `options` 逻辑处理。

等价于：

```json
{
  "optionSource": {
    "type": "STATIC"
  }
}
```

### 7.2 `STATIC` 模式

- `options` 必须满足现有校验。
- 默认值必须存在于 `options` 中。
- 提交值必须存在于 `options` 中。

### 7.3 `API` 模式

- `options` 可以为空。
- 前端根据 `optionSource` 拉取候选项。
- 后端发布时校验 `optionSource` 配置是否合法。
- 后端提交时只校验值结构，不校验值是否存在于远程返回值中。

## 8. 后端发布前校验规则

### 8.1 通用校验

如果字段类型不在适用范围内，但配置了：

```json
{
  "optionSource": {
    "type": "API"
  }
}
```

发布失败：

```text
字段 "xxx" 不支持远程选项数据源
```

### 8.2 `type` 校验

`optionSource.type` 只允许：

- `STATIC`
- `API`

为空时按 `STATIC` 处理。

### 8.3 `STATIC` 校验

保持现有校验：

- `SELECT` / `RADIO` 必须配置有效 `options`。
- `MULTISELECT` / `CHECKBOX` 必须配置有效 `options`。
- `CASCADER` / `MULTICASCADER` 必须配置有效树形 `options`。
- 默认值必须存在于 `options` 或级联树中。

### 8.4 `API` 校验

`API` 模式发布时校验：

- `url` 不能为空。
- `method` 只能是 `GET` 或 `POST`。
- `mapping` 不能为空。
- `mapping.listPath` 不能为空。
- `mapping.labelPath` 不能为空。
- `mapping.valuePath` 不能为空。
- `CASCADER` / `MULTICASCADER` 建议配置 `mapping.childrenPath`。

第一版不建议发布时真实请求 API。

原因：

- 发布流程不应依赖远程接口稳定性。
- 远程接口可能需要登录态或上下文。
- 远程接口失败会导致表单无法发布。
- 后端代理、鉴权、白名单、缓存可以作为后续增强。

## 9. 后端提交实例校验规则

### 9.1 `STATIC` 模式

保持现有逻辑：

- `SELECT` / `RADIO`：值必须存在于 `options`。
- `MULTISELECT` / `CHECKBOX`：数组内每个值都必须存在于 `options`。
- `CASCADER`：路径必须存在于树形 `options`。
- `MULTICASCADER`：每条路径都必须存在于树形 `options`。

### 9.2 `API` 模式

提交时只校验值结构。

- `SELECT` / `RADIO`：非空时必须是单值。
- `MULTISELECT` / `CHECKBOX`：非空时必须是数组。
- `CASCADER`：非空时必须是一维数组路径。
- `MULTICASCADER`：非空时必须是二维数组路径。
- `required`、`min`、`max` 等现有约束继续生效。

不校验提交值是否存在于远程 API 返回值中。

原因：

- 远程候选项可能随时间变化。
- 历史提交值不应因为远程数据变化变成非法。
- 表单提交不应因为远程接口超时或不可用而失败。
- 第一版目标是稳定接入远程候选项，不引入强依赖。

后续如果需要强校验，可以扩展：

```json
{
  "type": "API",
  "url": "/api/common/options/users",
  "method": "GET",
  "validateRemoteValue": true
}
```

第一版暂不实现。

## 10. 前端处理约定

### 10.1 加载逻辑

前端渲染字段时：

1. 如果 `optionSource` 为空或 `optionSource.type = STATIC`：
   - 使用字段自身 `options`。

2. 如果 `optionSource.type = API`：
   - 根据 `url`、`method`、`params` 请求接口。
   - 根据 `mapping` 将接口结果转换成 `DynamicFormOption[]`。
   - 使用转换后的 options 渲染组件。

### 10.2 加载失败

远程 options 加载失败时，建议前端显示加载失败状态。

不建议静默降级为空数组，因为用户可能误以为该字段没有可选项。

### 10.3 映射后的统一结构

前端最终应统一转换成现有结构：

```json
{
  "label": "显示文本",
  "value": "提交值",
  "visible": true,
  "children": []
}
```

其中：

- `visible` 可选，默认 `true`。
- `children` 用于 `CASCADER` / `MULTICASCADER`。

## 11. 联动规则影响

当前 `OPTION` 动作用于动态设置候选项。

建议第一版保留 `OPTION` 动作对远程选项字段的支持，但需要明确前端优先级。

推荐优先级：

1. 联动 `OPTION` 动态设置的 options 优先。
2. 没有联动覆盖时，使用 `optionSource` 拉取远程 options。
3. `STATIC` 模式下使用字段自身 `options`。

这样后续可以支持类似：

- 选择项目类型后，动态改变项目列表。
- 选择组织后，动态改变人员列表。
- 选择业务分类后，动态改变业务对象候选项。

如果前端认为第一版处理复杂，也可以临时限制：

- `optionSource.type = API` 时不允许配置 `OPTION` 联动。

但从扩展性看，推荐保留能力，仅明确优先级。

## 12. 数据库变更建议

由于当前 `options`、`columns` 等 JSON 配置字段使用 `text + Fastjson2TypeHandler`，建议新增字段也使用 `text`，保持风格一致。

```sql
ALTER TABLE `cat_dynamic_form_field`
ADD COLUMN `option_source` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '选项远程数据源配置' AFTER `options`;
```

如果后续统一改造 JSON 字段，也可以再考虑使用 MySQL `json` 类型。

## 13. 版本复制要求

新增 `option_source` 后，必须同步修改字段版本复制逻辑。

`DynamicFormFieldMapper.copyVersion` 中需要同时复制：

- insert 字段列表中的 `option_source`
- select 字段列表中的 `option_source`

否则发布、停用、重新生成草稿时，远程数据源配置会丢失。

## 14. 用户/部门模板后续接入方式

用户/部门后续不需要成为特殊字段类型，可以作为字段模板。

### 14.1 用户选择模板

```json
{
  "type": "SELECT",
  "title": "用户",
  "optionSource": {
    "type": "API",
    "url": "/api/common/options/users",
    "method": "GET",
    "mapping": {
      "listPath": "data",
      "labelPath": "nickname",
      "valuePath": "id"
    }
  },
  "options": []
}
```

### 14.2 部门选择模板

```json
{
  "type": "CASCADER",
  "title": "部门",
  "optionSource": {
    "type": "API",
    "url": "/api/common/options/departments",
    "method": "GET",
    "mapping": {
      "listPath": "data",
      "labelPath": "name",
      "valuePath": "id",
      "childrenPath": "children"
    }
  },
  "options": []
}
```

模板只是预设字段配置，不影响动态表单核心字段类型。

## 15. 第一版推荐实现范围

第一版建议实现：

- 新增 `DynamicFormOptionSource`。
- 新增 `DynamicFormOptionMapping`。
- `DynamicFormField` 新增 `optionSource`。
- 数据库新增 `option_source` 字段。
- 字段版本复制时复制 `option_source`。
- 发布前校验 `optionSource` 配置。
- `API` 模式下允许适用字段的 `options` 为空。
- `API` 模式下提交时只校验值结构。
- 文档约定前端如何加载和映射远程 options。

## 16. 后续可扩展能力

远程选项能力稳定后，可以继续扩展：

- 后端代理远程 options 请求。
- URL 白名单。
- 后端统一鉴权。
- 远程 options 缓存。
- `validateRemoteValue` 强校验开关。
- 字段模板市场，例如用户、部门、角色、岗位、字典、项目等。
- 远程 options 依赖其他字段值动态传参。

## 17. 结论

当前阶段推荐方案：

```text
字段级 optionSource 配置 + 前端加载远程 options + 后端校验配置和提交结构
```

该方案改动小、风险低，并且不污染字段类型体系。用户、部门等业务对象后续可以作为字段模板复用这套通用配置。
