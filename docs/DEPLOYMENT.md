# Administrative Workbench 部署指南

本文档介绍如何将 Administrative Workbench 部署到安装了 1Panel 和 Docker 的阿里云服务器。

## 快速部署

### 方式一：一键脚本部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/whatwoods/Administrative-Workbench.git
cd Administrative-Workbench

# 2. 运行部署脚本
chmod +x deploy/scripts/deploy.sh
./deploy/scripts/deploy.sh
```

脚本会自动：
- 检查 Docker 环境
- 生成安全的 JWT 和 MongoDB 密码
- 构建并启动所有服务

### 方式二：手动 Docker Compose 部署

```bash
# 1. 复制并编辑环境变量
cp .env.example .env
nano .env  # 修改密码等配置

# 2. 进入 deploy 目录并启动
cd deploy
docker compose up -d
```

### 方式三：1Panel 面板部署

1. 将项目上传到服务器（如 `/opt/1panel/apps/local/admin-workbench`）
2. 在 1Panel 中选择 **应用商店** → **本地应用**
3. 选择 `deploy/1panel` 目录
4. 填写配置（MongoDB 密码、JWT 密钥等）
5. 点击部署

## 环境变量说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `MONGO_USER` | MongoDB 用户名 | admin |
| `MONGO_PASSWORD` | MongoDB 密码 | - |
| `JWT_SECRET` | JWT 密钥 | - |
| `FRONTEND_PORT` | 前端端口 | 80 |
| `BACKEND_PORT` | 后端端口 | 5000 |

## 常用命令

```bash
# 查看服务状态
cd deploy && docker compose ps

# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 更新部署
./deploy/scripts/update.sh
```

## HTTPS 配置（可选）

推荐使用 1Panel 的 **网站** 功能配置反向代理和 SSL：

1. 在 1Panel 中创建网站
2. 设置反向代理到 `http://127.0.0.1:80`
3. 申请并配置 SSL 证书

## 目录结构

```
deploy/
├── docker-compose.yml    # 生产配置
├── 1panel/
│   └── app.yml          # 1Panel 应用定义
└── scripts/
    ├── deploy.sh        # 部署脚本
    └── update.sh        # 更新脚本
```
