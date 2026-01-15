# Administrative Workbench 部署指南

## 快速部署

### 1. 服务器准备

```bash
mkdir -p /opt/admin-workbench && cd /opt/admin-workbench
```

### 2. 下载配置

```bash
curl -O https://raw.githubusercontent.com/whatwoods/Administrative-Workbench/main/deploy/docker-compose.yml
```

### 3. 创建环境变量

```bash
cat > .env << EOF
MONGO_USER=admin
MONGO_PASSWORD=你的安全密码
JWT_SECRET=你的JWT密钥
APP_PORT=80
EOF
```

### 4. 启动

```bash
docker compose pull
docker compose up -d
```

## 更新

```bash
docker compose pull && docker compose up -d && docker image prune -f
```

## 镜像地址

```
ghcr.io/whatwoods/administrative-workbench:latest
```

## 常用命令

```bash
docker compose ps      # 状态
docker compose logs -f # 日志
docker compose restart # 重启
docker compose down    # 停止
```
