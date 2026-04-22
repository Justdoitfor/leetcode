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

## 部署说明 (Cloudflare Pages 部署)

如果你不熟悉命令行，可以完全通过 Cloudflare 的网页控制台 (Dashboard) 进行部署。

### 1. 创建 D1 数据库
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 在左侧菜单中找到并点击 **Workers & Pages** -> **D1**。
3. 点击右侧的 **Create database** 按钮。
4. 输入数据库名称，比如 `db-name`，然后点击创建。
5. 创建成功后，点击进入该数据库详情页。
6. 在数据库详情页点击 **Console** 标签页，这里可以执行 SQL。
7. 打开项目根目录下的 `schema.sql` 文件，复制其中的所有 SQL 语句(注意：需要逐条复制执行，d1 console中多条语句执行不支持)。
8. 粘贴到 Cloudflare 的 Console 输入框中，点击 **Execute** 执行，完成表结构初始化。
9. （可选）如果你需要一些初始测试数据，打开 `seed.sql` 文件，复制里面的代码，同样在 Console 里粘贴并点击 **Execute**。

### 2. 部署项目到 Cloudflare Pages
1. 在 Cloudflare 控制台左侧菜单点击 **Workers & Pages**。
2. 点击 **Create application**，选择 **Pages** 标签，然后点击 **Connect to Git**。
3. 授权连接你的 GitHub 账号，选择当前的 `db-name` 仓库。
4. 在 "Set up builds and deployments" 页面，进行以下设置：
   - **Project name**: `leetcode` (或你喜欢的名字)
   - **Production branch**: `main`
   - **Framework preset**: 选择 `None`
   - **Build command**: 填入 `npm run build`
   - **Build output directory**: 填入 `dist`
5. **最重要的一步：绑定数据库**
   - 展开 **Environment variables (advanced)** 选项卡。
   - 不要直接点保存！继续向下找到 **D1 database bindings** 区域。
   - 点击 **Add binding**。
   - **Variable name** 必须严格填写为：`DB`。
   - **D1 database** 的下拉菜单中，选择你刚刚在第 1 步创建的数据库 (比如 `db-name`)。
6. 最后点击底部的 **Save and Deploy**。


