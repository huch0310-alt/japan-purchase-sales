# ========================================
# 日本采销管理系统 - 最简部署脚本
# ========================================
# 使用方法：将此内容复制到服务器上执行

# 1. 安装Docker (如已安装可跳过)
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker

# 2. 创建项目目录
mkdir -p /opt/japan-sales && cd /opt/japan-sales

# 3. 启动PostgreSQL数据库
docker run -d --name japan-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=japan2024 \
  -e POSTGRES_DB=japan_purchase_sales \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  --health-cmd="pg_isready -U postgres" \
  --health-interval=10s \
  --health-timeout=5s \
  --health-retries=5 \
  postgres:14-alpine

# 4. 启动后端
docker run -d --name japan-backend \
  -e NODE_ENV=production \
  -e DB_HOST=43.153.155.76 \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=japan2024 \
  -e DB_DATABASE=japan_purchase_sales \
  -e DB_SYNCHRONIZE=true \
  -e JWT_SECRET=japan-secret-2024 \
  -p 3001:3001 \
  nestjs/base:latest \
  sh -c "npm install -g @nestjs/cli && git clone https://github.com/your-repo/japan-purchase-sales.git /app && cd /app/backend && npm install && npm run start:prod"

# 5. 启动前端
docker run -d --name japan-web \
  -p 3000:80 \
  nginx:alpine

# 6. 开放端口
ufw allow 3000/tcp
ufw allow 3001/tcp
ufw allow 5432/tcp
