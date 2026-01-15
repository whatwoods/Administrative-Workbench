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

后端 (`backend/.env`)：
```env
# JWT 配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# LLM 配置 (AI Agent 核心)
LLM_PROVIDER=tencent
LLM_API_KEY=your-tencent-cloud-api-key
LLM_MODEL=deepseek-v3.2
```

### 3. 启动服务

本项目使用 **SQLite** 数据库，无需安装独立的数据库服务。

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

## ⌨️ 快捷键

在应用中可以使用以下快捷键：

- `Ctrl + Shift + A`: 打开/关闭全局 AI 辅助窗口
- `Esc`: 关闭当前弹出的对话框


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

### 数据库锁定 (SQLite)
如果遇到 `database is locked` 错误，请检查是否有其他进程正在占用 `database.sqlite` 文件，或尝试重启后端。

### CORS 错误
检查后端 `CORS` 配置，确认前端 URL 已加入白名单。


### 环境变量未生效
确认 `.env` 文件在正确的目录，重启开发服务器
