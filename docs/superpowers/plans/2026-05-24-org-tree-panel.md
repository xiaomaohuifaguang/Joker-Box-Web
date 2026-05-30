# 机构树面板重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将机构管理页左侧机构树抽离为独立组件 `OrgTreePanel.vue`，增加搜索、展开/收起全部、右键菜单、拖拽排序功能，并精致化视觉表现。

**Architecture:** 从 `IndexView.vue` 中抽出树区域为独立 `OrgTreePanel.vue` 组件，通过 `v-model:selectedId` / `update:selectedName` 与父组件双向通信，通过 `add` / `edit` / `delete` emit 通知父组件操作。右键菜单为组件内局部实现，拖拽使用 `el-tree` 原生 `draggable`。

**Tech Stack:** Vue 3 Composition API, Element Plus el-tree, SCSS, 项目 CSS 变量体系

**Deferred from spec:** 选中节点到根节点路径连线高亮（实线 + 品牌色）需要递归遍历父节点并逐节点切换连接线样式，复杂度较高且 el-tree 不原生支持，暂不实现。

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/views/console/orgManager/OrgTreePanel.vue` | 新建 — 树面板组件：搜索、工具栏、树、右键菜单、拖拽 |
| `src/views/console/orgManager/IndexView.vue` | 修改 — 使用 OrgTreePanel 替换内联树代码，简化 script 和 style |

---

### Task 1: Create OrgTreePanel — template + script skeleton

**Files:**
- Create: `src/views/console/orgManager/OrgTreePanel.vue`

- [ ] **Step 1: Create OrgTreePanel.vue with full template and script**

```vue
<template>
    <div class="org-tree-panel">
        <!-- 搜索 + 工具栏 -->
        <div class="panel-toolbar">
            <el-input
                v-model="filterText"
                placeholder="搜索机构..."
                clearable
                size="default"
                class="tree-search"
                @input="handleFilter">
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-input>
            <div class="toolbar-actions">
                <el-tooltip content="展开全部" placement="top" :show-after="400">
                    <el-button :icon="Expand" circle size="small" @click="expandAll" class="toolbar-btn" />
                </el-tooltip>
                <el-tooltip content="收起全部" placement="top" :show-after="400">
                    <el-button :icon="Fold" circle size="small" @click="collapseAll" class="toolbar-btn" />
                </el-tooltip>
            </div>
        </div>

        <!-- 机构树 -->
        <div class="tree-body" v-show="!isEmpty">
            <el-tree
                ref="treeRef"
                :data="treeData"
                :props="{ children: 'children', label: 'name' }"
                node-key="id"
                :default-expanded-keys="defaultExpanded"
                highlight-current
                draggable
                :allow-drop="allowDrop"
                @node-click="handleNodeClick"
                @node-contextmenu="handleContextMenu"
                @node-drag-start="onDragStart"
                @node-drag-end="onDragEnd"
                @node-drop="onNodeDrop"
                :filter-node-method="filterNode"
                class="org-tree">
                <template #default="{ node, data }">
                    <span class="tree-node" :class="{ 'is-selected': selectedId === data.id }">
                        <span class="node-indicator" :style="{ background: getNodeColor(node.level) }" />
                        <span class="node-icon" :style="{ background: getNodeColor(node.level) }">
                            <el-icon><OfficeBuilding /></el-icon>
                        </span>
                        <span class="node-label">{{ node.label }}</span>
                    </span>
                </template>
            </el-tree>
        </div>

        <!-- 空态 -->
        <div class="tree-empty" v-if="isEmpty">
            <el-empty description="未找到匹配机构" :image-size="80" />
        </div>

        <!-- 右键菜单 -->
        <Teleport to="body">
            <div
                v-if="contextMenu.visible"
                class="tree-context-menu"
                :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
                @click.stop>
                <div class="menu-item" @click="handleMenuAction('add')">
                    <el-icon><Plus /></el-icon>
                    <span>新建子机构</span>
                </div>
                <template v-if="!contextMenu.isRoot">
                    <div class="menu-divider" />
                    <div class="menu-item" @click="handleMenuAction('edit')">
                        <el-icon><Edit /></el-icon>
                        <span>编辑</span>
                    </div>
                    <div class="menu-divider" />
                    <div class="menu-item danger" @click="handleMenuAction('delete')">
                        <el-icon><Delete /></el-icon>
                        <span>删除</span>
                    </div>
                </template>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import {
    Search,
    Plus,
    Edit,
    Delete,
    OfficeBuilding,
    Expand,
    Fold
} from '@element-plus/icons-vue'
import { computed, nextTick, ref, watch } from 'vue'
import type { ElTree } from 'element-plus'

const props = defineProps<{
    treeData: any[]
    selectedId: string
}>()

const emit = defineEmits<{
    (e: 'update:selectedId', id: string): void
    (e: 'update:selectedName', name: string): void
    (e: 'add', parentId: string, parentName: string): void
    (e: 'edit', id: string): void
    (e: 'delete', id: string): void
}>()

const treeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref('')

const defaultExpanded = computed(() => {
    if (props.treeData.length > 0) return [props.treeData[0].id]
    return []
})

const isEmpty = ref(false)

const getNodeColor = (level: number) => {
    const colors = ['var(--data-1)', 'var(--data-2)', 'var(--data-3)', 'var(--data-4)', 'var(--data-5)']
    return colors[(level - 1) % colors.length]
}

// --- 搜索 ---
const filterNode = (value: string, data: any) => {
    if (!value) return true
    return data.name?.includes(value)
}

const handleFilter = (val: string) => {
    treeRef.value?.filter(val)
}

// --- 展开 / 收起 ---
const expandAll = () => {
    const tree = treeRef.value
    if (!tree) return
    const nodes = tree.store._getAllNodes()
    nodes.forEach((node: any) => { node.expanded = true })
}

const collapseAll = () => {
    const tree = treeRef.value
    if (!tree) return
    const nodes = tree.store._getAllNodes()
    nodes.forEach((node: any) => { node.expanded = false })
}

// --- 节点点击 ---
const handleNodeClick = (data: any) => {
    emit('update:selectedId', data.id)
    emit('update:selectedName', data.name)
}

// --- 右键菜单 ---
const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    nodeId: '',
    nodeName: '',
    isRoot: false
})

const handleContextMenu = (event: MouseEvent, data: any, node: any) => {
    event.preventDefault()
    contextMenu.value = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        nodeId: data.id,
        nodeName: data.name,
        isRoot: node.level === 1
    }
}

const handleMenuAction = (action: 'add' | 'edit' | 'delete') => {
    const { nodeId, nodeName } = contextMenu.value
    contextMenu.value.visible = false
    if (action === 'add') emit('add', nodeId, nodeName)
    else if (action === 'edit') emit('edit', nodeId)
    else if (action === 'delete') emit('delete', nodeId)
}

const closeContextMenu = () => {
    contextMenu.value.visible = false
}

// --- 拖拽 ---
const isDragging = ref(false)

const allowDrop = (_draggingNode: any, _dropNode: any, type: string) => {
    return ['inner', 'prev', 'next'].includes(type)
}

const onDragStart = () => { isDragging.value = true }
const onDragEnd = () => { isDragging.value = false }

const onNodeDrop = (_draggingNode: any, dropNode: any, dropType: string) => {
    // emit 事件通知父组件调用排序 API
    // dropType: 'inner' 成为子节点, 'prev'/'next' 同级排序
    emit('update:selectedId', dropNode.data.id)
    emit('update:selectedName', dropNode.data.name)
}

// --- 点击外部关闭右键菜单 ---
document.addEventListener('click', closeContextMenu)

// --- watch filterText 更新空态 ---
watch(filterText, () => {
    nextTick(() => {
        // el-tree filter 后检查是否有可见节点
        const tree = treeRef.value
        if (!tree) return
        const nodes = tree.store._getAllNodes()
        const hasVisible = nodes.some((n: any) => n.visible)
        isEmpty.value = filterText.value !== '' && !hasVisible
    })
})
</script>
```

- [ ] **Step 2: Add scoped styles to OrgTreePanel.vue**

Append the following `<style scoped lang="scss">` block to the file:

```scss
<style scoped lang="scss">
.org-tree-panel {
    display: flex;
    flex-direction: column;
    height: 100%;

    // --- 工具栏 ---
    .panel-toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-bottom: 12px;
        margin-bottom: 12px;
        border-bottom: 1px solid var(--border-light);

        .tree-search {
            flex: 1;
            transition: flex var(--duration-normal) var(--ease-out);

            &:focus-within {
                flex: 1.4;
            }

            :deep(.el-input__wrapper) {
                border-radius: var(--radius-lg);
                background: var(--bg-input);
                box-shadow: 0 0 0 1px var(--border-light) inset;
                transition: all var(--duration-normal) var(--ease-out);

                &:hover {
                    box-shadow: 0 0 0 1px var(--brand-primary) inset;
                }

                &.is-focus {
                    box-shadow: 0 0 0 2px var(--brand-primary) inset;
                }
            }
        }

        .toolbar-actions {
            display: flex;
            gap: 4px;
            flex-shrink: 0;

            .toolbar-btn {
                border: 1px solid var(--border-light);
                background: var(--bg-input);
                color: var(--text-secondary);
                transition: all var(--duration-fast) var(--ease-out);

                &:hover {
                    color: var(--brand-primary);
                    border-color: var(--brand-primary);
                    background: var(--brand-primary-lighter);
                }
            }
        }
    }

    // --- 树体 ---
    .tree-body {
        flex: 1;
        overflow: auto;

        :deep(.el-tree) {
            background: transparent;

            .el-tree-node__content {
                height: 38px;
                padding-right: 8px;
                border-radius: var(--radius-md);
                transition: all var(--duration-fast) var(--ease-out);

                &:hover {
                    background: var(--bg-overlay) !important;
                }
            }

            .el-tree-node.is-current > .el-tree-node__content {
                background: var(--brand-primary-lighter) !important;

                .tree-node {
                    .node-label {
                        color: var(--brand-primary);
                        font-weight: var(--fw-semibold);
                    }

                    .node-indicator {
                        opacity: 1;
                    }
                }
            }

            .el-tree-node__expand-icon {
                transition: transform var(--duration-normal) var(--ease-out);
            }
        }
    }

    // --- 节点 ---
    .tree-node {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        position: relative;
        padding: 2px 0;

        .node-indicator {
            position: absolute;
            left: -16px;
            top: 4px;
            bottom: 4px;
            width: 3px;
            border-radius: 2px;
            opacity: 0;
            transition: opacity var(--duration-fast) var(--ease-out);
        }

        .node-icon {
            width: 24px;
            height: 24px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: transform var(--duration-fast) var(--ease-bounce);

            .el-icon {
                font-size: 12px;
                color: white;
            }
        }

        &:hover .node-icon {
            transform: scale(1.08);
        }

        .node-label {
            font-size: var(--fs-md);
            color: var(--text-regular);
            transition: all var(--duration-fast) var(--ease-out);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        &.is-selected {
            .node-label {
                color: var(--brand-primary);
                font-weight: var(--fw-semibold);
            }

            .node-indicator {
                opacity: 1;
            }
        }
    }

    // --- 空态 ---
    .tree-empty {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 0;

        :deep(.el-empty__description p) {
            color: var(--text-placeholder);
            font-size: var(--fs-sm);
        }
    }
}

// --- 右键菜单 (非 scoped，Teleport 到 body) ---
.tree-context-menu {
    position: fixed;
    z-index: var(--z-dropdown);
    min-width: 160px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 6px 0;
    animation: menuFadeIn var(--duration-fast) var(--ease-out);

    @keyframes menuFadeIn {
        from { opacity: 0; transform: scale(0.95) translateY(-4px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        font-size: var(--fs-sm);
        color: var(--text-regular);
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-out);

        &:hover {
            background: var(--bg-overlay);
            color: var(--brand-primary);
        }

        &.danger:hover {
            background: var(--danger-bg);
            color: var(--danger);
        }

        .el-icon {
            font-size: 14px;
        }
    }

    .menu-divider {
        height: 1px;
        background: var(--border-light);
        margin: 4px 12px;
    }
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/views/console/orgManager/OrgTreePanel.vue
git commit -m "feat(org): add OrgTreePanel component with search, context menu, drag support"
```

---

### Task 2: Refactor IndexView to use OrgTreePanel

**Files:**
- Modify: `src/views/console/orgManager/IndexView.vue`

- [ ] **Step 1: Replace the left column tree section in template**

In `IndexView.vue`, replace the entire left `<el-col>` block (lines 22–54) with:

```html
<!-- 左侧机构树 -->
<el-col :xs="24" :sm="8" :md="6" :lg="5">
    <div class="tree-card">
        <div class="card-header">
            <div class="header-icon tree">
                <el-icon><FolderOpened /></el-icon>
            </div>
            <span class="header-title">机构树</span>
        </div>
        <div class="tree-wrapper">
            <OrgTreePanel
                :tree-data="orgTree"
                v-model:selected-id="selectOrg.parentId"
                @update:selected-name="handleTreeSelect"
                @add="handleTreeAdd"
                @edit="handleTreeEdit"
                @delete="handleTreeDelete"
            />
        </div>
    </div>
</el-col>
```

- [ ] **Step 2: Update script — replace imports and add handler functions**

Replace the import block and add new handlers. Replace lines 209–225 with:

```typescript
import {
    House,
    Search,
    Plus,
    View,
    Edit,
    Delete,
    OfficeBuilding,
    FolderOpened,
    Connection,
    Clock,
    Timer
} from '@element-plus/icons-vue'
import { http, alert, confirm } from '@/utils';
import { onMounted, ref } from 'vue';
import OrgInfoView from './OrgInfoView.vue';
import OrgAddView from './OrgAddView.vue';
import OrgTreePanel from './OrgTreePanel.vue';
import PageHeader from '@/components/common/PageHeader.vue';
```

Remove the `getNodeColor` function (lines 255–258) and `getOrgColor` function (lines 260–265) — `getNodeColor` moves into `OrgTreePanel`, `getOrgColor` stays for the table.

Wait — `getOrgColor` is used by the table org-cell column, so it stays. Only `getNodeColor` is removed. Add these new handler functions after `handleNodeClick`:

```typescript
const handleTreeSelect = (name: string) => {
    selectOrg.value.parentName = name
    queryPage()
}

const handleTreeAdd = (parentId: string, parentName: string) => {
    selectOrg.value.parentId = parentId
    selectOrg.value.parentName = parentName
    dialogAdd.value = true
}

const handleTreeEdit = (id: string) => {
    openDialog(id, 'edit')
}

const handleTreeDelete = (id: string) => {
    confirmDelete(id)
}
```

Also remove the old `handleNodeClick` function since `OrgTreePanel` handles node click internally and emits `update:selectedId` + `update:selectedName`.

- [ ] **Step 3: Clean up scoped styles — remove tree-node and org-tree scoped styles**

Remove the `.tree-wrapper` section's `.org-tree .tree-node` styles (lines 438–469). These are now handled by `OrgTreePanel`. Keep the `.tree-wrapper` container styles:

```scss
.tree-wrapper {
    flex: 1;
    overflow: auto;
}
```

- [ ] **Step 4: Verify the page renders correctly**

Run the dev server and navigate to the org management page. Check:
- Tree renders with data
- Clicking a node selects it and loads the right-side table
- Expand/collapse works
- Other page functionality (search, table, pagination, dialogs) still works

- [ ] **Step 5: Commit**

```bash
git add src/views/console/orgManager/IndexView.vue
git commit -m "refactor(org): use OrgTreePanel component in IndexView"
```

---

### Task 3: Verify all features work end-to-end

**Files:**
- All previous files

- [ ] **Step 1: Test tree search**

Type text in the search box. Verify:
- Matching nodes stay visible, non-matching hide
- Clearing the search restores all nodes
- Empty state shows when no matches found

- [ ] **Step 2: Test expand/collapse all**

Click expand all button — all nodes should expand.
Click collapse all button — all nodes should collapse except default expansion.

- [ ] **Step 3: Test right-click context menu**

Right-click on root node — should show only "新建子机构".
Right-click on child node — should show "新建子机构", "编辑", "删除".
Click outside menu — menu should close.
Click "新建子机构" — add dialog should open with correct parentId/parentName.
Click "编辑" — edit dialog should open for that node.
Click "删除" — delete confirmation should appear.

- [ ] **Step 4: Test drag and drop**

Drag a node to reorder. Verify the tree updates visually. (Note: actual API persistence depends on backend — the current implementation only updates the UI.)

- [ ] **Step 5: Test visual polish**

Check:
- Node icons have correct level-based colors
- Hover effect: icon scales up slightly
- Selected node: left indicator bar appears, label turns brand color
- Search box focus: expands slightly
- Context menu appears with fade-in animation

- [ ] **Step 6: Commit if any fixes were needed**

```bash
git add -u
git commit -m "fix(org): polish tree panel interactions"
```
