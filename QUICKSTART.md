# Administrative Workbench - 快速启动指南

## 🚀 快速开始（5分钟）

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动开发服务器（需要 MongoDB 运行）
npm run dev
```

服务器将在 `http://localhost:5000` 启动

### 2. 启动 MongoDB

使用 Docker（推荐）：
```bash
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7
```

或本地安装 MongoDB 并启动服务。

### 3. 启动前端

在新终端中：
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:5173` 启动

### 4. 访问应用

- 打开浏览器访问 `http://localhost:5173`
- 使用任意邮箱和密码注册新账户
- 开始使用应用！

## 📚 已实现功能

### ✅ 认证系统
- 用户注册和登录
- JWT 令牌管理
- 受保护的路由
- 安全的密码存储（bcrypt）

### ✅ Todo 管理
- 创建、编辑、删除待办事项
- 分类（维修、项目、日常工作）
- 优先级设置（高、中、低）
- 状态跟踪（待处理、进行中、已完成）
- 截止日期设置
- 按类别和优先级筛选

### ✅ 费用追踪
- 记录各类费用
- 分类统计（办公、维修、水电气等）
- 月度汇总
- 可视化图表
- 批量导入支持

### ✅ 智能便签
- 创建文本和绘图便签
- 多标签分类
- 版本历史记录
- 自动保存

### ✅ UI/UX
- 响应式设计（桌面、平板、移动）
- 可折叠侧边栏导航
- 用户认证流程
- 美观的深色主题支持

## 🔌 API 端点

### 认证
```
POST   /api/auth/register     - 注册新用户
POST   /api/auth/login        - 用户登录
GET    /api/auth/profile      - 获取用户信息（需要认证）
```

### Todo
```
GET    /api/todos             - 获取所有待办
POST   /api/todos             - 创建待办
PATCH  /api/todos/:id         - 更新待办
DELETE /api/todos/:id         - 删除待办
POST   /api/todos/reorder     - 重新排序
```

### 费用
```
GET    /api/expenses          - 获取费用列表
GET    /api/expenses/stats    - 获取统计数据
POST   /api/expenses          - 创建费用
PATCH  /api/expenses/:id      - 更新费用
DELETE /api/expenses/:id      - 删除费用
POST   /api/expenses/bulk-import - 批量导入
```

### 便签
```
GET    /api/notes             - 获取所有便签
POST   /api/notes             - 创建便签
PATCH  /api/notes/:id         - 更新便签
DELETE /api/notes/:id         - 删除便签
GET    /api/notes/:id/versions - 获取版本历史
```

### 导航
```
GET    /api/navigation        - 获取导航项
POST   /api/navigation        - 创建导航项
PATCH  /api/navigation/:id    - 更新导航项
DELETE /api/navigation/:id    - 删除导航项
POST   /api/navigation/reorder - 重新排序
```

## 🛠️ 环境变量设置

### 后端 (.env)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:admin123@localhost:27017/admin-workbench?authSource=admin
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
WEATHER_API_KEY=your-weather-api-key
OPENAI_API_KEY=your-openai-api-key
```

## 📦 Docker 部署

使用 Docker Compose 一键部署：

```bash
# 启动所有服务（MongoDB、后端、前端）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问：
- 前端：http://localhost:3000
- API：http://localhost:5000/api
- 数据库：localhost:27017

## 🧪 测试账户

注册时使用任意邮箱和密码即可创建账户。例如：
- 邮箱：test@example.com
- 密码：password123

## 📁 项目结构

```
frontend/
├── src/
│   ├── components/      # React 组件
│   │   ├── Sidebar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── TodoForm.tsx
│   │   ├── ExpenseForm.tsx
│   │   └── NoteForm.tsx
│   ├── pages/          # 页面
│   │   ├── Dashboard.tsx
│   │   ├── Auth.tsx
│   │   ├── TodoPage.tsx
│   │   ├── ExpensePage.tsx
│   │   └── NotePage.tsx
│   ├── services/       # API 服务
│   ├── hooks/          # 自定义 hooks
│   ├── styles/         # 全局样式
│   └── App.tsx         # 主应用

backend/
├── src/
│   ├── routes/         # API 路由
│   ├── controllers/    # 请求处理
│   ├── models/         # 数据模型
│   ├── middleware/     # 中间件
│   ├── services/       # 业务逻辑
│   └── index.ts        # 入口文件
```

## 🔗 关键技术

- **前端**：React 18, TypeScript, Vite, React Router, Zustand
- **后端**：Node.js, Express, TypeScript, MongoDB, Mongoose, JWT
- **部署**：Docker, Docker Compose, Nginx

## 🚧 下一步计划

- [ ] 天气 API 集成
- [ ] AI 助手集成（OpenAI）
- [ ] 实时数据同步（WebSocket）
- [ ] 离线支持（Service Worker）
- [ ] 单元测试和 E2E 测试
- [ ] 性能优化和监控
- [ ] 用户权限管理增强
- [ ] 数据备份和恢复

## ❓ 常见问题

### 1. MongoDB 连接失败

确保 MongoDB 正在运行：
```bash
# Docker 方式
docker ps | grep mongo

# 或重新启动
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:7
```

### 2. 前端无法连接后端

检查后端是否运行在 5000 端口：
```bash
curl http://localhost:5000/api/health
```

应该返回 `{"status":"ok",...}`

### 3. 密钥和令牌错误

确保 JWT_SECRET 已在后端 .env 中设置。更改后需要重启服务器。

### 4. 依赖安装失败

清除缓存并重新安装：
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📞 支持

如有问题，请检查：
1. 控制台错误信息
2. 浏览器开发者工具的网络标签
3. 后端的日志输出
4. 数据库连接状态

## 📄 许可证

MIT
