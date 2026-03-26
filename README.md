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

## 业务规则定义

### 1. VIP折扣规则

**核心原则**: 默认折扣为0（即不打折）

**折扣计算公式**:
```
应付金额 = 原价 × (1 - 折扣百分比 / 100)
```

**示例**:
| 折扣值 (vipDiscount) | 实际折扣率 | 计算公式 | 说明 |
|---------------------|-----------|---------|------|
| 0 | 0% | 原价 × 1 | 不打折 |
| 10 | 10% | 原价 × 0.9 | 九折 |
| 20 | 20% | 原价 × 0.8 | 八折 |
| 90 | 90% | 原价 × 0.1 | 一折 |

**数据库存储**: vipDiscount 字段存储整数，如 10 表示 10%（九折），不是 0.1

**前端显示**: 显示为百分比，如 `((order.customer.vipDiscount || 0) * 100).toFixed(0) + '%'`

**历史Bug警示**: 之前曾错误理解为 vipDiscount=90 表示 9000%，实际应为 90%（九折）

---

### 2. 客户创建必填字段

**新增客户时，以下字段为必填项**:

| 字段 | 字段名 | 说明 |
|------|--------|------|
| 用户名 | username | 客户登录账号 |
| 密码 | password | 登录密码 |
| 公司名称 | companyName | 客户公司名称 |
| 联系人 | contactPerson | 负责对接的人员姓名 |
| 联系电话 | phone | 联系方式（手机或电话） |
| 送货地址 | address | 默认送货地址 |
| VIP折扣 | vipDiscount | 可选，默认0，填入10表示9折 |

**可选字段**:
- 发票名称 (invoiceName) - 默认与公司名称相同
- 发票地址 (invoiceAddress) - 默认与公司地址相同
- 发票电话 (invoicePhone) - 默认与联系电话相同

---

### 3. 商品分类规则

**系统内置八大分类**（固定，不可删除）:

| 中文 | 日语 | 英语 |
|------|------|------|
| 肉类 | 肉類 | Meat |
| 蛋品 | 卵類 | Eggs |
| 生鲜蔬果 | 生鮮野菜 | Fresh Produce |
| 海鲜 | 海鮮 | Seafood |
| 调料 | 調味料 | Condiments |
| 饮料 | 飲料 | Beverages |
| 粮油 | 穀物油 | Grains & Oils |
| 日配 | 日配 | Daily Products |

**分类添加规则**:
1. **必须同时输入三语**: 新增分类时，中文、日语、英语三个名称必须同时填写，缺一不可
2. **不可删除内置分类**: 系统内置的八大分类不可删除
3. **分类名称唯一性**: 同一种语言下的分类名称不可重复

**数据库设计**:
```sql
categories (
  id UUID PRIMARY KEY,
  name_zh VARCHAR(50),      -- 中文名称
  name_ja VARCHAR(50),       -- 日语名称
  name_en VARCHAR(50),       -- 英语名称
  is_system BOOLEAN DEFAULT FALSE,  -- 是否系统内置
  created_at TIMESTAMP
)
```

---

### 4. 金额显示规则

**核心原则**: 日元最小单位是"円"（元），所有金额只显示整数，不显示小数

**格式化函数**:
```javascript
// 正确示例
formatCurrency(1234.56)  // 返回 "¥1,235"（四舍五入到整数）

// 错误示例
1234.56.toLocaleString()  // 可能显示 "¥1,234.56"
```

---

## 许可证

MIT License
