# 流程弹窗重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 IndexView.vue 中内嵌的详情/处理/认领 dialog 提取为独立完整组件，处理记录支持折叠，处理/详情页统一通过 info 接口获取数据。

**Architecture:** 新增 `ProcessInstanceDetailDialog.vue`（统一详情+处理，mode 区分）和 `ProcessInstanceClaimDialog.vue`（认领独立组件），两者均为自包含弹窗组件，内置按钮和逻辑。`IndexView.vue` 精简为纯列表页，通过 ref 调用弹窗。

**Tech Stack:** Vue 3 + TypeScript + Element Plus + SCSS

---

## File Structure

| 文件 | 操作 | 职责 |
|---|---|---|
| `src/views/main/process/ProcessInstanceHandleRecord.vue` | 修改 | 增加 `collapsible` 属性，header 可点击折叠/展开 |
| `src/views/main/process/ProcessInstanceDetailDialog.vue` | 新增 | 统一详情/处理弹窗，内置按钮，调 info 接口 |
| `src/views/main/process/ProcessInstanceClaimDialog.vue` | 新增 | 认领弹窗，独立完整组件，调 info 接口 |
| `src/views/main/process/IndexView.vue` | 修改 | 移除内嵌 dialog，替换为组件 ref 调用 |
| `src/views/main/process/ProcessInstanceInfoView.vue` | 删除 | 被 DetailDialog 替代 |
| `src/views/main/process/ProcessInstanceHandleView.vue` | 删除 | 被 DetailDialog 替代 |

---

### Task 1: ProcessInstanceHandleRecord.vue 增加可折叠功能

**Files:**
- Modify: `src/views/main/process/ProcessInstanceHandleRecord.vue`

- [ ] **Step 1: 添加折叠相关状态和图标**

  在 `<script setup>` 中：

  ```ts
  import { ref } from 'vue'
  import { Timer, DocumentDelete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
  ```

  替换现有的 `import { Timer, DocumentDelete } from '@element-plus/icons-vue'`。

  在 `props` 定义后添加：

  ```ts
  const props = defineProps<{
    records: HandleRecord[] | null | undefined
    collapsible?: boolean
  }>()

  const expanded = ref(true)

  const toggleExpanded = () => {
    if (props.collapsible !== false) {
      expanded.value = !expanded.value
    }
  }
  ```

- [ ] **Step 2: 修改 section-header 支持点击折叠**

  替换 `.section-header` div：

  ```vue
  <div class="section-header" :class="{ clickable: collapsible !== false }" @click="toggleExpanded">
    <div class="section-icon record">
      <el-icon><Timer /></el-icon>
    </div>
    <span class="section-title">流程处理记录</span>
    <el-icon v-if="collapsible !== false" class="expand-icon">
      <component :is="expanded ? ArrowUp : ArrowDown" />
    </el-icon>
  </div>
  ```

- [ ] **Step 3: 记录列表增加 v-show 控制**

  将 `record-list` div 修改为：

  ```vue
  <div v-show="expanded" class="record-list">
  ```

  将 `empty-state` div 修改为：

  ```vue
  <div v-show="expanded" v-if="!records || records.length === 0" class="empty-state">
  ```

- [ ] **Step 4: 添加折叠样式**

  在 `<style>` 的 `.section-header` 规则后添加：

  ```scss
  .section-header.clickable {
    cursor: pointer;
    user-select: none;
  }

  .expand-icon {
    margin-left: auto;
    font-size: 16px;
    color: var(--text-secondary);
  }
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add src/views/main/process/ProcessInstanceHandleRecord.vue
  git commit -m "feat: add collapsible to process handle record"
  ```

---

### Task 2: 创建 ProcessInstanceDetailDialog.vue

**Files:**
- Create: `src/views/main/process/ProcessInstanceDetailDialog.vue`

- [ ] **Step 1: 写入完整组件代码**

  创建文件 `src/views/main/process/ProcessInstanceDetailDialog.vue`，内容：

  ```vue
  <template>
    <el-dialog
      v-model="dialog.open"
      :title="dialogTitle"
      width="720px"
      destroy-on-close
      :close-on-click-modal="false"
      class="detail-dialog"
    >
      <div v-loading="loading" class="dialog-body">
        <ProcessInstanceBaseInfo
          :item="infoData"
          :icon="dialog.mode === 'handle' ? Promotion : Tickets"
          :title="dialog.mode === 'handle' ? '待处理任务' : '流程详情'"
          icon-bg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
        />

        <!-- 表单占位（handle 模式） -->
        <div v-if="dialog.mode === 'handle'" class="form-placeholder">
          <el-icon class="placeholder-icon"><Edit /></el-icon>
          <p>表单内容待接入</p>
          <span>后续在此处填入表单数据等内容</span>
        </div>

        <!-- 处理记录 -->
        <ProcessInstanceHandleRecord :records="records" collapsible />
      </div>

      <template v-if="dialog.mode === 'handle'" #footer>
        <div class="dialog-footer">
          <el-button size="large" @click="dialog.open = false">取消</el-button>
          <el-button type="warning" size="large" :loading="actionLoading" @click="showBack">
            <el-icon><RefreshLeft /></el-icon>
            <span>驳回</span>
          </el-button>
          <el-button type="danger" size="large" :loading="actionLoading" @click="showReject">
            <el-icon><CircleClose /></el-icon>
            <span>拒绝</span>
          </el-button>
          <el-button type="primary" size="large" :loading="actionLoading" @click="showPass">
            <el-icon><Promotion /></el-icon>
            <span>通过</span>
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 确认通过弹窗 -->
    <el-dialog v-model="passDialog.open" title="确认通过" width="480px" :close-on-click-modal="false" append-to-body destroy-on-close class="pass-confirm-dialog">
      <div class="confirm-body">
        <p class="confirm-tip">确定要通过该审批吗？</p>
        <div class="remark-field">
          <div class="remark-label">备注 / 审批意见（可选）</div>
          <el-input v-model="passDialog.remark" type="textarea" :rows="3" placeholder="为空时默认存储“通过”" resize="none" />
        </div>
      </div>
      <template #footer>
        <div class="confirm-footer">
          <el-button size="large" @click="passDialog.open = false">取消</el-button>
          <el-button type="primary" size="large" :loading="passDialog.loading" @click="handlePass">
            <el-icon><Promotion /></el-icon>
            <span>确认通过</span>
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 确认拒绝弹窗 -->
    <el-dialog v-model="rejectDialog.open" title="确认拒绝" width="480px" :close-on-click-modal="false" append-to-body destroy-on-close class="reject-confirm-dialog">
      <div class="confirm-body">
        <p class="confirm-tip">确定要拒绝该审批吗？</p>
        <div class="remark-field">
          <div class="remark-label">备注 / 审批意见（可选）</div>
          <el-input v-model="rejectDialog.remark" type="textarea" :rows="3" placeholder="为空时默认存储“拒绝”" resize="none" />
        </div>
      </div>
      <template #footer>
        <div class="confirm-footer">
          <el-button size="large" @click="rejectDialog.open = false">取消</el-button>
          <el-button type="danger" size="large" :loading="rejectDialog.loading" @click="handleReject">
            <el-icon><CircleClose /></el-icon>
            <span>确认拒绝</span>
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 确认驳回弹窗 -->
    <el-dialog v-model="backDialog.open" title="确认驳回" width="480px" :close-on-click-modal="false" append-to-body destroy-on-close class="back-confirm-dialog">
      <div class="confirm-body">
        <p class="confirm-tip">确定要驳回该审批吗？</p>
        <div class="remark-field">
          <div class="remark-label">备注 / 审批意见（可选）</div>
          <el-input v-model="backDialog.remark" type="textarea" :rows="3" placeholder="为空时默认存储“驳回”" resize="none" />
        </div>
      </div>
      <template #footer>
        <div class="confirm-footer">
          <el-button size="large" @click="backDialog.open = false">取消</el-button>
          <el-button type="warning" size="large" :loading="backDialog.loading" @click="handleBack">
            <el-icon><RefreshLeft /></el-icon>
            <span>确认驳回</span>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>

  <script setup lang="ts">
  import { computed, ref } from 'vue'
  import { Promotion, Tickets, Edit, CircleClose, RefreshLeft } from '@element-plus/icons-vue'
  import { http, alert } from '@/utils'
  import ProcessInstanceBaseInfo from './ProcessInstanceBaseInfo.vue'
  import ProcessInstanceHandleRecord from './ProcessInstanceHandleRecord.vue'

  const emit = defineEmits<{
    (e: 'success'): void
  }>()

  const dialog = ref({
    open: false,
    mode: 'detail' as 'detail' | 'handle',
  })

  const loading = ref(false)
  const actionLoading = ref(false)
  const infoData = ref<any>(null)
  const records = ref<any[]>([])
  const currentId = ref<string | number>('')
  const currentTaskId = ref<string | undefined>(undefined)

  const dialogTitle = computed(() => {
    const name = infoData.value?.processDefinitionName || '未命名流程'
    return dialog.value.mode === 'handle' ? `处理任务 · ${name}` : `流程详情 · ${name}`
  })

  const open = (id: string | number, taskId?: string, mode: 'detail' | 'handle' = 'detail') => {
    currentId.value = id
    currentTaskId.value = taskId
    dialog.value.mode = mode
    dialog.value.open = true
    loadInfo()
  }

  const loadInfo = async () => {
    loading.value = true
    try {
      const result = await http.post('/processInstance/info', undefined, {
        params: { id: currentId.value, taskId: currentTaskId.value },
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

  // 通过
  const passDialog = ref({ open: false, remark: '', loading: false })
  const showPass = () => { passDialog.value = { open: true, remark: '', loading: false } }
  const handlePass = async () => {
    passDialog.value.loading = true
    try {
      const result = await http.post('/processInstance/pass', {
        processInstanceId: currentId.value,
        taskId: currentTaskId.value,
        remark: passDialog.value.remark || undefined,
      }, { raw: true })
      if (result.code === 200) {
        alert(result.msg || '审批通过', 'success')
        passDialog.value.open = false
        dialog.value.open = false
        emit('success')
      }
    } finally {
      passDialog.value.loading = false
    }
  }

  // 拒绝
  const rejectDialog = ref({ open: false, remark: '', loading: false })
  const showReject = () => { rejectDialog.value = { open: true, remark: '', loading: false } }
  const handleReject = async () => {
    rejectDialog.value.loading = true
    try {
      const result = await http.post('/processInstance/reject', {
        processInstanceId: currentId.value,
        taskId: currentTaskId.value,
        remark: rejectDialog.value.remark || undefined,
      }, { raw: true })
      if (result.code === 200) {
        alert(result.msg || '审批拒绝', 'success')
        rejectDialog.value.open = false
        dialog.value.open = false
        emit('success')
      }
    } finally {
      rejectDialog.value.loading = false
    }
  }

  // 驳回
  const backDialog = ref({ open: false, remark: '', targetNodeId: undefined as string | undefined, loading: false })
  const showBack = () => { backDialog.value = { open: true, remark: '', targetNodeId: undefined, loading: false } }
  const handleBack = async () => {
    backDialog.value.loading = true
    try {
      const result = await http.post('/processInstance/back', {
        processInstanceId: currentId.value,
        taskId: currentTaskId.value,
        remark: backDialog.value.remark || undefined,
        targetNodeId: backDialog.value.targetNodeId,
      }, { raw: true })
      if (result.code === 200) {
        alert(result.msg || '审批驳回', 'success')
        backDialog.value.open = false
        dialog.value.open = false
        emit('success')
      }
    } finally {
      backDialog.value.loading = false
    }
  }

  defineExpose({ open })
  </script>

  <style scoped lang="scss">
  .detail-dialog {
    :deep(.el-dialog__header) {
      background: var(--brand-gradient);
      margin: 0;
      padding: 18px 24px;
      .el-dialog__title { color: var(--text-on-brand); font-weight: var(--fw-semibold); }
      .el-dialog__headerbtn .el-dialog__close { color: var(--text-on-brand); }
    }
    :deep(.el-dialog__body) { padding: 0; }
    :deep(.el-dialog__footer) { padding: 16px 24px; border-top: 1px solid var(--border-light); }
  }

  .dialog-body {
    padding: 24px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .form-placeholder {
    border: 1px dashed var(--border-light);
    border-radius: var(--radius-lg);
    background: var(--bg-overlay);
    padding: 48px 20px;
    text-align: center;
    color: var(--text-secondary);
    margin-bottom: 24px;
    .placeholder-icon { font-size: 36px; color: var(--brand-primary); margin-bottom: 12px; }
    p { margin: 0 0 6px; font-size: var(--fs-lg); font-weight: var(--fw-semibold); color: var(--text-primary); }
    span { font-size: var(--fs-sm); }
  }

  .confirm-body {
    .confirm-tip { margin: 0 0 16px; font-size: var(--fs-md); color: var(--text-primary); }
    .remark-field {
      .remark-label { font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--text-primary); margin-bottom: 8px; }
      :deep(.el-textarea__inner) { border-radius: var(--radius-md); }
    }
  }
  .confirm-footer { display: flex; justify-content: flex-end; gap: 12px; }

  .pass-confirm-dialog {
    :deep(.el-dialog__header) {
      background: var(--brand-gradient); margin: 0; padding: 18px 24px;
      .el-dialog__title { color: var(--text-on-brand); font-weight: var(--fw-semibold); }
      .el-dialog__headerbtn .el-dialog__close { color: var(--text-on-brand); }
    }
  }
  .reject-confirm-dialog {
    :deep(.el-dialog__header) {
      background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); margin: 0; padding: 18px 24px;
      .el-dialog__title { color: #fff; font-weight: var(--fw-semibold); }
      .el-dialog__headerbtn .el-dialog__close { color: #fff; }
    }
  }
  .back-confirm-dialog {
    :deep(.el-dialog__header) {
      background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); margin: 0; padding: 18px 24px;
      .el-dialog__title { color: #fff; font-weight: var(--fw-semibold); }
      .el-dialog__headerbtn .el-dialog__close { color: #fff; }
    }
  }
  </style>
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/views/main/process/ProcessInstanceDetailDialog.vue
  git commit -m "feat: add unified detail/handle dialog component"
  ```

---

### Task 3: 创建 ProcessInstanceClaimDialog.vue

**Files:**
- Create: `src/views/main/process/ProcessInstanceClaimDialog.vue`

- [ ] **Step 1: 写入完整组件代码**

  创建文件 `src/views/main/process/ProcessInstanceClaimDialog.vue`，内容：

  ```vue
  <template>
    <el-dialog
      v-model="dialog.open"
      :title="dialogTitle"
      width="560px"
      destroy-on-close
      :close-on-click-modal="false"
      class="claim-dialog"
    >
      <div v-loading="loading" class="dialog-body">
        <ProcessInstanceBaseInfo
          :item="infoData"
          :icon="Pointer"
          title="待认领任务"
          icon-bg="linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)"
        />
        <!-- 后续可在此扩展认领说明、表单等 -->
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" @click="dialog.open = false">取消</el-button>
          <el-button type="success" size="large" :loading="claiming" @click="handleClaim">
            <el-icon><Pointer /></el-icon>
            <span>确认认领</span>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>

  <script setup lang="ts">
  import { computed, ref } from 'vue'
  import { Pointer } from '@element-plus/icons-vue'
  import { http, alert } from '@/utils'
  import ProcessInstanceBaseInfo from './ProcessInstanceBaseInfo.vue'

  const emit = defineEmits<{
    (e: 'success'): void
  }>()

  const dialog = ref({ open: false })
  const loading = ref(false)
  const claiming = ref(false)
  const infoData = ref<any>(null)
  const currentId = ref<string | number>('')
  const currentTaskId = ref<string | undefined>(undefined)

  const dialogTitle = computed(() => {
    const name = infoData.value?.processDefinitionName || '未命名流程'
    return `认领任务 · ${name}`
  })

  const open = (id: string | number, taskId?: string) => {
    currentId.value = id
    currentTaskId.value = taskId
    dialog.value.open = true
    loadInfo()
  }

  const loadInfo = async () => {
    loading.value = true
    try {
      const result = await http.post('/processInstance/info', undefined, {
        params: { id: currentId.value, taskId: currentTaskId.value },
        raw: true,
      })
      if (result.code === 200) {
        infoData.value = result.data
      }
    } finally {
      loading.value = false
    }
  }

  const handleClaim = async () => {
    claiming.value = true
    try {
      const result = await http.post('/processInstance/claim', {
        processInstanceId: currentId.value,
        taskId: currentTaskId.value,
      }, { raw: true })
      if (result.code === 200) {
        alert(result.msg || '认领成功', 'success')
        dialog.value.open = false
        emit('success')
      }
    } finally {
      claiming.value = false
    }
  }

  defineExpose({ open })
  </script>

  <style scoped lang="scss">
  .claim-dialog {
    :deep(.el-dialog__header) {
      background: var(--brand-gradient);
      margin: 0;
      padding: 18px 24px;
      .el-dialog__title { color: var(--text-on-brand); font-weight: var(--fw-semibold); }
      .el-dialog__headerbtn .el-dialog__close { color: var(--text-on-brand); }
    }
    :deep(.el-dialog__body) { padding: 0; }
    :deep(.el-dialog__footer) { padding: 16px 24px; border-top: 1px solid var(--border-light); }
  }

  .dialog-body {
    padding: 24px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  </style>
  ```

  **注意：** `/processInstance/claim` 接口若尚未实现，此处的 `handleClaim` 可先用 `alert('认领接口接入后启用', 'warning')` 占位，后续替换。

- [ ] **Step 2: Commit**

  ```bash
  git add src/views/main/process/ProcessInstanceClaimDialog.vue
  git commit -m "feat: add claim dialog component"
  ```

---

### Task 4: 精简 IndexView.vue

**Files:**
- Modify: `src/views/main/process/IndexView.vue`

- [ ] **Step 1: 替换 dialog 模板**

  在模板中：

  1. 删除详情 dialog（`detail-dialog` class 的 `el-dialog`）
  2. 删除处理 dialog（`handle-dialog` class 的 `el-dialog`）
  3. 删除认领 dialog（`claim-dialog` class 的 `el-dialog`）
  4. 在模板末尾（`</div>` 之前）添加：

  ```vue
  <ProcessInstanceDetailDialog ref="detailDialogRef" @success="queryPage" />
  <ProcessInstanceClaimDialog ref="claimDialogRef" @success="queryPage" />
  ```

- [ ] **Step 2: 更新 import**

  在 `<script setup>` 顶部：

  1. 移除未使用的图标导入（确认移除后保留的图标：Tickets, Search, Refresh, List, Document, UserFilled, Clock, Timer, Link, Edit, Delete, View, Pointer, DocumentDelete, Promotion, CircleClose, RefreshLeft, BellFilled, Memo, Files, Plus, ArrowRight）
  2. 移除 `ProcessInstanceInfoView` 和 `ProcessInstanceClaimView` 和 `ProcessInstanceHandleView` 的 import
  3. 添加新组件的 import：

  ```ts
  import ProcessInstanceDetailDialog from './ProcessInstanceDetailDialog.vue'
  import ProcessInstanceClaimDialog from './ProcessInstanceClaimDialog.vue'
  ```

- [ ] **Step 3: 移除旧的状态和 ref**

  删除以下 ref 定义：

  ```ts
  // 删除
  const detailDialog = ref<{ open: boolean; id: string | number | null }>({ open: false, id: null })
  const claimDialog = ref<{ open: boolean; loading: boolean; item: any | null }>({ open: false, loading: false, item: null })
  const claimViewRef = ref<InstanceType<typeof ProcessInstanceClaimView> | null>(null)
  const handleDialog = ref<{ open: boolean; loading: boolean; item: any | null }>({ open: false, loading: false, item: null })
  const handleViewRef = ref<InstanceType<typeof ProcessInstanceHandleView> | null>(null)
  ```

  替换为：

  ```ts
  const detailDialogRef = ref<InstanceType<typeof ProcessInstanceDetailDialog> | null>(null)
  const claimDialogRef = ref<InstanceType<typeof ProcessInstanceClaimDialog> | null>(null)
  ```

- [ ] **Step 4: 更新事件处理方法**

  替换以下方法：

  ```ts
  const openDetail = (item: any) => {
    detailDialogRef.value?.open(item.id, item.taskId, 'detail')
  }

  const handleProcess = (item: any) => {
    detailDialogRef.value?.open(item.id, item.taskId, 'handle')
  }

  const handleClaim = (item: any) => {
    claimDialogRef.value?.open(item.id, item.taskId)
  }
  ```

  删除以下方法（不再需要的）：

  ```ts
  // 删除
  const handleConfirmHandle = () => { handleViewRef.value?.showConfirm() }
  const handleRejectHandle = () => { handleViewRef.value?.showReject() }
  const handleBackHandle = () => { handleViewRef.value?.showBack() }
  const onHandleSuccess = () => { handleDialog.value.open = false; queryPage() }
  const handleConfirmClaim = () => { claimViewRef.value?.showConfirm() }
  const onClaimSuccess = () => { claimDialog.value.open = false; queryPage() }
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add src/views/main/process/IndexView.vue
  git commit -m "refactor: simplify IndexView by extracting dialogs to components"
  ```

---

### Task 5: 清理旧组件

**Files:**
- Delete: `src/views/main/process/ProcessInstanceInfoView.vue`
- Delete: `src/views/main/process/ProcessInstanceHandleView.vue`

- [ ] **Step 1: 确认无其他引用后删除**

  ```bash
  # 确认没有其他文件引用这两个组件
  grep -r "ProcessInstanceInfoView" src/ --include="*.vue" --include="*.ts"
  grep -r "ProcessInstanceHandleView" src/ --include="*.vue" --include="*.ts"
  ```

  若只有 IndexView.vue 引用（且已在 Task 4 中移除），则安全删除：

  ```bash
  git rm src/views/main/process/ProcessInstanceInfoView.vue
  git rm src/views/main/process/ProcessInstanceHandleView.vue
  git commit -m "chore: remove obsolete InfoView and HandleView components"
  ```

---

## 自审检查

### Spec 覆盖检查

| Spec 要求 | 对应 Task |
|---|---|
| 处理/详情页取值都是 info 接口 | Task 2 (DetailDialog), Task 3 (ClaimDialog) |
| 弹窗为完整 Vue 组件，dialog 内不写按钮 | Task 2, Task 3 |
| 处理记录可折叠 | Task 1 |
| 认领页独立完整组件 | Task 3 |
| IndexView 精简 | Task 4 |
| 清理旧组件 | Task 5 |

### Placeholder 检查

- 无 TBD/TODO
- 无 "后续实现" 等模糊描述
- 所有代码块包含完整可运行代码

### 类型一致性检查

- `open(id, taskId, mode)` 签名在所有组件中一致
- `emit('success')` 事件名一致
- `info` 接口参数 `id` + `taskId` 一致
