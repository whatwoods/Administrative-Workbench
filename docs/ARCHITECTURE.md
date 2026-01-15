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

### 6. AI 智能助手 🤖
- 智能问答
- 自动创建待办事项
- 智能录入费用
- 文档生成

## 🛠️ 技术栈

### 前端
- **框架**：React 18
- **语言**：TypeScript
- **构建工具**：Vite
- **状态管理**：Zustand
- **HTTP 客户端**：Axios
- **UI 组件**：Lucide React
- **图表**：Recharts
- **通知**：React Hot Toast

### 后端
- **运行时**：Node.js
- **框架**：Express
- **语言**：TypeScript
- **数据库**：MongoDB + Mongoose
- **认证**：JWT
- **密码加密**：bcryptjs
- **验证**：express-validator

### 部署
- **容器化**：Docker
- **编排**：Docker Compose
- **Web 服务器**：Nginx（前端）

## 🚀 快速开始

### 前置要求
- Node.js 20+
- MongoDB 7+
- Docker & Docker Compose（可选）

### 本地开发

#### 后端启动
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### 前端启动
```bash
cd frontend
npm install
npm run dev
```

### Docker 部署
```bash
docker-compose up -d
```

访问：
- 前端：http://localhost:3000
- API：http://localhost:5000/api
- 健康检查：http://localhost:5000/api/health

## 📡 API 端点规划

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出

### Todo
- `GET /api/todos` - 获取所有待办
- `GET /api/todos/:id` - 获取单个待办
- `POST /api/todos` - 创建待办
- `PATCH /api/todos/:id` - 更新待办
- `DELETE /api/todos/:id` - 删除待办
- `POST /api/todos/reorder` - 重新排序

### 费用
- `GET /api/expenses` - 获取费用列表
- `GET /api/expenses/stats` - 获取统计数据
- `POST /api/expenses` - 创建费用
- `PATCH /api/expenses/:id` - 更新费用
- `DELETE /api/expenses/:id` - 删除费用
- `POST /api/expenses/bulk-import` - 批量导入

### 天气
- `GET /api/weather/current` - 当前天气
- `GET /api/weather/forecast` - 天气预报
- `GET /api/weather/solar-terms` - 节气信息

### 便签
- `GET /api/notes` - 获取便签列表
- `POST /api/notes` - 创建便签
- `PATCH /api/notes/:id` - 更新便签
- `DELETE /api/notes/:id` - 删除便签

### 导航
- `GET /api/navigation` - 获取导航项
- `POST /api/navigation` - 创建导航项
- `PATCH /api/navigation/:id` - 更新导航项
- `DELETE /api/navigation/:id` - 删除导航项

### AI 助手
- `POST /api/ai/chat` - 问答
- `POST /api/ai/create-todo` - 智能创建待办
- `POST /api/ai/add-expense` - 智能添加费用

## 📊 数据库模型

### User（用户）
- username, email, password
- role (admin/user)
- preferences (theme, language, notifications)

### Todo（待办）
- userId, title, description
- category, priority, status
- dueDate, order

### Expense（费用）
- userId, amount, category
- description, date, status
- attachments

### Note（便签）
- userId, title, content
- type (text/draw), tags
- versions (版本历史)

### Navigation（导航）
- userId, category, title
- url, icon, order, isDefault

## 🔐 安全性

- JWT 令牌认证
- 密码 bcrypt 加密
- CORS 配置
- 用户数据隔离
- 操作日志记录

## 📈 性能优化

- 懒加载
- 图片压缩
- 缓存策略
- 代码分割
- 数据库索引

## 🌐 响应式设计

- 桌面（>1024px）
- 平板（768px-1024px）
- 移动（<768px）

## 📝 下一步

1. **后端路由开发**：实现各功能模块的 API
2. **前端组件开发**：开发各功能的 React 组件
3. **数据同步**：实现实时数据同步机制
4. **认证系统**：完善用户认证和权限管理
5. **AI 集成**：集成 LLM API（OpenAI/Claude）
6. **测试**：单元测试、集成测试、E2E 测试
7. **部署**：CI/CD 流程、生产环境配置

## 📄 许可证

MIT
