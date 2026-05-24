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
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
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

document.addEventListener('click', closeContextMenu)
onBeforeUnmount(() => {
    document.removeEventListener('click', closeContextMenu)
})

// --- 拖拽 ---
const isDragging = ref(false)

const allowDrop = (_draggingNode: any, _dropNode: any, type: string) => {
    return ['inner', 'prev', 'next'].includes(type)
}

const onDragStart = () => { isDragging.value = true }
const onDragEnd = () => { isDragging.value = false }

const onNodeDrop = (_draggingNode: any, dropNode: any, _dropType: string) => {
    emit('update:selectedId', dropNode.data.id)
    emit('update:selectedName', dropNode.data.name)
}

// --- watch filterText 更新空态 ---
watch(filterText, () => {
    nextTick(() => {
        const tree = treeRef.value
        if (!tree) return
        const nodes = tree.store._getAllNodes()
        const hasVisible = nodes.some((n: any) => n.visible)
        isEmpty.value = filterText.value !== '' && !hasVisible
    })
})
</script>

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
</style>

<style lang="scss">
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
