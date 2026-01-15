# Administrative Workbench - 开发指南

## 环境设置

### 1. 安装依赖

后端：
```bash
cd backend
npm install
```

前端：
```bash
cd frontend
npm install
```

### 2. 环境变量配置

后端 (`.env`)：
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/admin-workbench
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
WEATHER_API_KEY=your-weather-api-key
OPENAI_API_KEY=your-openai-api-key
```

### 3. 启动服务

终端 1 - 后端：
```bash
cd backend
npm run dev
```

终端 2 - 前端：
```bash
cd frontend
npm run dev
```

### 4. 启动 MongoDB

使用 Docker：
```bash
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:7
```

## 代码规范

### TypeScript
- 使用严格模式
- 明确类型注解
- 避免使用 `any`

### React 组件
- 函数式组件
- 使用 hooks
- Prop 类型定义

### 后端
- RESTful API 设计
- 错误处理
- 请求验证

## 文件命名规范

- 组件：`PascalCase` (e.g., `TodoList.tsx`)
- 工具函数：`camelCase` (e.g., `formatDate.ts`)
- 常量：`UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

## 提交规范

```
feat: 新增功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 代码重构
test: 测试相关
chore: 其他改动
```

## 常见问题

### MongoDB 连接失败
检查 MongoDB 是否运行，确认连接字符串正确

### CORS 错误
检查后端 CORS 配置，确认前端 URL 已加入白名单

### 环境变量未生效
确认 `.env` 文件在正确的目录，重启开发服务器
