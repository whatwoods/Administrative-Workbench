# GitHub Actions 自动化部署 - 快速参考

## 📌 项目已配置自动化 CI/CD！

您的 Administrative Workbench 项目现已配置完整的 GitHub Actions 自动化部署流程，使用 **GitHub Container Registry (ghcr.io)** 存储镜像。

---

## 🚀 工作原理

```
您的电脑
   ↓ git push origin main
GitHub 仓库
   ↓ 触发 GitHub Actions
构建阶段 (Build)
   ├─ 构建后端 Docker 镜像
   ├─ 构建前端 Docker 镜像
   └─ 推送到 GitHub Container Registry (ghcr.io)
部署阶段 (Deploy)
   ├─ SSH 连接到您的服务器
   ├─ 拉取最新代码和镜像
   ├─ 重启容器
   └─ ✅ 完成！
```

---

## 📋 需要的 4 个 GitHub Secrets

**位置**: 仓库 Settings → Secrets and variables → Actions

| 名称 | 说明 | 示例 |
|------|------|------|
| `SERVER_HOST` | 服务器 IP 或域名 | `192.168.1.100` |
| `SERVER_USER` | SSH 用户名 | `ubuntu` |
| `SERVER_SSH_KEY` | SSH 私钥 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_PORT` | SSH 端口 | `22` |
| `DEPLOY_PATH` | 部署目录路径 | `/opt/administrative-workbench` |

> ✨ **不需要 Docker Hub！** 使用 GitHub 自动分配的 `GITHUB_TOKEN`

---

## 🔧 配置步骤（10-15 分钟）

### 步骤 1：生成 SSH 密钥
```bash
# 在您的本地电脑上执行
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""

# 复制公钥到服务器
ssh-copy-id -i ~/.ssh/github_deploy.pub ubuntu@your-server-ip

# 查看私钥（用于 GitHub Secrets）
cat ~/.ssh/github_deploy
```

### 步骤 2：在 GitHub 中添加 Secrets
```
GitHub 仓库 → Settings → Secrets and variables → Actions
↓
点击 "New repository secret"
↓
添加上面 5 个 Secrets
```

### 步骤 3：初始化服务器
```bash
# 在您的服务器上执行
ssh -i ~/.ssh/github_deploy ubuntu@your-server-ip

# 创建部署目录
sudo mkdir -p /opt/administrative-workbench
sudo chown $(whoami):$(whoami) /opt/administrative-workbench

# 克隆项目
cd /opt/administrative-workbench
git clone https://github.com/whatwoods/Administrative-Workbench.git .

# 创建 .env 文件
cat > .env << 'EOF'
MONGODB_URI=mongodb://admin:password@mongodb:27017/admin
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=3001
VITE_API_URL=http://your-server-ip
EOF

# 配置 Docker 登录（用于拉取 ghcr.io 镜像）
# 生成 GitHub 个人访问令牌（Settings → Developer settings → Personal access tokens）
docker login ghcr.io -u USERNAME -p YOUR_PAT

# 首次启动
docker-compose up -d
```

---

## ✅ 验证配置

### 1️⃣ GitHub Actions 日志
```
GitHub 仓库 → Actions → Build and Deploy to Server
→ 查看最新构建日志
```

### 2️⃣ 检查 GitHub Packages
```
GitHub 仓库 → Packages
→ 应该看到两个最新的镜像版本
```

### 3️⃣ 服务器检查
```bash
# SSH 到服务器
ssh -i ~/.ssh/github_deploy ubuntu@your-server-ip

# 查看容器
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4️⃣ 浏览器访问
```
前端: http://your-server-ip
后端: http://your-server-ip:3001/api
```

---

## 🎯 使用方法

### ✨ 自动部署
```bash
# 在您的电脑上
git push origin main

# 自动触发 GitHub Actions
# → 构建镜像 → 推送 ghcr.io → 部署到服务器
```

### 🔄 手动重新部署
```
GitHub Actions 页面
→ "Build and Deploy to Server"
→ "Run workflow"
```

### 📊 监控部署
```bash
# 在服务器上
docker-compose logs -f

# 或单个服务
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 📚 详细文档

- **[快速配置清单](docs/DEPLOYMENT_CHECKLIST.md)** - 一步步操作指南
- **[完整配置指南](docs/CI_CD.md)** - 深入详解和故障排除
- **[配置示例](docs/CI_CD.example.md)** - 代码示例和命令

---

## 🐛 常见问题

### Q: 为什么部署没有自动触发？
**A**: 检查 `.github/workflows/deploy.yml` 中的触发条件。默认只在 `main` 分支推送时触发。

### Q: 如何只构建镜像不部署？
**A**: 修改 `deploy.yml`，删除 `deploy` 阶段或注释掉。

### Q: SSH 连接超时？
**A**: 检查服务器 IP、端口、防火墙和 SSH 密钥是否正确。

### Q: 如何手动部署到服务器？
**A**: 在服务器上运行 `./scripts/deploy.sh`

### Q: 如何回滚到上一个版本？
**A**: 在 GitHub Actions 中重新运行之前的构建，或在服务器上修改镜像标签。

### Q: 私有仓库的镜像如何在服务器上拉取？
**A**: 在服务器上登录 ghcr.io：
```bash
docker login ghcr.io -u YOUR_USERNAME -p YOUR_PAT
```
其中 `YOUR_PAT` 是 GitHub 个人访问令牌（Settings → Developer settings → Personal access tokens）

---

## 🔐 安全建议

1. ✅ 使用 SSH 密钥而不是密码
2. ✅ 定期更换 Secrets
3. ✅ GitHub 令牌使用最小权限（只需 `packages:read` 和 `contents:read`）
4. ✅ 限制 SSH 访问权限
5. ✅ 在 `.env` 中不提交敏感信息

---

## 📈 下一步优化

- [ ] 添加单元测试验证
- [ ] 添加代码质量检查
- [ ] 配置数据库自动备份
- [ ] 添加监控和告警
- [ ] 配置 SSL/TLS 证书
- [ ] 设置 CDN 加速
- [ ] 配置负载均衡

---

**需要帮助？** 查看 [docs/CI_CD.md](docs/CI_CD.md) 了解完整说明。

---

## 🔧 配置步骤（15-20 分钟）

### 步骤 1：准备 Docker Hub
1. 注册 [Docker Hub](https://hub.docker.com)
2. 创建 2 个镜像仓库
3. 生成访问令牌（不是密码）

```bash
# Docker Hub → Account Settings → Security → New Access Token
```

### 步骤 2：生成 SSH 密钥
```bash
# 在您的本地电脑上执行
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""

# 复制公钥到服务器
ssh-copy-id -i ~/.ssh/github_deploy.pub ubuntu@your-server-ip

# 查看私钥（用于 GitHub Secrets）
cat ~/.ssh/github_deploy
```

### 步骤 3：在 GitHub 中添加 Secrets
```
GitHub 仓库 → Settings → Secrets and variables → Actions
↓
点击 "New repository secret"
↓
添加上面 7 个 Secrets
```

### 步骤 4：初始化服务器
```bash
# 在您的服务器上执行
ssh -i ~/.ssh/github_deploy ubuntu@your-server-ip

# 创建部署目录
sudo mkdir -p /opt/administrative-workbench
sudo chown $(whoami):$(whoami) /opt/administrative-workbench

# 克隆项目
cd /opt/administrative-workbench
git clone https://github.com/whatwoods/Administrative-Workbench.git .

# 创建 .env 文件
cat > .env << 'EOF'
MONGODB_URI=mongodb://admin:password@mongodb:27017/admin
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=3001
VITE_API_URL=http://your-server-ip
EOF

# 首次启动
docker-compose up -d
```

---

## ✅ 验证配置

### 1️⃣ GitHub Actions 日志
```
GitHub 仓库 → Actions → Build and Deploy to Server
→ 查看最新构建日志
```

### 2️⃣ 检查 Docker Hub
```
Docker Hub → 您的帐户 → Repositories
→ 应该看到两个最新的镜像版本
```

### 3️⃣ 服务器检查
```bash
# SSH 到服务器
ssh -i ~/.ssh/github_deploy ubuntu@your-server-ip

# 查看容器
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4️⃣ 浏览器访问
```
前端: http://your-server-ip
后端: http://your-server-ip:3001/api
```

---

## 🎯 使用方法

### ✨ 自动部署
```bash
# 在您的电脑上
git push origin main

# 自动触发 GitHub Actions
# → 构建镜像 → 推送 Docker Hub → 部署到服务器
```

### 🔄 手动重新部署
```
GitHub Actions 页面
→ "Build and Deploy to Server"
→ "Run workflow"
```

### 📊 监控部署
```bash
# 在服务器上
docker-compose logs -f

# 或单个服务
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 📚 详细文档

- **[快速配置清单](docs/DEPLOYMENT_CHECKLIST.md)** - 一步步操作指南
- **[完整配置指南](docs/CI_CD.md)** - 深入详解和故障排除
- **[配置示例](docs/CI_CD.example.md)** - 代码示例和命令

---

## 🐛 常见问题

### Q: 为什么部署没有自动触发？
**A**: 检查 `.github/workflows/deploy.yml` 中的触发条件。默认只在 `main` 分支推送时触发。

### Q: 如何只构建镜像不部署？
**A**: 修改 `deploy.yml`，删除 `deploy` 阶段或注释掉。

### Q: SSH 连接超时？
**A**: 检查服务器 IP、端口、防火墙和 SSH 密钥是否正确。

### Q: 如何手动部署到服务器？
**A**: 在服务器上运行 `./scripts/deploy.sh`

### Q: 如何回滚到上一个版本？
**A**: 在 GitHub Actions 中重新运行之前的构建，或在服务器上修改镜像标签。

---

## 🔐 安全建议

1. ✅ 使用 SSH 密钥而不是密码
2. ✅ 定期更换 Secrets
3. ✅ 使用 Docker Hub 访问令牌而不是密码
4. ✅ 限制 SSH 访问权限
5. ✅ 在 `.env` 中不提交敏感信息

---

## 📈 下一步优化

- [ ] 添加单元测试验证
- [ ] 添加代码质量检查
- [ ] 配置数据库自动备份
- [ ] 添加监控和告警
- [ ] 配置 SSL/TLS 证书
- [ ] 设置 CDN 加速
- [ ] 配置负载均衡

---

**需要帮助？** 查看 [docs/CI_CD.md](docs/CI_CD.md) 了解完整说明。
