#!/bin/bash

# 设备仓库管理系统 - Linux快速启动脚本

set -e

echo "=========================================="
echo "   设备仓库管理系统 - 快速启动脚本"
echo "=========================================="
echo

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[错误] 未检测到Docker，请先安装Docker${NC}"
    echo "安装指南: https://docs.docker.com/engine/install/"
    exit 1
fi

# 检查Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}[错误] 未检测到Docker Compose${NC}"
    echo "安装指南: https://docs.docker.com/compose/install/"
    exit 1
fi

# 检查.env文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}[提示] 创建默认环境配置文件...${NC}"
    cat > .env << 'EOF'
# MySQL配置
MYSQL_ROOT_PASSWORD=warehouse123
MYSQL_PASSWORD=warehouse123

# 管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# CORS配置
CORS_ORIGINS=http://localhost:80
EOF
    echo -e "${GREEN}[完成] 已创建.env文件，请根据需要修改配置${NC}"
    echo
fi

echo "[1/4] 正在拉取最新代码..."
cd ..
git pull || echo "跳过代码更新"
cd deploy

echo
echo "[2/4] 正在构建应用..."
docker-compose build --no-cache

echo
echo "[3/4] 正在启动服务..."
docker-compose up -d

echo
echo "[4/4] 等待服务启动..."
sleep 15

# 检查服务状态
if docker-compose ps | grep -q "Up"; then
    echo
    echo "=========================================="
    echo -e "   ${GREEN}✅ 部署成功！${NC}"
    echo "=========================================="
    echo
    echo "📱 访问地址:"
    echo "   前端: http://localhost"
    echo "   后端: http://localhost/api"
    echo
    echo "🔧 管理命令:"
    echo "   查看日志: docker-compose logs -f"
    echo "   停止服务: docker-compose down"
    echo "   重启服务: docker-compose restart"
    echo
    echo "👤 默认账号:"
    echo "   用户名: admin"
    echo "   密码: admin123"
    echo
    echo "=========================================="
else
    echo
    echo -e "${RED}[错误] 服务启动失败，请检查日志:${NC}"
    echo "   docker-compose logs"
    exit 1
fi
