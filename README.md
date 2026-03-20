# 日本采销管理系统

B端企业应用（多端SaaS），用于商品采购、销售、订单管理、請求書生成。

## 项目概述

- **项目名称**: 日本采销管理系统
- **项目类型**: B端企业应用（多端SaaS）
- **核心功能**: 商品采购、销售、订单管理、請求書生成
- **目标用户**: 约500人（采购、销售、管理人员、客户）

## 技术栈

| 层级 | 技术方案 |
|------|----------|
| 后端 | Node.js + NestJS |
| 数据库 | PostgreSQL |
| 文件存储 | 腾讯云COS（可选） |
| APP框架 | Flutter 3.x |
| 状态管理 | Riverpod |
| Web后台 | Vue3 + Element Plus |
| 多语言 | flutter_localizations + intl |
| 电子章 | pdf_lib |

## 系统架构

```
日本采销管理系统
├── backend/           # NestJS 后端 API
│   ├── src/
│   │   ├── auth/           # 认证模块
│   │   ├── users/          # 用户模块（员工/客户）
│   │   ├── products/       # 商品模块
│   │   ├── orders/        # 订单模块
│   │   ├── invoices/       # 請求書模块
│   │   ├── categories/     # 分类模块
│   │   ├── units/         # 单位模块
│   │   ├── cart/          # 购物车模块
│   │   ├── settings/      # 系统设置
│   │   ├── logs/          # 操作日志
│   │   ├── messages/      # 消息通知
│   │   ├── reports/       # 报表导出
│   │   ├── upload/       # 文件上传
│   │   ├── dashboard/     # 仪表盘
│   │   └── common/        # 公共模块
│   └── database/          # 数据库脚本
│
├── web-admin/        # Vue3 管理后台
│   └── src/
│       ├── views/          # 页面组件
│       ├── router/         # 路由配置
│       ├── store/         # 状态管理
│       ├── api/            # API封装
│       └── assets/        # 静态资源
│
└── flutter-app/      # Flutter 移动端
    └── lib/
        ├── src/
        │   ├── pages/      # 页面
        │   ├── widgets/   # 组件
        │   ├── models/    # 数据模型
        │   ├── providers/  # 状态管理
        │   ├── services/  # API服务
        │   ├── utils/     # 工具类
        │   └── config/    # 配置
        └── i18n/          # 多语言
```

## 功能模块

### 后台管理系统（Web端）

| 模块 | 功能 | 权限 |
|------|------|------|
| 信息统计 | 各种信息显示和图表化分析 | 所有人 |
| 客户管理 | 客户信息录入管理 | 所有人 |
| 员工管理 | 员工信息录入管理 | 超级管理员、管理员 |
| 采购管理 | 采购人员操作集合 | 采购人员、超级管理员、管理员 |
| 商品管理 | 销售人员操作集合 | 销售人员、超级管理员、管理员 |
| 订单管理 | 订单查看、确认、打印 | 销售人员、超级管理员、管理员 |
| 账单管理 | 订单汇总、請求書生成、已付款标记 | 销售人员、超级管理员、管理员 |
| 操作日志 | 记录所有操作 | 超级管理员可见全部；管理员可见采购和销售操作 |

### 采购端APP

- 商品采集（拍照+填写信息）
- 我的采集记录（查看、修改、删除未审核商品）
- 消息通知
- 个人中心

### 销售端APP

- 待审核商品（通过/拒绝）
- 商品管理（上下架、价格修改）
- 订单管理（确认、打印）
- 消息通知
- 个人中心

### 客户端APP（B端客户）

- 商品浏览（分类+商品列表）
- 购物车
- 订单管理（下单、取消）
- 消息通知
- 个人中心

## 快速开始

### 1. 环境要求

- Node.js 18+
- PostgreSQL 14+
- Flutter 3.x
- Vue 3.x

### 2. 后端启动

```bash
cd backend

# 安装依赖
npm install

# 创建数据库
psql -U postgres -c "CREATE DATABASE japan_purchase_sales;"

# 初始化数据库
psql -U postgres -d japan_purchase_sales -f database/init.sql

# 复制环境配置
cp .env.example .env

# 启动开发服务器
npm run start:dev
```

后端服务将在 http://localhost:3001 启动

### 3. Web管理后台启动

```bash
cd web-admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

管理后台将在 http://localhost:3000 启动

### 4. Flutter APP

```bash
cd flutter-app

# 安装依赖
flutter pub get

# 运行APP
flutter run
```

## API文档

启动后端服务后，访问 http://localhost:3001/api 查看Swagger API文档。

## 核心API接口

### 认证

- `POST /api/auth/staff/login` - 员工登录
- `POST /api/auth/customer/login` - 客户登录
- `POST /api/auth/verify` - 验证令牌

### 用户管理

- `GET /api/staff` - 获取员工列表
- `POST /api/staff` - 创建员工
- `GET /api/customers` - 获取客户列表
- `POST /api/customers` - 创建客户

### 商品管理

- `GET /api/products/active` - 获取已上架商品
- `GET /api/products/pending` - 获取待审核商品
- `POST /api/products` - 采集商品
- `PUT /api/products/:id/approve` - 审核通过
- `PUT /api/products/:id/activate` - 上架商品

### 订单管理

- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取订单列表
- `PUT /api/orders/:id/confirm` - 确认订单

### 請求書

- `POST /api/invoices` - 生成請求書
- `GET /api/invoices/:id/pdf` - 下载PDF

### 报表

- `GET /api/reports/sales/export` - 导出销售报表
- `GET /api/stats/dashboard` - 获取仪表盘数据

## 默认账号

创建数据库后，可使用以下默认账号登录：

- 用户名: admin
- 密码: admin123

（需要在数据库中手动创建或使用注册功能）

## 开发计划

1. 基础架构（2周）
2. 核心功能（3周）
3. 订单与财务（2周）
4. 报表与系统设置（2周）
5. 测试与部署（1周）

## 许可证

MIT License
