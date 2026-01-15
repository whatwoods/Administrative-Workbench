#!/bin/bash
# Administrative Workbench - 一键部署脚本
# 适用于安装了 Docker 和 Docker Compose 的服务器（如 1Panel）

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的信息
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 检查依赖
check_dependencies() {
    info "检查依赖..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker 未安装，请先安装 Docker"
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose 未安装，请先安装 Docker Compose"
    fi
    
    success "依赖检查通过"
}

# 初始化环境变量
init_env() {
    info "初始化环境变量..."
    
    if [ ! -f "../.env" ]; then
        if [ -f "../.env.example" ]; then
            cp "../.env.example" "../.env"
            warning "已从 .env.example 创建 .env 文件，请修改其中的敏感配置"
            
            # 生成随机 JWT_SECRET
            NEW_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
            sed -i "s/your-super-secret-jwt-key-change-in-production/$NEW_SECRET/" "../.env"
            
            # 生成随机 MongoDB 密码
            NEW_MONGO_PASS=$(openssl rand -base64 16 2>/dev/null || head -c 16 /dev/urandom | base64)
            sed -i "s/your_secure_password_here/$NEW_MONGO_PASS/" "../.env"
            
            success "已自动生成安全密钥"
        else
            error "找不到 .env.example 文件"
        fi
    else
        info ".env 文件已存在，跳过创建"
    fi
}

# 构建并启动服务
deploy() {
    info "开始部署..."
    
    cd "$(dirname "$0")"
    
    # 使用 docker compose 或 docker-compose
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
    
    info "拉取最新镜像..."
    $COMPOSE_CMD pull mongodb || true
    
    info "构建应用镜像..."
    $COMPOSE_CMD build --no-cache
    
    info "启动服务..."
    $COMPOSE_CMD up -d
    
    success "部署完成！"
}

# 显示状态
show_status() {
    info "服务状态:"
    
    cd "$(dirname "$0")"
    
    if docker compose version &> /dev/null; then
        docker compose ps
    else
        docker-compose ps
    fi
    
    echo ""
    success "部署信息:"
    echo -e "  前端: ${GREEN}http://localhost:${FRONTEND_PORT:-80}${NC}"
    echo -e "  后端: ${GREEN}http://localhost:${BACKEND_PORT:-5000}${NC}"
    echo ""
    info "使用 'docker compose logs -f' 查看日志"
}

# 主函数
main() {
    echo ""
    echo "╔══════════════════════════════════════╗"
    echo "║  Administrative Workbench 部署脚本   ║"
    echo "╚══════════════════════════════════════╝"
    echo ""
    
    check_dependencies
    init_env
    deploy
    show_status
}

# 运行
main "$@"
