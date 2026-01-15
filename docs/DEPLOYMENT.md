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

---

## 🔧 环境变量配置

### 核心配置

```env
# 端口
APP_PORT=80

# 认证安全
JWT_SECRET=changes_this_to_a_secure_random_string
JWT_EXPIRE=7d

# 数据库
DATABASE_URL=file:/app/data/admin-workbench.db
```

### 第三方服务 (可选)

```env
# 天气服务
WEATHER_API_KEY=your_key

# AI 服务
LLM_PROVIDER=tencent
LLM_API_KEY=your_key
LLM_MODEL=deepseek-v3.2
```

---

## 故障排除

### 1. 容器无法启动
检查日志：
```bash
docker compose logs -f
```
常见原因：端口冲突、权限不足（数据目录）。

### 2. 权限问题
如果遇到 SQLite 写入错误，尝试修复数据目录权限：
```bash
chmod -R 777 ./data
```

---

## 安全建议

1. **启用 HTTPS**：建议在宿主机使用 Nginx 或 1Panel 的 OpenResty 进行反向代理并配置 SSL。
2. **修改 JWT 密钥**：切勿使用默认密钥，生产环境必须生成强随机字符串。
3. **数据备份**：定期备份 `data/` 目录或 SQLite 数据库文件。
