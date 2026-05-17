# 动态表单 - 后端验证规范文档

> 作者：Claude Code
> 日期：2026-05-14
> 版本：v1
> 适用范围：**发布接口 (`/dynamicForm/deploy`) 的强制后端校验**；保存接口 (`/dynamicForm/add`、`/dynamicForm/update`) 的前端校验已同步实现，后端可仅做轻量兜底或信任前端。

---

## 一、概述

本文档定义动态表单在**发布前**必须通过的完整后端验证规则。发布接口 (`/dynamicForm/deploy`) 在执行版本复制前，必须调用本规范定义的一系列校验方法，任一校验失败即阻止发布，并返回具体错误信息。

校验范围涵盖：
1. 表单基础信息
2. 字段分组配置
3. 表单字段配置（按类型差异化校验）
4. 联动规则配置（条件树 + 动作）
5. 字段间一致性校验

---

## 二、验证入口

### 2.1 调用时机

| 接口 | 时机 | 说明 |
|------|------|------|
| `POST /dynamicForm/deploy` | 复制为新版本前 | **必须完整校验**，不通过则返回错误 |
| `POST /dynamicForm/add` | 保存前 | 前端已完整校验，后端可选轻量校验 |
| `POST /dynamicForm/update` | 保存前 | 前端已完整校验，后端可选轻量校验 |

### 2.2 验证执行顺序

```
Step 1: 表单基础信息校验
Step 2: 分组配置校验（如有 groups）
Step 3: 字段配置校验（遍历所有字段）
Step 4: 字段 ID 唯一性校验
Step 5: 联动规则校验
Step 6: 联动与字段一致性校验
Step 7: 字段类型与联动动作兼容性校验
```

任一 Step 失败，立即返回错误，不再继续后续校验。

---

## 三、Step 1：表单基础信息校验

### 3.1 校验规则

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `name` | 非空，去除首尾空格后长度 `1-64` | 表单名称不能为空 / 表单名称长度不能超过64字符 |
| `name` | 不能仅包含空白字符 | 表单名称不能为空 |
| `description` | 可选，如有则长度 `0-500` | 表单描述长度不能超过500字符 |

### 3.2 Java 伪代码

```java
public void validateBasicInfo(DynamicForm form) {
    String name = form.getName();
    if (name == null || name.trim().isEmpty()) {
        throw new IllegalArgumentException("表单名称不能为空");
    }
    if (name.trim().length() > 64) {
        throw new IllegalArgumentException("表单名称长度不能超过64字符");
    }
    if (form.getDescription() != null && form.getDescription().length() > 500) {
        throw new IllegalArgumentException("表单描述长度不能超过500字符");
    }
}
```

---

## 四、Step 2：分组配置校验

### 4.1 存在性判断

- 若请求传入 `groups` 且非空 → 进入分组校验
- 若请求传入 `formFields` 平铺列表 → 跳过分组校验，进入字段校验
- 两者都为空 → 报错：`至少需要配置一个表单字段`

### 4.2 分组字段校验规则

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `id` | 非空，去除首尾空格后非空 | 分组ID不能为空 |
| `name` | 非空，去除首尾空格后长度 `1-32` | 分组名称不能为空 / 分组名称长度不能超过32字符 |
| `sort` | 可选，整数类型 | — |
| `collapsed` | 可选，只能是 `"0"` 或 `"1"` | 分组折叠状态只能是 0（展开）或 1（折叠） |
| `fields` | 每个分组至少包含一个字段 | 分组 "{name}" 至少需要包含一个字段 |
| `fields` 内字段 | 同 Step 3 字段校验 | 见下方字段校验 |

### 4.3 分组 ID 唯一性

- 所有分组的 `id` 在表单内必须唯一
- 冲突时报错：`分组ID重复: {id}`

### 4.4 分组与字段关联校验

- 若通过 `groups` 传入，字段的 `groupId` 必须与所属分组 `id` 一致
- 若存在 `groupId` 指向不存在的分组 → 报错：`字段 {fieldId} 引用的分组 {groupId} 不存在`

### 4.5 Java 伪代码

```java
public void validateGroups(List<DynamicFormFieldGroup> groups) {
    if (groups == null || groups.isEmpty()) return;

    Set<String> groupIds = new HashSet<>();
    for (DynamicFormFieldGroup group : groups) {
        // id 校验
        if (group.getId() == null || group.getId().trim().isEmpty()) {
            throw new IllegalArgumentException("分组ID不能为空");
        }
        if (groupIds.contains(group.getId())) {
            throw new IllegalArgumentException("分组ID重复: " + group.getId());
        }
        groupIds.add(group.getId());

        // name 校验
        if (group.getName() == null || group.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("分组名称不能为空");
        }
        if (group.getName().trim().length() > 32) {
            throw new IllegalArgumentException("分组名称长度不能超过32字符");
        }

        // collapsed 校验
        if (group.getCollapsed() != null
            && !"0".equals(group.getCollapsed())
            && !"1".equals(group.getCollapsed())) {
            throw new IllegalArgumentException("分组折叠状态只能是 0（展开）或 1（折叠）");
        }

        // fields 非空校验
        if (group.getFields() == null || group.getFields().isEmpty()) {
            throw new IllegalArgumentException("分组 \"" + group.getName() + "\" 至少需要包含一个字段");
        }
    }
}
```

---

## 五、Step 3：字段配置校验

### 5.1 通用字段校验（所有类型都适用）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `fieldId` | 非空，格式 `^[a-zA-Z][a-zA-Z0-9_]{0,31}$` | 字段ID不能为空 / 字段ID格式错误：以字母开头，仅含字母数字下划线，最长32字符 |
| `title` | 非空，去除首尾空格后长度 `1-32` | 字段标题不能为空 / 字段标题长度不能超过32字符 |
| `type` | 必须是指定枚举值之一 | 字段类型无效: {type} |
| `span` | 可选，整数 `1-24` | 字段宽度 span 需在 1-24 之间 |
| `sort` | 可选，整数 | — |
| `required` | 可选，只能是 `"1"` 或 `"0"` | 必填标识只能是 1（必填）或 0（选填） |
| `pattern` | 可选，如有则必须是合法正则表达式 | 字段 "{title}" 的正则表达式无效 |
| `patternTips` | 可选，长度 `0-64` | 正则提示长度不能超过64字符 |
| `placeholder` | 可选，长度 `0-128` | 占位提示长度不能超过128字符 |

**字段类型枚举（FormFieldType）：**
```
INPUT, NUMBER, SELECT, MULTISELECT, RADIO, CHECKBOX,
DATE, DATETIME, TIME, DATERANGE, SWITCH, TEXTAREA,
UPLOAD, RATE, SLIDER, COLOR, CASCADER, MULTICASCADER
```

### 5.2 按字段类型的差异化校验

#### 5.2.1 INPUT（文本输入）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `minLength` | 可选，`>= 0` | 最小长度不能为负数 |
| `maxLength` | 可选，`>= 1`，若同时有 `minLength` 则 `maxLength >= minLength` | 最大长度不能小于最小长度 |
| `defaultValue` | 可选，字符串类型 | — |

#### 5.2.2 NUMBER（数字输入）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `min` | 可选，数值 | — |
| `max` | 可选，数值，若有 `min` 则 `max >= min` | 最大值不能小于最小值 |
| `defaultValue` | 可选，必须是数字或可解析为数字 | 默认值必须是数字 |

#### 5.2.3 SELECT / RADIO（单选类）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `options` | **必填**，至少一个选项 | 字段 "{title}" 缺少选项 |
| `options[].label` | 非空，长度 `1-64` | 选项标签不能为空 |
| `options[].value` | 非空 | 选项值不能为空 |
| `defaultValue` | 可选，必须在 `options` 的 value 中 | 默认值不在选项列表中 |

#### 5.2.4 MULTISELECT / CHECKBOX（多选类）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `options` | **必填**，至少一个选项 | 字段 "{title}" 缺少选项 |
| `options[].label` | 非空 | 选项标签不能为空 |
| `options[].value` | 非空 | 选项值不能为空 |
| `min` | 可选，`>= 0`，最少勾选数 | 最少勾选数不能为负数 |
| `max` | 可选，`>= 1`，最多勾选数，若有 `min` 则 `max >= min` | 最多勾选数不能小于最少勾选数 |
| `defaultValue` | 可选，必须是数组，每个元素在 options value 中 | 默认值格式错误或包含无效选项 |

#### 5.2.5 CASCADER / MULTICASCADER（级联选择）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `options` | **必填**，至少一个选项 | 字段 "{title}" 缺少选项 |
| `options[].label` | 非空 | 选项标签不能为空 |
| `options[].value` | 非空 | 选项值不能为空 |
| `options[].children` | 可选，子选项结构同父选项 | 级联选项子项格式错误 |

级联选项递归校验：
```java
public void validateCascaderOptions(List<DynamicFormOption> options, int depth) {
    if (depth > 10) {
        throw new IllegalArgumentException("级联选项嵌套层级不能超过10层");
    }
    for (DynamicFormOption opt : options) {
        if (opt.getLabel() == null || opt.getLabel().trim().isEmpty()) {
            throw new IllegalArgumentException("选项标签不能为空");
        }
        if (opt.getValue() == null || opt.getValue().toString().trim().isEmpty()) {
            throw new IllegalArgumentException("选项值不能为空");
        }
        if (opt.getChildren() != null && !opt.getChildren().isEmpty()) {
            validateCascaderOptions(opt.getChildren(), depth + 1);
        }
    }
}
```

#### 5.2.6 DATE / DATETIME / TIME / DATERANGE（时间类）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `defaultValue` | 可选，字符串，格式校验 | — |
| `DATERANGE` | `defaultValue` 应为数组（开始、结束） | 日期区间默认值应为数组 |

#### 5.2.7 SWITCH（开关）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `defaultValue` | 可选，布尔类型 | — |

#### 5.2.8 TEXTAREA（多行文本）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `minLength` | 可选，`>= 0` | 最小长度不能为负数 |
| `maxLength` | 可选，`>= 1` | — |
| `min` | 可选，显示最小行数，`>= 1` | 最小行数不能小于1 |
| `max` | 可选，显示最大行数，`>= min` | 最大行数不能小于最小行数 |

#### 5.2.9 UPLOAD（文件上传）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `maxLength` | 可选，表示最多上传数量，`>= 1` | 最多上传数量不能小于1 |
| `defaultValue` | 不支持 | — |

#### 5.2.10 RATE（评分）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `max` | 可选，最大分值，`>= 1` | 最大分值不能小于1 |
| `defaultValue` | 可选，数值，`0 <= value <= max` | 默认值超出评分范围 |

#### 5.2.11 SLIDER（滑块）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `min` | 可选，最小值 | — |
| `max` | 可选，最大值，`> min` | 最大值必须大于最小值 |
| `defaultValue` | 可选，数值，`min <= value <= max` | 默认值超出滑块范围 |

#### 5.2.12 COLOR（颜色选择）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `defaultValue` | 可选，字符串，如 `#FF0000` | — |

### 5.3 字段配置校验汇总表

| 字段类型 | 需 options | 支持 min/max | 支持 minLength/maxLength | 支持 pattern | 支持 defaultValue |
|----------|-----------|-------------|-------------------------|-------------|------------------|
| INPUT | 否 | 否 | 是 | 是 | 是（字符串） |
| NUMBER | 否 | 是 | 否 | 否 | 是（数字） |
| SELECT | **是** | 否 | 否 | 否 | 是（单值） |
| MULTISELECT | **是** | 否 | 否 | 否 | 是（数组） |
| RADIO | **是** | 否 | 否 | 否 | 是（单值） |
| CHECKBOX | **是** | 是（勾选数） | 否 | 否 | 是（数组） |
| DATE | 否 | 否 | 否 | 否 | 是（字符串） |
| DATETIME | 否 | 否 | 否 | 否 | 是（字符串） |
| TIME | 否 | 否 | 否 | 否 | 是（字符串） |
| DATERANGE | 否 | 否 | 否 | 否 | 是（数组） |
| SWITCH | 否 | 否 | 否 | 否 | 是（布尔） |
| TEXTAREA | 否 | 是（行数） | 是 | 是 | 是（字符串） |
| UPLOAD | 否 | 否 | maxLength=数量 | 否 | 否 |
| RATE | 否 | 是（分值） | 否 | 否 | 是（数字） |
| SLIDER | 否 | 是 | 否 | 否 | 是（数字） |
| COLOR | 否 | 否 | 否 | 否 | 是（字符串） |
| CASCADER | **是** | 否 | 否 | 否 | 是（单值/数组） |
| MULTICASCADER | **是** | 否 | 否 | 否 | 是（数组） |

---

## 六、Step 4：字段 ID 唯一性校验

### 6.1 校验规则

- 表单内所有字段的 `fieldId` 必须全局唯一（跨分组也唯一）
- 冲突时报错：`字段ID重复: {fieldId}`

### 6.2 Java 伪代码

```java
public void validateFieldIdUniqueness(List<DynamicFormField> allFields) {
    Set<String> fieldIds = new HashSet<>();
    for (DynamicFormField field : allFields) {
        if (fieldIds.contains(field.getFieldId())) {
            throw new IllegalArgumentException("字段ID重复: " + field.getFieldId());
        }
        fieldIds.add(field.getFieldId());
    }
}
```

---

## 七、Step 5：联动规则校验

### 7.1 联动规则整体结构

```json
{
  "linkageRules": [
    {
      "id": null,
      "name": "规则名称",
      "targetFieldId": "目标字段ID",
      "actionType": "SHOW",
      "actionValue": null,
      "enable": true,
      "sortOrder": 0,
      "conditionTree": [
        {
          "nodeType": "AND",
          "children": [
            {
              "nodeType": "CONDITION",
              "triggerFieldId": "触发字段ID",
              "triggerCondition": "EQ",
              "triggerValue": "触发值"
            }
          ]
        }
      ]
    }
  ]
}
```

### 7.2 单条规则校验

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `targetFieldId` | **必填** | 联动规则 #{index} 缺少目标字段 |
| `actionType` | **必填**，必须是动作枚举之一 | 联动规则 #{index} 动作类型无效: {actionType} |
| `enable` | 可选，布尔类型 | — |
| `sortOrder` | 可选，整数 | — |
| `conditionTree` | **必填**，至少一个元素，根节点必须是 `AND` 或 `OR` | 联动规则 #{index} 缺少条件配置 |

**动作类型枚举（LinkageAction）：**
```
SHOW, HIDE, REQUIRED, DISABLED, ENABLED, SET_PATTERN, SET_SPAN, OPTION, VALUE
```

### 7.3 条件树递归校验

条件树节点分为两类：
- **逻辑节点**：`nodeType = "AND"` 或 `"OR"`
- **条件节点**：`nodeType = "CONDITION"`

#### 7.3.1 逻辑节点校验

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `nodeType` | 必须是 `AND` / `OR` | 条件节点类型无效: {nodeType} |
| `children` | **必填**，至少一个子节点 | 逻辑节点 #{path} 缺少子节点 |
| `children` | 递归校验每个子节点 | — |

#### 7.3.2 条件节点校验

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `nodeType` | 必须是 `CONDITION` | — |
| `triggerFieldId` | **必填** | 条件节点 #{path} 缺少触发字段 |
| `triggerCondition` | **必填**，必须是条件枚举之一 | 条件节点 #{path} 条件运算符无效: {triggerCondition} |
| `triggerValue` | `EMPTY` / `NOT_EMPTY` 时可为空，其他情况建议非空 | 条件节点 #{path} 缺少触发值 |

**条件运算符枚举（LinkageCondition）：**
```
EQ, NE, GT, LT, GE, LE, IN, NOT_IN, EMPTY, NOT_EMPTY, REGEX
```

### 7.4 条件值类型与运算符兼容性

| 运算符 | triggerValue 类型 | 校验规则 |
|--------|------------------|----------|
| `EQ` / `NE` | 字符串/数字/布尔 | — |
| `GT` / `LT` / `GE` / `LE` | 数字 | 必须是可解析为数字的值 |
| `IN` / `NOT_IN` | 数组 | 必须是数组，至少一个元素 |
| `EMPTY` / `NOT_EMPTY` | 忽略 | triggerValue 可为 null |
| `REGEX` | 字符串 | 必须是合法的正则表达式 |

### 7.5 动作参数校验

| 动作类型 | actionValue 规则 | 错误信息 |
|----------|-----------------|----------|
| `SHOW` / `HIDE` / `ENABLED` | 应为 null 或忽略 | — |
| `REQUIRED` | 布尔类型，默认 true | actionValue 必须是布尔值 |
| `DISABLED` | 布尔类型，默认 true | actionValue 必须是布尔值 |
| `SET_PATTERN` | 对象 `{"pattern": "...", "patternTips": "..."}`，pattern 必须是合法正则 | 正则表达式无效 |
| `SET_SPAN` | 整数 `1-24` | span 需在 1-24 之间 |
| `OPTION` | 选项数组 | 选项格式错误 |
| `VALUE` | 任意值 | — |

### 7.6 Java 伪代码

```java
public void validateLinkageRules(List<DynamicFormLinkageRule> rules, Set<String> fieldIds) {
    if (rules == null || rules.isEmpty()) return;

    for (int i = 0; i < rules.size(); i++) {
        DynamicFormLinkageRule rule = rules.get(i);
        int idx = i + 1;

        // targetFieldId
        if (rule.getTargetFieldId() == null || rule.getTargetFieldId().trim().isEmpty()) {
            throw new IllegalArgumentException("联动规则 #" + idx + " 缺少目标字段");
        }

        // actionType
        List<String> validActions = Arrays.asList(
            "SHOW", "HIDE", "REQUIRED", "DISABLED", "ENABLED",
            "SET_PATTERN", "SET_SPAN", "OPTION", "VALUE"
        );
        if (!validActions.contains(rule.getActionType())) {
            throw new IllegalArgumentException("联动规则 #" + idx + " 动作类型无效: " + rule.getActionType());
        }

        // conditionTree
        if (rule.getConditionTree() == null || rule.getConditionTree().isEmpty()) {
            throw new IllegalArgumentException("联动规则 #" + idx + " 缺少条件配置");
        }

        // 递归校验 conditionTree
        validateConditionNode(rule.getConditionTree().get(0), idx, ".conditionTree[0]", fieldIds);

        // actionValue 类型校验
        validateActionValue(rule, idx);
    }
}

private void validateConditionNode(DynamicFormLinkageNode node, int ruleIdx, String path, Set<String> fieldIds) {
    if (node == null) return;

    String nodeType = node.getNodeType();
    if ("AND".equals(nodeType) || "OR".equals(nodeType)) {
        List<DynamicFormLinkageNode> children = node.getChildren();
        if (children == null || children.isEmpty()) {
            throw new IllegalArgumentException("联动规则 #" + ruleIdx + path + " 逻辑节点缺少子节点");
        }
        for (int i = 0; i < children.size(); i++) {
            validateConditionNode(children.get(i), ruleIdx, path + ".children[" + i + "]", fieldIds);
        }
    } else if ("CONDITION".equals(nodeType)) {
        if (node.getTriggerFieldId() == null || node.getTriggerFieldId().trim().isEmpty()) {
            throw new IllegalArgumentException("联动规则 #" + ruleIdx + path + " 缺少触发字段");
        }
        if (node.getTriggerCondition() == null || node.getTriggerCondition().trim().isEmpty()) {
            throw new IllegalArgumentException("联动规则 #" + ruleIdx + path + " 缺少条件运算符");
        }

        // REGEX 校验
        if ("REGEX".equals(node.getTriggerCondition())) {
            if (node.getTriggerValue() == null) {
                throw new IllegalArgumentException("联动规则 #" + ruleIdx + path + " REGEX 条件缺少触发值");
            }
            try {
                Pattern.compile(String.valueOf(node.getTriggerValue()));
            } catch (PatternSyntaxException e) {
                throw new IllegalArgumentException("联动规则 #" + ruleIdx + path + " 正则表达式无效");
            }
        }
    } else {
        throw new IllegalArgumentException("联动规则 #" + ruleIdx + path + " 节点类型无效: " + nodeType);
    }
}

private void validateActionValue(DynamicFormLinkageRule rule, int idx) {
    String actionType = rule.getActionType();
    Object actionValue = rule.getActionValue();

    if ("SET_PATTERN".equals(actionType) && actionValue != null) {
        String pattern;
        if (actionValue instanceof Map) {
            pattern = (String) ((Map<?, ?>) actionValue).get("pattern");
        } else {
            pattern = String.valueOf(actionValue);
        }
        if (pattern != null && !pattern.isEmpty()) {
            try {
                Pattern.compile(pattern);
            } catch (PatternSyntaxException e) {
                throw new IllegalArgumentException("联动规则 #" + idx + " 正则表达式无效");
            }
        }
    }

    if ("SET_SPAN".equals(actionType) && actionValue != null) {
        int span;
        if (actionValue instanceof Map) {
            span = ((Number) ((Map<?, ?>) actionValue).get("span")).intValue();
        } else {
            span = ((Number) actionValue).intValue();
        }
        if (span < 1 || span > 24) {
            throw new IllegalArgumentException("联动规则 #" + idx + " 的 span 需在 1-24 之间");
        }
    }
}
```

---

## 八、Step 6：联动与字段一致性校验

### 8.1 目标字段存在性

- `targetFieldId` 必须存在于表单的所有字段中
- 不存在时报错：`联动规则 #{index} 的目标字段 "{fieldId}" 不存在`

### 8.2 触发字段存在性

- 条件树中所有 `CONDITION` 节点的 `triggerFieldId` 必须存在于表单字段中
- 不存在时报错：`联动规则 #{index}{path} 的触发字段 "{fieldId}" 不存在`

### 8.3 自引用校验

- 条件节点的 `triggerFieldId` 不能等于同条规则的 `targetFieldId`
- 即字段不能通过联动规则控制自己
- 违规时报错：`联动规则 #{index}{path} 触发字段与目标字段相同`

### 8.4 Java 伪代码

```java
public void validateLinkageFieldConsistency(
        List<DynamicFormLinkageRule> rules,
        Set<String> fieldIds) {
    if (rules == null) return;

    for (int i = 0; i < rules.size(); i++) {
        DynamicFormLinkageRule rule = rules.get(i);
        int idx = i + 1;

        // 目标字段存在性
        if (!fieldIds.contains(rule.getTargetFieldId())) {
            throw new IllegalArgumentException(
                "联动规则 #" + idx + " 的目标字段 \"" + rule.getTargetFieldId() + "\" 不存在");
        }

        // 递归校验触发字段存在性和自引用
        validateTriggerField(rule.getConditionTree().get(0), idx,
            ".conditionTree[0]", fieldIds, rule.getTargetFieldId());
    }
}

private void validateTriggerField(DynamicFormLinkageNode node, int ruleIdx, String path,
        Set<String> fieldIds, String targetFieldId) {
    if (node == null) return;

    if ("CONDITION".equals(node.getNodeType())) {
        String triggerId = node.getTriggerFieldId();
        if (triggerId != null) {
            if (!fieldIds.contains(triggerId)) {
                throw new IllegalArgumentException(
                    "联动规则 #" + ruleIdx + path + " 的触发字段 \"" + triggerId + "\" 不存在");
            }
            if (triggerId.equals(targetFieldId)) {
                throw new IllegalArgumentException(
                    "联动规则 #" + ruleIdx + path + " 触发字段与目标字段相同");
            }
        }
    } else {
        List<DynamicFormLinkageNode> children = node.getChildren();
        if (children != null) {
            for (int i = 0; i < children.size(); i++) {
                validateTriggerField(children.get(i), ruleIdx,
                    path + ".children[" + i + "]", fieldIds, targetFieldId);
            }
        }
    }
}
```

---

## 九、Step 7：字段类型与联动动作兼容性校验

### 9.1 各字段类型支持的动作类型

| 字段类型 | 支持的动作 |
|----------|-----------|
| 所有类型 | SHOW, HIDE, REQUIRED, DISABLED, ENABLED, SET_SPAN |
| INPUT, TEXTAREA | + SET_PATTERN, VALUE |
| SELECT, MULTISELECT, RADIO, CHECKBOX, CASCADER, MULTICASCADER | + OPTION, VALUE |
| NUMBER, SLIDER, RATE, DATE, DATETIME, TIME, DATERANGE, COLOR, SWITCH | + VALUE |
| UPLOAD | 仅 SHOW, HIDE, REQUIRED, DISABLED, ENABLED, SET_SPAN（不支持 VALUE） |

### 9.2 兼容性校验规则

- 对于每条联动规则，根据 `targetFieldId` 找到对应字段的类型
- 检查 `actionType` 是否在该类型支持的动作列表中
- 不支持时报错：`联动规则 #{index} 动作 "{actionType}" 不支持目标字段类型 "{fieldType}"`

### 9.3 Java 伪代码

```java
public void validateActionCompatibility(
        List<DynamicFormLinkageRule> rules,
        Map<String, String> fieldIdToTypeMap) {
    if (rules == null) return;

    // 定义各类型支持的动作
    Set<String> commonActions = Set.of("SHOW", "HIDE", "REQUIRED", "DISABLED", "ENABLED", "SET_SPAN");
    Set<String> withValueActions = new HashSet<>(commonActions);
    withValueActions.add("VALUE");

    for (int i = 0; i < rules.size(); i++) {
        DynamicFormLinkageRule rule = rules.get(i);
        int idx = i + 1;
        String fieldType = fieldIdToTypeMap.get(rule.getTargetFieldId());
        if (fieldType == null) continue; // 已在 Step 8 中校验

        Set<String> validActions = new HashSet<>(withValueActions);

        if ("UPLOAD".equals(fieldType)) {
            validActions = new HashSet<>(commonActions); // UPLOAD 不支持 VALUE
        } else if ("INPUT".equals(fieldType) || "TEXTAREA".equals(fieldType)) {
            validActions.add("SET_PATTERN");
        } else if (Set.of("SELECT", "MULTISELECT", "RADIO", "CHECKBOX", "CASCADER", "MULTICASCADER")
                .contains(fieldType)) {
            validActions.add("OPTION");
        }

        if (!validActions.contains(rule.getActionType())) {
            throw new IllegalArgumentException(
                "联动规则 #" + idx + " 动作 \"" + rule.getActionType()
                + "\" 不支持目标字段类型 \"" + fieldType + "\"");
        }
    }
}
```

---

## 十、完整验证流程（发布接口）

### 10.1 验证顺序图

```
┌─────────────────────────────────────────────────────────────┐
│                    /dynamicForm/deploy                        │
│                        发布接口                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 1: 表单基础信息校验                                      │
│   - name 非空，长度 1-64                                     │
│   - description 长度 0-500                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: 分组配置校验（如有 groups）                            │
│   - 分组 id 非空且唯一                                        │
│   - 分组 name 非空，长度 1-32                                │
│   - collapsed 只能是 0/1                                     │
│   - 每个分组至少一个字段                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: 字段配置校验                                          │
│   - 通用校验（fieldId格式、title、type、span、required等）     │
│   - 按类型差异化校验（options、min/max、pattern等）           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: 字段 ID 唯一性校验                                    │
│   - 所有 fieldId 全局唯一                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: 联动规则结构校验                                      │
│   - targetFieldId、actionType 必填                           │
│   - conditionTree 非空，递归校验节点                          │
│   - actionValue 类型校验                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: 联动与字段一致性校验                                   │
│   - targetFieldId 存在于字段列表                               │
│   - triggerFieldId 存在于字段列表                              │
│   - 不允许自引用（trigger == target）                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 7: 字段类型与动作兼容性校验                               │
│   - actionType 必须支持目标字段类型                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                        全部通过 → 执行发布
```

### 10.2 完整 Java 校验入口

```java
@Service
public class DynamicFormValidationService {

    public void validateBeforeDeploy(DynamicForm form) {
        // Step 1: 基础信息
        validateBasicInfo(form);

        // 收集所有字段
        List<DynamicFormField> allFields = new ArrayList<>();
        if (form.getGroups() != null && !form.getGroups().isEmpty()) {
            // Step 2: 分组校验
            validateGroups(form.getGroups());
            for (DynamicFormFieldGroup group : form.getGroups()) {
                allFields.addAll(group.getFields());
            }
        } else if (form.getFormFields() != null) {
            allFields.addAll(form.getFormFields());
        } else {
            throw new IllegalArgumentException("至少需要配置一个表单字段");
        }

        // Step 3: 字段配置校验
        for (DynamicFormField field : allFields) {
            validateField(field);
        }

        // Step 4: fieldId 唯一性
        validateFieldIdUniqueness(allFields);

        // 构建 fieldId 集合和类型映射
        Set<String> fieldIds = allFields.stream()
            .map(DynamicFormField::getFieldId)
            .collect(Collectors.toSet());
        Map<String, String> fieldIdToType = allFields.stream()
            .collect(Collectors.toMap(DynamicFormField::getFieldId, DynamicFormField::getType));

        // Step 5-7: 联动规则校验
        List<DynamicFormLinkageRule> rules = form.getLinkageRules();
        if (rules != null && !rules.isEmpty()) {
            validateLinkageRules(rules, fieldIds);
            validateLinkageFieldConsistency(rules, fieldIds);
            validateActionCompatibility(rules, fieldIdToType);
        }
    }
}
```

---

## 十一、错误码与返回格式

### 11.1 校验失败返回示例

```json
{
  "code": 400,
  "msg": "联动规则 #2 的目标字段 \"remark\" 不存在",
  "data": null
}
```

### 11.2 批量错误建议

若希望一次性返回所有错误（而非遇到第一个就停止），可改为：

```json
{
  "code": 400,
  "msg": "表单验证失败",
  "data": {
    "errors": [
      "表单名称不能为空",
      "字段ID重复: field_001",
      "联动规则 #1 的触发字段 \"field_xxx\" 不存在",
      "联动规则 #2 动作 \"SET_PATTERN\" 不支持目标字段类型 \"UPLOAD\""
    ]
  }
}
```

> 建议发布接口使用**立即停止**策略，add/update 接口可使用**批量收集**策略。

---

## 十二、注意事项

1. **字段 ID 格式**：前端生成规则为 `field_` + 随机字符串，后端校验时只需确保以字母开头、仅含字母数字下划线即可
2. **版本隔离**：发布时校验的是 DRAFT 版本的数据，校验通过后才复制为新版本
3. **停用表单重新发布**：`stop` 后表单状态变为 `-1`（已停用），重新编辑后再次发布时同样需要完整校验
4. **联动规则排序**：`sortOrder` 决定执行顺序，发布时建议按 sortOrder 重新排序后保存
5. **条件树根节点**：为了结构统一，conditionTree 的根节点必须且只能是 `AND` 或 `OR`，即使单条件也要包一层
6. **正则表达式**：前后端都要做正则合法性校验，避免前端传非法正则导致后端 Pattern.compile 抛异常
7. **options 格式**：级联选项支持 `children` 嵌套，后端存储时按 JSON 字符串存即可，但发布前要验证嵌套层级不超过 10 层防止恶意数据
8. **maxLength 语义**：UPLOAD 类型中 `maxLength` 表示最多上传文件数量，而非字符串长度
9. **前后端一致性**：前端保存时已执行与本文档完全相同的校验逻辑（见 `linkage.ts#validateTemplate`），后端发布校验作为最终安全兜底

---

## 十三、附录：前后端职责划分

### 13.1 职责总览

| 场景 | 前端 (`linkage.ts#validateTemplate`) | 后端 (`DynamicFormValidationService`) |
|------|--------------------------------------|---------------------------------------|
| **保存表单** `add` / `update` | 完整校验（Step 1~7），阻止非法保存请求 | 轻量兜底或信任前端 |
| **发布表单** `deploy` | 可选预校验（调用同一份 `validateTemplate`） | **强制完整校验**（Step 1~7），不通过拒绝发布 |
| **提交数据** `submit` | 运行时联动求值 + 字段级校验 | 联动求值 + 字段级校验（双保险） |

### 13.2 为什么这样划分

- **保存时前端拦**：用户在表单设计器编辑时，需要即时、详细的错误反馈（如 "字段ID格式错误"、"联动规则触发字段不存在"）。如果等保存到后端才报错，体验极差。
- **发布时后端拦**：发布是从草稿到正式版本的不可逆（或高成本可逆）操作，后端必须做最终确认。即使前端已校验，后端也不能信任前端数据（可能被绕过）。
- **双保险原则**：发布时后端校验与前端校验使用**同一套规则**，确保前后端行为一致。

### 13.3 前端校验入口

前端在以下位置调用 `validateTemplate`：

| 文件 | 调用时机 | 说明 |
|------|----------|------|
| `DynamicFormAddView.vue#add()` | 点击"确认添加"时 | 完整校验，失败则 `alert` 提示 |
| `DynamicFormInfoView.vue#save()` | 点击"保存修改"时 | 完整校验，失败则 `alert` 提示 |
| `IndexView.vue#deploy()`（可选） | 点击"发布"时 | 可先加载详情再校验，再调 deploy 接口 |

### 13.4 `validateTemplate` 函数签名

```typescript
// src/components/dynamicForm/linkage.ts
export const validateTemplate = (
    name: string,              // 表单名称
    fields: FormField[],       // 字段列表（平铺）
    linkages?: FormLinkageRule[], // 联动规则
    groups?: FormFieldGroup[], // 分组列表（可选）
    description?: string,      // 表单描述（可选）
): { ok: boolean; errors: string[] }
```

### 13.5 后端简化建议

若后端希望节省开发成本，可在 `add` / `update` 接口中仅保留以下**最小兜底校验**：

```java
// add / update 时的轻量校验
public void validateBeforeSave(DynamicForm form) {
    // 仅校验最基础的不为空
    if (form.getName() == null || form.getName().trim().isEmpty()) {
        throw new IllegalArgumentException("表单名称不能为空");
    }
    // 字段非空
    List<DynamicFormField> fields = extractAllFields(form);
    if (fields == null || fields.isEmpty()) {
        throw new IllegalArgumentException("至少需要一个表单字段");
    }
    // 其余校验信任前端
}
```

> **但 `deploy` 接口绝不可简化**，必须执行本文档 Step 1~7 的完整校验。
