#!/bin/bash
# Administrative Workbench - 更新脚本
# 用于更新已部署的应用

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

cd "$(dirname "$0")"

# 使用 docker compose 或 docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

info "拉取最新代码..."
git pull

info "重新构建镜像..."
$COMPOSE_CMD build --no-cache

info "重启服务..."
$COMPOSE_CMD up -d

success "更新完成！"

info "服务状态:"
$COMPOSE_CMD ps
