# fkLeetcode — LeetCode 刷题打卡系统

## 项目目标
构建一个面向算法学习者的全栈 Web 应用，支持刷题打卡、笔记记录、
艾宾浩斯复习调度、数据可视化。使用浅色现代风格，专业且克制。

---

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 构建工具
- React Router v6（前端路由）
- Zustand（全局状态管理）
- react-markdown + remark-gfm + rehype-highlight（Markdown/代码块渲染）
- highlight.js（代码高亮，含行号）
- recharts（图表可视化）
- date-fns（日期处理）
- Tailwind CSS（样式，使用自定义 design token）

### 后端
- Cloudflare D1
- Zod（请求校验）
- cors + helmet（安全中间件）

### 数据库 Schema
创建以下表：

problems 表:
  id INTEGER PRIMARY KEY AUTOINCREMENT
  leetcode_id INTEGER UNIQUE
  title TEXT NOT NULL
  title_zh TEXT
  difficulty TEXT CHECK(difficulty IN ('Easy','Medium','Hard')) NOT NULL
  tags TEXT (JSON数组字符串，如 '["动态规划","数组"]')
  url TEXT
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP

checkins 表:
  id INTEGER PRIMARY KEY AUTOINCREMENT
  problem_id INTEGER REFERENCES problems(id)
  checked_at DATE NOT NULL
  duration_min INTEGER
  status TEXT CHECK(status IN ('Accepted','WrongAnswer','TimeLimitExceeded')) DEFAULT 'Accepted'
  note TEXT (Markdown格式的题解笔记)
  rating INTEGER CHECK(rating IN (1,2,3)) (1=忘记,2=模糊,3=掌握)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP

reviews 表:
  id INTEGER PRIMARY KEY AUTOINCREMENT
  problem_id INTEGER REFERENCES problems(id)
  next_review_date DATE NOT NULL
  interval_days INTEGER DEFAULT 1
  ease_factor REAL DEFAULT 2.5
  repetitions INTEGER DEFAULT 0
  last_rating INTEGER

---

## API 设计（RESTful）

GET    /api/problems              获取题目列表，支持 ?difficulty=&tag=&search=
POST   /api/problems              新增题目
GET    /api/problems/:id          获取题目详情（含所有打卡记录）
PUT    /api/problems/:id          编辑题目
DELETE /api/problems/:id          删除题目

GET    /api/checkins              获取打卡记录，支持 ?date=&problem_id=
POST   /api/checkins              创建打卡记录（同时触发复习计划更新）
PUT    /api/checkins/:id          更新打卡记录（编辑笔记/评分）
DELETE /api/checkins/:id          删除打卡记录

GET    /api/reviews/today         获取今日到期复习列表
POST   /api/reviews/:id/respond   提交复习反馈 body: {rating: 1|2|3}
                                  按 SM-2 算法重新计算 next_review_date 和 interval_days

GET    /api/stats/overview        返回总题数、各难度分布、本周/本月完成数
GET    /api/stats/heatmap         返回近 365 天每日打卡数，格式: [{date, count}]
GET    /api/stats/tags            返回各标签完成数量
GET    /api/stats/weekly          返回近7天每日完成数

---

## SM-2 复习算法实现

在 POST /api/checkins 时，如果是首次打卡该题目，在 reviews 表插入记录：
  next_review_date = today + 1 day，interval_days=1，repetitions=0

在 POST /api/reviews/:id/respond 时根据 rating 更新：

  if rating === 1 (忘记):
    repetitions = 0
    interval_days = 1
    ease_factor 不变

  if rating === 2 (模糊):
    repetitions += 1
    interval_days = max(1, interval_days - 1)
    ease_factor = max(1.3, ease_factor - 0.15)

  if rating === 3 (掌握):
    repetitions += 1
    if repetitions === 1: interval_days = 1
    else if repetitions === 2: interval_days = 6
    else: interval_days = round(interval_days * ease_factor)
    ease_factor = ease_factor + 0.1

  next_review_date = today + interval_days

---

## 前端页面与路由

/ → Dashboard 仪表盘（默认页）
/problems → 题目列表
/problems/new → 新增题目
/problems/:id → 题目详情 + 打卡历史
/problems/:id/checkin → 新增打卡记录（含 Markdown 笔记编辑器）
/review → 今日复习
/stats → 数据分析

---

## UI 设计规范

### 色彩系统（CSS 变量）

:root {
  --color-bg: #F8F7F4;
  --color-surface: #FFFFFF;
  --color-border: rgba(0,0,0,0.08);
  --color-border-strong: rgba(0,0,0,0.14);

  --color-easy: #639922;
  --color-easy-bg: #EAF3DE;
  --color-medium: #BA7517;
  --color-medium-bg: #FAEEDA;
  --color-hard: #A32D2D;
  --color-hard-bg: #FCEBEB;

  --color-primary: #3B6D11;
  --color-primary-hover: #27500A;
  --color-primary-bg: #EAF3DE;

  --color-review: #534AB7;
  --color-review-bg: #EEEDFE;
  --color-review-border: #CECBF6;

  --color-text-primary: #1A1A1A;
  --color-text-secondary: #5F5E5A;
  --color-text-muted: #B4B2A9;

  --color-streak: #854F0B;
  --color-streak-bg: #FAEEDA;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --font-mono: 'DM Mono', 'Fira Code', monospace;
}

### 字体
引入 Google Fonts: DM Sans (400, 500) + DM Mono (400)
body 使用 DM Sans，代码块使用 DM Mono

### 通用组件规范

Layout:
- 左侧固定侧边栏 200px，内容区 flex-1
- 侧边栏背景 #FFFFFF，右侧边框 1px solid var(--color-border)
- 顶部 topbar 高度 52px，白色背景，底部边框
- 内容区背景 var(--color-bg)，padding 20px，overflow-y auto

Card:
- background: var(--color-surface)
- border: 1px solid var(--color-border)
- border-radius: var(--radius-lg)
- padding: 16px 20px

Button Primary:
- background: var(--color-primary), color: white
- border-radius: var(--radius-md), padding: 7px 14px
- font-size: 13px, font-weight: 500
- hover: var(--color-primary-hover)

Button Secondary:
- background: white, color: var(--color-text-secondary)
- border: 1px solid var(--color-border-strong)
- hover: background #F1EFE8

难度标签:
- 圆角胶囊 pill，padding: 2px 8px，font-size: 11px，font-weight: 500
- Easy: color var(--color-easy), bg var(--color-easy-bg)
- Medium: color var(--color-medium), bg var(--color-medium-bg)
- Hard: color var(--color-hard), bg var(--color-hard-bg)

### 各页面详细设计

#### 1. Dashboard 仪表盘 (/)

布局：双列 Grid，左列 flex:1，右列 280px，gap 16px

左列内容（从上到下）：
  [指标卡区] 3列 grid：
    - 已完成题数（大字号 24px，绿色）
    - 通过率（百分比）
    - 连续打卡天数（带🔥图标，橙色系）

  [热力图卡] 标题"打卡记录"
    - 7行×53列 grid（按周排列）展示近一年每日打卡密度
    - 5档颜色：#F1EFE8 → #C0DD97 → #97C459 → #639922 → #3B6D11
    - 悬停 tooltip 显示日期和题数
    - 图例在右下角

  [最近记录卡] 标题"最近打卡"
    - 列表展示，每行：✓图标 + 难度标签 + 题目名 + 算法标签 + 时间
    - 点击跳转到题目详情页

右列内容（从上到下）：
  [分布图卡] 甜甜圈图：Easy/Medium/Hard 占比
    使用 recharts PieChart，内圈显示总数

  [标签进度卡] 每个标签一行：
    标签名（fixed宽度） + 进度条 + "完成/总数"
    进度条颜色随完成率变化（<40% 红，40-70% 橙，>70% 绿）

  [复习队列卡] 背景 #FAFAFA
    标题：今日复习（数字徽章显示待复习数）
    每题展示：题名 + 难度 + 第N次复习
    三个按钮：忘记了 / 模糊 / 掌握
    点击后此卡消失（乐观更新），显示下一题

  [本周图卡] recharts BarChart，7天每日完成数柱状图
    柱子按 Easy/Medium/Hard 颜色堆叠（StackedBar）

侧边栏：
  顶部 Logo（绿色小图标 + "fkLeetcode"文字）
  导航菜单项：仪表盘 / 题目列表 / 今日复习（红点显示待复习数）/ 数据分析
  难度快速筛选：简单 / 中等 / 困难（点击跳转到带过滤的题目列表）
  底部连续打卡天数徽章

#### 2. 题目列表 (/problems)

顶部：搜索框（placeholder "搜索题目名称或编号..."）+ 难度筛选 tabs + 标签多选下拉
      右侧"+ 添加题目"按钮

表格列：# / 题目名称 / 难度 / 标签 / 完成次数 / 最近打卡 / 操作
行悬停高亮，点击跳转详情

#### 3. 题目详情 (/problems/:id)

上半部分：题目信息（LeetCode链接、难度、标签、做题次数统计）
中部：[立即打卡] 大按钮

打卡历史 Tab：每次打卡记录列表，含日期、耗时、状态、评分
最佳笔记展示：Markdown 渲染，使用 react-markdown + rehype-highlight

#### 4. 打卡记录页 (/problems/:id/checkin)

表单字段：
  - 耗时（分钟，数字输入）
  - 提交状态（Accepted / WrongAnswer / TLE，Radio）
  - 自我评分（1-3，大图标按钮：😰 / 😐 / 😊）
  - 笔记（Markdown 编辑器）

Markdown 编辑器：
  - 左右分栏：左侧 textarea 编辑，右侧实时预览
  - 工具栏：加粗 / 斜体 / 代码块 / 行内代码 / 标题 / 链接
  - 代码块支持语言选择（python / javascript / java / c++ / go）
  - 预览区代码块使用 highlight.js 语法高亮，含语言标签和复制按钮

#### 5. 今日复习 (/review)

卡片式翻页布局，一次显示一题：
  - 题目名、难度、标签、距上次做题天数
  - "查看上次笔记"展开区（Markdown 渲染）
  - 底部三个评分按钮（大号，全宽）
  - 进度指示：第 X / Y 题
  - 全部完成后显示庆祝动画 + 今日统计

#### 6. 数据分析 (/stats)

Row 1：4个指标卡（总题数 / 本月完成 / 平均耗时 / 复习完成率）
Row 2：折线图（近30天每日完成数趋势）
Row 3：左侧雷达图（各算法类型覆盖率），右侧散点图（题目耗时分布）
Row 4：标签完成情况完整列表（可排序）

---

## 代码组织结构

frontend/
  src/
    api/          # axios 请求封装，每个资源一个文件
    components/   # 通用组件
      ui/         # Button, Card, Badge, Input, Modal, Tabs
      layout/     # Sidebar, Topbar, PageLayout
      markdown/   # MarkdownEditor, MarkdownPreview, CodeBlock
      charts/     # HeatmapChart, DonutChart, BarChart, LineChart
    pages/        # 页面组件（与路由对应）
    stores/       # Zustand store（problems, checkins, reviews, stats）
    types/        # TypeScript 接口定义
    utils/        # sm2.ts, date.ts, formatters.ts

backend/
  src/
    db/           # database.ts（初始化）, schema.ts（建表）
    routes/       # problems.ts, checkins.ts, reviews.ts, stats.ts
    middleware/   # errorHandler.ts, validate.ts
    utils/        # sm2.ts（复习算法）
    index.ts      # Express 入口

---

## 数据初始化

应用首次启动时，自动插入20条示例题目数据，包含：
两数之和(Easy)、最长不重复子串(Medium)、合并K个链表(Hard)等常见题目，
带有合理的标签分类，并生成过去60天的随机打卡历史记录，
以便热力图和图表有数据可以展示。

---

## 细节要求

1. 所有异步操作显示 loading skeleton（灰色占位块）
2. 操作成功/失败使用轻量 toast 通知（右上角，3秒自动消失）
3. 删除操作需要二次确认 modal
4. 表单使用 Zod 前端校验，实时显示错误信息
5. 热力图和图表响应窗口宽度变化（ResizeObserver）
6. 打卡笔记 Markdown 编辑器支持 Ctrl+S 快捷键保存
7. 侧边栏"今日复习"菜单项显示红色数字徽章（待复习数 > 0 时）
8. 所有日期使用 date-fns 格式化，支持中文相对时间（"今天"/"昨天"/"3天前"）
9. 代码块复制按钮点击后图标变为✓，2秒后还原
10. 整体 border-radius 统一，不使用 sharp 方角
