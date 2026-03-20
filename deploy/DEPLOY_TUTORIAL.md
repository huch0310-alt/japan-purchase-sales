# 日本采销管理系统 - 腾讯云部署详细教程

## 一、准备工作

### 1.1 购买腾讯云服务器
1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 购买轻量应用服务器或CVM
3. 配置建议：
   - **配置**: 2核4G
   - **系统**: Ubuntu 20.04 LTS (推荐) 或 CentOS 8
   - **带宽**: 5Mbps
   - **硬盘**: 50GB SSD

### 1.2 记录服务器信息
购买后记录以下信息：
```
服务器IP: xxx.xxx.xxx.xxx
登录用户名: root
登录密码: xxxxxxxx (或SSH密钥)
```

---

## 二、上传项目文件

### 2.1 方法一：使用宝塔面板（推荐新手）

1. 在腾讯云控制台安装"轻量应用服务器"时选择"宝塔面板"
2. 登录宝塔面板: `http://服务器IP:8888`
3. 点击"文件" → 上传整个项目文件夹
4. 上传位置: `/opt/japan-purchase-sales`

### 2.2 方法二：使用Xftp

1. 下载安装 [Xftp](https://www.xshell.com/xftp/)
2. 新建连接：
   - 主机: 服务器IP
   - 用户名: root
   - 密码: 服务器密码
3. 左侧选本地项目文件夹，右侧选 `/opt/`
4. 创建文件夹 `japan-purchase-sales`
5. 上传所有文件

### 2.3 方法三：使用Git（推荐）

```bash
# 1. 先把项目上传到GitHub/Gitee
# 2. 在服务器上执行:
ssh root@服务器IP

# 3. 安装git
apt update && apt install -y git

# 4. 克隆项目
cd /opt
git clone 你的项目地址 japan-purchase-sales
```

---

## 三、开始部署

### 3.1 登录服务器

打开终端（Windows用PowerShell或Xshell），运行：

```bash
ssh root@你的服务器IP
```

输入密码后登录成功。

### 3.2 进入项目目录

```bash
cd /opt/japan-purchase-sales/deploy
```

### 3.3 创建环境变量文件

```bash
cp .env.example .env
```

编辑环境变量：

```bash
nano .env
```

修改内容：
```
DB_PASSWORD=设置一个强密码
JWT_SECRET=设置一个随机字符串
```

保存: `Ctrl + O`，回车
退出: `Ctrl + X`

### 3.4 启动所有服务

```bash
docker-compose -f docker-compose.prod.yml up -d
```

等待1-2分钟，首次需要下载Docker镜像。

### 3.5 检查服务状态

```bash
docker-compose -f docker-compose.prod.yml ps
```

应该看到4个服务都是 "Up" 状态：
```
Name                    Status
japan-sales-backend    Up
japan-sales-web        Up
japan-sales-nginx      Up
japan-sales-postgres   Up (healthy)
```

---

## 四、访问系统

### 4.1 打开浏览器

地址栏输入：`http://你的服务器IP`

### 4.2 登录系统

```
用户名: admin
密码: admin123
```

---

## 五、常用命令

### 查看日志（排错用）
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### 停止服务
```bash
docker-compose -f docker-compose.prod.yml down
```

### 重启服务
```bash
docker-compose -f docker-compose.prod.yml restart
```

### 更新代码后重新部署
```bash
cd /opt/japan-purchase-sales
git pull  # 如果用git
docker-compose -f deploy/docker-compose.prod.yml down
docker-compose -f deploy/docker-compose.prod.yml up -d --build
```

---

## 六、域名配置（可选）

### 6.1 购买域名
在腾讯云购买域名

### 6.2 配置DNS解析
添加记录：
```
记录类型: A
主机记录: @
记录值: 服务器IP
```

### 6.3 申请SSL证书（免费）
1. 腾讯云搜索"SSL证书"
2. 申请免费证书
3. 下载Nginx证书
4. 上传到服务器 `/opt/japan-sales/deploy/nginx/ssl/`
5. 修改nginx配置启用HTTPS

---

## 七、防火墙配置

如果无法访问，检查防火墙：

```bash
# 开放端口
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp

# 启动防火墙
ufw enable
```

---

## 八、常见问题

### Q1: 端口被占用
```bash
# 查看端口占用
netstat -tlnp | grep 80

# 改端口或停止占用程序
```

### Q2: 数据库连接失败
```bash
# 查看数据库日志
docker-compose logs postgres

# 检查.env配置
```

### Q3: 网页打不开
```bash
# 查看nginx状态
docker-compose logs nginx

# 检查防火墙
ufw status
```

---

## 九、技术支持

如有问题，请提供：
1. 服务器IP
2. 错误截图
3. 日志输出：`docker-compose logs`
