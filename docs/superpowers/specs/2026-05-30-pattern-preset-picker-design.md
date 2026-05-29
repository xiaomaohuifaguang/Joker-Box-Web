# 常用正则预设选择器设计文档

## 背景与目标

当前动态表单的字段编辑器（FieldEditor）和联动编辑器（LinkageEditor）中，配置正则校验时需要用户手动输入正则表达式和提示文案。为了降低表单设计者的使用门槛，提升配置效率，需要提供一组常用的正则预设，通过弹窗选择的方式快速填入。

## 需求摘要

- 在 `FieldEditor.vue` 和 `LinkageEditor.vue` 的 `pattern` 输入区域增加常用正则预设选择功能
- 选择预设后自动填入 `pattern` 和 `patternTips`
- 预设列表前端内置固定，后续可扩展
- 使用弹窗（Dialog）方式展示预设列表，支持搜索和分类筛选

## 预设正则列表（V1）

按分类组织，共 8 个预设：

| 分类 | 名称 | 正则表达式 | 提示文案 |
|------|------|-----------|---------|
| 基础信息 | 汉字姓名 | `^[一-龥·]{2,16}$` | 请输入2-16位汉字姓名 |
| 基础信息 | 英文姓名 | `^[a-zA-Z\s\-']{2,32}$` | 请输入正确的英文姓名 |
| 联系方式 | 手机号 | `^1[3-9]\d{9}$` | 请输入正确的11位手机号 |
| 联系方式 | 邮箱 | `^[\w.-]+@[\w.-]+\.\w+$` | 请输入正确的邮箱地址 |
| 证件 | 身份证号（18位） | `^[1-9]\d{5}(18\|19\|20)\d{2}(0[1-9]\|1[0-2])(0[1-9]\|[12]\d\|3[01])\d{3}[\dXx]$` | 请输入正确的18位身份证号 |
| 证件 | 护照号 | `^[a-zA-Z0-9]{5,20}$` | 请输入正确的护照号 |
| 其他 | 邮编 | `^\d{6}$` | 请输入正确的6位邮编 |
| 其他 | 银行卡号 | `^\d{16,19}$` | 请输入正确的银行卡号 |

## 组件设计

### PatternPresetPicker 组件

一个独立的 Vue 组件，通过 Dialog 形式展示预设列表。

#### 界面布局

```
┌─────────────────────────────────────────┐
│  选择常用正则                      [×]  │
├─────────────────────────────────────────┤
│  [🔍 搜索正则名称...        ]           │
│  ─────────────────────────────────────  │
│  [全部] [基础信息] [联系方式] [证件] [其他] │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─ 汉字姓名 ───────────────────────┐  │
│  │  正则: ^[一-龥·]{2,16}$  │  │
│  │  提示: 请输入2-16位汉字姓名       │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌─ 手机号 ─────────────────────────┐  │
│  │  正则: ^1[3-9]\d{9}$             │  │
│  │  提示: 请输入正确的11位手机号     │  │
│  └──────────────────────────────────┘  │
│                                         │
│              ...                        │
│                                         │
├─────────────────────────────────────────┤
│              [  取 消  ]                │
└─────────────────────────────────────────┘
```

#### Props

| 属性 | 类型 | 说明 |
|------|------|------|
| `modelValue` | `boolean` | 控制弹窗显示/隐藏 |

#### Emits

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `boolean` | 同步显示状态 |
| `select` | `{ pattern: string, patternTips: string }` | 用户选中某个预设后触发 |

#### 交互行为

- **搜索**：在搜索框输入时实时过滤，匹配 `name` 和 `category`
- **分类标签**：顶部标签栏切换分类，"全部"显示所有预设
- **卡片点击**：单击卡片即选中，触发 `select` 事件并关闭弹窗
- **空状态**：搜索/筛选无结果时显示"未找到匹配的正则预设"

### 数据结构

```ts
// src/components/dynamicForm/types/pattern-presets.ts
export interface PatternPreset {
  id: string
  name: string
  category: string
  pattern: string
  patternTips: string
  description?: string
}

export const PATTERN_PRESETS: PatternPreset[] = [
  // ... 预设列表
]

export const PATTERN_PRESET_CATEGORIES: string[] = [
  '全部', '基础信息', '联系方式', '证件', '其他'
]
```

## 集成方式

### FieldEditor.vue

在 `pattern` 输入框的 `append` 插槽增加触发按钮：

```vue
<el-col :span="12" v-if="hasPattern">
  <el-form-item label="正则校验">
    <el-input v-model="form.pattern" placeholder="例：^[一-龥]{2,4}$">
      <template #append>
        <el-button @click="patternPickerVisible = true">
          <el-icon><Collection /></el-icon>
        </el-button>
      </template>
    </el-input>
  </el-form-item>
</el-col>
```

弹窗组件放在 FieldEditor 模板底部：

```vue
<PatternPresetPicker
  v-model="patternPickerVisible"
  @select="({ pattern, patternTips }) => {
    form.pattern = pattern
    form.patternTips = patternTips
  }"
/>
```

### LinkageEditor.vue

在 `SET_PATTERN` 动作的正则输入区域同样增加触发按钮：

```vue
<template v-if="element.actionType === 'SET_PATTERN'">
  <el-input v-model="element.actionValue.pattern" placeholder="正则表达式">
    <template #append>
      <el-button @click="openPatternPickerFor(element)">
        <el-icon><Collection /></el-icon>
      </el-button>
    </template>
  </el-input>
  <el-input v-model="element.actionValue.patternTips" placeholder="提示信息" />
</template>
```

由于 LinkageEditor 中可能有多个联动规则同时编辑，弹窗采用单例模式，通过 `activeElement` 记录当前操作的规则项，选择后回填到对应项。

## 数据流

```
用户点击按钮
    ↓
打开 PatternPresetPicker（modelValue = true）
    ↓
用户在弹窗中搜索/筛选/点击卡片
    ↓
触发 select 事件 → { pattern, patternTips }
    ↓
父组件接收事件，回填到当前编辑的表单字段
    ↓
关闭弹窗（modelValue = false）
```

## 错误处理

- **无效正则不处理**：预设正则均为内置固定值，已验证有效性，无需运行时校验
- **联动回退**：如果用户在 LinkageEditor 打开弹窗后切换了动作类型，弹窗关闭后回填逻辑不会执行（因弹窗已关闭）
- **空值保护**：如果用户手动清空了 `pattern`，`patternTips` 保留原值（不强制联动清空）

## 扩展性考虑

- 预设列表为常量数组，后续扩展只需在 `PATTERN_PRESETS` 中增加条目即可
- 分类标签根据预设数据动态生成，新增分类自动出现在标签栏
- 组件本身不依赖业务上下文，可复用于任何需要选择正则的场景
