# 网关流向条件配置 — 前端设计文档

> 设计日期：2026-05-31
> 文档版本：v1.0
> 对应接口文档：docs/gateway-condition-api-v2.md

---

## 一、概述

为流程设计器的**排他网关（exclusiveGateway）**和**包容网关（inclusiveGateway）**出线添加条件配置能力。支持三种模式：

- **NATIVE**：JUEL 表达式直接输入
- **CUSTOM**：可视化规则树编辑器（AND/OR/CONDITION 嵌套）
- **默认走向**：无条件兜底路径

条件配置数据随流程定义保存时一起提交，不复用现有 `edge.properties.condition` 文本输入。

---

## 二、背景与现有状态

当前 `EdgePropertyPanel.vue` 对网关出线仅提供一个简单的 `condition` 文本输入框（`${approve}` 占位符），无模式切换、无可视化规则编辑、无字段选择。

`GatewayProperty.vue` 已支持选择默认流向，通过 `edge.properties.isDefaultFlow` 标记。

---

## 三、设计决策汇总

| 决策项 | 选择 | 说明 |
|---|---|---|
| UI 入口 | 属性面板 + 弹窗 | EdgePropertyPanel 显示摘要和入口，复杂编辑在弹窗中进行 |
| 规则树呈现 | 卡片/区块式 | AND/OR 用彩色边框卡片包裹，CONDITION 用行内表单 |
| 整体方案 | EdgePropertyPanel 扩展 | 增量改动，不破坏现有"点击线编线属性"习惯 |
| 数据存储 | edge.properties | 条件数据存于 LogicFlow edge 的 properties 中 |
| 保存派生 | 父组件遍历构建 | 保存前从 graphRawData.edges 提取并组装 gatewayConditions 数组 |
| 表单字段来源 | 复用现有接口 | 通过 `/dynamicForm/info` 获取表单字段列表 |

---

## 四、组件架构

### 4.1 文件清单

```
src/components/process-designer/
├── components/
│   ├── PropertyPanels/
│   │   └── EdgePropertyPanel.vue          # 扩展：增加条件配置区块
│   ├── GatewayConditionDialog.vue          # 新增：条件配置弹窗
│   ├── condition-editors/
│   │   ├── NativeConditionEditor.vue       # NATIVE 模式：JUEL 表达式输入
│   │   └── CustomConditionEditor.vue       # CUSTOM 模式：卡片式规则树
│   └── ConditionSummary.vue                # 新增：规则树文本摘要组件
```

### 4.2 组件职责

| 组件 | 职责 |
|---|---|
| `EdgePropertyPanel` | 检测 source 是否为网关，显示条件类型切换 + 对应模式的简要展示 + "配置条件"按钮 |
| `GatewayConditionDialog` | 弹窗容器，管理三种模式的切换和数据，底部确定/取消 |
| `NativeConditionEditor` | JUEL 表达式 `<el-input>` + 可用变量提示 |
| `CustomConditionEditor` | 递归渲染规则树，AND/OR 卡片 + CONDITION 行内表单，处理节点增删改 |
| `ConditionSummary` | 将 RuleTreeNode 渲染为一行可读文本摘要（用于 EdgePropertyPanel 预览） |

---

## 五、EdgePropertyPanel 扩展设计

### 5.1 显示条件

仅当 `edge.sourceNodeId` 对应的节点类型为 `bpmn:exclusiveGateway` 或 `bpmn:inclusiveGateway` 时显示条件配置区块。其他连线保持现状。

### 5.2 条件类型切换

三个 pill 按钮横向排列：
- **NATIVE**：显示 JUEL 表达式输入框（monospace 字体）+ 可用变量提示
- **CUSTOM**：显示 `ConditionSummary` 文本摘要 + "配置条件"按钮
- **默认走向**：显示绿色提示块，说明此线为默认分支

切换模式时清空当前配置（弹出确认对话框防止误操作）。

### 5.3 数据绑定

读取/写入 `props.data.properties.gatewayCondition`：

```typescript
interface GatewayConditionData {
  conditionType: 'NATIVE' | 'CUSTOM' | null
  isDefault: boolean
  nativeExpression?: string
  ruleTree?: RuleTreeNode
}
```

---

## 六、GatewayConditionDialog 弹窗设计

### 6.1 弹窗标题

格式：`条件配置 — {sequenceFlowId}（{sourceNodeId} → {targetNodeId}）`

帮助用户确认正在编辑哪条连线。

### 6.2 顶部模式切换

三个 tab 按钮：NATIVE 表达式 / CUSTOM 规则 / 默认走向。

切换时：
1. 如果当前模式有数据，弹出确认对话框"切换模式将清空当前条件，是否继续？"
2. 清空对应数据字段
3. 切换到新模式空白状态

### 6.3 NATIVE 模式（NativeConditionEditor）

- 单行 `<el-input>`，placeholder 为 `${amount > 10000}`
- 字体使用 monospace
- 下方显示"可用变量"区域，列出当前流程中可引用的变量名标签（点击可插入到光标位置）
- 变量来源：表单字段 fieldIds + 内置变量 `formData`, `__handler_dept`, `__handler_role`, `__prev_handler_dept`, `__prev_handler_role`

### 6.4 CUSTOM 模式（CustomConditionEditor）

#### 6.4.1 规则树结构

固定以 **AND** 为根节点，不可删除。根节点下可添加：
- **CONDITION 节点**：单条比较条件
- **AND 组**：可包含 CONDITION 和其他 AND/OR 组
- **OR 组**：可包含 CONDITION 和其他 AND/OR 组

#### 6.4.2 节点渲染

**AND/OR 组**：
- 顶部显示类型标签（AND 橙色 / OR 蓝色）+ "以下全部满足"/"以下任一满足"说明
- 右侧显示删除按钮（根 AND 不显示）
- 内部垂直排列子节点
- 底部显示添加按钮："+ 添加条件" / "+ 添加 AND 组" / "+ 添加 OR 组"

**CONDITION 节点（行内表单）**：
- `category` 下拉：`FORM_FIELD` | `HANDLER_DEPT` | `HANDLER_ROLE` | `PREV_HANDLER_DEPT` | `PREV_HANDLER_ROLE`
- `fieldKey`：
  - category = `FORM_FIELD` 时：下拉选择表单 fieldId（从流程绑定表单加载）
  - 其他 category 时：显示固定只读文本 `deptId` 或 `roleId`
- `operator` 下拉：EQ | NE | GT | LT | GE | LE | IN | NOT_IN | EMPTY | NOT_EMPTY | REGEX
- `value` 输入：
  - operator = EMPTY/NOT_EMPTY 时：隐藏输入或显示占位符
  - operator = IN/NOT_IN 时：提示 JSON 数组格式
  - 其他情况：普通文本输入
- 右侧删除按钮

#### 6.4.3 表单字段加载

当 category 选 `FORM_FIELD` 时，fieldKey 下拉需要加载表单字段列表。

加载策略：
1. 从 ProcessEditor 的 `nodeConfig` 中获取 `globalFormBinding` 和 `nodeFormBindings`
2. 收集所有绑定的表单 ID + 版本
3. 并行调用 `/dynamicForm/info` 获取每个表单的字段列表
4. 聚合所有字段，按 `fieldId` 去重，下拉显示 `title`（值存 `fieldId`）

为减少重复请求，在弹窗打开时预加载一次，缓存到弹窗组件内部。

### 6.5 默认走向模式

- 中央显示绿色确认图标 + "此连线已设为默认走向"
- 副标题："当所有其他条件都不满足时，流程将自动走此分支"
- 无其他可编辑内容

---

## 七、数据流与持久化

### 7.1 运行时数据流

```
用户编辑（弹窗）
    ↓
GatewayConditionDialog 内部 state（临时）
    ↓
点击"确定" → 写入 edge.properties.gatewayCondition
    ↓
LogicFlow 更新图形数据
    ↓
ProcessEditor emit('update:graphRawData')
    ↓
父组件更新 info.rawData
```

### 7.2 保存时构建 gatewayConditions

父组件（ProcessDefinitionAddView / ProcessDefinitionInfoView）在调用 `/processDefinition/save` 前：

```typescript
function buildGatewayConditions(graphRawData: any): GatewayConditionSaveItem[] {
  const gatewayTypes = ['bpmn:exclusiveGateway', 'bpmn:inclusiveGateway']
  const edges = graphRawData.edges || []

  return edges
    .filter((edge: any) => {
      const sourceNode = graphRawData.nodes.find((n: any) => n.id === edge.sourceNodeId)
      return sourceNode && gatewayTypes.includes(sourceNode.type)
    })
    .map((edge: any) => {
      const data = edge.properties?.gatewayCondition
      return {
        sequenceFlowId: edge.id,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        conditionType: data?.conditionType ?? null,
        isDefault: data?.isDefault ?? false,
        nativeExpression: data?.nativeExpression,
        ruleTree: data?.ruleTree
      }
    })
}
```

### 7.3 查询加载时回写

父组件收到 `/processDefinition/info` 响应后：

```typescript
function applyGatewayConditions(graphRawData: any, gatewayConditions: any[]) {
  const conditionMap = new Map(gatewayConditions.map(c => [c.sequenceFlowId, c]))

  graphRawData.edges?.forEach((edge: any) => {
    const condition = conditionMap.get(edge.id)
    if (condition) {
      edge.properties = edge.properties || {}
      edge.properties.gatewayCondition = {
        conditionType: condition.conditionType,
        isDefault: condition.isDefault,
        nativeExpression: condition.nativeExpression,
        ruleTree: condition.ruleTree
      }
    }
  })
}
```

---

## 八、默认走向与 GatewayProperty 整合

### 8.1 单一数据源原则

默认走向的真实数据源是 LogicFlow edge 的 `properties.isDefaultFlow`（由 GatewayProperty 维护）。`gatewayCondition.isDefault` 只作为**同步镜像**，不独立管理。

### 8.2 同步逻辑

| 触发源 | 操作 | 同步行为 |
|---|---|---|
| GatewayProperty | 设置某线为默认 | 该线 `gatewayCondition` → `{ isDefault: true, conditionType: null }`，清除 expression/ruleTree |
| GatewayProperty | 取消某线默认 | 该线 `gatewayCondition` → 删除或重置为空 |
| EdgePropertyPanel | 切到"默认走向" | 同步更新 source 网关的 `isDefaultFlow` 为该线 |
| EdgePropertyPanel | 从"默认走向"切走 | 清除 source 网关的 `isDefaultFlow`（如果指向该线）|

### 8.3 EdgePropertyPanel 读取逻辑

```typescript
const isDefault = computed(() => {
  // 优先读取 gatewayCondition.isDefault
  if (props.data.properties?.gatewayCondition?.isDefault) return true
  // 兼容读取旧版 isDefaultFlow
  return props.data.properties?.isDefaultFlow === true
})
```

---

## 九、前端校验规则

### 9.1 弹窗内校验（点击"确定"时）

| 场景 | 规则 | 错误提示 |
|---|---|---|
| NATIVE | `nativeExpression` 非空 | 请填写 JUEL 表达式 |
| CUSTOM | 根 AND 节点必须有至少一个子节点 | 请至少添加一个条件 |
| CUSTOM | CONDITION 节点 `category` 必填 | 请选择条件来源 |
| CUSTOM | CONDITION 节点 `fieldKey` 必填 | 请选择字段 |
| CUSTOM | CONDITION 节点 `operator` 必填 | 请选择运算符 |
| CUSTOM | CONDITION 节点 `value` 必填（EMPTY/NOT_EMPTY 除外） | 请填写比较值 |
| CUSTOM | IN/NOT_IN 的 `value` 必须是有效 JSON 数组 | 值必须是 JSON 数组格式，如 ["1","2"] |

### 9.2 流程保存前校验（FlowWarningDialog）

在现有 `validateFlow()` 基础上增加：

- 每个排他网关/包容网关的出线中，至少有一条配置了条件（NATIVE 或 CUSTOM）或被设为默认走向
- 若存在未配置条件的出线且无默认走向，显示警告："网关 {gatewayId} 存在未配置条件的出线，建议设置默认走向"

---

## 十、样式规范

### 10.1 使用现有主题变量

- 面板背景：`var(--bg-container)`
- 卡片背景：`var(--bg-elevated)` 或 `#1e1e2e`
- AND 卡片边框色：`#f0a030`（主色偏橙）
- OR 卡片边框色：`#4a9eff`（主色偏蓝）
- 删除按钮：`#e06060`
- 成功提示：`rgba(100, 200, 100, 0.1)` 背景 + `#8c8` 文字

### 10.2 弹窗尺寸

- 宽度：最小 640px，推荐 720px
- 最大高度：80vh，内容区滚动
- 适应 `el-dialog` 的 `destroy-on-close` 和 `close-on-click-modal`

---

## 十一、测试要点

1. **模式切换**：NATIVE ↔ CUSTOM ↔ 默认走向，数据是否正确清空/保留
2. **规则树嵌套**：AND 内嵌 OR，OR 内嵌 AND，增删节点后结构正确
3. **表单字段加载**：切换 category 为 FORM_FIELD 时，fieldKey 下拉正确加载
4. **数据持久化**：保存后刷新页面，条件配置正确恢复
5. **默认走向同步**：在 GatewayProperty 和 EdgePropertyPanel 两侧操作，状态保持同步
6. **校验**：各种空值、非法 JSON 数组、无子节点等情况正确拦截
7. **非网关出线**：普通连线的 EdgePropertyPanel 不显示条件配置区块

---

## 十二、参考文档

- [网关流向条件配置接口文档 v2.1](../../gateway-condition-api-v2.md)
- [接口文档前端审查反馈](../../gateway-condition-api-v2-feedback.md)
