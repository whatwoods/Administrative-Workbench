# 📋 Administrative Workbench (AWB)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Star](https://img.shields.io/github/stars/whatwoods/Administrative-Workbench.svg)](https://github.com/whatwoods/Administrative-Workbench/stargazers)
[![Node](https://img.shields.io/badge/node-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.3-blue.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/docker-unified-blue.svg)](Dockerfile)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)](docs/PROGRESS.md)

**Administrative Workbench (AWB)** 是一个现代化、生产就绪的全栈工作台应用。它采用轻量化的 **SQLite** 数据库和**前后端合一**的 Docker 镜像设计，旨在为个人或小微团队提供一个简单、高效、易于维护的行政办公自动化平台。

> **� 核心亮点**：
> - **极筒部署**：无需 MongoDB，一键启动单个容器即可运行全栈应用。
> - **高性能架构**：前端采用模块化 Feature-based 架构，后端采用内嵌式 SQLite。
> - **离线就绪**：支持离线访问、PWA 特性和本地缓存同步。

---

## ✨ 核心功能

- � **认证系统**：全套 JWT 登录注册流，支持权限角色管理。
- 📝 **任务管理 (Todo)**：支持分类、优先级、截止日期、拖拽排序。
- 💰 **费用追踪 (Expense)**：可视化支出统计图表，支持月度分析和导出。
- 📌 **智能便签 (Note)**：支持 Markdown、版本历史记录和标签分类。
- 🧭 **资源导航 (Navigation)**：支持自定义常用工具链接和分类管理。
- 🌤️ **天气预报**：集成 7 天天气、PM2.5 及生活指数。
- 🤖 **AI 助手**：内置智能谈话系统，辅助日常办公决策。
- ⚡ **实时同步**：基于 WebSocket 的实时数据变化通知。

---

## 🛠️ 技术栈

### 前端 (Modern React)
- **核心**: React 18 + Vite 5
- **状态管理**: Zustand (轻量级)
- **样式**: Vanilla CSS + Lucide Icons
- **架构**: **Feature-based Modular Architecture** (按功能模块组织代码)
- **离线**: Service Worker + IndexedDB

### 后端 (Lightweight Node.js)
- **框架**: Express 4 (TypeScript)
- **数据库**: **SQLite 3** (无需独立服务)
- **ORM**: **Drizzle ORM** (极致性能与类型安全)
- **进程管理**: Supervisor (Docker 内置)
- **代理**: Nginx (Docker 内置，负责静态资源与 API 分发)

---

## 🚀 快速部署 (Docker)

这是在生产环境运行 AWB 的最快方式。

### 1. 一键启动
```bash
mkdir -p /opt/awb && cd /opt/awb

# 下载编排文件
curl -O https://raw.githubusercontent.com/whatwoods/Administrative-Workbench/main/deploy/docker-compose.yml

# 启动 (默认端口 80)
docker compose up -d
```

### 2. 访问
打开浏览器访问：`http://your-server-ip`

详细部署说明请参考：[📖 部署指南](docs/DEPLOYMENT.md)

---

## 📁 目录结构

```text
Administrative-Workbench/
├── backend/                # 后端源码 (Node.js + SQLite)
│   ├── src/
│   │   ├── db/             # Drizzle Schema & SQLite 连接
│   │   ├── controllers/    # 路由控制器
│   │   └── services/       # 业务逻辑
├── frontend/               # 前端源码 (React + Vite)
│   ├── src/
│   │   ├── app/            # 路由、全局状态、入口
│   │   ├── features/       # 功能模块 (auth, todo, expense...)
│   │   └── shared/         # 共享组件与 Hooks
├── deploy/                 # 部署配置 (Docker Compose, 1Panel)
├── docs/                   # 详细文档库
├── Dockerfile              # 全栈合一镜像构建文件
└── docker-compose.yml      # 本地开发编排文件
```

---

## 🛠️ 本地开发

### 后端
```bash
cd backend
npm install
npm run dev
```

### 前端
```bash
cd frontend
npm install
npm run dev
```

---
- 快速启动：[docs/README.md](docs/README.md)
## 🤝 贡献与反馈

欢迎提交 Issue 或 Pull Request 来完善这个项目。

- **GitHub**: [whatwoods/Administrative-Workbench](https://github.com/whatwoods/Administrative-Workbench)
- **Issues**: [提交报告](https://github.com/whatwoods/Administrative-Workbench/issues)

---

## 📝 许可证

本项目采用 [MIT License](LICENSE)。

---
**Happy Work!** �