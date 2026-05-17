# 流程详情/处理/认领弹窗重构设计

## 背景

当前 `IndexView.vue` 内嵌了多个 `el-dialog`：详情、处理、认领、发起流程、发起表单。其中详情和处理 dialog 的按钮写在 `el-dialog` 的 `footer` 插槽里，导致：

1. `IndexView.vue` 越来越臃肿，职责不单一。
2. 详情页和处理页有大量重复展示逻辑（基础信息、处理记录）。
3. 处理记录不可折叠，记录多时占用大量纵向空间。
4. 处理页从列表传入完整 `item`，但基础信息也应以 `info` 接口为准。

## 目标

1. 提取公共展示部分，减少重复代码。
2. 处理页和详情页统一通过 `/processInstance/info` 接口获取数据。
3. 列表页点击弹窗为完整 Vue 组件，dialog 内不再写按钮，按钮写在组件文件内部。
4. 处理记录支持折叠/展开。
5. 认领页独立为完整组件，便于后续扩展。

## 架构

```
IndexView.vue
├── ProcessInstanceDetailDialog.vue   (详情 + 处理，mode 区分)
│   ├── ProcessInstanceBaseInfo.vue   (复用，展示基础信息)
│   ├── [表单占位区]                  (mode=handle 时显示)
│   ├── [操作按钮区]                  (mode=handle 时显示：取消/驳回/拒绝/通过)
│   └── ProcessInstanceHandleRecord.vue (处理记录，可折叠)
├── ProcessInstanceClaimDialog.vue    (认领，独立完整组件)
├── ProcessInstanceStartView.vue      (不变)
├── ProcessInstanceInfoView.vue       (保留，可能被 DetailDialog 替代或复用)
└── ...
```

## 组件设计

### ProcessInstanceDetailDialog.vue

**Props（无）**

通过 `defineExpose` 暴露 `open(id, taskId, mode)` 方法。

**内部状态**

```ts
const dialog = ref({
  open: false,
  mode: 'detail' as 'detail' | 'handle',
  loading: false,
})

const infoData = ref<any>(null)
const records = ref<any[]>([])
```

**数据获取**

```ts
const loadInfo = async (id: string, taskId?: string) => {
  loading.value = true
  try {
    const result = await http.post('/processInstance/info', undefined, {
      params: { id, taskId },
      raw: true,
    })
    if (result.code === 200) {
      infoData.value = result.data
      records.value = result.data?.processHandleInfoList ?? []
    }
  } finally {
    loading.value = false
  }
}
```

**模板结构**

```vue
<el-dialog v-model="dialog.open" :title="title" width="720px">
  <div v-loading="loading">
    <!-- 基础信息 -->
    <ProcessInstanceBaseInfo :item="infoData" ... />

    <!-- 表单占位（mode=handle） -->
    <div v-if="dialog.mode === 'handle'" class="form-placeholder">...</div>
  </div>

  <!-- 操作按钮（mode=handle，写在 dialog 内部底部） -->
  <template v-if="dialog.mode === 'handle'" #footer>
    <div class="dialog-footer">
      <el-button @click="dialog.open = false">取消</el-button>
      <el-button type="warning" @click="showBack">驳回</el-button>
      <el-button type="danger" @click="showReject">拒绝</el-button>
      <el-button type="primary" @click="showPass">通过</el-button>
    </div>
  </template>

  <!-- 处理记录（dialog 内容区底部，非 footer） -->
  <ProcessInstanceHandleRecord :records="records" collapsible />
</el-dialog>
```

**操作弹窗**

通过/拒绝/驳回的确认弹窗放在 `ProcessInstanceDetailDialog.vue` 内部，作为子弹窗。点击通过后 `emit('success')`，外部刷新列表。

### ProcessInstanceClaimDialog.vue

**暴露方法**

```ts
defineExpose({ open(id, taskId) })
```

**内部结构**

```vue
<el-dialog v-model="dialog.open" title="认领任务" width="560px">
  <div v-loading="loading">
    <ProcessInstanceBaseInfo :item="infoData" ... />
    <!-- 后续可在此加认领说明、表单等 -->
  </div>
  <template #footer>
    <el-button @click="dialog.open = false">取消</el-button>
    <el-button type="success" :loading="claiming" @click="handleClaim">
      确认认领
    </el-button>
  </template>
</el-dialog>
```

### ProcessInstanceHandleRecord.vue 修改

**新增 Props**

```ts
collapsible: { type: Boolean, default: true }
```

**新增状态**

```ts
const expanded = ref(true)
```

**模板修改**

- `section-header` 增加点击事件切换 `expanded`
- header 右侧增加折叠/展开图标（`ArrowUp` / `ArrowDown`）
- 记录列表用 `v-show="expanded"` 控制

### IndexView.vue 精简

**移除的模板**

- 详情 dialog
- 处理 dialog
- 认领 dialog

**替换为**

```vue
<ProcessInstanceDetailDialog ref="detailDialogRef" @success="queryPage" />
<ProcessInstanceClaimDialog ref="claimDialogRef" @success="queryPage" />
```

**事件处理**

```ts
const handleProcess = (item: any) => {
  detailDialogRef.value?.open(item.id, item.taskId, 'handle')
}

const openDetail = (item: any) => {
  detailDialogRef.value?.open(item.id, item.taskId, 'detail')
}

const handleClaim = (item: any) => {
  claimDialogRef.value?.open(item.id, item.taskId)
}
```

## 文件变更清单

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/views/main/process/ProcessInstanceDetailDialog.vue` | 新增 | 统一详情/处理弹窗 |
| `src/views/main/process/ProcessInstanceClaimDialog.vue` | 新增 | 认领弹窗（完整组件） |
| `src/views/main/process/ProcessInstanceHandleRecord.vue` | 修改 | 增加可折叠功能 |
| `src/views/main/process/IndexView.vue` | 修改 | 移除内嵌 dialog，替换为组件 ref |
| `src/views/main/process/ProcessInstanceInfoView.vue` | 保留/可选删除 | 若 DetailDialog 完全替代则移除 |
| `src/views/main/process/ProcessInstanceHandleView.vue` | 保留/可选删除 | 逻辑迁移到 DetailDialog 后移除 |
| `src/views/main/process/ProcessInstanceBaseInfo.vue` | 保留 | 继续复用 |

## 接口

`/processInstance/info` 需支持参数：
- `id`（流程实例主键）
- `taskId`（当前任务 ID，可选）

返回字段需包含：
- 基础信息字段（`title`, `code`, `processDefinitionName`, `createByName`, `processStatus`, `processInstanceId`, `taskId`, `taskName`, ...）
- `processHandleInfoList`（处理记录列表）
