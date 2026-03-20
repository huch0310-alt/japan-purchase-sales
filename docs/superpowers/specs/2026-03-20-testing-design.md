# 日本采销管理系统 - 测试与质量保障设计

## 概述

为日本采销管理系统构建完整的测试套件，确保代码质量和功能正确性。

## 测试策略

### 1. 测试金字塔

```
        /\
       /E2E\        (少量 - 关键业务流程)
      /------\
     /集成测试\    (中量 - API端点)
    /----------\
   /单元测试    \  (大量 - 业务逻辑)
  /------------\
```

### 2. 测试技术栈

| 层级 | 工具 | 用途 |
|------|------|------|
| 单元测试 | Jest + @nestjs/testing | Service层业务逻辑 |
| 集成测试 | Jest + supertest | Controller层API端点 |
| E2E测试 | Jest + supertest | 完整业务流程 |

### 3. 测试覆盖目标

| 模块 | 单元测试 | 集成测试 | E2E测试 |
|------|---------|---------|---------|
| 认证模块 | 70% | 100% | ✓ |
| 用户模块 | 70% | 100% | ✓ |
| 商品模块 | 70% | 100% | ✓ |
| 订单模块 | 80% | 100% | ✓ |
| 請求書模块 | 80% | 100% | ✓ |

## 模块设计

### 1. 测试目录结构

```
backend/
├── test/
│   ├── unit/                 # 单元测试
│   │   ├── auth/
│   │   ├── users/
│   │   ├── products/
│   │   ├── orders/
│   │   └── invoices/
│   ├── integration/          # 集成测试
│   │   ├── auth.controller.spec.ts
│   │   ├── users.controller.spec.ts
│   │   └── ...
│   └── e2e/                  # E2E测试
│       ├── auth.spec.ts
│       ├── order-flow.spec.ts
│       └── invoice-flow.spec.ts
├── jest.config.js
├── jest-e2e.json
└── setup-jest.ts
```

### 2. 测试夹具 (Fixtures)

```typescript
// test/fixtures/index.ts
- createTestStaff()
- createTestCustomer()
- createTestProduct()
- createTestOrder()
- createTestInvoice()
- mockJwtAuth()
```

### 3. 公共测试工具

```typescript
// test/utils/index.ts
- clearDatabase()
- loginAndGetToken()
- createTestData()
```

## 核心测试用例

### 1. 认证模块

**单元测试:**
- 用户名密码验证
- JWT令牌生成与验证
- 角色权限检查

**集成测试:**
- 员工登录成功/失败
- 客户登录成功/失败
- 令牌刷新
- 权限验证

**E2E测试:**
- 完整登录流程

### 2. 订单模块

**单元测试:**
- 订单创建（含VIP折扣计算）
- 订单状态转换
- 金额计算（消费税）

**集成测试:**
- 创建订单
- 确认订单
- 完成订单
- 取消订单
- 订单列表查询

**E2E测试:**
- 客户下单 → 销售确认 → 完成流程

### 3. 請求書模块

**单元测试:**
- 請求書生成
- PDF生成
- 金额汇总计算

**集成测试:**
- 生成請求書
- 下载PDF
- 标记付款

**E2E测试:**
- 订单 → 請求書 → PDF → 付款流程

## 测试数据管理

### 1. 测试数据库

```typescript
// 使用独立测试数据库
process.env.DB_DATABASE = 'japan_purchase_sales_test'
```

### 2. 测试夹具工厂

每个实体有对应的工厂函数，支持自定义属性和关联关系。

## 验收标准

1. 核心Service单元测试覆盖率 > 70%
2. 所有API端点有集成测试
3. 关键业务流程有E2E测试
4. 测试可以独立运行: `npm run test`
5. E2E测试可独立运行: `npm run test:e2e`
6. CI/CD集成测试通过

## 实现计划

1. 配置Jest测试环境
2. 创建测试工具和夹具
3. 为认证模块编写测试
4. 为核心业务模块编写测试
5. 添加E2E测试
6. 配置CI/CD测试运行
