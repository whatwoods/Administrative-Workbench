# Administrative Workbench - 项目架构

## 📋 项目概述

Administrative Workbench 是一个全功能的行政管理工作台，集成了多个核心功能模块，支持桌面、平板和移动设备。

## 🏗️ 项目结构

```
Administrative-Workbench/
├── frontend/                 # React + TypeScript 前端
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API 服务
│   │   ├── hooks/          # 自定义 hooks
│   │   ├── styles/         # 样式文件
│   │   ├── utils/          # 工具函数
│   │   ├── App.tsx         # 主应用
│   │   └── main.tsx        # 入口文件
│   ├── public/             # 静态资源
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── Dockerfile
│
├── backend/                 # Node.js + Express 后端
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   ├── middleware/     # 中间件
│   │   ├── config/         # 配置文件
│   │   ├── utils/          # 工具函数
│   │   └── index.ts        # 服务器入口
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── Dockerfile
│
├── docs/                   # 文档
├── docker-compose.yml      # Docker 编排
├── pr.md                   # 需求文档
└── README.md

```

## 🎯 核心功能

### 1. Todo List 管理 ✓
- **分类支持**：维修事项、工程项目、日常工作
- **功能**：增删改查、拖拽排序、状态标记
- **筛选**：按项目、紧急程度筛选

### 2. 时间与气候信息面板 🌤️
- 当前天气（温度、天气状况、日落时间）
- 5日天气预报
- 节气信息显示
- 下个节气倒计时

### 3. 智能便签组件 📝
- 文本输入和绘图支持
- 多便签管理
- 自动保存
- 版本历史

### 4. 费用统计卡片 💰
- 手动录入和批量导入
- 分类统计（办公、维修、水电气）
- 可视化图表（月度趋势、报销进度）

### 5. 快速导航栏 🔗
- 固定侧边栏（可折叠）
- 分组链接
- 自定义和搜索
- 云端同步

### 6. AI Agent 助手 (LLM Agent) 🤖
- **核心逻辑**：基于 `aiAgentService.ts` 的工具编排引擎。
- **能力**：具备 13+ 内置 Tool，实现从自然语言到 API 调用的双向映射。
- **RAG 增强**：集成语义搜索，基于本地笔记库回答用户问题。
- **多模态**：支持 Web Speech API 语音交互。

## 🛠️ 技术栈

### 前端
- **框架**：React 18 + Vite 5
- **语言**：TypeScript
- **状态管理**：Zustand
- **离线能力**: PWA + Service Worker + LocalStorage
- **核心组件**: `AIAssistant` (聊天界面), `AIFloatingWidget` (全局悬浮窗)
- **UI 风格**：Vanilla CSS + Glassmorphism + Lucide Icons

### 后端
- **运行时**：Node.js (TypeScript)
- **框架**：Express 4
- **数据库**：**SQLite 3** (嵌入式)
- **ORM**：**Drizzle ORM** (负责 Schema 定义、迁移与高性能查询)
- **AI 引擎**：Tencent Cloud DeepSeek V3 / SiliconFlow
- **认证**：JWT (权限校验与用户隔离)

### 部署 (Unified Image)
- **基础镜像**：Debian / Alpine
- **反向代理**：Nginx (内部转发静态资源与 API)
- **容器化**：Docker + Docker Compose


## 📝 下一步优化

1. **测试覆盖**：完善单元测试和 E2E 测试
2. **性能监控**：添加应用性能监控
3. **CI/CD**：优化自动化部署流程


## 📄 许可证

MIT
