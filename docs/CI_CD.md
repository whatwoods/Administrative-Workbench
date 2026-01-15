# 🚀 GitHub Actions 自动化部署指南

本指南说明如何配置 GitHub Actions 来自动构建 Docker 镜像并部署到您的服务器。

## 📋 目录

1. [环境要求](#环境要求)
2. [配置步骤](#配置步骤)
3. [GitHub Secrets 配置](#github-secrets-配置)
4. [工作流说明](#工作流说明)
5. [故障排除](#故障排除)

---

## 环境要求

### 开发环境
- GitHub 账户（支持免费计划）
- Docker Hub 账户（或其他镜像仓库）

### 生产服务器
- Linux 服务器（Ubuntu 20.04+）
- Docker 和 Docker Compose
- Git 已安装
- SSH 访问权限
- 足够的磁盘空间（至少 5GB）

---

## 配置步骤

### 第 1 步：准备 Docker Hub 账户

1. 前往 [Docker Hub](https://hub.docker.com) 注册账户
2. 创建两个镜像仓库：
   - `administrative-workbench-backend`
   - `administrative-workbench-frontend`

### 第 2 步：生成 SSH 密钥（在您的服务器上）

```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_deploy

# 查看公钥（添加到服务器）
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# 查看私钥（用于 GitHub Secrets）
cat ~/.ssh/github_deploy
```

### 第 3 步：配置 GitHub Secrets

前往您的 GitHub 仓库设置：
1. **Settings** → **Secrets and variables** → **Actions**
2. 添加以下 Secrets：

#### 必需的 Secrets

| Secret 名称 | 说明 | 示例 |
|-----------|-----|------|
| `DOCKER_USERNAME` | Docker Hub 用户名 | `your-docker-username` |
| `DOCKER_PASSWORD` | Docker Hub 密码或访问令牌 | `dckr_pat_xxxxx` |
| `SERVER_HOST` | 服务器 IP 地址或域名 | `192.168.1.100` 或 `deploy.example.com` |
| `SERVER_USER` | SSH 用户名 | `ubuntu` 或 `root` |
| `SERVER_SSH_KEY` | SSH 私钥内容 | （从上面的命令复制） |
| `SERVER_PORT` | SSH 端口 | `22` |
| `DEPLOY_PATH` | 服务器上的部署目录 | `/opt/administrative-workbench` |

### 第 4 步：准备服务器

```bash
# 登录到您的服务器
ssh -i ~/.ssh/github_deploy ubuntu@your-server-ip

# 创建部署目录
sudo mkdir -p /opt/administrative-workbench
sudo chown $(whoami):$(whoami) /opt/administrative-workbench

# 初始化 Git 仓库
cd /opt/administrative-workbench
git clone https://github.com/whatwoods/Administrative-Workbench.git .

# 创建 .env 文件
cat > .env << 'EOF'
MONGODB_URI=mongodb://admin:changeme123@mongodb:27017/admin
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=3001
VITE_API_URL=http://your-server-ip:3001
EOF

# 创建 docker-compose.override.yml（用于生产配置）
cat > docker-compose.override.yml << 'EOF'
version: '3.8'
services:
  backend:
    restart: always
    environment:
      - NODE_ENV=production
  frontend:
    restart: always
  mongodb:
    restart: always
    volumes:
      - mongodb_data:/data/db
volumes:
  mongodb_data:
EOF

# 首次启动
docker-compose up -d
```

---

## GitHub Secrets 配置

### 添加 Docker Hub 凭证

1. 在 GitHub 上创建仓库
2. 进入 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**

#### 方法 A：使用 Docker Hub 密码
```
Name: DOCKER_PASSWORD
Value: 你的 Docker Hub 密码
```

#### 方法 B：使用访问令牌（推荐）
1. 登录 Docker Hub
2. 进入 **Account Settings** → **Security** → **New Access Token**
3. 创建令牌名称（如 `github-actions`）
4. 复制令牌值作为 Secret

### 添加服务器凭证

```
Name: SERVER_HOST
Value: 192.168.1.100

Name: SERVER_USER  
Value: ubuntu

Name: SERVER_SSH_KEY
Value: -----BEGIN RSA PRIVATE KEY-----
       MIIEowIBAAKCAQEA...
       ...
       -----END RSA PRIVATE KEY-----

Name: SERVER_PORT
Value: 22

Name: DEPLOY_PATH
Value: /opt/administrative-workbench
```

---

## 工作流说明

### 工作流文件位置
`.github/workflows/deploy.yml`

### 触发条件

工作流在以下情况下自动运行：

1. **代码推送到 main 分支**
   - 当下列路径有变化时：
     - `backend/**`
     - `frontend/**`
     - `docker-compose.yml`
     - `.github/workflows/deploy.yml`

2. **手动触发**
   - 在 GitHub Actions 标签页点击 **Run workflow**

### 工作流步骤

#### 1️⃣ **Build 阶段**
```
✅ Checkout 代码
✅ 设置 Docker Buildx
✅ 登录 Docker Hub
✅ 构建后端镜像
✅ 构建前端镜像
✅ 推送镜像到 Docker Hub
```

#### 2️⃣ **Deploy 阶段**（在 Build 完成后）
```
✅ SSH 连接到服务器
✅ 拉取最新代码
✅ 拉取最新 Docker 镜像
✅ 停止旧服务
✅ 启动新服务
✅ 清理旧镜像
```

### 工作流配置详解

#### 触发条件配置
```yaml
on:
  push:
    branches:
      - main          # 仅在 main 分支
    paths:            # 只有这些路径改变才触发
      - 'backend/**'
      - 'frontend/**'
      - 'docker-compose.yml'
  workflow_dispatch:  # 允许手动触发
```

#### Docker 镜像标签
```yaml
tags: |
  type=ref,event=branch      # 分支名 (main)
  type=semver,pattern={{version}}  # 版本号
  type=sha                   # 提交 SHA
  type=raw,value=latest      # latest 标签
```

---

## 手动部署

如果您想手动部署而不使用 GitHub Actions，可以使用提供的脚本：

### 在服务器上执行

```bash
cd /opt/administrative-workbench

# 方法 1：使用脚本（推荐）
DOCKER_USERNAME=your-username ./scripts/deploy.sh

# 方法 2：手动命令
git pull origin main
docker-compose pull
docker-compose down
docker-compose up -d
```

---

## 监控和日志

### 查看 GitHub Actions 日志

1. 进入仓库的 **Actions** 标签页
2. 选择最近的工作流运行
3. 点击 **build** 或 **deploy** 查看详细日志

### 查看服务器日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 仅查看后端日志
docker-compose logs -f backend

# 仅查看前端日志
docker-compose logs -f frontend

# 仅查看数据库日志
docker-compose logs -f mongodb

# 查看最后 50 行
docker-compose logs --tail=50
```

### 检查容器状态

```bash
# 查看容器状态
docker-compose ps

# 查看容器统计信息
docker stats

# 进入容器
docker exec -it administrative-workbench-backend-1 sh
```

---

## 故障排除

### 问题 1：构建失败

**症状**：GitHub Actions 构建阶段失败

**解决方案**：
```bash
# 1. 检查 Dockerfile
docker build -t test ./backend

# 2. 查看构建日志
docker build -t test ./backend --progress=plain

# 3. 验证依赖
npm install
npm run build
```

### 问题 2：部署连接超时

**症状**：部署阶段无法连接到服务器

**解决方案**：
```bash
# 1. 验证 SSH 密钥
ssh-i ~/.ssh/github_deploy -p 22 ubuntu@server-ip

# 2. 检查防火墙
sudo ufw status

# 3. 允许 SSH 端口
sudo ufw allow 22/tcp
```

### 问题 3：镜像拉取失败

**症状**：`docker pull` 失败

**解决方案**：
```bash
# 1. 验证 Docker Hub 凭证
docker login

# 2. 检查镜像是否存在
docker search your-username/administrative-workbench-backend

# 3. 重新推送镜像
docker build -t your-username/administrative-workbench-backend:latest ./backend
docker push your-username/administrative-workbench-backend:latest
```

### 问题 4：容器启动失败

**症状**：`docker-compose up` 启动失败

**解决方案**：
```bash
# 1. 查看容器日志
docker-compose logs -f

# 2. 检查端口占用
sudo netstat -tulpn | grep LISTEN

# 3. 检查 .env 文件
cat .env

# 4. 清空并重建
docker-compose down -v
docker-compose up -d
```

### 问题 5：权限错误

**症状**：`Permission denied` 错误

**解决方案**：
```bash
# 1. 检查目录权限
ls -la /opt/administrative-workbench

# 2. 修复权限
sudo chown -R $(whoami):$(whoami) /opt/administrative-workbench

# 3. 使脚本可执行
chmod +x ./scripts/deploy.sh
```

---

## 安全最佳实践

### 1. 使用 SSH 密钥而不是密码
```bash
# ✅ 推荐
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy

# ❌ 不推荐
ssh-keygen -t rsa -b 1024
```

### 2. 定期轮换 Secrets
```bash
# 每 90 天生成新密钥
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy_new
```

### 3. 限制 SSH 访问
```bash
# 编辑 sshd 配置
sudo nano /etc/ssh/sshd_config

# 添加：
PermitRootLogin no
PasswordAuthentication no
AllowUsers github-deploy ubuntu

# 重启 SSH
sudo systemctl restart ssh
```

### 4. 使用只读 Docker Hub 令牌
1. Docker Hub → Account Settings → Security
2. 创建 **Pull only** 令牌（不是 Read, Write, Delete）

### 5. 监控部署活动
```bash
# 查看 auth 日志
tail -f /var/log/auth.log

# 查看 docker 日志
journalctl -u docker -f
```

---

## 性能优化

### 1. 使用 Docker Layer Caching

工作流已配置 GitHub Actions 缓存：
```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

### 2. 使用更小的基础镜像

在 Dockerfile 中：
```dockerfile
# ❌ 大镜像
FROM node:18

# ✅ 小镜像
FROM node:18-alpine
```

### 3. 并行构建

修改 `docker-compose.yml`：
```yaml
version: '3.8'
services:
  backend:
    # ...
  frontend:
    # ...
  mongodb:
    # ...
```

---

## 下一步

1. ✅ [配置完成！](#配置步骤)
2. 📝 推送代码到 main 分支
3. 🔍 在 GitHub Actions 中查看构建日志
4. 🚀 验证部署到服务器
5. 📊 设置监控和告警

---

## 相关资源

- [GitHub Actions 文档](https://docs.github.com/cn/actions)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose 参考](https://docs.docker.com/compose/compose-file/)
- [SSH 密钥配置](https://docs.github.com/cn/authentication/connecting-to-github-with-ssh)

---

**问题或建议？** 请在 [Issues](https://github.com/whatwoods/Administrative-Workbench/issues) 中提交。
