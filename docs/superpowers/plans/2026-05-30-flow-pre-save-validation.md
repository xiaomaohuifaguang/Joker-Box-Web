# 流程保存前警告确认实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现流程保存前的分布式校验框架，有警告时弹出确认框，用户确认后才保存。

**Architecture:** 每个 PropertyPanel 导出自己的校验函数，ProcessEditor 维护校验器注册表并提供 `validateFlow()` 方法，ProcessDefinitionInfoView 在保存时调用校验并拦截弹窗。

**Tech Stack:** Vue 3 + Element Plus + TypeScript + LogicFlow

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/process-designer/types/flow-validation.ts` | 创建 | FlowWarning / FlowValidator 类型定义 |
| `src/components/process-designer/components/PropertyPanels/GatewayProperty.vue` | 修改 | 导出 `validateGateway` 函数 |
| `src/components/process-designer/ProcessEditor.vue` | 修改 | 添加 `registerValidator`、`validateFlow`、暴露 `validateFlow` 给父组件 |
| `src/views/console/processManager/ProcessDefinitionInfoView.vue` | 修改 | 保存前调用 `validateFlow`，有警告则弹确认框 |

---

### Task 1: 创建类型定义文件

**Files:**
- Create: `src/components/process-designer/types/flow-validation.ts`

- [ ] **Step 1: 编写类型定义文件**

```ts
export interface FlowWarning {
  type: 'node' | 'edge' | 'process'
  nodeId?: string
  nodeName?: string
  message: string
}

export type FlowValidator = (node: any, lf: any) => FlowWarning[]
```

- [ ] **Step 2: Commit**

```bash
git add src/components/process-designer/types/flow-validation.ts
git commit -m "feat: add FlowWarning and FlowValidator types

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: GatewayProperty 导出校验函数

**Files:**
- Modify: `src/components/process-designer/components/PropertyPanels/GatewayProperty.vue`

- [ ] **Step 1: 导入类型**

在 `<script setup>` 顶部，在现有导入后添加：

```ts
import type { FlowWarning } from '../../types/flow-validation'
```

- [ ] **Step 2: 在 `defaultFlow` computed 之后添加校验函数**

在 `defaultFlow` computed 的闭合括号 `})` 之后、`</script>` 之前，添加：

```ts
export const validateGateway = (node: any, lf: any): FlowWarning[] => {
  const warnings: FlowWarning[] = []
  if (!['bpmn:exclusiveGateway', 'bpmn:inclusiveGateway'].includes(node.type)) {
    return warnings
  }

  const defaultFlow = node.properties?.default
  if (!defaultFlow) {
    const edges = lf.graphModel?.edges || []
    const sourceEdges = edges.filter((e: any) => e.sourceNodeId === node.id)
    const hasUnconditional = sourceEdges.some((e: any) => !e.properties?.condition)
    if (hasUnconditional) {
      warnings.push({
        type: 'node',
        message: '未设置默认路径，存在无条件出边',
      })
    }
  }
  return warnings
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/process-designer/components/PropertyPanels/GatewayProperty.vue
git commit -m "feat: export validateGateway from GatewayProperty

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: ProcessEditor 添加校验器注册中心

**Files:**
- Modify: `src/components/process-designer/ProcessEditor.vue`

- [ ] **Step 1: 导入类型和校验函数**

在 `<script setup>` 顶部，在现有导入后添加：

```ts
import type { FlowValidator, FlowWarning } from './types/flow-validation'
import { validateGateway } from './components/PropertyPanels/GatewayProperty.vue'
```

- [ ] **Step 2: 添加校验器注册表和注册函数**

在 `const renderData = ref(props.info.rawData)` 附近（或其他合适位置），添加：

```ts
const validators: Record<string, FlowValidator> = {}

const registerValidator = (nodeType: string, validator: FlowValidator) => {
  validators[nodeType] = validator
}
```

- [ ] **Step 3: 添加 validateFlow 函数**

在 `registerValidator` 之后，添加：

```ts
const validateFlow = (): FlowWarning[] => {
  if (!lf.value) return []
  const warnings: FlowWarning[] = []
  const nodes = lf.value.graphModel?.nodes || []

  nodes.forEach((node: any) => {
    const validator = validators[node.type]
    if (validator) {
      try {
        const nodeWarnings = validator(node, lf.value)
        nodeWarnings.forEach(w => {
          warnings.push({
            ...w,
            nodeId: node.id,
            nodeName: node.text?.value || node.id,
          })
        })
      } catch (e) {
        console.error(`校验节点 ${node.id} 时出错:`, e)
      }
    }
  })

  return warnings
}
```

- [ ] **Step 4: 注册网关校验器**

在 `onMounted` 内部，在 `registerCustomElement(lf.value)` 之后，添加：

```ts
registerValidator('bpmn:exclusiveGateway', validateGateway)
registerValidator('bpmn:inclusiveGateway', validateGateway)
```

- [ ] **Step 5: 暴露 validateFlow 给父组件**

在 `<script setup>` 底部（在 `onNodeConfigChange` 之后），添加：

```ts
defineExpose({ validateFlow })
```

- [ ] **Step 6: 构建验证**

```bash
npx vite build 2>&1 | grep -i "error\|ProcessEditor" | head -10
```

Expected: 无 ProcessEditor 相关错误（构建可能因预存在问题失败，但与本次修改无关）。

- [ ] **Step 7: Commit**

```bash
git add src/components/process-designer/ProcessEditor.vue
git commit -m "feat: add validator registry and validateFlow to ProcessEditor

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: ProcessDefinitionInfoView 保存前拦截

**Files:**
- Modify: `src/views/console/processManager/ProcessDefinitionInfoView.vue`

- [ ] **Step 1: 添加 ProcessEditor ref**

在 `const nodeConfig = ref(...)` 之后，添加：

```ts
const processEditorRef = ref<any>(null)
```

- [ ] **Step 2: 绑定 ref 到 ProcessEditor 组件**

在模板中，找到 `ProcessEditor` 组件的使用：

```vue
<ProcessEditor v-if="loaded" :key="reloadKey" :info="info" :readonly="type === 'view'"
    v-model:node-config="nodeConfig"
    @update:graphRawData="(data: any) => info.rawData = data"
    @update:graphData="(data: any) => info.xmlStr = data" />
```

改为：

```vue
<ProcessEditor ref="processEditorRef" v-if="loaded" :key="reloadKey" :info="info" :readonly="type === 'view'"
    v-model:node-config="nodeConfig"
    @update:graphRawData="(data: any) => info.rawData = data"
    @update:graphData="(data: any) => info.xmlStr = data" />
```

- [ ] **Step 3: 修改 save 函数，添加警告校验**

将现有的 `save` 函数替换为：

```ts
const save = () => {
  const warnings = processEditorRef.value?.validateFlow() || []

  if (warnings.length > 0) {
    const warningList = warnings
      .map(w => `• 节点「${w.nodeName}」：${w.message}`)
      .join('\n')

    ElMessageBox.confirm(
      `流程存在 ${warnings.length} 个警告：\n\n${warningList}\n\n建议修复后再保存，避免流程运行时卡住。`,
      '流程存在警告',
      {
        confirmButtonText: '确认保存',
        cancelButtonText: '返回修改',
        type: 'warning',
      }
    ).then(() => {
      doSave()
    }).catch(() => {})
    return
  }

  const missingTasks = validateUserTasks(info.value.rawData)
  if (missingTasks.length > 0) {
    const taskList = missingTasks.map((name: string) => `「${name}」`).join('、')
    ElMessageBox.confirm(
      `以下用户任务未设置处理类型，请检查：\n${taskList}`,
      '校验提示',
      {
        confirmButtonText: '确认继续',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        closeOnPressEscape: true,
        type: 'warning',
      }
    ).then(() => {
      doSave()
    }).catch(() => {})
    return
  }

  confirm("提示", "确认保存？", async () => {
    doSave()
  })
}
```

- [ ] **Step 4: 构建验证**

```bash
npx vite build 2>&1 | grep -i "error\|ProcessDefinitionInfoView" | head -10
```

Expected: 无 ProcessDefinitionInfoView 相关错误。

- [ ] **Step 5: Commit**

```bash
git add src/views/console/processManager/ProcessDefinitionInfoView.vue
git commit -m "feat: intercept save with warning confirmation dialog

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: 最终验证

- [ ] **Step 1: 完整构建检查**

```bash
npx vite build 2>&1 | tail -5
```

Expected: `✓ built in X.XXs`（预存在的 `registerComponents.js` 错误可能仍出现，但与本次修改无关）。

- [ ] **Step 2: Lint 检查**

```bash
npm run lint 2>&1 | grep -E "(flow-validation|GatewayProperty|ProcessEditor|ProcessDefinitionInfoView)" | head -10
```

Expected: 无与本次修改文件相关的 lint 错误（lint 配置不支持 TypeScript，大量预存在错误是正常的）。

- [ ] **Step 3: 最终提交（如有修复）**

```bash
git add -A
git commit -m "style: fix lint issues

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

### 1. Spec Coverage

| 设计文档需求 | 对应任务 |
|-------------|---------|
| FlowWarning / FlowValidator 类型 | Task 1 |
| GatewayProperty 导出 validateGateway | Task 2 |
| ProcessEditor 注册校验器 + validateFlow | Task 3 |
| ProcessEditor 暴露 validateFlow | Task 3 Step 5 |
| ProcessDefinitionInfoView 保存拦截 | Task 4 |
| 确认框 UI 文案 | Task 4 Step 3 |
| 校验器异常保护 try/catch | Task 3 Step 3 |

### 2. Placeholder Scan

- [x] 无 TBD/TODO
- [x] 无 "implement later"
- [x] 所有步骤包含具体代码
- [x] 无 "Similar to Task N"

### 3. Type Consistency

- [x] `FlowWarning` 接口在 Task 1 定义，Task 2/3 中使用一致
- [x] `FlowValidator` 类型在 Task 1 定义，Task 2/3 中使用一致
- [x] `validateFlow` 返回类型 `FlowWarning[]` 在 Task 3/4 中一致
- [x] `processEditorRef` 类型在 Task 4 中与 `defineExpose` 匹配

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-30-flow-pre-save-validation.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
