#!/bin/bash

# 日本采销管理系统 - 一键部署脚本
# 适用于 Ubuntu 20.04/22.04/24.04 LTS

set -e

echo "======================================"
echo "  日本采销管理系统 - 一键部署"
echo "======================================"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}请使用root用户运行此脚本${NC}"
  exit 1
fi

echo -e "${GREEN}[1/7] 更新系统...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}[2/7] 安装必要工具...${NC}"
apt install -y curl wget git vim

echo -e "${GREEN}[3/7] 安装Docker...${NC}"
if ! command -v docker &> /dev/null; then
    # Ubuntu 24.04 需要使用官方Docker安装脚本
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}Docker安装完成${NC}"
else
    echo -e "${YELLOW}Docker已安装: $(docker --version)${NC}"
fi

echo -e "${GREEN}[4/7] 安装Docker Compose...${NC}"
# 使用Docker官方推荐的方式安装Compose插件
if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose安装完成${NC}"
else
    echo -e "${YELLOW}Docker Compose已安装${NC}"
fi

echo -e "${GREEN}[5/7] 创建项目目录...${NC}"
mkdir -p /opt/japan-purchase-sales
cd /opt/japan-purchase-sales

echo -e "${GREEN}[6/7] 配置环境变量...${NC}"
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env 2>/dev/null || echo "创建环境配置文件..."
    cat > backend/.env << 'EOF'
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=japan2024
DB_DATABASE=japan_purchase_sales
DB_SYNCHRONIZE=true
JWT_SECRET=japan-sales-secret-$(date +%s)
JWT_EXPIRES_IN=7d
PORT=3001
EOF
fi

echo -e "${GREEN}[7/7] 启动服务...${NC}"

# 内存优化 - 2G内存服务器添加swap
TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
if [ "$TOTAL_MEM" -lt 4096 ]; then
    echo -e "${YELLOW}检测到内存小于4G，配置Swap...${NC}"
    if [ ! -f /swapfile ]; then
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
fi

docker-compose up -d --build

echo ""
echo "======================================"
echo -e "${GREEN}部署完成！${NC}"
echo "======================================"
echo ""
echo "访问地址："
echo "  Web管理后台: http://你的服务器IP:3000"
echo "  后端API: http://你的服务器IP:3001"
echo ""
echo "默认账号:"
echo "  用户名: admin"
echo "  密码: admin123"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"
