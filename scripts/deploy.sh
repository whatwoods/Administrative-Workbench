#!/bin/bash

# Administrative Workbench 部署脚本
# 在服务器上运行此脚本来手动部署应用

set -e

echo "🚀 开始部署 Administrative Workbench..."

# 配置变量
DEPLOY_PATH="${DEPLOY_PATH:-.}"
DOCKER_USERNAME="${DOCKER_USERNAME:-}"

if [ -z "$DOCKER_USERNAME" ]; then
    echo "❌ 错误: DOCKER_USERNAME 未设置"
    exit 1
fi

# 进入部署目录
cd "$DEPLOY_PATH"

echo "📂 部署路径: $(pwd)"

# 更新代码
echo "📥 更新代码..."
git pull origin main

# 创建 .env 文件（如果不存在）
if [ ! -f .env ]; then
    echo "📝 创建 .env 文件..."
    cat > .env << EOF
MONGODB_URI=mongodb://admin:password@mongodb:27017/admin
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=3001
VITE_API_URL=http://\$(hostname -I | awk '{print \$1}'):3001
EOF
    echo "✅ .env 文件已创建，请修改密码和其他敏感信息"
fi

# 构建或拉取镜像
echo "🐳 处理 Docker 镜像..."

# 方案 1: 使用预构建镜像（推荐）
if [ "${BUILD_TYPE:-pull}" = "pull" ]; then
    echo "📡 从 Docker Hub 拉取镜像..."
    docker pull "$DOCKER_USERNAME/administrative-workbench-backend:latest" || true
    docker pull "$DOCKER_USERNAME/administrative-workbench-frontend:latest" || true
else
    # 方案 2: 本地构建
    echo "🔨 本地构建镜像..."
    docker-compose build
fi

# 停止旧服务
echo "⏹️  停止现有服务..."
docker-compose down || true

# 启动新服务
echo "▶️  启动新服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务健康状态
echo "🏥 检查服务健康状态..."
if docker-compose ps | grep -q "healthy"; then
    echo "✅ 服务已启动并正常运行"
else
    echo "⚠️  服务已启动，请检查日志"
    docker-compose logs --tail=20
fi

# 清理无用资源
echo "🧹 清理 Docker 资源..."
docker image prune -f
docker system prune -f

# 显示服务状态
echo ""
echo "📊 服务状态:"
docker-compose ps

echo ""
echo "✅ 部署完成！"
echo "📍 前端地址: http://$(hostname -I | awk '{print $1}')"
echo "📍 后端地址: http://$(hostname -I | awk '{print $1}'):3001"
echo ""
echo "查看日志: docker-compose logs -f"
echo "重启服务: docker-compose restart"
echo "停止服务: docker-compose down"
