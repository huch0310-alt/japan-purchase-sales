# 日本采销管理系统 - 测试指南

## 📋 目录

1. [测试概述](#测试概述)
2. [测试环境配置](#测试环境配置)
3. [测试结构](#测试结构)
4. [运行测试](#运行测试)
5. [编写测试](#编写测试)
6. [测试最佳实践](#测试最佳实践)
7. [常见问题](#常见问题)

## 测试概述

### 测试类型

本项目包含以下类型的测试：

- **单元测试（Unit Tests）**: 测试单个函数、方法或类的行为
- **E2E测试（End-to-End Tests）**: 测试完整的API端点和业务流程
- **集成测试（Integration Tests）**: 测试多个模块之间的交互

### 测试覆盖率目标

- 总体覆盖率: **> 60%**
- 核心业务逻辑覆盖率: **> 80%**
- API端点覆盖率: **> 70%**

## 测试环境配置

### 1. 环境变量配置

创建 `.env.test` 文件：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=japan_purchase_sales_test

# JWT配置
JWT_SECRET=test-jwt-secret-key
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=test
PORT=3001
```

### 2. 创建测试数据库

```bash
# 连接到PostgreSQL
psql -U postgres

# 创建测试数据库
CREATE DATABASE japan_purchase_sales_test;

# 退出
\q
```

### 3. 安装依赖

```bash
npm install
```

## 测试结构

```
backend/test/
├── e2e/                          # E2E测试
│   ├── auth.e2e-spec.ts         # 认证模块测试
│   ├── products.e2e-spec.ts     # 商品管理测试
│   ├── orders.e2e-spec.ts       # 订单管理测试
│   ├── customers.e2e-spec.ts    # 客户管理测试
│   └── app.e2e-spec.ts          # 应用集成测试
├── unit/                         # 单元测试
│   ├── auth/                    # 认证模块单元测试
│   ├── products/                # 商品模块单元测试
│   ├── orders/                  # 订单模块单元测试
│   └── users/                   # 用户模块单元测试
├── integration/                  # 集成测试
│   └── auth.controller.spec.ts  # 认证控制器集成测试
├── fixtures/                     # 测试数据工厂
│   └── index.ts                 # 测试数据生成函数
├── utils/                        # 测试工具函数
├── jest-global-mocks.ts          # Jest全局模拟
├── setup.ts                      # 测试环境设置
├── global-setup.ts               # 全局设置
├── global-teardown.ts            # 全局清理
└── jest-e2e.json                 # E2E测试配置
```

## 运行测试

### 运行所有测试

```bash
# 运行单元测试
npm test

# 运行E2E测试
npm run test:e2e

# 运行所有测试（单元+E2E）
npm test && npm run test:e2e
```

### 运行特定测试

```bash
# 运行特定文件的测试
npm test -- products.service.spec.ts

# 运行特定测试套件
npm test -- --testNamePattern="ProductsService"

# 运行E2E测试中的特定文件
npm run test:e2e -- auth.e2e-spec.ts
```

### 生成测试覆盖率报告

```bash
# 单元测试覆盖率
npm run test:cov

# E2E测试覆盖率
npm run test:e2e:cov

# 查看覆盖率报告
open coverage/lcov-report/index.html
```

### 监听模式

```bash
# 监听文件变化，自动运行测试
npm run test:watch
```

## 编写测试

### 单元测试示例

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(getRepositoryToken(Product));
  });

  describe('findAll', () => {
    it('应该返回所有商品', async () => {
      const products = [{ id: '1', name: '商品1' }];
      repository.find.mockResolvedValue(products);

      const result = await service.findAll();

      expect(result).toEqual(products);
      expect(repository.find).toHaveBeenCalled();
    });
  });
});
```

### E2E测试示例

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (GET)', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200);
  });
});
```

### 使用测试数据工厂

```typescript
import { createTestProduct, createTestCustomer } from '../fixtures';

describe('订单测试', () => {
  it('应该创建订单', async () => {
    const product = createTestProduct({ 
      name: '测试商品',
      salePrice: 1000 
    });
    const customer = createTestCustomer({ 
      companyName: '测试公司' 
    });
    
    // 使用测试数据进行测试
  });
});
```

## 测试最佳实践

### 1. 测试命名

```typescript
// ✅ 好的命名
it('应该返回404当商品不存在', async () => {
  // ...
});

// ❌ 不好的命名
it('test1', async () => {
  // ...
});
```

### 2. 测试隔离

```typescript
// ✅ 每个测试独立
beforeEach(async () => {
  // 重置测试数据
  await database.clean();
});

it('测试1', async () => {
  // 独立的测试环境
});

it('测试2', async () => {
  // 独立的测试环境
});
```

### 3. 清理测试数据

```typescript
afterAll(async () => {
  // 清理测试数据
  await productRepository.delete({ name: Like('测试%') });
  await userRepository.delete({ username: Like('test-%') });
  await app.close();
});
```

### 4. 使用Mock避免外部依赖

```typescript
// ✅ 使用Mock
const mockEmailService = {
  sendEmail: jest.fn(),
};

const module = await Test.createTestingModule({
  providers: [
    UserService,
    { provide: EmailService, useValue: mockEmailService },
  ],
}).compile();
```

### 5. 测试边界条件

```typescript
describe('商品数量验证', () => {
  it('应该接受有效的数量', async () => {
    await service.updateQuantity('product-id', 100);
  });

  it('应该拒绝负数数量', async () => {
    await expect(
      service.updateQuantity('product-id', -1)
    ).rejects.toThrow('数量不能为负数');
  });

  it('应该拒绝零数量', async () => {
    await expect(
      service.updateQuantity('product-id', 0)
    ).rejects.toThrow('数量必须大于0');
  });
});
```

### 6. 测试错误处理

```typescript
it('应该正确处理数据库错误', async () => {
  repository.save.mockRejectedValue(new Error('数据库连接失败'));

  await expect(service.create(productData)).rejects.toThrow('数据库连接失败');
});
```

## 常见问题

### Q1: 测试数据库连接失败

**问题**: `Connection refused` 或 `数据库不存在`

**解决方案**:
```bash
# 1. 确认PostgreSQL正在运行
sudo systemctl status postgresql

# 2. 创建测试数据库
createdb japan_purchase_sales_test

# 3. 检查.env.test配置
cat .env.test
```

### Q2: 测试运行缓慢

**问题**: E2E测试运行时间过长

**解决方案**:
```typescript
// 1. 减少beforeAll中的数据准备
beforeAll(async () => {
  // 只创建必要的数据
});

// 2. 使用事务回滚
afterEach(async () => {
  await queryRunner.rollbackTransaction();
});

// 3. 并行运行测试
// jest-e2e.json
{
  "maxWorkers": 4
}
```

### Q3: 测试数据污染

**问题**: 测试之间相互影响

**解决方案**:
```typescript
// 1. 每个测试使用唯一的数据
const uniqueId = Date.now();
const username = `test-user-${uniqueId}`;

// 2. 清理测试数据
afterAll(async () => {
  await repository.delete({ username: Like('test-%') });
});

// 3. 使用事务
beforeEach(async () => {
  queryRunner = dataSource.createQueryRunner();
  await queryRunner.startTransaction();
});

afterEach(async () => {
  await queryRunner.rollbackTransaction();
  await queryRunner.release();
});
```

### Q4: Mock不生效

**问题**: Mock的函数没有被调用

**解决方案**:
```typescript
// 1. 确保正确注入Mock
const module = await Test.createTestingModule({
  providers: [
    Service,
    {
      provide: Repository,
      useValue: mockRepository, // 使用useValue而不是useClass
    },
  ],
}).compile();

// 2. 重置Mock
beforeEach(() => {
  jest.clearAllMocks();
});

// 3. 检查Mock调用
expect(mockRepository.find).toHaveBeenCalled();
```

### Q5: JWT Token过期

**问题**: E2E测试中Token过期

**解决方案**:
```typescript
// 在.env.test中设置较长的过期时间
JWT_EXPIRES_IN=30d

// 或者在每个测试中重新登录
beforeEach(async () => {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ username, password });
  token = response.body.access_token;
});
```

## 测试命令速查表

| 命令 | 说明 |
|------|------|
| `npm test` | 运行所有单元测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run test:cov` | 生成测试覆盖率报告 |
| `npm run test:e2e` | 运行E2E测试 |
| `npm run test:e2e:cov` | E2E测试覆盖率 |
| `npm test -- --verbose` | 详细输出模式 |
| `npm test -- --detectOpenHandles` | 检测未关闭的句柄 |

## 相关文档

- [Jest官方文档](https://jestjs.io/)
- [NestJS测试文档](https://docs.nestjs.com/fundamentals/testing)
- [Supertest文档](https://github.com/visionmedia/supertest)

## 联系方式

如有问题，请联系开发团队或提交Issue。
