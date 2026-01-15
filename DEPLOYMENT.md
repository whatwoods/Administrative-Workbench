# 部署指南

## 本地开发环境部署

### 前置要求
- Node.js 20+
- npm 或 yarn
- MongoDB 7+ 或 Docker

### 步骤 1: 克隆和配置

```bash
# 克隆项目
git clone https://github.com/whatwoods/Administrative-Workbench.git
cd Administrative-Workbench

# 创建后端环境文件
cp backend/.env.example backend/.env

# 编辑 .env 文件
nano backend/.env
```

### 步骤 2: 启动 MongoDB

**方式 1：使用 Docker（推荐）**
```bash
docker run -d \
  --name admin-workbench-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7
```

**方式 2：本地 MongoDB**
```bash
# 确保 MongoDB 已安装并运行
mongod

# 创建超级用户（如需要）
mongo admin --eval "db.createUser({user: 'admin', pwd: 'admin123', roles: ['root']})"
```

### 步骤 3: 启动后端

```bash
cd backend
npm install
npm run dev
```

服务器输出应包含：
```
Server is running on port 5000
MongoDB connected successfully
```

### 步骤 4: 启动前端

在新终端中：
```bash
cd frontend
npm install
npm run dev
```

前端将在 `http://localhost:5173` 可用

### 步骤 5: 访问应用

- 打开浏览器访问 `http://localhost:5173`
- 创建新账户或登录
- 开始使用！

---

## Docker Compose 一键部署

最简单的部署方式：

```bash
# 进入项目根目录
cd Administrative-Workbench

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 清理所有数据（慎用）
docker-compose down -v
```

**访问地址：**
- 前端：http://localhost:3000
- API：http://localhost:5000/api
- 数据库：localhost:27017

---

## 生产环境部署

### 使用云服务平台

#### 1. Heroku 部署

```bash
# 安装 Heroku CLI
npm install -g heroku

# 登录
heroku login

# 创建应用
heroku create your-app-name

# 设置环境变量
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=your-mongodb-uri

# 添加 MongoDB（如使用 MongoDB Atlas）
# 从 MongoDB Atlas 获取连接字符串

# 部署
git push heroku main

# 查看日志
heroku logs --tail
```

#### 2. AWS EC2 部署

```bash
# SSH 连接到 EC2 实例
ssh -i your-key.pem ec2-user@your-instance-ip

# 安装依赖
sudo yum update -y
sudo yum install nodejs npm git -y
sudo yum install docker -y

# 启动 Docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# 克隆项目
git clone your-repo-url
cd Administrative-Workbench

# 使用 Docker Compose 启动
docker-compose up -d

# 配置 Nginx 反向代理（可选）
sudo amazon-linux-extras install nginx1 -y
```

#### 3. DigitalOcean App Platform

```bash
# 连接 GitHub 仓库
# 1. 在 DigitalOcean 创建新应用
# 2. 选择 GitHub 仓库
# 3. 设置构建命令：
#    - Frontend: npm ci && npm run build
#    - Backend: npm ci
# 4. 设置启动命令：
#    - Backend: npm start
# 5. 添加环境变量
# 6. 部署
```

#### 4. Render 部署

```bash
# 1. 连接 GitHub 账户到 Render
# 2. 创建新 Web Service
# 3. 选择此仓库
# 4. 配置：
#    Build Command: npm ci
#    Start Command: npm start
# 5. 添加环境变量
# 6. 部署
```

### 自己的服务器部署

#### 使用 Nginx + PM2 + MongoDB

```bash
# SSH 连接到服务器
ssh user@server-ip

# 安装依赖
sudo apt update
sudo apt install nodejs npm nginx mongodb -y

# 启动 MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# 克隆项目
git clone your-repo-url
cd Administrative-Workbench

# 构建前端
cd frontend
npm ci
npm run build
cd ..

# 安装后端依赖
cd backend
npm ci

# 安装 PM2
npm install -g pm2

# 启动后端服务
pm2 start npm --name "awb-backend" -- start
pm2 save
pm2 startup

# 配置 Nginx
sudo nano /etc/nginx/sites-available/default
```

**Nginx 配置示例：**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 测试 Nginx 配置
sudo nginx -t

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 配置 SSL（使用 Let's Encrypt）
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 环境变量配置

### 后端 (.env)

```env
# 基本配置
NODE_ENV=production
PORT=5000

# MongoDB 连接
MONGODB_URI=mongodb://admin:password@host:27017/admin-workbench?authSource=admin

# JWT 配置
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d

# 天气 API（可选）
WEATHER_API_KEY=your-openweathermap-api-key

# AI API（可选）
OPENAI_API_KEY=your-openai-api-key

# 日志级别
LOG_LEVEL=info
```

### 前端 (.env)

```env
# API 基地址
VITE_API_URL=https://api.your-domain.com
# 或本地开发
VITE_API_URL=http://localhost:5000/api
```

---

## 监控和维护

### 日志管理

```bash
# 查看后端日志（使用 PM2）
pm2 logs awb-backend

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# 使用 Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 数据库备份

```bash
# MongoDB 备份
mongodump --uri="mongodb://admin:password@host:27017/admin-workbench?authSource=admin" --out /backups

# MongoDB 恢复
mongorestore --uri="mongodb://admin:password@host:27017/admin-workbench?authSource=admin" /backups
```

### 性能监控

```bash
# PM2 监控面板
pm2 monit

# Docker 资源使用
docker stats

# CPU 和内存使用
top
htop
```

---

## 故障排除

### 常见问题

#### 1. MongoDB 连接失败

```bash
# 检查 MongoDB 状态
docker ps | grep mongo
# 或
systemctl status mongodb

# 检查连接字符串
# 确保用户名、密码、主机、端口正确
```

#### 2. 端口占用

```bash
# 查看占用的端口
lsof -i :5000
lsof -i :3000
lsof -i :27017

# 杀死进程
kill -9 <PID>
```

#### 3. 内存不足

```bash
# 检查内存使用
free -h

# 清理 Docker
docker system prune

# 增加 Node.js 堆内存
NODE_OPTIONS=--max-old-space-size=2048 npm start
```

#### 4. SSL 证书错误

```bash
# 更新证书
sudo certbot renew

# 验证证书
sudo certbot certificates
```

---

## 性能优化

### 1. 启用 GZIP 压缩

**Nginx 配置：**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 2. 设置缓存策略

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 数据库索引

```javascript
// 在 MongoDB 中创建索引
db.todos.createIndex({ userId: 1, status: 1 })
db.expenses.createIndex({ userId: 1, date: -1 })
db.notes.createIndex({ userId: 1, updatedAt: -1 })
```

### 4. 限制请求

```javascript
// 使用 express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

---

## 安全性检查清单

- [ ] 更改 JWT_SECRET 为强密码
- [ ] 启用 HTTPS/SSL
- [ ] 设置强大的 MongoDB 密码
- [ ] 禁用 MongoDB 无认证访问
- [ ] 配置 CORS 白名单
- [ ] 设置 request size 限制
- [ ] 定期更新依赖包
- [ ] 启用 rate limiting
- [ ] 配置防火墙规则
- [ ] 定期备份数据库
- [ ] 监控错误日志
- [ ] 设置 security headers

---

## CI/CD 部署

### GitHub Actions 示例

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Build frontend
        run: cd frontend && npm ci && npm run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/project
            git pull origin main
            cd backend && npm ci
            pm2 restart awb-backend
```

---

## 常用命令

```bash
# 后端
npm run dev          # 开发模式
npm run build        # 构建
npm start            # 生产模式

# 前端
npm run dev          # 开发服务器
npm run build        # 构建产品版本
npm run preview      # 预览产品构建

# Docker
docker-compose up -d       # 启动
docker-compose down        # 停止
docker-compose logs -f     # 查看日志
docker-compose ps          # 查看状态

# PM2
pm2 start app.js           # 启动
pm2 stop app.js            # 停止
pm2 restart app.js         # 重启
pm2 logs                    # 查看日志
pm2 monit                   # 监控
```

---

## 获取帮助

- 📖 查看 [QUICKSTART.md](./QUICKSTART.md)
- 🏗️ 查看 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- 🔧 查看 [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)

---

**最后更新**: 2026-01-15  
**版本**: v1.0.0
