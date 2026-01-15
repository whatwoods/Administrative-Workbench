# Administrative Workbench 部署指南

本文档介绍如何使用预构建的 Docker 镜像部署 Administrative Workbench。

## 快速部署（推荐）

### 1. 在服务器上创建部署目录

```bash
mkdir -p /opt/admin-workbench && cd /opt/admin-workbench
```

### 2. 下载配置文件

```bash
# 下载 docker-compose 和环境变量模板
curl -O https://raw.githubusercontent.com/whatwoods/Administrative-Workbench/main/deploy/docker-compose.yml
curl -O https://raw.githubusercontent.com/whatwoods/Administrative-Workbench/main/.env.example
mv .env.example .env
```

### 3. 配置环境变量

```bash
nano .env
```

修改以下配置：
```
MONGO_USER=admin
MONGO_PASSWORD=你的安全密码
JWT_SECRET=你的JWT密钥
FRONTEND_PORT=80
```

### 4. 登录 GHCR（如果仓库是私有的）

```bash
# 使用 GitHub Personal Access Token 登录
echo "你的TOKEN" | docker login ghcr.io -u 你的GitHub用户名 --password-stdin
```

### 5. 拉取并启动服务

```bash
docker compose pull
docker compose up -d
```

## 更新部署

当有新版本发布时：

```bash
cd /opt/admin-workbench
docker compose pull
docker compose up -d
docker image prune -f  # 清理旧镜像
```

## 镜像地址

| 服务 | 镜像地址 |
|------|---------|
| Backend | `ghcr.io/whatwoods/administrative-workbench/backend:latest` |
| Frontend | `ghcr.io/whatwoods/administrative-workbench/frontend:latest` |

## 常用命令

```bash
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 停止服务
docker compose down
```

## HTTPS 配置（可选）

使用 1Panel 的**网站**功能配置反向代理和 SSL：
1. 创建网站，设置反向代理到 `http://127.0.0.1:80`
2. 申请并配置 SSL 证书
