# 🚀 GitHub Actions 自动化部署 - 快速配置清单

完成以下步骤即可启用自动化部署。预计时间：15-20 分钟

---

## 📋 配置清单

### ✅ 第 1 步：准备 GitHub Container Registry（0 分钟）

✨ **好消息！** GitHub Container Registry (ghcr.io) 已经为您准备好了！
- [ ] 您已有 GitHub 账户
- [ ] 无需额外配置，直接使用 GitHub 默认的 `GITHUB_TOKEN`

> 这比使用 Docker Hub 更简单 - 无需单独注册和生成令牌！

### ✅ 第 2 步：配置服务器 SSH（5 分钟）

**在您的本地电脑上执行：**

```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/github_deploy.pub -p 22 ubuntu@your-server-ip

# 显示私钥（复制整个输出内容）
cat ~/.ssh/github_deploy
```

- [ ] 复制 SSH 私钥内容（以 `-----BEGIN OPENSSH PRIVATE KEY-----` 开头）

### ✅ 第 3 步：添加 GitHub Secrets（5 分钟）

在 GitHub 仓库页面：

1. 进入 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，添加以下内容：

```bash
# Secret 1
名称: SERVER_HOST
值: 192.168.1.100 (或 deploy.example.com)

# Secret 2
名称: SERVER_USER
值: ubuntu

# Secret 3
名称: SERVER_SSH_KEY
值: (粘贴上面复制的完整私钥内容)

# Secret 4
名称: SERVER_PORT
值: 22

# Secret 5
名称: DEPLOY_PATH
值: /opt/administrative-workbench
```

- [ ] SERVER_HOST
- [ ] SERVER_USER
- [ ] SERVER_SSH_KEY
- [ ] SERVER_PORT
- [ ] DEPLOY_PATH

> ✨ **注意：** 不需要 DOCKER_USERNAME 和 DOCKER_PASSWORD！
> GitHub 会自动使用 GITHUB_TOKEN 来推送镜像到 ghcr.io

### ✅ 第 4 步：初始化服务器（5 分钟）

**在您的服务器上执行：**

```bash
# SSH 连接到服务器
ssh -i ~/.ssh/github_deploy -p 22 ubuntu@your-server-ip

# 创建部署目录
sudo mkdir -p /opt/administrative-workbench
sudo chown $(whoami):$(whoami) /opt/administrative-workbench

# 初始化项目
cd /opt/administrative-workbench
git clone https://github.com/whatwoods/Administrative-Workbench.git .

# 创建 .env 文件（重要！）
cat > .env << 'EOF'
MONGODB_URI=mongodb://admin:yourpassword@mongodb:27017/admin
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=3001
VITE_API_URL=http://your-server-ip
EOF

# 首次启动
docker-compose up -d
```

- [ ] 服务器目录已创建
- [ ] Git 仓库已初始化
- [ ] .env 文件已创建
- [ ] 容器已启动

---

## ✨ 完成后的自动流程

```
推送代码到 GitHub
    ↓
GitHub Actions 自动触发
    ↓
构建 Docker 镜像 → 推送到 Docker Hub
    ↓
SSH 连接服务器
    ↓
拉取最新镜像 → 重启容器
    ↓
✅ 部署完成！
```

---

## 🧪 验证部署

### 方式 1：查看 GitHub Actions 日志
1. 推送代码：`git push origin main`
2. 进入 GitHub 仓库 → **Actions** 标签页
3. 查看最新的 **Build and Deploy** 工作流

### 方式 2：在服务器上验证
```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试 API
curl http://localhost:3001/api/health
```

### 方式 3：在浏览器中访问
```
前端: http://your-server-ip
后端 API: http://your-server-ip:3001/api
```

---

## 📊 查看部署历史

**GitHub Actions 日志位置：**
```
GitHub 仓库 → Actions → Build and Deploy to Server
```

**服务器部署日志：**
```bash
# 查看实时日志
docker-compose logs -f

# 查看指定服务
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看历史记录
docker-compose logs --tail=100
```

---

## 🔧 常见操作

### 重新部署当前版本
```bash
# 在 GitHub Actions 页面点击"Re-run failed jobs"
# 或手动在服务器上
docker-compose restart
```

### 停止和启动服务
```bash
# 停止
docker-compose down

# 启动
docker-compose up -d

# 重启
docker-compose restart
```

### 查看服务状态
```bash
# 查看所有容器
docker-compose ps

# 查看内存/CPU 使用
docker stats

# 查看镜像大小
docker images
```

### 清理无用资源
```bash
# 删除无用镜像
docker image prune -a

# 删除无用容器
docker container prune

# 删除所有未使用资源
docker system prune -a
```

---

## ⚠️ 故障排除

### 问题：GitHub Actions 构建失败
**检查清单：**
- [ ] Docker Hub 凭证正确
- [ ] Dockerfile 语法正确
- [ ] 依赖版本兼容
- 
**解决：**查看 GitHub Actions 日志中的错误信息

### 问题：SSH 连接失败
**检查清单：**
- [ ] SSH 密钥正确
- [ ] 服务器 IP/端口正确
- [ ] 防火墙允许 SSH 访问
- [ ] 服务器 SSH 配置允许公钥认证

**解决：**
```bash
# 手动测试连接
ssh -v -i ~/.ssh/github_deploy -p 22 ubuntu@your-server-ip
```

### 问题：容器启动失败
**检查清单：**
- [ ] .env 文件配置正确
- [ ] 磁盘空间充足
- [ ] 端口未被占用
- [ ] MongoDB 数据库可访问

**解决：**
```bash
docker-compose logs -f
docker-compose ps
docker-compose down -v
docker-compose up -d
```

### 问题：部署后应用无法访问
**检查清单：**
- [ ] 容器正在运行
- [ ] 防火墙允许 80、443、3001 端口
- [ ] 代理配置正确
- [ ] DNS 解析正确

**解决：**
```bash
# 测试服务是否运行
curl http://localhost
curl http://localhost:3001

# 检查防火墙
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 3001/tcp
```

---

## 📚 更多资源

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [Docker 官方文档](https://docs.docker.com/)
- [完整配置指南](CI_CD.md)
- [环境变量示例](CI_CD.example.md)

---

## 🎉 成功标志

当您看到以下现象，说明配置成功了：

✅ GitHub Actions 中显示 `Build and Deploy` 工作流成功
✅ Docker Hub 中出现最新的镜像版本
✅ 服务器上的容器正在运行
✅ 可以访问应用的前端和 API

---

**需要帮助？** 查看 [CI_CD.md](CI_CD.md) 了解详细说明，或在 GitHub Issues 中提问。
