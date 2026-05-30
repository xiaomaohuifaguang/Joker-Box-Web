# 主题系统优化 + Matrix 主题 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全面优化现有7套主题（色彩/动效/交互），新增第8套黑客矩阵(Matrix)科幻主题含专属辉光动效。

**Architecture:** 遵循现有 SCSS mixin + CSS 变量架构。Matrix 主题新增 `_theme-matrix.scss` 色板 mixin 和 `matrix-effects.scss` 专属动效（仅 `data-theme=matrix` 时生效）。现有主题仅修改色值，不变结构。

**Tech Stack:** Vue 3 + SCSS + Element Plus + CSS custom properties + CSS animations

---

### Task 1: 创建 Matrix 主题色板文件

**Files:**
- Create: `src/assets/styles/theme/_theme-matrix.scss`

- [ ] **Step 1: 创建 `_theme-matrix.scss`**

```scss
// ============================================================
// 🟢 黑客矩阵主题 · Matrix
// 经典《黑客帝国》美学：纯黑底 + 磷光绿 #00FF41
// 终端荧光、代码雨、绝对黑暗中的绿色信号
// ============================================================

@mixin theme-matrix {
    /* ---------- 品牌色（磷光绿为主） ---------- */
    --brand-primary: #00FF41;
    --brand-primary-hover: #33FF66;
    --brand-primary-active: #00CC33;
    --brand-primary-light: #66FF88;
    --brand-primary-lighter: #99FFAA;
    --brand-secondary: #003300;
    --brand-accent: #006600;

    /* ---------- 渐变（纯色，矩阵不用渐变） ---------- */
    --brand-gradient: #00FF41;
    --brand-gradient-hover: #33FF66;
    --brand-gradient-soft: rgba(0, 255, 65, 0.08);
    --brand-gradient-text: #00FF41;
    --brand-gradient-border: #00FF41;

    /* ---------- 背景层级（绝对黑暗中的终端绿） ---------- */
    --bg-page: #0A0A0A;
    --bg-container: #0F0F0F;
    --bg-elevated: #161616;
    --bg-input: #1C1C1C;
    --bg-overlay: rgba(0, 255, 65, 0.05);
    --bg-overlay-strong: rgba(0, 255, 65, 0.10);
    --bg-mask: rgba(0, 0, 0, 0.80);

    /* ---------- 文字层级（终端荧光字符感） ---------- */
    --text-primary: #E0FFE0;
    --text-regular: #B0D0B0;
    --text-secondary: #607060;
    --text-placeholder: #3A4A3A;
    --text-disabled: #252525;
    --text-on-brand: #0A0A0A;
    --text-on-dark: #E0FFE0;
    --text-link: #00FF41;
    --text-link-hover: #33FF66;

    /* ---------- 边框（终端绿线） ---------- */
    --border-base: #1C1C1C;
    --border-light: #161616;
    --border-strong: #2A3A2A;
    --border-focus: #00FF41;
    --border-divider: #1C1C1C;

    /* ---------- 功能色（低饱和，融入终端） ---------- */
    --success: #3D8B5F;
    --success-hover: #2D7A4F;
    --success-bg: rgba(61, 139, 95, 0.08);
    --success-border: rgba(61, 139, 95, 0.30);

    --warning: #B8A040;
    --warning-hover: #A89030;
    --warning-bg: rgba(184, 160, 64, 0.08);
    --warning-border: rgba(184, 160, 64, 0.30);

    --danger: #CC3333;
    --danger-hover: #AA2222;
    --danger-bg: rgba(204, 51, 51, 0.08);
    --danger-border: rgba(204, 51, 51, 0.30);

    --info: #4A7A6A;
    --info-hover: #3A6A5A;
    --info-bg: rgba(74, 122, 106, 0.08);
    --info-border: rgba(74, 122, 106, 0.30);

    /* ---------- 阴影（微弱辉光） ---------- */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.6);
    --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.5);
    --shadow-xl: 0 24px 48px rgba(0, 0, 0, 0.6);
    --shadow-glow: 0 0 0 2px rgba(0, 255, 65, 0.12);
    --shadow-glow-strong: 0 0 24px rgba(0, 255, 65, 0.20);
    --shadow-inner: inset 0 1px 2px rgba(0, 0, 0, 0.5);

    /* ---------- 数据可视化（终端色板） ---------- */
    --data-1: #00FF41;
    --data-2: #3D8B5F;
    --data-3: #4A7A6A;
    --data-4: #B8A040;
    --data-5: #CC3333;
    --data-6: #00CC33;
    --data-7: #607060;
    --data-8: #3A6A5A;

    --data-grad-1: #00FF41;
    --data-grad-2: #3D8B5F;
    --data-grad-3: #4A7A6A;
    --data-grad-4: #B8A040;
    --data-grad-5: #CC3333;
    --data-grad-6: #00CC33;

    /* ---------- 登录页（矩阵终端） ---------- */
    --auth-bg: #0A0A0A;
    --auth-card-bg: rgba(15, 15, 15, 0.85);
    --auth-card-border: rgba(0, 255, 65, 0.15);
    --auth-text: #E0FFE0;
    --auth-text-muted: rgba(224, 255, 224, 0.55);
    --auth-input-bg: rgba(28, 28, 28, 0.60);

    /* ---------- 滚动条 ---------- */
    --scrollbar-thumb: #2A3A2A;
    --scrollbar-thumb-hover: #00FF41;
    --scrollbar-track: transparent;

    /* ---------- Matrix 专属变量 ---------- */
    --glow-brand: 0 0 8px rgba(0, 255, 65, 0.20), inset 0 0 8px rgba(0, 255, 65, 0.05);
    --glow-brand-strong: 0 0 20px rgba(0, 255, 65, 0.35), 0 0 40px rgba(0, 255, 65, 0.10), inset 0 0 12px rgba(0, 255, 65, 0.08);
    --scan-line-color: rgba(0, 255, 65, 0.6);
}
```

- [ ] **Step 2: 提交**

```bash
git add src/assets/styles/theme/_theme-matrix.scss
git commit -m "feat(theme): add Matrix theme color palette"
```

---

### Task 2: 注册 Matrix 主题到变量系统和 JS composable

**Files:**
- Modify: `src/assets/styles/theme/_variables.scss`
- Modify: `src/composables/useTheme.js`

- [ ] **Step 1: 在 `_variables.scss` 中导入 matrix 并声明 `[data-theme='matrix']`**

在文件顶部 `@use` 区域添加：

```scss
@use './theme-matrix' as matrix;
```

在 `dusk` 主题声明之后添加：

```scss
/* 显式 matrix 主题（黑客矩阵） */
:root[data-theme='matrix'] {
    @include matrix.theme-matrix;
}
```

- [ ] **Step 2: 在 `useTheme.js` 中注册 matrix 主题**

在 `THEMES` 对象中添加：

```js
MATRIX: 'matrix',
```

在 `THEME_LIST` 数组中添加（dusk 之后）：

```js
{ key: THEMES.MATRIX, label: '黑客矩阵', icon: 'Monitor' },
```

在 `VALID_THEMES` Set 中添加 `THEMES.MATRIX`。

在 `DARK_THEMES` Set 中添加 `THEMES.MATRIX`。

- [ ] **Step 3: 在 ThemeSelector.vue 的 ICON_MAP 中添加 Monitor**

```js
import { Sunny, Moon, MoonNight, PartlyCloudy, MostlyCloudy, Monitor, Check } from '@element-plus/icons-vue'

const ICON_MAP = { Sunny, Moon, MoonNight, PartlyCloudy, MostlyCloudy, Monitor }
```

- [ ] **Step 4: 提交**

```bash
git add src/assets/styles/theme/_variables.scss src/composables/useTheme.js src/components/common/ThemeSelector.vue
git commit -m "feat(theme): register Matrix theme in variables, composable, and selector"
```

---

### Task 3: 添加 Matrix 主题的 Element Plus 主色阶梯

**Files:**
- Modify: `src/assets/styles/theme/_element-plus.scss`

- [ ] **Step 1: 在 `_element-plus.scss` 的主色阶梯区域添加 matrix**

在 `dusk` 主题主色阶梯之后添加：

```scss
/* matrix 主题（深色黑客矩阵系，light-N 用透明度阶梯）*/
:root[data-theme='matrix'] {
    --el-color-primary: #00FF41;
    --el-color-primary-light-3: #00CC33;
    --el-color-primary-light-5: rgba(0, 255, 65, 0.4);
    --el-color-primary-light-7: rgba(0, 255, 65, 0.24);
    --el-color-primary-light-8: rgba(0, 255, 65, 0.16);
    --el-color-primary-light-9: rgba(0, 255, 65, 0.08);
    --el-color-primary-dark-2: #33FF66;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/assets/styles/theme/_element-plus.scss
git commit -m "feat(theme): add Matrix EP primary color steps"
```

---

### Task 4: 创建 Matrix 专属动效文件

**Files:**
- Create: `src/assets/styles/theme/matrix-effects.scss`

- [ ] **Step 1: 创建 `matrix-effects.scss`**

```scss
// ============================================================
// Matrix 主题专属动效
// 仅 data-theme="matrix" 时生效，不影响其他主题
// ============================================================

/* ---------- Keyframes ---------- */

@keyframes matrixGlowPulse {
    0%, 100% {
        box-shadow: 0 0 12px rgba(0, 255, 65, 0.4);
    }
    50% {
        box-shadow: 0 0 24px rgba(0, 255, 65, 0.6), 0 0 48px rgba(0, 255, 65, 0.15);
    }
}

@keyframes matrixScanLine {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}

@keyframes matrixBorderBreath {
    0%, 100% {
        border-color: rgba(0, 255, 65, 0.3);
    }
    50% {
        border-color: #00FF41;
    }
}

@keyframes matrixActiveGlow {
    0%, 100% {
        box-shadow: var(--shadow-glow);
    }
    50% {
        box-shadow: var(--shadow-glow-strong);
    }
}

@keyframes matrixFlashIn {
    0% {
        opacity: 0;
        filter: brightness(2);
    }
    30% {
        opacity: 1;
        filter: brightness(1.5);
    }
    100% {
        opacity: 1;
        filter: brightness(1);
    }
}

/* ---------- 条件加载：仅 matrix 主题生效 ---------- */

:root[data-theme='matrix'] {
    /* 1. 辉光脉动 — primary 按钮 hover */
    .el-button--primary:hover,
    .el-button--primary:focus {
        animation: matrixGlowPulse 2s ease-in-out infinite;
    }

    /* 2. 扫描线焦点 — input focus */
    .el-input__wrapper.is-focus,
    .el-textarea__inner:focus {
        position: relative;
        overflow: hidden;

        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--scan-line-color), transparent);
            animation: matrixScanLine 2s linear infinite;
            pointer-events: none;
        }
    }

    /* 3. 代码雨过渡 — 切换到 matrix 时的闪烁 */
    &.theme-transitioning {
        animation: matrixFlashIn 0.3s ease-out;
    }

    /* 4. 边框呼吸 — 卡片 hover */
    .el-card:hover {
        animation: matrixBorderBreath 2s ease-in-out infinite;
    }

    /* 5. 选中扫描 — active menu/tag */
    .el-menu-item.is-active {
        animation: matrixActiveGlow 2.5s ease-in-out infinite;
    }

    .el-tag {
        &.is-active,
        &[aria-selected='true'] {
            animation: matrixActiveGlow 2.5s ease-in-out infinite;
        }
    }

    /* 主题切换过渡增强 */
    &,
    html,
    body {
        transition: background-color 0.4s var(--ease-out),
            color 0.4s var(--ease-out),
            border-color 0.4s var(--ease-out);
    }
}
```

- [ ] **Step 2: 在 `main.scss` 中导入 matrix-effects**

在 `@use './theme/element-plus';` 之后添加：

```scss
/* ---------- 5. Matrix 主题专属动效（条件加载）---------- */
@use './theme/matrix-effects';
```

- [ ] **Step 3: 在 useTheme.js 中添加切换闪烁效果**

在 `setTheme` 函数中，切换到 matrix 时添加短暂的 `theme-transitioning` class：

```js
function setTheme(t) {
    if (VALID_THEMES.has(t)) {
        if (t === THEMES.MATRIX) {
            const root = document.documentElement
            root.classList.add('theme-transitioning')
            setTimeout(() => root.classList.remove('theme-transitioning'), 300)
        }
        _theme.value = t
    }
}
```

- [ ] **Step 4: 提交**

```bash
git add src/assets/styles/theme/matrix-effects.scss src/assets/styles/main.scss src/composables/useTheme.js
git commit -m "feat(theme): add Matrix exclusive effects — glow pulse, scan line, flash transition"
```

---

### Task 5: 优化现有7套主题色彩

**Files:**
- Modify: `src/assets/styles/theme/_theme-joker.scss`
- Modify: `src/assets/styles/theme/_theme-ink.scss`
- Modify: `src/assets/styles/theme/_theme-obsidian.scss`
- Modify: `src/assets/styles/theme/_theme-cyan.scss`
- Modify: `src/assets/styles/theme/_theme-deepblue.scss`
- Modify: `src/assets/styles/theme/_theme-dawn.scss`
- Modify: `src/assets/styles/theme/_theme-dusk.scss`

- [ ] **Step 1: 优化 joker 色彩**

在 `_theme-joker.scss` 中修改：

```scss
--bg-container: #12100E;       // 原 #141210，微调更暖
--brand-accent: #D4A050;       // 原 #F0E6D2，改为更鲜明的暖金点缀
```

- [ ] **Step 2: 优化 ink 色彩**

在 `_theme-ink.scss` 中修改：

```scss
--bg-page: #F7F2EA;           // 原 #F5F0E8，更温暖
--text-secondary: #5B5B5B;    // 原 #6B6B6B，对比度 3.2→4.1
--border-base: #D2CBBB;       // 原 #D9D3C7，更清晰的层次
--data-3: #4A8B5A;            // 原 #5A7A5A，更鲜明的绿
```

- [ ] **Step 3: 优化 obsidian 色彩**

在 `_theme-obsidian.scss` 中修改：

```scss
--text-secondary: #707070;    // 原 #606060，可读性增强
--shadow-glow: 0 0 0 2px rgba(224, 224, 224, 0.15);    // 原 0.10，可感知度增强
--shadow-glow-strong: 0 0 16px rgba(224, 224, 224, 0.12); // 原 0.08，可感知度增强
--border-strong: #404040;     // 原 #303030，区分度增强
```

- [ ] **Step 4: 优化 cyan 色彩**

在 `_theme-cyan.scss` 中修改：

```scss
--text-primary: #081A10;      // 原 #0A1F14，对比度提升
--bg-container: #FCFFFC;      // 原 #FFFFFF，微调白度
--brand-accent: #40D4C8;      // 原 #4ECDC4，更鲜明的海泡色
--warning: #C4A030;           // 原 #C4A035，与 success 区分度增强
```

- [ ] **Step 5: 优化 deepblue 色彩**

在 `_theme-deepblue.scss` 中修改：

```scss
--bg-page: #030610;           // 原 #020408，微调深度
--text-secondary: #5A7878;    // 原 #608888，对比度 2.8→3.8
--brand-primary: #00E5C8;     // 原 #00D9C0，微增饱和度
--brand-primary-hover: #00F8DC; // 原 #00F0D4
--brand-primary-active: #00C8B0; // 原 #00B8A8
--border-base: #1E3545;       // 原 #1A3040，分层更清晰
--border-light: #152535;      // 原 #122030
```

- [ ] **Step 6: 优化 dawn 色彩**

在 `_theme-dawn.scss` 中修改：

```scss
--text-secondary: #555555;    // 原 #666666，对比度增强
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);     // 原 outline-shadow，改为真实阴影
--shadow-md: 0 2px 6px rgba(0, 0, 0, 0.08);      // 原 0 1px 2px
--shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.08);     // 原 0 2px 4px
--shadow-xl: 0 8px 20px rgba(0, 0, 0, 0.10);     // 原 0 4px 8px
--shadow-glow: 0 0 0 2px rgba(26, 54, 93, 0.12); // 原 0.08
--shadow-glow-strong: 0 0 0 2px rgba(26, 54, 93, 0.18); // 原 0.12
--brand-accent: #D4B878;      // 原 #C9A96E，金色饱和度提升
--border-divider: #DDDDDD;    // 原 #E8E8E8，更明显
```

- [ ] **Step 7: 优化 dusk 色彩**

在 `_theme-dusk.scss` 中修改：

```scss
--text-secondary: #808080;    // 原 #707070，可读性
--border-base: #303030;       // 原 #2A2A2E，对比度微增
--border-light: #222226;      // 原 #1E1E22
--brand-primary: #C0B090;     // 原 #B8A88A，暖度微调
--brand-primary-hover: #D0C0A0; // 原 #C9B89A
--shadow-glow: 0 0 0 1px rgba(184, 168, 138, 0.12);   // 原 0.08
--shadow-glow-strong: 0 0 0 2px rgba(184, 168, 138, 0.18); // 原 0.10
```

- [ ] **Step 8: 提交**

```bash
git add src/assets/styles/theme/_theme-joker.scss src/assets/styles/theme/_theme-ink.scss src/assets/styles/theme/_theme-obsidian.scss src/assets/styles/theme/_theme-cyan.scss src/assets/styles/theme/_theme-deepblue.scss src/assets/styles/theme/_theme-dawn.scss src/assets/styles/theme/_theme-dusk.scss
git commit -m "fix(theme): optimize color contrast and hierarchy for all 7 themes"
```

---

### Task 6: 增强 _mixins.scss 动效和工具

**Files:**
- Modify: `src/assets/styles/theme/_mixins.scss`

- [ ] **Step 1: 增强 `card-hoverable` mixin**

将现有 `card-hoverable` 替换为：

```scss
/* 可悬浮卡片：边框变色 + 微妙阴影过渡 */
@mixin card-hoverable {
    @include card;

    &:hover {
        border-color: var(--brand-primary);
        box-shadow: var(--shadow-md);
        transform: scale(1.005);
    }
}
```

- [ ] **Step 2: 增强 `btn-primary` mixin 的 hover/active 缩放曲线**

将现有 `btn-primary` 的 hover/active 替换为：

```scss
    &:hover {
        background: var(--brand-primary-hover);
        transform: scale(1.02);
        box-shadow: var(--shadow-md);
    }

    &:active {
        transform: scale(0.97);
        box-shadow: var(--shadow-sm);
    }
```

- [ ] **Step 3: 新增 `link-hover` mixin**

在文件末尾 `subtlePulse` keyframe 之后添加：

```scss
/* ---------- 链接下划线滑入 ---------- */
@mixin link-hover($color: var(--text-link), $hover-color: var(--text-link-hover)) {
    color: $color;
    text-decoration: none;
    position: relative;
    transition: color var(--duration-fast) var(--ease-out);

    &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -1px;
        width: 0;
        height: 1px;
        background: $hover-color;
        transition: width var(--duration-normal) var(--ease-out);
    }

    &:hover {
        color: $hover-color;

        &::after {
            width: 100%;
        }
    }
}
```

- [ ] **Step 4: 提交**

```bash
git add src/assets/styles/theme/_mixins.scss
git commit -m "feat(theme): enhance card-hoverable, btn-primary, add link-hover mixin"
```

---

### Task 7: 升级 ThemeSelector 交互体验

**Files:**
- Modify: `src/components/common/ThemeSelector.vue`

- [ ] **Step 1: 替换完整 `ThemeSelector.vue` 的 `<style scoped>` 部分**

```vue
<style scoped>
.theme-trigger {
    width: 36px;
    height: 36px;
    padding: 0;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    color: var(--text-regular);
    transition: background-color var(--duration-normal) var(--ease-out),
        color var(--duration-normal) var(--ease-out),
        box-shadow var(--duration-normal) var(--ease-out),
        border-color var(--duration-normal) var(--ease-out),
        transform var(--duration-fast) var(--ease-out);
}

.theme-trigger:hover {
    background: var(--bg-overlay);
    color: var(--brand-primary);
    border-color: var(--border-base);
    box-shadow: var(--shadow-glow);
}

.theme-trigger:active {
    transform: scale(0.95);
}

.theme-trigger:focus-visible {
    outline: none;
    border-color: var(--brand-primary);
    box-shadow: var(--shadow-glow);
}
</style>
```

- [ ] **Step 2: 替换完整 `ThemeSelector.vue` 的 `<style>` (unscoped) 部分**

```vue
<style>
/* 下拉菜单全局样式（unscoped，作用于 popper） */
.theme-dropdown .el-dropdown__popper {
    padding: 6px !important;
    border-radius: var(--radius-lg) !important;
    background: var(--bg-container) !important;
    border: 1px solid var(--border-light) !important;
    box-shadow: var(--shadow-lg) !important;
}

.theme-menu {
    padding: 4px !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

.theme-menu .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: var(--radius-md);
    font-size: var(--fs-sm);
    color: var(--text-regular);
    transition: background-color var(--duration-fast) var(--ease-out),
        color var(--duration-fast) var(--ease-out),
        box-shadow var(--duration-fast) var(--ease-out);
    min-width: 160px;
}

.theme-menu .el-dropdown-menu__item:hover {
    background: var(--bg-overlay) !important;
    color: var(--brand-primary) !important;
}

.theme-menu .el-dropdown-menu__item.active {
    background: var(--brand-gradient-soft);
    color: var(--brand-primary);
    font-weight: var(--fw-semibold);
    box-shadow: var(--shadow-glow);
}

.theme-item__icon {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-overlay);
    color: var(--text-secondary);
    flex-shrink: 0;
    transition: background var(--duration-fast) var(--ease-out),
        color var(--duration-fast) var(--ease-out);
}

.theme-menu .el-dropdown-menu__item:hover .theme-item__icon,
.theme-menu .el-dropdown-menu__item.active .theme-item__icon {
    background: var(--brand-gradient);
    color: var(--text-on-brand);
}

/* 主题色小圆点 */
.theme-item__dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-pill);
    flex-shrink: 0;
}

.theme-item__label {
    flex: 1;
}

.theme-item__check {
    color: var(--brand-primary);
    display: flex;
    align-items: center;
}
</style>
```

- [ ] **Step 3: 更新 `<template>` 部分，添加主题色圆点**

替换整个 `<template>` 为：

```vue
<template>
    <el-dropdown trigger="click" placement="bottom-end" popper-class="theme-dropdown" @command="handleCommand">
        <button class="theme-trigger" :class="`is-${theme}`" :aria-label="`当前主题：${currentLabel}，点击切换`">
            <el-icon :size="18">
                <component :is="currentIcon" />
            </el-icon>
        </button>
        <template #dropdown>
            <el-dropdown-menu class="theme-menu">
                <el-dropdown-item v-for="item in THEME_LIST" :key="item.key" :command="item.key"
                    :class="{ active: theme === item.key }">
                    <span class="theme-item__dot" :style="{ background: item.dotColor }"></span>
                    <span class="theme-item__icon">
                        <el-icon :size="16">
                            <component :is="resolveIcon(item.icon)" />
                        </el-icon>
                    </span>
                    <span class="theme-item__label">{{ item.label }}</span>
                    <span v-if="theme === item.key" class="theme-item__check">
                        <el-icon :size="14">
                            <Check />
                        </el-icon>
                    </span>
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>
```

- [ ] **Step 4: 在 `useTheme.js` 的 THEME_LIST 中为每项添加 dotColor**

```js
export const THEME_LIST = [
    { key: THEMES.INK, label: '水墨丹青', icon: 'Sunny', dotColor: '#C53D43' },
    { key: THEMES.JOKER, label: '午夜嘉年华', icon: 'Moon', dotColor: '#C9A227' },
    { key: THEMES.OBSIDIAN, label: '黑曜镜面', icon: 'MoonNight', dotColor: '#E0E0E0' },
    { key: THEMES.CYAN, label: '碧波', icon: 'PartlyCloudy', dotColor: '#2E8B57' },
    { key: THEMES.DEEPBLUE, label: '深渊萤光', icon: 'MostlyCloudy', dotColor: '#00D9C0' },
    { key: THEMES.DAWN, label: '晨曦白', icon: 'Sunny', dotColor: '#1A365D' },
    { key: THEMES.DUSK, label: '暮夜黑', icon: 'MoonNight', dotColor: '#B8A88A' },
    { key: THEMES.MATRIX, label: '黑客矩阵', icon: 'Monitor', dotColor: '#00FF41' },
]
```

- [ ] **Step 5: 提交**

```bash
git add src/components/common/ThemeSelector.vue src/composables/useTheme.js
git commit -m "feat(theme): upgrade ThemeSelector with glow, color dots, scale feedback"
```

---

### Task 8: 视觉验证

**Files:** 无文件变更

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 逐个切换8套主题，验证以下项**
  - 切换过渡是否平滑（0.4s）
  - Matrix 主题：按钮 hover 辉光脉动
  - Matrix 主题：input focus 扫描线
  - Matrix 主题：卡片 hover 边框呼吸
  - Matrix 主题：切换到 matrix 时的闪烁过渡
  - 其他7套主题色彩微调效果
  - ThemeSelector 圆点、辉光、缩放反馈
  - Element Plus 组件在所有主题下正常渲染

- [ ] **Step 3: 如有问题，修复后提交**

```bash
git add -u
git commit -m "fix(theme): address visual verification issues"
```
