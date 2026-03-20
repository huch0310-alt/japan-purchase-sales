#!/bin/bash
# 日本采销管理系统 - 极简部署脚本
# 服务器IP: 43.153.155.76
# 使用方法: 将此脚本上传到服务器执行

set -e

echo "========================================"
echo "   日本采销管理系统 - 一键部署"
echo "========================================"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
  echo "请使用root用户执行此脚本"
  exit 1
fi

echo "[1/5] 安装Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
fi
echo "Docker版本: $(docker --version)"

echo "[2/5] 安装Docker Compose..."
apt update && apt install -y docker-compose-plugin
echo "Docker Compose已安装"

echo "[3/5] 创建项目目录..."
mkdir -p /opt/japan-sales
cd /opt/japan-sales

echo "[4/5] 下载配置文件..."

# docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./backend:/app
    command: sh -c "npm install && npm run build && npm run start:prod"
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=japan2024
      - DB_DATABASE=japan_purchase_sales
      - DB_SYNCHRONIZE=true
      - JWT_SECRET=japan-secret-2024
    depends_on:
      postgres:
        condition: service_healthy

  web-admin:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./web-admin:/app
    command: sh -c "npm install && npm run build"
    ports:
      - "3000:80"
    depends_on:
      - backend

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=japan2024
      - POSTGRES_DB=japan_purchase_sales
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
    ports:
      - "5432:5432"

volumes:
  postgres_data:
EOF

echo "[5/5] 启动服务..."
docker-compose up -d

echo ""
echo "========================================"
echo "   部署完成！"
echo "========================================"
echo ""
echo "访问地址："
echo "  Web管理后台: http://43.153.155.76:3000"
echo "  后端API: http://43.153.155.76:3001"
echo ""
echo "默认账号: admin / admin123"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"
