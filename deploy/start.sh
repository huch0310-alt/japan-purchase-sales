#!/bin/bash
# 日本采销管理系统 - 极简一键部署脚本
# 只需要复制到服务器执行即可

set -e

echo "========== 日本采销管理系统 一键部署 =========="

# 1. 安装Docker
echo "[1/4] 安装Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
fi
echo "Docker已安装: $(docker --version)"

# 2. 创建目录
echo "[2/4] 创建目录..."
mkdir -p /opt/japan-sales
cd /opt/japan-sales

# 3. 复制当前目录文件到服务器
echo "[3/4] 请确保已将项目文件复制到 /opt/japan-sales 目录"
echo "项目结构:"
echo "  /opt/japan-sales/"
echo "  ├── backend/       (后端代码)"
echo "  ├── web-admin/    (前端代码)"
echo "  ├── deploy/       (部署配置)"
echo "  └── ..."

# 4. 启动服务
echo "[4/4] 启动服务..."
cd /opt/japan-sales/deploy

# 复制环境变量配置
cp .env.example .env 2>/dev/null || true

# 启动
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "========== 部署完成 =========="
echo ""
echo "访问地址: http://你的服务器IP"
echo "后端API:  http://你的服务器IP/api"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"
echo ""
