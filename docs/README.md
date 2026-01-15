# Administrative Workbench - 快速启动指南

## 🚀 极速部署 (Docker)

最简单的运行方式是使用 Docker Compose。

```bash
# 下载 docker-compose.yml
curl -O https://raw.githubusercontent.com/whatwoods/Administrative-Workbench/main/deploy/docker-compose.yml

# 启动服务
docker compose up -d
```

访问地址：
- 页面：http://localhost:80
- API：http://localhost:80/api

---

## 🛠️ 本地开发环境

如果您需要修改代码，请按以下步骤配置开发环境。

### 前置要求
- Node.js 20+
- npm 9+
- Git

### 1. 启动后端

后端使用 TypeScript + Express + SQLite。

```bash
cd backend

# 安装依赖
npm install

# 初始化数据库 (自动创建各类表)
npm run db:push

# 启动开发服务器
npm run dev
```

API 将在 `http://localhost:5000` 启动。

### 2. 启动前端

前端使用 React + Vite。

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:5173` 启动。

---

## 📚 项目结构

采用 **Feature-based** 模块化架构。

```text
frontend/src/
├── app/                  # 应用入口与路由
├── features/             # 功能模块
│   ├── ai/               # AI 助手
│   ├── auth/             # 认证
│   ├── todo/             # 待办事项
│   ├── expense/          # 费用追踪
│   ├── note/             # 智能便签
│   ├── weather/          # 天气
│   └── dashboard/        # 仪表盘
├── shared/               # 共享组件与 Hooks
└── main.tsx
```

---

## 🔌 API 概览

### 核心功能
- **Auth**: `/api/auth` (Login, Register, Profile)
- **Todo**: `/api/todos` (CRUD, Reorder)
- **Expense**: `/api/expenses` (CRUD, Stats)
- **Note**: `/api/notes` (CRUD, Search)
- **Weather**: `/api/weather` (Current, Forecast, SolarTerms)
- **AI**: `/api/ai` (Chat, Suggestions)

### 环境变量

复制 `.env.example` 到 `backend/.env` 并配置：

```ini
LLM_PROVIDER=tencent
LLM_API_KEY=your_key
WEATHER_API_KEY=your_key
```

---

## ❓ 常见问题

### 数据库在哪里？
本项目使用 **SQLite**，数据库文件位于 `backend/data.db` (开发环境) 或 `/app/data/admin-workbench.db` (Docker 环境)。

### 如何重置数据？
删除 `data.db` 文件重启后端即可重建空数据库。

### 构建失败？
请确保 Node.js 版本 >= 20，并尝试删除 `node_modules` 重新安装。
