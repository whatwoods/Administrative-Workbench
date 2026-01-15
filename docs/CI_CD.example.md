# GitHub Actions 自动化部署 - 环境变量示例

## Docker Hub 配置示例

```bash
# Docker Hub 用户名
DOCKER_USERNAME=your-docker-username

# Docker Hub 密码（推荐使用访问令牌）
# 从 Docker Hub → Account Settings → Security 获取
DOCKER_PASSWORD=dckr_pat_xxxxxxxxxxxxxxxxxxxxx
```

## 服务器 SSH 配置示例

### Linux/Mac - 生成 SSH 密钥

```bash
# 生成 4096 位 RSA 密钥
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_deploy -N ""

# 或使用 ED25519（更安全，推荐）
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/github_deploy.pub -p 22 ubuntu@your-server-ip

# 或手动添加
cat ~/.ssh/github_deploy.pub | ssh -p 22 ubuntu@your-server-ip "cat >> ~/.ssh/authorized_keys"
```

### Windows - 使用 PuTTY 生成密钥

1. 下载 [PuTTYgen](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html)
2. 打开 PuTTYgen
3. 点击 **Generate**
4. 点击 **Save private key**（保存为 `.ppk` 格式）
5. 复制公钥内容到服务器的 `~/.ssh/authorized_keys`

### GitHub Secrets 配置示例

| 参数 | 值 | 说明 |
|------|------|------|
| `DOCKER_USERNAME` | `your-docker-username` | Docker Hub 用户名 |
| `DOCKER_PASSWORD` | `dckr_pat_xxxxx` | Docker Hub 访问令牌 |
| `SERVER_HOST` | `192.168.1.100` | 服务器公网 IP 或域名 |
| `SERVER_USER` | `ubuntu` | SSH 连接用户名 |
| `SERVER_SSH_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | SSH 私钥内容（整个文件） |
| `SERVER_PORT` | `22` | SSH 端口 |
| `DEPLOY_PATH` | `/opt/administrative-workbench` | 服务器部署目录路径 |

## 快速设置脚本

### 在服务器上初始化（运行一次）

```bash
#!/bin/bash

# 1. 创建部署用户（可选但推荐）
sudo useradd -m -s /bin/bash github-deploy
sudo mkdir -p /home/github-deploy/.ssh

# 2. 创建部署目录
sudo mkdir -p /opt/administrative-workbench
sudo chown github-deploy:github-deploy /opt/administrative-workbench

# 3. 初始化 Git 仓库
cd /opt/administrative-workbench
sudo -u github-deploy git init
sudo -u github-deploy git remote add origin https://github.com/whatwoods/Administrative-Workbench.git

# 4. 创建 .env 文件
cat > /opt/administrative-workbench/.env << 'EOF'
MONGODB_URI=mongodb://admin:password@mongodb:27017/admin
JWT_SECRET=your-very-long-random-secret-key-here-minimum-32-chars
NODE_ENV=production
PORT=3001
VITE_API_URL=http://your-server-ip
EOF

# 5. 配置 Docker 登录
sudo docker login --username your-docker-username

# 6. 验证 Docker
sudo docker ps

echo "✅ 初始化完成！"
```

### GitHub 通过 Secrets 推送到服务器的工作流程

```
1. 推送代码到 GitHub main 分支
        ↓
2. GitHub Actions 触发 deploy.yml
        ↓
3. Build 阶段：
   - 构建后端 Docker 镜像
   - 构建前端 Docker 镜像
   - 推送到 Docker Hub
        ↓
4. Deploy 阶段：
   - 使用 SSH 密钥连接到服务器
   - 拉取最新代码
   - 拉取最新 Docker 镜像
   - 重启 Docker 容器
        ↓
5. 完成！新版本已部署到服务器
```

## 验证部署

### 在服务器上检查

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 检查前端访问
curl http://localhost

# 检查后端 API
curl http://localhost:3001/api/health
```

### 通过浏览器检查

```
前端: http://your-server-ip
后端: http://your-server-ip:3001
API: http://your-server-ip:3001/api
```

## 常见问题

### Q: SSH 连接被拒绝
**A:** 检查 SSH 密钥和服务器 IP 地址是否正确

### Q: Docker 镜像推送失败
**A:** 确保 Docker Hub 凭证正确，并且镜像仓库已创建

### Q: 容器启动失败
**A:** 检查 .env 文件和服务器资源是否充足

### Q: 部署后应用无法访问
**A:** 检查防火墙规则，确保允许 80、443、3001 端口

## 监控命令速查

```bash
# 实时查看日志
docker-compose logs -f

# 查看特定服务
docker-compose logs -f backend

# 进入容器
docker exec -it <container-name> sh

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 启动服务
docker-compose up -d

# 更新镜像
docker-compose pull

# 查看磁盘使用
du -sh /opt/administrative-workbench

# 清理无用镜像
docker image prune -a
```

---

详见 [CI_CD.md](CI_CD.md) 了解完整配置说明。
