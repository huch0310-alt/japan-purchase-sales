# 日本采销管理系统 - 腾讯云服务器部署指南

## 推荐服务器系统

**推荐安装: Ubuntu 20.04 LTS**

理由：
- Docker支持最完善
- 社区资源丰富
- 长期稳定支持
- 操作简单易上手

---

## 腾讯云重装系统步骤

### 1. 登录腾讯云控制台

### 2. 进入云服务器控制台

### 3. 重装系统
- 选择 **Ubuntu 20.04 LTS (64位)**
- 设置root密码

---

## 一键部署脚本

连接服务器后，执行以下命令：

```bash
# 1. 下载部署脚本
cd /opt
wget https://raw.githubusercontent.com/japan-purchase-sales/deploy/main/deploy.sh

# 2. 添加执行权限
chmod +x deploy.sh

# 3. 运行部署脚本
./deploy.sh
```

---

## 手动部署步骤（推荐）

### 步骤1: 连接服务器

```bash
ssh root@你的服务器IP
```

### 步骤2: 安装Docker

```bash
# 更新系统
apt update && apt upgrade -y

# 安装必要工具
apt install -y curl wget git

# 安装Docker
curl -fsSL https://get.docker.com | sh

# 启动Docker
systemctl start docker
systemctl enable docker

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

验证安装：
```bash
docker --version
docker-compose --version
```

### 步骤3: 上传项目文件

**方式A: Git克隆（推荐）**
```bash
cd /opt
git clone https://github.com/你的仓库/japan-purchase-sales.git
cd japan-purchase-sales
```

**方式B: 本地上传**
```bash
# 在本地执行
scp -r /path/to/japan-purchase-sales root@你的服务器IP:/opt/
```

### 步骤4: 配置环境变量

```bash
cd /opt/japan-purchase-sales
cp backend/.env.example backend/.env
nano backend/.env
```

修改配置：
```env
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=japan2024
DB_DATABASE=japan_purchase_sales
DB_SYNCHRONIZE=true

JWT_SECRET=japan-sales-secret-2024
JWT_EXPIRES_IN=7d

PORT=3001
```

### 步骤5: 启动服务

```bash
cd /opt/japan-purchase-sales
docker-compose up -d --build
```

查看状态：
```bash
docker-compose ps
docker-compose logs -f
```

### 步骤6: 开放端口

```bash
# 开放端口
ufw allow 3000/tcp
ufw allow 3001/tcp
ufw allow 80/tcp
ufw enable
```

### 步骤7: 腾讯云安全组

在腾讯云控制台添加安全组规则：

| 协议 | 端口 | 来源 | 说明 |
|------|------|------|------|
| TCP | 3000 | 0.0.0.0/0 | Web管理后台 |
| TCP | 3001 | 0.0.0.0/0 | API服务 |

---

## 访问服务

- **Web管理后台**: http://你的服务器IP:3000
- **后端API**: http://你的服务器IP:3001
- **API文档**: http://你的服务器IP:3001/api

---

## 默认登录

- **用户名**: admin
- **密码**: admin123

---

## 常用维护命令

```bash
# 重启所有服务
docker-compose restart

# 查看日志
docker-compose logs -f backend

# 更新部署
git pull
docker-compose up -d --build

# 停止服务
docker-compose down
```

---

## 内存优化（如需要）

2G内存可能不足，可以添加swap：

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```
