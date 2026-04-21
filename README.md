# fkLeetcode — LeetCode 刷题打卡系统

这是一个面向算法学习者的全栈 Web 应用，支持刷题打卡、笔记记录、艾宾浩斯复习调度和数据可视化。项目基于 React 18、Vite、Tailwind CSS 和 Cloudflare 生态 (Hono + D1 Database) 开发。

## 主要功能

- **仪表盘**: 直观的指标统计与年度打卡热力图。
- **题目管理**: 搜索、过滤和录入 LeetCode 题目。
- **打卡与笔记**: 支持 Markdown 与代码高亮的沉浸式打卡体验。
- **智能复习**: 内置 SM-2 (艾宾浩斯) 算法，自动生成每日复习计划。
- **数据分析**: 雷达图、散点图、饼图等多维度的刷题数据分析。

## 本地开发指南

本项目采用 Vite 作为构建工具，通过 `@hono/vite-dev-server` 插件在本地同时运行前端 React 与后端 Hono API，并使用 Wrangler 提供本地的 Cloudflare D1 模拟环境。

### 环境要求

- Node.js >= 18
- pnpm (推荐) 或 npm

### 安装与启动

1. 安装依赖:
   ```bash
   pnpm install
   ```

2. 初始化本地 D1 数据库:
   ```bash
   pnpm run db:init
   ```
   > 这将在 `.wrangler/state/v3/d1` 目录下创建本地 SQLite 数据库文件，并执行 `schema.sql` 填充表结构和初始测试数据。

3. 启动开发服务器:
   ```bash
   pnpm run dev
   ```
   应用将运行在 `http://localhost:5173`，后端 API 可通过 `/api/*` 访问。

## 部署说明 (Cloudflare)

项目原生兼容 Cloudflare Pages 和 Cloudflare Workers 架构。

### 1. 创建远程 D1 数据库

首先在你的 Cloudflare 账号中创建一个 D1 数据库：

```bash
npx wrangler d1 create fkleetcode-db
```

记下输出的 `database_id`，将其更新到项目根目录的 `wrangler.toml` 文件中：

```toml
[[d1_databases]]
binding = "DB"
database_name = "fkleetcode-db"
database_id = "这里填入你的database_id"
```

### 2. 初始化远程数据库结构

将本地的表结构和初始数据导入到远程 D1 数据库：

```bash
npx wrangler d1 execute fkleetcode-db --remote --file=./schema.sql
```

### 3. 部署到 Cloudflare

你可以将项目构建并发布到 Cloudflare Pages（同时包含静态前端资产和后端 Functions）：

```bash
pnpm run build
npx wrangler pages deploy dist --project-name=fkleetcode
```

> **注意**：你需要在 Cloudflare Pages Dashboard 中为该项目绑定对应的 D1 数据库 (变量名设为 `DB`)。

## 贡献

后续所有修改和功能迭代请提交至 `main` 分支。每次修改功能后，请确保同步更新此 `README.md` 中的使用说明。
