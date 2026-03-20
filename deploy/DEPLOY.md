# 日本采销管理系统 - 部署指南

## 服务器要求
- 腾讯云 2核4G
- 系统: Ubuntu 20.04+ / CentOS 8+
- 带宽: 5M+

## 部署步骤

### 方式一: 一键部署 (推荐)

```bash
# 1. 连接服务器
ssh root@你的服务器IP

# 2. 下载项目并部署
cd /opt
git clone https://github.com/你的仓库/japan-purchase-sales.git
cd japan-purchase-sales/deploy

# 3. 配置环境变量
cp .env.example .env
nano .env  # 修改密码

# 4. 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 5. 查看状态
docker-compose -f docker-compose.prod.yml ps
```

### 方式二: 手动部署

```bash
# 1. 安装Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker

# 2. 安装Docker Compose
apt update
apt install -y docker-compose

# 3. 配置环境变量
mkdir -p /opt/japan-sales
cd /opt/japan-sales
cp /path/to/project/deploy/.env.example .env

# 4. 编辑环境变量
nano .env

# 5. 复制项目文件
cp -r /path/to/project/backend ./backend
cp -r /path/to/project/web-admin ./web-admin
cp /path/to/project/deploy/docker-compose.prod.yml ./docker-compose.yml
cp /path/to/project/deploy/nginx ./nginx

# 6. 启动服务
docker-compose up -d
```

## 验证部署

```bash
# 检查容器状态
docker-compose ps

# 检查日志
docker-compose logs -f

# 测试API
curl http://localhost/api
```

## 访问地址

- Web管理后台: http://你的服务器IP
- 后端API: http://你的服务器IP/api

## 初始账号

- 用户名: admin
- 密码: admin123

## 常用命令

```bash
# 启动
docker-compose -f docker-compose.prod.yml start

# 停止
docker-compose -f docker-compose.prod.yml stop

# 重启
docker-compose -f docker-compose.prod.yml restart

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 更新部署
docker-compose -f docker-compose.prod.yml down
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

## 防火墙配置

```bash
# 开放端口
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 22/tcp   # SSH

# 启动防火墙
ufw enable
```
