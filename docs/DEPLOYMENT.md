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

```bash
docker compose logs -f    # 查看日志
docker compose restart    # 重启
docker compose down       # 停止

# 更新方法 (Docker Compose)
docker compose pull && docker compose up -d
```

### 方式二：手动部署更新 (非 Compose)

如果你是通过 `docker run` 手动启动的容器，请按以下步骤更新：

1. **拉取新镜像**：`docker pull ghcr.io/whatwoods/administrative-workbench:latest`
2. **停止并删除旧容器**：`docker stop awb-app && docker rm awb-app`
3. **重新运行启动命令**：使用之前的 `docker run` 命令重新创建容器（确保挂载了相同的 `/app/data` 目录）。


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

---

## 📦 1Panel 部署指南

如果你使用 [1Panel](https://1panel.cn) 面板管理服务器，可以按以下方法部署。

### 方式一：Docker Compose 编排（推荐）

1. 进入 **容器** -> **编排** -> **创建编排**
2. 粘贴以下内容：

```yaml
version: '3.8'
services:
  awb-app:
    image: ghcr.io/whatwoods/administrative-workbench:latest
    container_name: awb-app
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      - JWT_SECRET=你的随机密钥
      - NODE_ENV=production
      - LLM_PROVIDER=tencent
      - LLM_API_KEY=你的API密钥
    volumes:
      - ./data:/app/data
```

3. 点击 **部署** 启动容器

### 方式二：手动创建容器

在 **容器** -> **容器** -> **创建容器** 中填写以下内容：

#### 基本信息

| 项目 | 填写内容 |
| :--- | :--- |
| **容器名称** | `awb-app` |
| **镜像** | `ghcr.io/whatwoods/administrative-workbench:latest` |
| **重启策略** | 总是重启 (Always) |

#### 端口映射

| 服务端口 | 宿主机端口 | 协议 |
| :--- | :--- | :--- |
| `80` | `8080` (或其他可用端口) | TCP |

#### 挂载（存储卷）

| 宿主机路径 | 容器路径 | 模式 |
| :--- | :--- | :--- |
| `/opt/1panel/apps/awb/data` | `/app/data` | 读写 |

> [!WARNING]
> **必须挂载 `/app/data` 目录**，否则重启容器后所有数据（账号、待办、笔记）将会丢失！

#### 环境变量

可以在"批量编辑"模式下逐行粘贴：

```text
NODE_ENV=production
JWT_SECRET=awb_secure_key_123456
LLM_PROVIDER=tencent
LLM_API_KEY=你的API密钥
APP_PORT=80
```

如果使用 **硅基流动 (SiliconFlow)** 作为 AI 提供商：

```text
NODE_ENV=production
JWT_SECRET=awb_secure_key_123456
LLM_PROVIDER=siliconflow
LLM_API_KEY=你的API密钥
LLM_MODEL=deepseek-ai/DeepSeek-V3
APP_PORT=80
```

#### 标签（可选）

| 键 | 值 |
| :--- | :--- |
| `owner` | `admin` |
| `project` | `administrative-workbench` |
| `description` | `AI办公工作台` |

---

## � 自动化更新 (GitHub -> Docker)

目前本项目已经配置了 GitHub Actions，每当你向 `main` 分支提交代码时，会自动构建新镜像并推送到 `ghcr.io`。

为了让你的服务器能自动感知并更新镜像，建议使用 **Watchtower**。

### 1. 使用 Docker Compose 集成

修改你的 `docker-compose.yml`，添加 Watchtower 服务：

```yaml
services:
  awb-app:
    image: ghcr.io/whatwoods/administrative-workbench:latest
    # ... 其他配置 ...

  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=3600 # 每小时检查一次
    command: --interval 3600 awb-app
```

### 2. 手动运行 Watchtower (独立容器)

如果你不想修改 Compose 文件，可以直接运行一个独立容器来监视 `awb-app`：

```bash
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --cleanup \
  --interval 3600 \
  awb-app
```

**原理说明**：
- **GitHub Actions**：负责把代码变动变成新的“镜像包”。
- **Watchtower**：就像一个守卫，每隔一小时去仓库看一眼有没有新包，如果有，就自动拉取并重启你的应用。

---

## �🔐 默认账户与首次登录


为了提高即时可用性和安全性，本项目**默认禁用了开放注册**，并内置了一个初始管理员账号。

### 初始凭据

- **用户名**: `Way`
- **密码**: (初始预设)

### 首次使用流程

1. 部署完成后，访问 `http://服务器IP:APP_PORT`
2. 使用上述初始凭据登录。
3. 登录后，系统会自动为您初始化所需的数据库结构。

### 注意事项

- **修改密码**：目前建议通过直接修改 SQLite 数据库中的 `users` 表来更改密码。
- **数据持久化**：所有用户数据保存在您挂载的 `/app/data` 目录下的 `admin-workbench.db` 文件中。
- **JWT 密钥**：`JWT_SECRET` 环境变量用于加密登录令牌，务必在生产环境使用随机长字符串。

