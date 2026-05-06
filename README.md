# Joker-Box Web

Joker-Box 前端项目 —— 一个基于 Vue 3 + Vite + Element Plus 构建的现代化中后台管理系统，集成流程设计器、动态表单、AI 助手、富文本编辑、文件预览等能力。

## 技术栈

| 类别 | 技术 |
|------|------|
| 核心框架 | Vue 3 + Vue Router + Pinia |
| 构建工具 | Vite 5 |
| UI 组件库 | Element Plus 2 |
| CSS 预处理器 | Sass / SCSS |
| 流程引擎 | LogicFlow 2 |
| 富文本编辑 | Tiptap 2 |
| 图表库 | ECharts 5 |
| 文件预览 | @vue-office (docx/excel) + vue3-pdf-app |
| 其他 | Axios、html2canvas、marked、vue-draggable、@vueuse/core |

## 功能特性

### 前台应用
- **首页** — 系统入口与概览
- **网站收藏** — 个人网站导航管理
- **码头** — 文件服务器，支持多种文件预览（图片、视频、PDF、Word、Excel、Markdown、代码高亮）
- **代码生成器** — 在线代码生成工具
- **个人空间** — 用户信息、修改密码
- **流程审批** — 基于 LogicFlow 的 BPMN 流程设计与审批
- **干大事论坛** — 社区帖子发布、评论、回复
- **工具箱** — JSON 格式化、Cron 表达式转换、签到卡
- **动态表单** — 可视化表单设计与填报

### 后台管理（控制台）
- **展板** — 数据可视化展示
- **权限管理** — 用户管理、角色管理、机构管理
- **API 管理** — 接口定义与维护
- **菜单管理** — 系统菜单配置
- **网站管理** — 网站收藏后台管理
- **表单管理** — 动态表单模板管理
- **流程管理** — 流程定义与版本管理
- **系统提示** — AI 系统提示词管理
- **邮件记录** — 邮件发送记录查看
- **爬虫任务** — 爬虫任务配置与管理
- **模型管理** — AI 模型配置

### 全局特性
- **多主题切换** — 支持多种预设主题（含暗黑模式）
- **AI 智能助手** — 内置悬浮 AI 对话助手
- **网页截图** — 一键将当前页面截取为图片
- **水印保护** — 全局水印，防止敏感信息泄露
- **路由权限** — 基于角色的细粒度访问控制

## 项目结构

```
Joker-Box-Web/
├── public/                    # 静态资源
├── src/
│   ├── assets/               # 样式、字体、图片、LogicFlow 自定义资源
│   ├── components/           # 公共组件
│   │   ├── common/           # 通用组件（Header、Footer、Avatar、Logo 等）
│   │   ├── dynamicForm/      # 动态表单相关组件
│   │   ├── editor/           # 富文本编辑器（Tiptap）
│   │   ├── icon/             # 自定义图标组件
│   │   ├── media/            # 媒体预览组件（PDF/Excel/Word/视频等）
│   │   └── process-designer/ # 流程设计器（基于 LogicFlow）
│   ├── composables/          # Vue 组合式函数（主题切换等）
│   ├── entity/               # 类型定义/实体
│   ├── router/               # 路由配置
│   ├── utils/                # 工具函数（HTTP、正则、字典、常量等）
│   ├── views/                # 页面视图
│   │   ├── console/          # 后台管理页面
│   │   ├── main/             # 前台页面
│   │   └── common/           # 通用页面（404、403、测试页）
│   ├── App.vue               # 根组件
│   ├── main.js               # 入口文件
│   └── registerComponents.js # 全局组件注册
├── index.html
├── package.json
└── vite.config.js            # Vite 配置（含代理）
```

## 快速开始

### 环境要求
- Node.js >= 18
- npm / yarn / pnpm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认启动在 `http://localhost:5173`，API 请求通过代理转发到 `http://localhost:8100`。

### 构建生产环境

```bash
npm run build
```

### 代码规范

```bash
# ESLint 检查与修复
npm run lint

# Prettier 格式化
npm run format
```

## 代理配置

开发环境下，`/joker-box` 前缀的 API 请求会自动代理到后端服务：

```js
// vite.config.js
proxy: {
  '/joker-box': {
    target: 'http://localhost:8100/',
    changeOrigin: true,
  }
}
```

## 主题系统

项目内置了多主题切换能力，主题文件位于 `src/assets/styles/theme/`。支持：
- 亮色/暗色模式
- 自定义 CSS 变量驱动
- 动态切换无需刷新

## 浏览器支持

- Chrome / Edge >= 90
- Firefox >= 90
- Safari >= 14

## 相关项目

- [Joker-Box 后端](https://github.com/xiaomaohuifaguang/Joker-Box) — 对应的后端服务

## License

[MIT](LICENSE)
