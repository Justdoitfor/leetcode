# fkLeetcode — LeetCode 刷题打卡系统

这是一个面向算法学习者的全栈 Web 应用，支持刷题打卡、笔记记录、艾宾浩斯复习调度和数据可视化。项目基于 React 18、Vite、Tailwind CSS 和 Node.js 开发。

## 主要功能

- **仪表盘**: 直观的指标统计与年度打卡热力图。
- **题目管理**: 搜索、过滤和录入 LeetCode 题目。
- **打卡与笔记**: 支持 Markdown 与代码高亮的沉浸式打卡体验。
- **智能复习**: 内置 SM-2 (艾宾浩斯) 算法，自动生成每日复习计划。
- **数据分析**: 雷达图、散点图、饼图等多维度的刷题数据分析。

## 本地开发指南

项目采用前后端一体化仓库（Monorepo 结构），前端使用 Vite，后端为 Express。

### 环境要求

- Node.js >= 18
- pnpm (推荐) 或 npm

### 安装与启动

1. 安装依赖:
   ```bash
   pnpm install
   ```

2. 启动开发服务器 (将同时启动前端和后端):
   ```bash
   pnpm run dev
   ```
   
   - 前端默认运行在 `http://localhost:5173`
   - 后端默认运行在 `http://localhost:3001`

   > 首次启动时，后端将自动创建 SQLite 数据库（`data.sqlite`）并填充初始模拟数据，方便你快速预览热力图等功能。

## 部署说明 (Cloudflare)

根据项目要求，本项目计划部署至 Cloudflare。由于 Cloudflare Workers 原生不支持 Node.js 原生模块 (如 `better-sqlite3` 或完整的 `Express`)，推荐采用以下方案进行迁移与部署：

### 1. 数据库迁移 (Cloudflare D1)
目前本地开发使用的是 `better-sqlite3`。要部署到 Cloudflare，需将数据库切换为 [Cloudflare D1](https://developers.cloudflare.com/d1/)：
- 使用 Wrangler 命令行创建 D1 数据库。
- 将 `api/db/schema.ts` 中的建表语句导入到 D1。

### 2. 后端迁移 (Hono 或 Cloudflare Pages Functions)
将现有的 Express 路由迁移为 [Hono](https://hono.dev/) 框架（Hono 拥有和 Express 相似的 API 并且是为 Edge 环境量身定做的）：
- 替换 `express` 实例为 `new Hono()`。
- 使用 `@cloudflare/workers-types` 中的 `D1Database` 接口进行数据库操作，替代 `better-sqlite3`。

### 3. 部署前端 (Cloudflare Pages)
- 在 Cloudflare Dashboard 中创建一个 Pages 项目。
- 连接你的 GitHub 仓库。
- 构建命令设置为 `pnpm run build` 或 `npm run build`。
- 输出目录设置为 `dist`。
- 如果后端已经用 Hono 重构并配置了 `wrangler.toml`，可以直接将后端部署为 Worker 并将前端 Pages 的 `/api` 请求代理到 Worker。

## 贡献

后续所有修改和功能迭代请提交至 `main` 分支。每次修改功能后，请确保同步更新此 `README.md` 中的使用说明。
