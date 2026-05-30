# 机构树面板重构设计

日期: 2026-05-24

## 目标

重构机构管理页左侧机构树，提升视觉精致度并增加交互功能：树搜索、展开/收起全部、拖拽排序、右键菜单。

## 组件结构

将树区域从 `IndexView.vue` 抽离为独立组件 `OrgTreePanel.vue`。

```
OrgTreePanel
  props:  treeData: any[], selectedId: string
  emits:  update:selectedId, update:selectedName, add, edit, delete
```

树面板只负责展示和交互，不调用 API。右键菜单操作通过 emit 通知 `IndexView` 执行已有 dialog 逻辑。`IndexView` 通过 `v-model:selectedId` 双向绑定选中机构。

## 视觉设计

### 卡片头部

搜索框 + 工具栏（展开全部 / 收起全部）横排。搜索框聚焦时 width 微微扩展（transition）。

### 节点样式

- 层级图标：胶囊形色块（左色块 + 白色 el-icon），颜色继承现有 `getNodeColor`
- 悬停态：整行半透明底色 + 图标 scale(1.08)
- 选中态：左侧 3px 品牌色竖条 + 浅底色 + 图标发光阴影
- 展开/收起箭头：旋转动画 chevron 图标

### 连接线

保留全局虚线。选中节点到根节点的路径连线变为实线 + 品牌色，形成路径高亮效果。

### 空态

搜索无结果时显示插画 + "未找到匹配机构" 文案。

## 交互功能

| 功能 | 实现 |
|------|------|
| 树搜索 | 搜索框 + `el-tree` 的 `filter-node-method` 实时过滤 |
| 展开/收起全部 | 工具栏按钮，遍历 tree store 调用 expandAll / collapseAll |
| 右键菜单 | 自定义 ContextMenu，菜单项：新建子机构 / 编辑 / 删除 |
| 拖拽排序 | `el-tree` 的 `draggable` + `allow-drop` 限制同级拖拽，拖拽时节点半透明 + 蓝色指示线 |

### 右键菜单细节

- 根节点：只显示"新建子机构"
- 非根节点：显示"新建子机构" / "编辑" / "删除"
- 菜单定位：`position: fixed`，点击其他区域关闭

### 拖拽排序细节

- `allow-drop(draggingNode, dropNode, type)`: 允许 `inner`（成为子节点）和 `prev`/`next`（同级排序），不限制跨层级
- 拖拽中节点 opacity 0.5
- 拖拽完成后调用后端排序接口更新节点 parentId 和排序

## 文件变更

| 文件 | 变更 |
|------|------|
| `src/views/console/orgManager/OrgTreePanel.vue` | 新建 |
| `src/views/console/orgManager/IndexView.vue` | 重构，使用 OrgTreePanel 替换内联树代码 |

## 约束

- 复用项目现有 CSS 变量体系（--brand-*, --bg-*, --text-*, --data-* 等）
- 复用全局 el-tree 连接线样式
- 保持响应式布局不变（移动端树区域 max-height 400px）
