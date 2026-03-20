# 日本采销管理系统 - 部署命令

## 在服务器上执行以下命令

### 步骤1: 安装Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker
```

### 步骤2: 创建并进入项目目录

```bash
mkdir -p /opt/japan-sales && cd /opt/japan-sales
```

### 步骤3: 创建 docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: japan-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: japan2024
      POSTGRES_DB: japan_purchase_sales
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
    restart: unless-stopped

  backend:
    image: node:18-alpine
    container_name: japan-backend
    working_dir: /app
    volumes:
      - ./backend:/app
    command: >
      sh -c "npm install && npm run build && npm run start:prod"
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: japan2024
      DB_DATABASE: japan_purchase_sales
      DB_SYNCHRONIZE: "true"
      JWT_SECRET: japan-secret-2024
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  web:
    image: nginx:alpine
    container_name: japan-web
    volumes:
      - ./web/dist:/usr/share/nginx/html:ro
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
EOF
```

### 步骤4: 下载源代码

```bash
# 在本地执行，下载项目文件到服务器
# 或者使用git clone
git clone https://github.com/你的仓库/japan-purchase-sales.git /opt/japan-sales
```

### 步骤5: 启动服务

```bash
cd /opt/japan-sales
docker-compose up -d
```

### 步骤6: 开放端口

```bash
ufw allow 3000/tcp
ufw allow 3001/tcp
ufw enable
```

### 步骤7: 腾讯云安全组

在腾讯云控制台添加：
- 3000端口 (TCP)
- 3001端口 (TCP)

---

## 访问

- **Web后台**: http://43.153.155.76:3000
- **API**: http://43.153.155.76:3001

**账号**: admin / admin123
