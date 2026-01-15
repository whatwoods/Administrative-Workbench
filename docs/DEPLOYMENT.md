# Administrative Workbench 部署指南

## 快速部署（只需一个命令）

```bash
# 在服务器上执行
mkdir -p /opt/admin-workbench && cd /opt/admin-workbench

# 下载并启动
curl -O https://raw.githubusercontent.com/whatwoods/Administrative-Workbench/main/deploy/docker-compose.yml

# 配置（可选）
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env
echo "APP_PORT=80" >> .env

# 启动
docker compose pull && docker compose up -d
```

## 特点

- ✅ **单一镜像** - 前端 + 后端 + SQLite 合一
- ✅ **无需数据库容器** - SQLite 内嵌
- ✅ **数据持久化** - 通过 Docker volume 挂载

## 镜像地址

```
ghcr.io/whatwoods/administrative-workbench:latest
```

## 常用命令

```bash
docker compose logs -f    # 查看日志
docker compose restart    # 重启
docker compose down       # 停止
docker compose pull && docker compose up -d  # 更新
```

## 数据备份

```bash
# 备份
docker cp awb-app:/app/data/admin-workbench.db ./backup.db

# 恢复
docker cp ./backup.db awb-app:/app/data/admin-workbench.db
docker compose restart
```
