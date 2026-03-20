# 日本采销管理系统 - 测试套件实施计划

## 目标
为日本采销管理系统构建完整的测试套件，确保代码质量和功能正确性。

## 步骤

### 步骤1: 配置Jest测试环境
- [ ] 1.1 创建 `backend/jest.config.js` 配置文件
- [ ] 1.2 创建 `backend/jest-e2e.json` E2E配置文件
- [ ] 1.3 创建 `backend/test/setup.ts` 测试初始化文件
- [ ] 1.4 更新 `backend/package.json` 添加测试脚本
- [ ] 1.5 创建 `backend/test/jest-global-mocks.ts` 全局mock

### 步骤2: 创建测试工具和夹具
- [ ] 2.1 创建 `backend/test/fixtures/index.ts` 测试夹具
- [ ] 2.2 创建 `backend/test/utils/index.ts` 测试工具函数
- [ ] 2.3 创建 `backend/test/factories/` 工厂函数目录

### 步骤3: 认证模块测试
- [ ] 3.1 编写 AuthService 单元测试
- [ ] 3.2 编写 JwtStrategy 单元测试
- [ ] 3.3 编写 LocalStrategy 单元测试
- [ ] 3.4 编写 AuthController 集成测试

### 步骤4: 用户模块测试
- [ ] 4.1 编写 StaffService 单元测试
- [ ] 4.2 编写 CustomerService 单元测试
- [ ] 4.3 编写 StaffController 集成测试
- [ ] 4.4 编写 CustomerController 集成测试

### 步骤5: 商品模块测试
- [ ] 5.1 编写 ProductsService 单元测试
- [ ] 5.2 编写 ProductsController 集成测试

### 步骤6: 订单模块测试
- [ ] 6.1 编写 OrdersService 单元测试（含金额计算）
- [ ] 6.2 编写 OrdersController 集成测试

### 步骤7: 請求書模块测试
- [ ] 7.1 编写 InvoicesService 单元测试
- [ ] 7.2 编写 InvoicesController 集成测试

### 步骤8: E2E测试
- [ ] 8.1 编写登录流程E2E测试
- [ ] 8.2 编写订单业务流程E2E测试
- [ ] 8.3 编写請求書生成流程E2E测试

### 步骤9: CI/CD集成
- [ ] 9.1 添加GitHub Actions测试工作流
- [ ] 9.2 配置测试覆盖率报告

## 验证方式
- 运行 `npm run test` 验证单元测试和集成测试
- 运行 `npm run test:e2e` 验证E2E测试
- 检查测试覆盖率报告
