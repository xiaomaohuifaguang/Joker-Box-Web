# 主题系统全面优化 + Matrix 主题设计

## 概述

对现有7套主题进行全面优化（色彩、动效、交互），并新增第8套「黑客矩阵」科幻主题。新主题采用增强方案：CSS变量色板 + 专属动效。

---

## 一、新增 Matrix 主题 · 黑客矩阵

### 风格定位

经典《黑客帝国》美学：纯黑底 + 磷光绿 #00FF41。克制科幻——辉光脉动、扫描线焦点、代码雨过渡，不影响日常阅读流畅度。

### 色板定义

**品牌色（磷光绿为主）**
| 变量 | 值 | 用途 |
|------|-----|------|
| --brand-primary | #00FF41 | 主色 |
| --brand-primary-hover | #33FF66 | 悬停 |
| --brand-primary-active | #00CC33 | 按下 |
| --brand-primary-light | #66FF88 | 浅色 |
| --brand-primary-lighter | #99FFAA | 极浅 |
| --brand-secondary | #003300 | 辅色 |
| --brand-accent | #006600 | 点缀 |

**渐变（纯色，矩阵不用渐变）**
| 变量 | 值 |
|------|-----|
| --brand-gradient | #00FF41 |
| --brand-gradient-hover | #33FF66 |
| --brand-gradient-soft | rgba(0,255,65,0.08) |
| --brand-gradient-text | #00FF41 |
| --brand-gradient-border | #00FF41 |

**背景层级（绝对黑暗中的终端绿）**
| 变量 | 值 | 用途 |
|------|-----|------|
| --bg-page | #0A0A0A | 页面底 |
| --bg-container | #0F0F0F | 容器 |
| --bg-elevated | #161616 | 浮层 |
| --bg-input | #1C1C1C | 输入框 |
| --bg-overlay | rgba(0,255,65,0.05) | 遮罩 |
| --bg-overlay-strong | rgba(0,255,65,0.10) | 强遮罩 |
| --bg-mask | rgba(0,0,0,0.80) | 弹窗遮罩 |

**文字层级（终端荧光字符感）**
| 变量 | 值 | 用途 |
|------|-----|------|
| --text-primary | #E0FFE0 | 主文字 |
| --text-regular | #B0D0B0 | 常规 |
| --text-secondary | #607060 | 次要 |
| --text-placeholder | #3A4A3A | 占位 |
| --text-disabled | #252525 | 禁用 |
| --text-on-brand | #0A0A0A | 品牌上文字 |
| --text-on-dark | #E0FFE0 | 深色上文字 |
| --text-link | #00FF41 | 链接 |
| --text-link-hover | #33FF66 | 链接悬停 |

**边框（终端绿线）**
| 变量 | 值 |
|------|-----|
| --border-base | #1C1C1C |
| --border-light | #161616 |
| --border-strong | #2A3A2A |
| --border-focus | #00FF41 |
| --border-divider | #1C1C1C |

**功能色（低饱和，融入终端）**
| 变量 | 值 |
|------|-----|
| --success | #3D8B5F |
| --success-hover | #2D7A4F |
| --success-bg | rgba(61,139,95,0.08) |
| --success-border | rgba(61,139,95,0.30) |
| --warning | #B8A040 |
| --warning-hover | #A89030 |
| --warning-bg | rgba(184,160,64,0.08) |
| --warning-border | rgba(184,160,64,0.30) |
| --danger | #CC3333 |
| --danger-hover | #AA2222 |
| --danger-bg | rgba(204,51,51,0.08) |
| --danger-border | rgba(204,51,51,0.30) |
| --info | #4A7A6A |
| --info-hover | #3A6A5A |
| --info-bg | rgba(74,122,106,0.08) |
| --info-border | rgba(74,122,106,0.30) |

**阴影（微弱辉光，非纯黑）**
| 变量 | 值 |
|------|-----|
| --shadow-sm | 0 1px 2px rgba(0,0,0,0.5) |
| --shadow-md | 0 4px 12px rgba(0,0,0,0.6) |
| --shadow-lg | 0 12px 32px rgba(0,0,0,0.5) |
| --shadow-xl | 0 24px 48px rgba(0,0,0,0.6) |
| --shadow-glow | 0 0 0 2px rgba(0,255,65,0.12) |
| --shadow-glow-strong | 0 0 24px rgba(0,255,65,0.20) |
| --shadow-inner | inset 0 1px 2px rgba(0,0,0,0.5) |

**数据可视化（终端色板）**
| 变量 | 值 |
|------|-----|
| --data-1 | #00FF41 |
| --data-2 | #3D8B5F |
| --data-3 | #4A7A6A |
| --data-4 | #B8A040 |
| --data-5 | #CC3333 |
| --data-6 | #00CC33 |
| --data-7 | #607060 |
| --data-8 | #3A6A5A |

**登录页（矩阵终端）**
| 变量 | 值 |
|------|-----|
| --auth-bg | #0A0A0A |
| --auth-card-bg | rgba(15,15,15,0.85) |
| --auth-card-border | rgba(0,255,65,0.15) |
| --auth-text | #E0FFE0 |
| --auth-text-muted | rgba(224,255,224,0.55) |
| --auth-input-bg | rgba(28,28,28,0.60) |

**滚动条**
| 变量 | 值 |
|------|-----|
| --scrollbar-thumb | #2A3A2A |
| --scrollbar-thumb-hover | #00FF41 |
| --scrollbar-track | transparent |

### 专属变量（仅 matrix 主题定义）

| 变量 | 值 | 用途 |
|------|-----|------|
| --glow-brand | 0 0 8px rgba(0,255,65,0.20), inset 0 0 8px rgba(0,255,65,0.05) | 品牌辉光 |
| --glow-brand-strong | 0 0 20px rgba(0,255,65,0.35), 0 0 40px rgba(0,255,65,0.10), inset 0 0 12px rgba(0,255,65,0.08) | 强辉光 |
| --scan-line-color | rgba(0,255,65,0.6) | 扫描线颜色 |

### 专属动效（matrix-effects.scss，仅 data-theme=matrix 时生效）

1. **辉光脉动** — primary 按钮 hover 时 box-shadow 在 12px ↔ 24px 之间呼吸式增减，2s 循环
2. **扫描线焦点** — input focus 时顶部出现一条绿色光带从左扫到右，2s 线性循环
3. **代码雨过渡** — 切换到 matrix 主题时全屏 0.3s 闪烁（亮度微增后恢复）
4. **边框呼吸** — 卡片 hover 时 border-color 在 #00FF41 ↔ rgba(0,255,65,0.3) 之间渐变
5. **选中扫描** — active menu/tag 有持续微弱辉光 (shadow-glow-strong)

---

## 二、现有7套主题优化

### 色彩微调

**joker（午夜嘉年华）**
- bg-container #141210 → #12100E（微调更暖）
- text-regular 提升约5%对比度
- brand-accent 增加暗红深度

**ink（水墨丹青）**
- bg-page #F5F0E8 → #F7F2EA（更温暖）
- text-secondary 对比度 3.2 → 4.1（WCAG AA）
- border-base 更清晰的层次
- data-3 调整为更鲜明的绿

**obsidian（黑曜镜面）**
- text-secondary #606060 → #707070（可读性）
- shadow-glow 微增可感知度
- border-strong 稍亮增加区分

**cyan（碧波）**
- text-primary 对比度提升
- bg-container 白度微调
- success/warning 区分度增强
- brand-accent 更鲜明的海泡色

**deepblue（深渊萤光）**
- bg-page #020408 → #030610（微调深度）
- text-secondary 对比度 2.8 → 3.8
- brand-primary 微增饱和度
- border 分层更清晰

**dawn（晨曦白）**
- text-secondary 对比度增强
- shadow 从 outline-shadow 改为真实阴影
- brand-accent 金色饱和度提升
- border-divider 更明显

**dusk（暮夜黑）**
- text-secondary #707070 → #808080（可读性）
- border 对比度微增
- brand-primary 暖度微调
- shadow-glow 可感知度增强

### 动效增强（所有主题共享）

**主题切换过渡**
- html/body 已有 transition，确认所有主题变量都在 transition 范围内
- 切换时颜色平滑渐变 0.4s ease-out

**hover 微交互**
- 按钮 hover 加 scale(1.02)
- 卡片 border-color 过渡 0.25s
- 菜单项背景色渐显 0.15s
- 链接下划线滑入动画

**focus 反馈**
- input focus 边框渐变到品牌色
- shadow-glow 从 0 → full 过渡
- 统一 0.15s ease-out 时序

**_mixins.scss 增强**
- `card-hoverable` 加入 border-color 过渡
- `btn-primary` 改进 hover/active 缩放曲线
- 新增 `link-hover` 下划线滑入效果 mixin

### ThemeSelector 交互升级

**触发按钮**
- hover 时加品牌色辉光
- 点击时缩放反馈 scale(0.95)
- 当前主题图标微脉动提示
- 增加 transition 全属性

**下拉菜单**
- 每项添加主题色小圆点（视觉辨识）
- 选中项加辉光标记
- hover 项背景色渐变
- 新增 matrix 项 + Monitor 图标

---

## 三、文件变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| src/assets/styles/theme/_theme-matrix.scss | 新增 | Matrix 主题色板 mixin + 专属变量 |
| src/assets/styles/theme/matrix-effects.scss | 新增 | Matrix 专属动效（条件加载） |
| src/assets/styles/theme/_variables.scss | 修改 | 添加 [data-theme='matrix'] 声明 |
| src/assets/styles/theme/_element-plus.scss | 修改 | 添加 Matrix EP 主色阶梯 |
| src/assets/styles/theme/_tokens.scss | 修改 | 无需改动（共享 token 不变） |
| src/assets/styles/theme/_mixins.scss | 修改 | 增强 card-hoverable / btn-primary / 新增 link-hover |
| src/assets/styles/main.scss | 修改 | 导入 matrix-effects.scss |
| src/assets/styles/theme/_theme-joker.scss | 修改 | 色彩微调 |
| src/assets/styles/theme/_theme-ink.scss | 修改 | 色彩微调 |
| src/assets/styles/theme/_theme-obsidian.scss | 修改 | 色彩微调 |
| src/assets/styles/theme/_theme-cyan.scss | 修改 | 色彩微调 |
| src/assets/styles/theme/_theme-deepblue.scss | 修改 | 色彩微调 |
| src/assets/styles/theme/_theme-dawn.scss | 修改 | 色彩微调 |
| src/assets/styles/theme/_theme-dusk.scss | 修改 | 色彩微调 |
| src/composables/useTheme.js | 修改 | 注册 matrix 主题 + 图标映射 |
| src/components/common/ThemeSelector.vue | 修改 | 交互升级 + Monitor 图标 |

---

## 四、设计原则

1. **Matrix 不污染其他主题** — 专属动效仅 `data-theme=matrix` 时生效，其他主题零增量
2. **克制科幻** — 动效只在关键时刻触发（hover/focus/切换），不影响日常阅读
3. **同构扩展** — Matrix 遵循现有 mixin 架构，不引入新的主题机制
4. **向后兼容** — 现有7套主题的微调仅改色值，不改变量名或结构
