# 📋 Administrative Workbench

一个功能完整的现代化工作台应用，集成任务管理、费用追踪、智能便签和数据可视化等核心功能。基于 React + Express + MongoDB 全栈架构构建。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![React](https://img.shields.io/badge/react-18.2+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.2+-blue.svg)

## ✨ 核心功能

### 🔐 认证系统
- 用户注册与登录
- JWT 令牌认证
- 密码加密（bcryptjs）
- 受保护的路由

### 📝 Todo 任务管理
- 创建、编辑、删除任务
- 多维度筛选（分类、优先级、状态）
- 任务排序和状态跟踪
- 截止日期管理

### 💰 费用追踪系统
- 记录和管理支出
- 分类统计和分析
- 可视化图表展示
- 数据批量导入
- 支出趋势分析

### 📌 智能便签
- 文本和多种内容类型支持
- 版本历史管理
- 标签分类
- 便签版本查看

### 🧭 导航管理
- 自定义导航项
- 拖拽排序
- 快速访问

### 📊 数据可视化
- Recharts 集成
- 实时统计数据
- 交互式图表

## 🚀 快速开始

### 前置要求
- Node.js 18+
- Docker 和 Docker Compose（推荐）
- MongoDB 7+（如使用 Docker Compose 自动配置）

### 使用 Docker Compose（推荐）

```bash
# 克隆项目
git clone https://github.com/whatwoods/Administrative-Workbench.git
cd Administrative-Workbench

# 启动所有服务（MongoDB、后端、前端）
docker-compose up -d

# 应用将可在以下地址访问：
# 前端: http://localhost
# 后端: http://localhost:3001
# API 文档: http://localhost:3001/api
```

### 本地开发运行

#### 后端设置
```bash
cd backend

# 复制环境配置文件
cp .env.example .env

# 安装依赖
npm install

# 启动服务（需要 MongoDB 运行）
npm run dev
```

#### 前端设置
```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

## 📁 项目结构

```
Administrative-Workbench/
├── backend/                 # Express 后端应用
│   ├── src/
│   │   ├── controllers/    # 请求处理器
│   │   ├── models/         # Mongoose 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── services/       # 业务逻辑层
│   │   ├── middleware/     # 中间件（认证、错误处理）
│   │   ├── config/         # 配置文件
│   │   └── index.ts        # 服务器入口
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React Vite 前端应用
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 客户端
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── styles/         # 全局样式
│   │   ├── App.tsx         # 主应用组件
│   │   └── main.tsx        # 应用入口
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.ts
│   └── package.json
├── docs/                    # 项目文档
│   ├── ARCHITECTURE.md     # 架构设计文档
│   ├── DEVELOPMENT.md      # 开发指南
│   └── PROGRESS.md         # 进度跟踪
├── docker-compose.yml      # Docker Compose 配置
├── QUICKSTART.md           # 快速启动指南
├── DEPLOYMENT.md           # 部署指南
└── PROJECT_SUMMARY.md      # 项目总结
```

## 🛠️ 技术栈

### 前端
- **框架**: React 18.2
- **构建工具**: Vite 5.0
- **语言**: TypeScript 5.2
- **路由**: React Router 6.20
- **状态管理**: Zustand 4.4
- **HTTP 客户端**: Axios 1.6
- **UI 组件**: Lucide React 0.292
- **数据可视化**: Recharts 2.10
- **通知**: React Hot Toast 2.4

### 后端
- **框架**: Express 4.18
- **语言**: TypeScript 5.2
- **数据库**: MongoDB 7.0 + Mongoose 8.0
- **认证**: JWT + bcryptjs
- **验证**: express-validator
- **CORS**: 跨域资源共享

### DevOps
- **容器**: Docker
- **编排**: Docker Compose
- **反向代理**: Nginx
- **数据库**: MongoDB

## 📖 API 文档

项目包含 40+ RESTful API 端点，涵盖以下模块：

### 认证 API
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### Todo API
- `GET /api/todos` - 获取所有任务（支持筛选）
- `POST /api/todos` - 创建任务
- `GET /api/todos/:id` - 获取单个任务
- `PUT /api/todos/:id` - 更新任务
- `DELETE /api/todos/:id` - 删除任务
- `POST /api/todos/reorder` - 重新排序任务

### 费用 API
- `GET /api/expenses` - 获取所有费用
- `POST /api/expenses` - 创建费用记录
- `GET /api/expenses/stats` - 获取统计数据
- `PUT /api/expenses/:id` - 更新费用
- `DELETE /api/expenses/:id` - 删除费用
- `POST /api/expenses/bulk-import` - 批量导入

### 便签 API
- `GET /api/notes` - 获取所有便签
- `POST /api/notes` - 创建便签
- `GET /api/notes/:id` - 获取便签详情
- `PUT /api/notes/:id` - 更新便签
- `DELETE /api/notes/:id` - 删除便签
- `GET /api/notes/:id/versions` - 获取版本历史

### 导航 API
- `GET /api/navigation` - 获取导航项
- `POST /api/navigation` - 创建导航
- `PUT /api/navigation/:id` - 更新导航
- `DELETE /api/navigation/:id` - 删除导航

详见 [QUICKSTART.md](QUICKSTART.md) 获取完整 API 文档。

## 🔑 环境配置

### 后端 (.env)
```env
MONGODB_URI=mongodb://admin:password@mongodb:27017/admin
JWT_SECRET=your_jwt_secret_key
PORT=3001
NODE_ENV=development
```

### 前端 (API 端点)
```
VITE_API_URL=http://localhost:3001
```

## 📊 数据库模型

### User
```typescript
{
  username: string;
  email: string;
  password: string (hashed);
  role: string;
  preferences: object;
  createdAt: Date;
}
```

### Todo
```typescript
{
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  dueDate: Date;
  userId: ObjectId;
  order: number;
}
```

### Expense
```typescript
{
  amount: number;
  category: string;
  description: string;
  date: Date;
  status: string;
  userId: ObjectId;
}
```

### Note
```typescript
{
  title: string;
  content: string;
  type: 'text' | 'image' | 'mixed';
  tags: string[];
  versions: array;
  userId: ObjectId;
}
```

### Navigation
```typescript
{
  category: string;
  title: string;
  url: string;
  icon: string;
  order: number;
  userId: ObjectId;
}
```

## 🧪 测试

```bash
# 后端测试
cd backend
npm test

# 前端测试
cd frontend
npm test
```

## 📚 文档

- [快速启动指南](QUICKSTART.md) - 5分钟快速开始
- [架构设计文档](docs/ARCHITECTURE.md) - 详细架构说明
- [开发指南](docs/DEVELOPMENT.md) - 本地开发和代码标准
- [部署指南](DEPLOYMENT.md) - 生产环境部署
- [项目总结](PROJECT_SUMMARY.md) - 完整项目概览

## 🚢 部署

支持多种部署方式：

### Docker Compose（本地/开发）
```bash
docker-compose up -d
```

### Docker Swarm（生产）
参见 [DEPLOYMENT.md](DEPLOYMENT.md)

### Kubernetes（企业级）
参见 [DEPLOYMENT.md](DEPLOYMENT.md)

### 云服务商
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- Railway, Render 等

详见 [DEPLOYMENT.md](DEPLOYMENT.md) 获取完整部署指南。

## 📈 项目进度

- ✅ 认证系统
- ✅ Todo 管理
- ✅ 费用追踪
- ✅ 智能便签
- ✅ 导航管理
- ✅ 前端 UI/UX
- ✅ 后端 API
- ✅ 数据库设计
- ✅ Docker 配置
- ✅ 完整文档
- 🔄 单元测试和 E2E 测试
- 🔄 天气 API 集成
- 🔄 AI 助手集成
- 🔄 WebSocket 实时同步
- 🔄 离线支持（Service Worker）

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 👤 作者

**whatwoods**

- GitHub: [@whatwoods](https://github.com/whatwoods)
- Repository: [Administrative-Workbench](https://github.com/whatwoods/Administrative-Workbench)

## 🙏 致谢

感谢所有贡献者和支持者！

---

**祝您使用愉快！** 如有问题，欢迎通过 [Issues](https://github.com/whatwoods/Administrative-Workbench/issues) 反馈。