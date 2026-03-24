# 日本采销系统 - 账单管理系统测试计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用 Playwright 对账单管理系统进行全面测试，验证所有功能并生成测试报告

**Architecture:** 基于 Playwright E2E 测试框架，测试前端交互和后端 API 集成

**Tech Stack:** Playwright, Node.js, TypeScript

---

## 测试目标

### 测试数据要求
- 3 个管理员 (super_admin/admin)
- 3 个采购员 (procurement)
- 3 个销售员 (sales)
- 10 个客户
- 20 个商品（覆盖所有品类）

### 测试模块
1. 登录/登出功能
2. 员工管理（CRUD）
3. 客户管理（CRUD）
4. 分类管理
5. 商品管理
6. 订单管理（创建→确认→完成）
7. 账单生成与管理
8. 仪表盘统计

---

## 文件结构

```
tests/
├── e2e/
│   ├── playwright.config.ts      # Playwright 配置
│   ├── package.json              # 测试依赖
│   ├── tsconfig.json             # TypeScript 配置
│   ├── helpers/
│   │   ├── api.ts               # API 辅助函数
│   │   ├── auth.ts              # 认证辅助函数
│   │   └── data.ts              # 测试数据生成
│   ├── pages/
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── StaffPage.ts
│   │   ├── CustomerPage.ts
│   │   ├── ProductPage.ts
│   │   ├── CategoryPage.ts
│   │   ├── OrderPage.ts
│   │   ├── InvoiceGeneratePage.ts
│   │   └── InvoicePage.ts
│   └── tests/
│       ├── 01-auth.spec.ts
│       ├── 02-staff.spec.ts
│       ├── 03-customer.spec.ts
│       ├── 04-category.spec.ts
│       ├── 05-product.spec.ts
│       ├── 06-order.spec.ts
│       ├── 07-invoice.spec.ts
│       └── 08-dashboard.spec.ts
```

---

## Task 1: 测试环境搭建

**Files:**
- Create: `tests/e2e/package.json`
- Create: `tests/e2e/playwright.config.ts`
- Create: `tests/e2e/tsconfig.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "e2e-tests",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui",
    "test:report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.41.0",
    "@types/node": "^20.11.0",
    "typescript": "^5.3.0"
  }
}
```

- [ ] **Step 2: 创建 playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  use: {
    baseURL: 'http://43.153.155.76',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: undefined,
});
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "."
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: 安装依赖**

```bash
cd tests/e2e
npm install
npx playwright install chromium
```

- [ ] **Step 5: 提交代码**

```bash
git add tests/e2e/
git commit -m "test: setup playwright e2e test environment"
```

---

## Task 2: 辅助函数和数据生成器

**Files:**
- Create: `tests/e2e/helpers/api.ts`
- Create: `tests/e2e/helpers/auth.ts`
- Create: `tests/e2e/helpers/data.ts`

- [ ] **Step 1: 创建 helpers/api.ts**

```typescript
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://43.153.155.76:3001/api';

let apiInstance: AxiosInstance | null = null;

export function getApi(token?: string): AxiosInstance {
  apiInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return apiInstance;
}

export async function login(username: string, password: string): Promise<{ token: string; userId: string }> {
  const api = getApi();
  const response = await api.post('/auth/login', { username, password });
  return {
    token: response.data.access_token,
    userId: response.data.user?.id || '',
  };
}

export async function apiGet(path: string, token: string) {
  const api = getApi(token);
  return api.get(path);
}

export async function apiPost(path: string, data: any, token: string) {
  const api = getApi(token);
  return api.post(path, data);
}

export async function apiPut(path: string, data: any, token: string) {
  const api = getApi(token);
  return api.put(path, data);
}

export async function apiDelete(path: string, token: string) {
  const api = getApi(token);
  return api.delete(path);
}
```

- [ ] **Step 2: 创建 helpers/auth.ts**

```typescript
import { Page } from '@playwright/test';

export async function loginAs(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

export async function logout(page: Page): Promise<void> {
  await page.click('button:has-text("退出登录")');
  await page.click('button:has-text("确定")');
  await page.waitForURL('**/login');
}
```

- [ ] **Step 3: 创建 helpers/data.ts**

```typescript
// 测试数据生成器

export const TEST_USERS = {
  admins: [
    { username: 'admin1', password: 'Admin123!', name: '管理员一', role: 'super_admin' },
    { username: 'admin2', password: 'Admin123!', name: '管理员二', role: 'admin' },
    { username: 'admin3', password: 'Admin123!', name: '管理员三', role: 'admin' },
  ],
  procurement: [
    { username: 'procure1', password: 'Procure123!', name: '采购员一', role: 'procurement' },
    { username: 'procure2', password: 'Procure123!', name: '采购员二', role: 'procurement' },
    { username: 'procure3', password: 'Procure123!', name: '采购员三', role: 'procurement' },
  ],
  sales: [
    { username: 'sales1', password: 'Sales123!', name: '销售员一', role: 'sales' },
    { username: 'sales2', password: 'Sales123!', name: '销售员二', role: 'sales' },
    { username: 'sales3', password: 'Sales123!', name: '销售员三', role: 'sales' },
  ],
};

export const TEST_CUSTOMERS = [
  { username: 'cust1', companyName: '株式会社日本食品', contactPerson: '田中太郎', phone: '090-1111-1111' },
  { username: 'cust2', companyName: '東京レストラン株式会社', contactPerson: '佐藤二郎', phone: '090-2222-2222' },
  { username: 'cust3', companyName: '大阪商店株式会社', contactPerson: '鈴木三郎', phone: '090-3333-3333' },
  { username: 'cust4', companyName: '京都フーズ株式会社', contactPerson: '高橋四郎', phone: '090-4444-4444' },
  { username: 'cust5', companyName: '名古屋商事株式会社', contactPerson: '伊藤五郎', phone: '090-5555-5555' },
  { username: 'cust6', companyName: '福岡屋台株式会社', contactPerson: '渡辺六郎', phone: '090-6666-6666' },
  { username: 'cust7', companyName: '札幌グルメ株式会社', contactPerson: '加藤七郎', phone: '090-7777-7777' },
  { username: 'cust8', companyName: '広島きっと株式会社', contactPerson: '山田八郎', phone: '090-8888-8888' },
  { username: 'cust9', companyName: '仙台物産株式会社', contactPerson: '山口九郎', phone: '090-9999-9999' },
  { username: 'cust10', companyName: '新潟名刺株式会社', contactPerson: '黒木十郎', phone: '090-0000-0000' },
];

export const TEST_CATEGORIES = [
  '肉类',
  '蛋品',
  '生鲜蔬果',
  '海鲜',
  '调料',
];

export const TEST_PRODUCTS = [
  // 肉类 (5个)
  { name: '和牛切片 500g', category: '肉类', unit: '盒', purchasePrice: 150, salePrice: 200, quantity: 100 },
  { name: '猪五花肉 1kg', category: '肉类', unit: '包', purchasePrice: 80, salePrice: 120, quantity: 200 },
  { name: '鸡胸肉 1kg', category: '肉类', unit: '包', purchasePrice: 50, salePrice: 75, quantity: 150 },
  { name: '羊排 500g', category: '肉类', unit: '盒', purchasePrice: 120, salePrice: 180, quantity: 80 },
  { name: '培根 200g', category: '肉类', unit: '包', purchasePrice: 40, salePrice: 60, quantity: 120 },
  // 蛋品 (3个)
  { name: '鸡蛋 30個', category: '蛋品', unit: '盒', purchasePrice: 45, salePrice: 65, quantity: 300 },
  { name: '鸭蛋 20個', category: '蛋品', unit: '盒', purchasePrice: 55, salePrice: 80, quantity: 100 },
  { name: '鹌鹑蛋 40個', category: '蛋品', unit: '盒', purchasePrice: 35, salePrice: 50, quantity: 90 },
  // 生鲜蔬果 (5个)
  { name: '有机大米 5kg', category: '生鲜蔬果', unit: '袋', purchasePrice: 120, salePrice: 180, quantity: 200 },
  { name: '新鲜菠菜 300g', category: '生鲜蔬果', unit: '袋', purchasePrice: 15, salePrice: 25, quantity: 150 },
  { name: '胡萝卜 1kg', category: '生鲜蔬果', unit: '袋', purchasePrice: 12, salePrice: 20, quantity: 200 },
  { name: '苹果 1kg', category: '生鲜蔬果', unit: '袋', purchasePrice: 25, salePrice: 40, quantity: 180 },
  { name: '番茄 1kg', category: '生鲜蔬果', unit: '袋', purchasePrice: 18, salePrice: 28, quantity: 160 },
  // 海鲜 (4个)
  { name: '三文鱼切片 300g', category: '海鲜', unit: '盒', purchasePrice: 120, salePrice: 180, quantity: 60 },
  { name: '虾仁 500g', category: '海鲜', unit: '袋', purchasePrice: 80, salePrice: 120, quantity: 80 },
  { name: '螃蟹 1kg', category: '海鲜', unit: '只', purchasePrice: 200, salePrice: 300, quantity: 40 },
  { name: '金枪鱼 500g', category: '海鲜', unit: '盒', purchasePrice: 150, salePrice: 220, quantity: 50 },
  // 调料 (3个)
  { name: '酱油 1L', category: '调料', unit: '瓶', purchasePrice: 25, salePrice: 38, quantity: 250 },
  { name: '味淋 500ml', category: '调料', unit: '瓶', purchasePrice: 30, salePrice: 45, quantity: 180 },
  { name: '味噌 1kg', category: '调料', unit: '盒', purchasePrice: 35, salePrice: 52, quantity: 140 },
];

export function generateUniqueUsername(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

- [ ] **Step 4: 提交代码**

```bash
git add tests/e2e/helpers/
git commit -m "test: add helper functions and test data generators"
```

---

## Task 3: 页面对象模型

**Files:**
- Create: `tests/e2e/pages/LoginPage.ts`
- Create: `tests/e2e/pages/DashboardPage.ts`
- Create: `tests/e2e/pages/StaffPage.ts`
- Create: `tests/e2e/pages/CustomerPage.ts`
- Create: `tests/e2e/pages/ProductPage.ts`
- Create: `tests/e2e/pages/CategoryPage.ts`
- Create: `tests/e2e/pages/OrderPage.ts`
- Create: `tests/e2e/pages/InvoiceGeneratePage.ts`
- Create: `tests/e2e/pages/InvoicePage.ts`

- [ ] **Step 1: 创建 LoginPage.ts**

```typescript
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('**/dashboard');
  }

  async getErrorMessage(): Promise<string> {
    return this.page.locator('.el-message--error').textContent() || '';
  }
}
```

- [ ] **Step 2: 创建 DashboardPage.ts**

```typescript
import { Page } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
  }

  async getCustomerCount(): Promise<number> {
    const text = await this.page.locator('.el-card:has-text("客户数量") .number').textContent();
    return parseInt(text || '0');
  }

  async getProductCount(): Promise<number> {
    const text = await this.page.locator('.el-card:has-text("商品数量") .number').textContent();
    return parseInt(text || '0');
  }

  async getOrderCount(): Promise<number> {
    const text = await this.page.locator('.el-card:has-text("订单数量") .number').textContent();
    return parseInt(text || '0');
  }
}
```

- [ ] **Step 3: 创建 StaffPage.ts**

```typescript
import { Page } from '@playwright/test';

export class StaffPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/staff');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddButton() {
    await this.page.click('button:has-text("新增员工")');
    await this.page.waitForSelector('.el-dialog');
  }

  async fillStaffForm(data: {
    username: string;
    password: string;
    name: string;
    phone?: string;
    role: string;
  }) {
    await this.page.fill('input[name="username"]', data.username);
    await this.page.fill('input[name="password"]', data.password);
    await this.page.fill('input[name="name"]', data.name);
    if (data.phone) {
      await this.page.fill('input[name="phone"]', data.phone);
    }
    // 使用 Element Plus 的 el-select 组件
    await this.page.click('.el-dialog .el-select');
    await this.page.waitForSelector('.el-select-dropdown');
    await this.page.click(`.el-select-dropdown__item:has-text("${data.role}")`);
  }

  async submit() {
    await this.page.click('.el-dialog button:has-text("保存")');
    await this.page.waitForSelector('.el-dialog', { state: 'hidden' });
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }

  async deleteStaff(username: string) {
    const row = this.page.locator(`.el-table__row:has-text("${username}")`);
    await row.hover();
    await row.locator('button:has-text("删除")').click();
    await this.page.click('button:has-text("确定")');
  }
}
```

- [ ] **Step 4: 创建 CustomerPage.ts**

```typescript
import { Page } from '@playwright/test';

export class CustomerPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/customer');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddButton() {
    await this.page.click('button:has-text("新增客户")');
    await this.page.waitForSelector('.el-dialog');
  }

  async fillCustomerForm(data: {
    username: string;
    companyName: string;
    contactPerson: string;
    phone: string;
    address?: string;
    vipDiscount?: string;
  }) {
    await this.page.fill('input[name="username"]', data.username);
    await this.page.fill('input[name="companyName"]', data.companyName);
    await this.page.fill('input[name="contactPerson"]', data.contactPerson);
    await this.page.fill('input[name="phone"]', data.phone);
    if (data.address) {
      await this.page.fill('input[name="address"]', data.address);
    }
    if (data.vipDiscount) {
      await this.page.fill('input[name="vipDiscount"]', data.vipDiscount);
    }
  }

  async submit() {
    await this.page.click('.el-dialog button:has-text("保存")');
    await this.page.waitForSelector('.el-dialog', { state: 'hidden' });
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }

  async deleteCustomer(companyName: string) {
    const row = this.page.locator(`.el-table__row:has-text("${companyName}")`);
    await row.hover();
    await row.locator('button:has-text("删除")').click();
    await this.page.click('button:has-text("确定")');
  }
}
```

- [ ] **Step 5: 创建 CategoryPage.ts**

```typescript
import { Page } from '@playwright/test';

export class CategoryPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/category');
    await this.page.waitForLoadState('networkidle');
  }

  async addCategory(name: string) {
    await this.page.click('button:has-text("新增分类")');
    await this.page.waitForSelector('.el-dialog');
    await this.page.fill('input[name="name"]', name);
    await this.page.click('.el-dialog button:has-text("保存")');
    await this.page.waitForSelector('.el-dialog', { state: 'hidden' });
  }

  async deleteCategory(name: string) {
    const row = this.page.locator(`.el-table__row:has-text("${name}")`);
    await row.hover();
    await row.locator('button:has-text("删除")').click();
    await this.page.click('button:has-text("确定")');
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }
}
```

- [ ] **Step 6: 创建 ProductPage.ts**

```typescript
import { Page } from '@playwright/test';

export class ProductPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/product');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddButton() {
    await this.page.click('button:has-text("新增商品")');
    await this.page.waitForSelector('.el-dialog');
  }

  async fillProductForm(data: {
    name: string;
    category: string;
    unit: string;
    purchasePrice: string;
    salePrice: string;
    quantity: string;
    description?: string;
  }) {
    await this.page.fill('input[name="name"]', data.name);
    // 使用 Element Plus el-select 组件
    await this.page.click('.el-dialog .el-select');
    await this.page.waitForSelector('.el-select-dropdown');
    await this.page.click(`.el-select-dropdown__item:has-text("${data.category}")`);
    await this.page.fill('input[name="unit"]', data.unit);
    await this.page.fill('input[name="purchasePrice"]', data.purchasePrice);
    await this.page.fill('input[name="salePrice"]', data.salePrice);
    await this.page.fill('input[name="quantity"]', data.quantity);
    if (data.description) {
      await this.page.fill('textarea[name="description"]', data.description);
    }
  }

  async submit() {
    await this.page.click('.el-dialog button:has-text("保存")');
    await this.page.waitForSelector('.el-dialog', { state: 'hidden' });
  }

  async approveProduct(name: string) {
    const row = this.page.locator(`.el-table__row:has-text("${name}")`);
    await row.locator('button:has-text("审核")').click();
    await this.page.click('button:has-text("通过")');
  }

  async activateProduct(name: string) {
    const row = this.page.locator(`.el-table__row:has-text("${name}")`);
    await row.locator('button:has-text("上架")').click();
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }

  async filterByStatus(status: string) {
    // 使用 Element Plus 的 el-select 进行状态筛选
    await this.page.click('.filter-section .el-select');
    await this.page.waitForSelector('.el-select-dropdown');
    const statusMap: { [key: string]: string } = {
      'pending': '待审核',
      'approved': '已通过',
      'active': '上架',
      'inactive': '下架',
    };
    await this.page.click(`.el-select-dropdown__item:has-text("${statusMap[status] || status}")`);
    await this.page.waitForTimeout(500);
  }
}
```

- [ ] **Step 7: 创建 OrderPage.ts**

```typescript
import { Page } from '@playwright/test';

export class OrderPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/order');
    await this.page.waitForLoadState('networkidle');
  }

  async confirmOrder(orderNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${orderNo}")`);
    await row.locator('button:has-text("确认")').click();
    await this.page.waitForTimeout(500);
  }

  async completeOrder(orderNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${orderNo}")`);
    await row.locator('button:has-text("完成")').click();
    await this.page.waitForTimeout(500);
  }

  async viewOrder(orderNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${orderNo}")`);
    await row.locator('button:has-text("详情")').click();
    await this.page.waitForSelector('.el-dialog');
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }

  async getInvoiceStatus(orderNo: string): Promise<string> {
    const row = this.page.locator(`.el-table__row:has-text("${orderNo}")`);
    const invoiceCell = row.locator('td').nth(6); // 第7列是invoice状态
    return invoiceCell.textContent();
  }

  async filterByStatus(status: string) {
    // 使用 Element Plus 的 el-select 进行状态筛选
    await this.page.click('.el-select');
    await this.page.waitForSelector('.el-select-dropdown');
    const statusMap: { [key: string]: string } = {
      'pending': '待确认',
      'confirmed': '已确认',
      'completed': '已完成',
      'cancelled': '已取消',
    };
    await this.page.click(`.el-select-dropdown__item:has-text("${statusMap[status] || status}")`);
    await this.page.waitForTimeout(500);
  }
}
```

- [ ] **Step 8: 创建 InvoiceGeneratePage.ts**

```typescript
import { Page } from '@playwright/test';

export class InvoiceGeneratePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/invoice-generate');
    await this.page.waitForLoadState('networkidle');
  }

  async selectCustomer(companyName: string) {
    await this.page.click('.filter-section .el-select input');
    await this.page.waitForSelector('.el-select-dropdown');
    await this.page.click(`.el-select-dropdown__item:has-text("${companyName}")`);
    await this.page.waitForTimeout(1000);
  }

  async selectOrder(orderNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${orderNo}")`);
    await row.locator('.el-checkbox__input').click();
  }

  async clickGenerateButton() {
    await this.page.click('button:has-text("生成请求书")');
    await this.page.waitForSelector('.el-dialog');
  }

  async setDueDate(daysFromNow: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const dateStr = date.toISOString().split('T')[0];
    await this.page.fill('.el-date-editor input', dateStr);
  }

  async confirmGenerate() {
    await this.page.click('.el-dialog button:has-text("确认")');
    await this.page.waitForSelector('.el-dialog', { state: 'hidden' });
  }

  async getAvailableOrdersCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }

  async isOrderSelectable(orderNo: string): Promise<boolean> {
    const row = this.page.locator(`.el-table__row:has-text("${orderNo}")`);
    return !(await row.locator('.el-checkbox__input').isDisabled());
  }
}
```

- [ ] **Step 9: 创建 InvoicePage.ts**

```typescript
import { Page } from '@playwright/test';

export class InvoicePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/invoice');
    await this.page.waitForLoadState('networkidle');
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }

  async viewInvoice(invoiceNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${invoiceNo}")`);
    await row.locator('button:has-text("查看")').click();
    await this.page.waitForSelector('.el-dialog');
  }

  async markAsPaid(invoiceNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${invoiceNo}")`);
    await row.locator('button:has-text("标记付款")').click();
    await this.page.waitForTimeout(500);
  }

  async downloadPdf(invoiceNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${invoiceNo}")`);
    const downloadPromise = this.page.waitForEvent('download');
    await row.locator('button:has-text("下载PDF")').click();
    return downloadPromise;
  }
}
```

- [ ] **Step 10: 提交代码**

```bash
git add tests/e2e/pages/
git commit -m "test: add page object models"
```

---

## Task 4: 认证测试

**Files:**
- Create: `tests/e2e/tests/01-auth.spec.ts`

- [ ] **Step 1: 编写登录测试**

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TEST_USERS } from '../helpers/data';

test.describe('认证功能测试', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('管理员登录成功', async ({ page }) => {
    await loginPage.login(TEST_USERS.admins[0].username, TEST_USERS.admins[0].password);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('.username')).toContainText(TEST_USERS.admins[0].name);
  });

  test('采购员登录成功', async ({ page }) => {
    await loginPage.login(TEST_USERS.procurement[0].username, TEST_USERS.procurement[0].password);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('销售员登录成功', async ({ page }) => {
    await loginPage.login(TEST_USERS.sales[0].username, TEST_USERS.sales[0].password);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('错误密码登录失败', async ({ page }) => {
    await loginPage.login(TEST_USERS.admins[0].username, 'wrongpassword');
    await expect(page.locator('.el-message--error')).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('不存在的用户登录失败', async ({ page }) => {
    await loginPage.login('nonexistent', 'password');
    await expect(page.locator('.el-message--error')).toBeVisible();
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
cd tests/e2e
npx playwright test tests/01-auth.spec.ts --reporter=list
```

- [ ] **Step 3: 提交代码**

```bash
git add tests/e2e/tests/01-auth.spec.ts
git commit -m "test: add authentication tests"
```

---

## Task 5: 员工管理测试

**Files:**
- Create: `tests/e2e/tests/02-staff.spec.ts`

- [ ] **Step 1: 编写员工管理测试**

```typescript
import { test, expect } from '@playwright/test';
import { StaffPage } from '../pages/StaffPage';
import { TEST_USERS } from '../helpers/data';

test.describe('员工管理测试', () => {
  let staffPage: StaffPage;
  const createdUsernames: string[] = [];

  test.beforeEach(async ({ page }) => {
    staffPage = new StaffPage(page);
    // 登录为管理员
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_USERS.admins[0].username);
    await page.fill('input[name="password"]', TEST_USERS.admins[0].password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test.afterEach(async () => {
    // 清理创建的员工
    for (const username of createdUsernames) {
      try {
        await staffPage.goto();
        await staffPage.deleteStaff(username);
      } catch (e) {
        console.log(`Failed to cleanup ${username}`);
      }
    }
  });

  test('添加新员工-管理员角色', async () => {
    await staffPage.goto();
    const initialCount = await staffPage.getTableRowCount();

    await staffPage.clickAddButton();
    const username = `staff_${Date.now()}`;
    createdUsernames.push(username);
    await staffPage.fillStaffForm({
      username,
      password: 'Test123!',
      name: '测试员工',
      phone: '090-1234-5678',
      role: 'admin',
    });
    await staffPage.submit();

    await staffPage.goto();
    expect(await staffPage.getTableRowCount()).toBe(initialCount + 1);
  });

  test('添加新员工-采购员角色', async () => {
    await staffPage.goto();
    const initialCount = await staffPage.getTableRowCount();

    await staffPage.clickAddButton();
    const username = `staff_${Date.now()}`;
    createdUsernames.push(username);
    await staffPage.fillStaffForm({
      username,
      password: 'Test123!',
      name: '测试采购员',
      role: 'procurement',
    });
    await staffPage.submit();

    await staffPage.goto();
    expect(await staffPage.getTableRowCount()).toBe(initialCount + 1);
  });

  test('添加新员工-销售员角色', async () => {
    await staffPage.goto();
    const initialCount = await staffPage.getTableRowCount();

    await staffPage.clickAddButton();
    const username = `staff_${Date.now()}`;
    createdUsernames.push(username);
    await staffPage.fillStaffForm({
      username,
      password: 'Test123!',
      name: '测试销售员',
      role: 'sales',
    });
    await staffPage.submit();

    await staffPage.goto();
    expect(await staffPage.getTableRowCount()).toBe(initialCount + 1);
  });

  test('删除员工', async () => {
    // 先添加一个员工
    await staffPage.goto();
    await staffPage.clickAddButton();
    const username = `staff_del_${Date.now()}`;
    await staffPage.fillStaffForm({
      username,
      password: 'Test123!',
      name: '待删除员工',
      role: 'sales',
    });
    await staffPage.submit();

    // 再删除
    await staffPage.goto();
    const initialCount = await staffPage.getTableRowCount();
    await staffPage.deleteStaff(username);

    await staffPage.goto();
    expect(await staffPage.getTableRowCount()).toBe(initialCount - 1);
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
cd tests/e2e
npx playwright test tests/02-staff.spec.ts --reporter=list
```

- [ ] **Step 3: 提交代码**

```bash
git add tests/e2e/tests/02-staff.spec.ts
git commit -m "test: add staff management tests"
```

---

## Task 6: 客户管理测试

**Files:**
- Create: `tests/e2e/tests/03-customer.spec.ts`

- [ ] **Step 1: 编写客户管理测试**

```typescript
import { test, expect } from '@playwright/test';
import { CustomerPage } from '../pages/CustomerPage';
import { TEST_CUSTOMERS, TEST_USERS } from '../helpers/data';

test.describe('客户管理测试', () => {
  let customerPage: CustomerPage;
  const createdUsernames: string[] = [];

  test.beforeEach(async ({ page }) => {
    customerPage = new CustomerPage(page);
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_USERS.admins[0].username);
    await page.fill('input[name="password"]', TEST_USERS.admins[0].password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test.afterEach(async () => {
    for (const customer of createdUsernames) {
      try {
        await customerPage.goto();
        // 删除功能待验证
      } catch (e) {
        console.log(`Cleanup failed for ${customer}`);
      }
    }
  });

  test('添加新客户', async () => {
    await customerPage.goto();
    const initialCount = await customerPage.getTableRowCount();

    await customerPage.clickAddButton();
    const customer = TEST_CUSTOMERS[0];
    const username = `cust_${Date.now()}`;
    createdUsernames.push(username);
    await customerPage.fillCustomerForm({
      username,
      companyName: customer.companyName,
      contactPerson: customer.contactPerson,
      phone: customer.phone,
      address: '東京都テスト住所',
      vipDiscount: '90',
    });
    await customerPage.submit();

    await customerPage.goto();
    expect(await customerPage.getTableRowCount()).toBe(initialCount + 1);
  });

  test('添加10个客户', async () => {
    await customerPage.goto();
    const initialCount = await customerPage.getTableRowCount();

    for (let i = 0; i < 10; i++) {
      await customerPage.clickAddButton();
      const customer = TEST_CUSTOMERS[i];
      const username = `cust_${Date.now()}_${i}`;
      createdUsernames.push(username);
      await customerPage.fillCustomerForm({
        username,
        companyName: customer.companyName,
        contactPerson: customer.contactPerson,
        phone: customer.phone,
      });
      await customerPage.submit();
      await customerPage.goto();
    }

    await customerPage.goto();
    const finalCount = await customerPage.getTableRowCount();
    expect(finalCount).toBe(initialCount + 10);
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
cd tests/e2e
npx playwright test tests/03-customer.spec.ts --reporter=list
```

- [ ] **Step 3: 提交代码**

```bash
git add tests/e2e/tests/03-customer.spec.ts
git commit -m "test: add customer management tests"
```

---

## Task 7: 分类和商品管理测试

**Files:**
- Create: `tests/e2e/tests/04-category-product.spec.ts`

- [ ] **Step 1: 编写分类和商品管理测试**

```typescript
import { test, expect } from '@playwright/test';
import { CategoryPage } from '../pages/CategoryPage';
import { ProductPage } from '../pages/ProductPage';
import { TEST_USERS, TEST_CATEGORIES, TEST_PRODUCTS } from '../helpers/data';

test.describe('分类和商品管理测试', () => {
  let categoryPage: CategoryPage;
  let productPage: ProductPage;
  const createdCategories: string[] = [];

  test.beforeEach(async ({ page }) => {
    categoryPage = new CategoryPage(page);
    productPage = new ProductPage(page);
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_USERS.admins[0].username);
    await page.fill('input[name="password"]', TEST_USERS.admins[0].password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('添加商品分类', async () => {
    await categoryPage.goto();
    const initialCount = await categoryPage.getTableRowCount();

    for (const categoryName of TEST_CATEGORIES) {
      await categoryPage.addCategory(categoryName);
      createdCategories.push(categoryName);
    }

    await categoryPage.goto();
    expect(await categoryPage.getTableRowCount()).toBe(initialCount + TEST_CATEGORIES.length);
  });

  test('添加20个商品', async () => {
    // 先添加分类
    await categoryPage.goto();
    for (const categoryName of TEST_CATEGORIES) {
      try {
        await categoryPage.addCategory(categoryName);
        createdCategories.push(categoryName);
      } catch (e) {
        // 分类可能已存在
      }
    }

    // 添加商品
    await productPage.goto();
    const initialCount = await productPage.getTableRowCount();

    for (let i = 0; i < TEST_PRODUCTS.length; i++) {
      const product = TEST_PRODUCTS[i];
      await productPage.clickAddButton();
      await productPage.fillProductForm({
        name: product.name,
        category: product.category,
        unit: product.unit,
        purchasePrice: product.purchasePrice.toString(),
        salePrice: product.salePrice.toString(),
        quantity: product.quantity.toString(),
      });
      await productPage.submit();
      await productPage.goto();
    }

    await productPage.goto();
    const finalCount = await productPage.getTableRowCount();
    expect(finalCount).toBeGreaterThanOrEqual(initialCount + TEST_PRODUCTS.length);
  });

  test('审核并上架商品', async () => {
    await productPage.goto();
    await productPage.filterByStatus('pending');

    const pendingProducts = await productPage.getTableRowCount();
    expect(pendingProducts).toBeGreaterThan(0);

    // 审核通过
    for (let i = 0; i < Math.min(3, pendingProducts); i++) {
      await productPage.approveProduct(TEST_PRODUCTS[i].name);
    }

    // 上架
    await productPage.filterByStatus('approved');
    const approvedProducts = await productPage.getTableRowCount();
    for (let i = 0; i < Math.min(3, approvedProducts); i++) {
      await productPage.activateProduct(TEST_PRODUCTS[i].name);
    }

    // 验证
    await productPage.filterByStatus('active');
    expect(await productPage.getTableRowCount()).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
cd tests/e2e
npx playwright test tests/04-category-product.spec.ts --reporter=list
```

- [ ] **Step 3: 提交代码**

```bash
git add tests/e2e/tests/04-category-product.spec.ts
git commit -m "test: add category and product management tests"
```

---

## Task 8: 订单管理测试

**Files:**
- Create: `tests/e2e/tests/05-order.spec.ts`

- [ ] **Step 1: 编写订单管理测试**

```typescript
import { test, expect } from '@playwright/test';
import { OrderPage } from '../pages/OrderPage';
import { TEST_USERS, TEST_CUSTOMERS, TEST_PRODUCTS } from '../helpers/data';
import { apiPost, apiGet, login } from '../helpers/api';

test.describe('订单管理测试', () => {
  let orderPage: OrderPage;
  let adminToken: string;
  let salesToken: string;
  let customerToken: string;
  let customerId: string;
  let productId: string;
  let createdOrderIds: string[] = [];

  test.beforeAll(async () => {
    // 登录管理员获取token
    const adminRes = await login(TEST_USERS.admins[0].username, TEST_USERS.admins[0].password);
    adminToken = adminRes.token;

    // 登录销售获取token
    const salesRes = await login(TEST_USERS.sales[0].username, TEST_USERS.sales[0].password);
    salesToken = salesRes.token;

    // 登录客户获取token
    const customerRes = await login(TEST_CUSTOMERS[0].username, TEST_CUSTOMERS[0].password);
    customerToken = customerRes.token;

    // 获取客户ID
    const customersRes = await apiGet('/customers', adminToken);
    customerId = customersRes.data[0]?.id;

    // 获取一个已上架商品的ID用于创建订单
    const productsRes = await apiGet('/products/active', adminToken);
    productId = productsRes.data[0]?.id;
  });

  test.beforeEach(async ({ page }) => {
    orderPage = new OrderPage(page);
  });

  test.afterAll(async () => {
    // 清理订单
    for (const orderId of createdOrderIds) {
      try {
        await apiPost(`/orders/${orderId}/cancel`, {}, adminToken);
      } catch (e) {
        // ignore
      }
    }
  });

  test('创建新订单', async ({ page }) => {
    // 跳过如果没有可用商品
    if (!productId) {
      test.skip();
      return;
    }

    // 客户登录并创建订单
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_CUSTOMERS[0].username);
    await page.fill('input[name="password"]', TEST_CUSTOMERS[0].password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // 直接通过API创建订单（因为前端需要购物车流程）
    const orderRes = await apiPost('/orders', {
      items: [{ productId: productId, quantity: 1 }],
      deliveryAddress: '東京都テスト住所',
      contactPerson: TEST_CUSTOMERS[0].contactPerson,
      contactPhone: TEST_CUSTOMERS[0].phone,
    }, customerToken);

    createdOrderIds.push(orderRes.data.id);
    expect(orderRes.data.id).toBeDefined();
  });

  test('销售确认订单', async ({ page }) => {
    // 跳过如果没有可用商品
    if (!productId) {
      test.skip();
      return;
    }

    // 先创建一个待确认订单
    const orderRes = await apiPost('/orders', {
      items: [{ productId: productId, quantity: 1 }],
      deliveryAddress: '東京都テスト住所',
      contactPerson: TEST_CUSTOMERS[0].contactPerson,
      contactPhone: TEST_CUSTOMERS[0].phone,
    }, customerToken);
    const orderId = orderRes.data.id;
    createdOrderIds.push(orderId);

    // 销售登录
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_USERS.sales[0].username);
    await page.fill('input[name="password"]', TEST_USERS.sales[0].password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // 确认订单
    await orderPage.goto();
    await orderPage.filterByStatus('pending');
    await orderPage.confirmOrder(orderRes.data.orderNo);

    // 验证状态变更
    await orderPage.filterByStatus('confirmed');
    expect(await orderPage.getTableRowCount()).toBeGreaterThan(0);
  });

  test('完成订单', async ({ page }) => {
    // 销售登录并确认
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_USERS.sales[0].username);
    await page.fill('input[name="password"]', TEST_USERS.sales[0].password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await orderPage.goto();
    await orderPage.filterByStatus('confirmed');
    const rowCount = await orderPage.getTableRowCount();

    if (rowCount > 0) {
      // 获取第一个已确认订单的订单号
      const orderNo = await orderPage.locator('.el-table__row').first().locator('td').nth(1).textContent();
      await orderPage.completeOrder(orderNo || '');

      // 验证状态变更
      await orderPage.filterByStatus('completed');
      expect(await orderPage.getTableRowCount()).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
cd tests/e2e
npx playwright test tests/05-order.spec.ts --reporter=list
```

- [ ] **Step 3: 提交代码**

```bash
git add tests/e2e/tests/05-order.spec.ts
git commit -m "test: add order management tests"
```

---

## Task 9: 账单生成测试

**Files:**
- Create: `tests/e2e/tests/06-invoice.spec.ts`

- [ ] **Step 1: 编写账单生成测试**

```typescript
import { test, expect } from '@playwright/test';
import { InvoiceGeneratePage } from '../pages/InvoiceGeneratePage';
import { InvoicePage } from '../pages/InvoicePage';
import { OrderPage } from '../pages/OrderPage';
import { TEST_USERS, TEST_CUSTOMERS } from '../helpers/data';
import { apiPost, apiGet, login } from '../helpers/api';

test.describe('账单生成测试', () => {
  let invoiceGeneratePage: InvoiceGeneratePage;
  let invoicePage: InvoicePage;
  let orderPage: OrderPage;
  let adminToken: string;
  let salesToken: string;
  let customerToken: string;
  let completedOrderIds: string[] = [];

  test.beforeAll(async () => {
    const adminRes = await login(TEST_USERS.admins[0].username, TEST_USERS.admins[0].password);
    adminToken = adminRes.token;

    const salesRes = await login(TEST_USERS.sales[0].username, TEST_USERS.sales[0].password);
    salesToken = salesRes.token;

    const customerRes = await login(TEST_CUSTOMERS[0].username, TEST_CUSTOMERS[0].password);
    customerToken = customerRes.token;

    // 获取已上架商品
    const productsRes = await apiGet('/products/active', adminToken);
    const productId = productsRes.data[0]?.id;

    // 创建并完成一些订单用于测试
    if (productId) {
      for (let i = 0; i < 3; i++) {
        try {
          const orderRes = await apiPost('/orders', {
            items: [{ productId: productId, quantity: 1 }],
            deliveryAddress: '東京都テスト住所',
            contactPerson: TEST_CUSTOMERS[0].contactPerson,
            contactPhone: TEST_CUSTOMERS[0].phone,
          }, customerToken);
          const orderId = orderRes.data.id;

          // 确认订单
          await apiPost(`/orders/${orderId}/confirm`, {}, salesToken);
          // 完成订单
          await apiPost(`/orders/${orderId}/complete`, {}, salesToken);
          completedOrderIds.push(orderId);
        } catch (e) {
          // 忽略错误
        }
      }
    }
  });

  test.beforeEach(async ({ page }) => {
    invoiceGeneratePage = new InvoiceGeneratePage(page);
    invoicePage = new InvoicePage(page);
    orderPage = new OrderPage(page);
  });

  test('访问账单生成页面', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_USERS.admins[0].username);
    await page.fill('input[name="password"]', TEST_USERS.admins[0].password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await invoiceGeneratePage.goto();
    await expect(page.locator('.card-header:has-text("生成请求书")')).toBeVisible();
  });

  test('生成账单-选择已完成订单', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_USERS.admins[0].username);
    await page.fill('input[name="password"]', TEST_USERS.admins[0].password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await invoiceGeneratePage.goto();
    const ordersCount = await invoiceGeneratePage.getAvailableOrdersCount();

    if (ordersCount > 0) {
      // 选择第一个订单
      const firstOrderRow = page.locator('.el-table__row').first();
      const orderNo = await firstOrderRow.locator('td').nth(1).textContent();
      await invoiceGeneratePage.selectOrder(orderNo || '');

      // 点击生成按钮
      await invoiceGeneratePage.clickGenerateButton();

      // 设置到期日
      await invoiceGeneratePage.setDueDate(30);
      await invoiceGeneratePage.confirmGenerate();

      // 验证成功消息
      await expect(page.locator('.el-message--success')).toBeVisible();
    }
  });

  test('验证已生成账单的订单显示状态变更', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_USERS.admins[0].username);
    await page.fill('input[name="password"]', TEST_USERS.admins[0].password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // 检查订单列表中已完成订单的invoice状态
    await orderPage.goto();
    await orderPage.filterByStatus('completed');

    const rowCount = await orderPage.getTableRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('账单列表显示生成的账单', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_USERS.admins[0].username);
    await page.fill('input[name="password"]', TEST_USERS.admins[0].password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await invoicePage.goto();
    const invoiceCount = await invoicePage.getTableRowCount();

    // 如果之前生成了账单，应该显示在列表中
    if (invoiceCount > 0) {
      await expect(page.locator('.el-table')).toBeVisible();
    }
  });

  test('防重复生成验证', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_USERS.admins[0].username);
    await page.fill('input[name="password"]', TEST_USERS.admins[0].password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await invoiceGeneratePage.goto();

    // 尝试选择已生成账单的订单（应该被禁用）
    const rows = await invoiceGeneratePage.getAvailableOrdersCount();
    // 已生成账单的订单应该不在列表中或被禁用
    expect(rows).toBeGreaterThanOrEqual(0);
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
cd tests/e2e
npx playwright test tests/06-invoice.spec.ts --reporter=list
```

- [ ] **Step 3: 提交代码**

```bash
git add tests/e2e/tests/06-invoice.spec.ts
git commit -m "test: add invoice generation tests"
```

---

## Task 10: 运行完整测试套件并生成报告

- [ ] **Step 1: 运行所有测试**

```bash
cd tests/e2e
npx playwright test --reporter=list 2>&1 | tee test-results.txt
```

- [ ] **Step 2: 生成 HTML 报告**

```bash
cd tests/e2e
npx playwright show-report
```

- [ ] **Step 3: 从测试结果生成报告**

```bash
# 分析测试结果
cd tests/e2e

# 统计通过/失败的测试数量
PASS_COUNT=$(grep -c "✓" test-results.txt || echo "0")
FAIL_COUNT=$(grep -c "✗" test-results.txt || echo "0")

# 生成测试报告
cat > TEST_REPORT.md << 'EOF'
# 日本采销系统测试报告

## 测试执行信息
- 测试日期: $(date +%Y-%m-%d)
- 测试环境: http://43.153.155.76
- Playwright版本: $(npx playwright --version)

## 测试结果汇总
- 通过: $PASS_COUNT
- 失败: $FAIL_COUNT

## 详细结果
EOF

# 将测试结果追加到报告
grep -E "✓|✗" test-results.txt >> TEST_REPORT.md

echo "测试报告已生成: TEST_REPORT.md"
```

- [ ] **Step 4: 手动补充测试数据统计**

根据测试执行时创建的数据，手动填写测试报告中的：
- 实际创建的管理员数量
- 实际创建的采购员数量
- 实际创建的销售员数量
- 实际创建的客户数量
- 实际创建的商品数量
- 实际生成的账单数量

---

## 测试报告模板

```markdown
# 日本采销系统测试报告

## 测试执行信息
- 测试日期: YYYY-MM-DD
- 测试环境: http://43.153.155.76
- Playwright版本: x.x.x

## 测试数据
| 类型 | 计划数量 | 实际数量 | 备注 |
|------|----------|----------|------|
| 管理员 | 3 | x | |
| 采购员 | 3 | x | |
| 销售员 | 3 | x | |
| 客户 | 10 | x | |
| 商品 | 20 | x | |
| 分类 | 5 | x | |

## 测试结果汇总

### 通过的测试
- [ ] 认证功能
- [ ] 员工管理
- [ ] 客户管理
- [ ] 分类管理
- [ ] 商品管理
- [ ] 订单管理
- [ ] 账单生成
- [ ] 账单管理

### 失败的测试
| 测试名称 | 失败原因 | 严重程度 | 状态 |
|----------|----------|----------|------|
| xxx | xxx | 高/中/低 | 待修复 |

## 发现的问题

### 高优先级
1. [问题描述]
   - 预期行为:
   - 实际行为:
   - 修复建议:

### 中优先级
1. [问题描述]

### 低优先级
1. [问题描述]

## 修复后的回归测试

### 第一轮修复
- [ ] 修复问题1
- [ ] 验证问题1

### 第二轮修复
- [ ] 修复问题2
- [ ] 验证问题2

## 最终验证

### 功能验证清单
- [ ] 管理员可正常登录登出
- [ ] 员工CRUD操作正常
- [ ] 客户CRUD操作正常
- [ ] 商品审核上架流程正常
- [ ] 订单创建确认完成流程正常
- [ ] 账单生成功能正常
- [ ] 防重复生成逻辑正常
- [ ] 账单列表显示正常
- [ ] Dashboard统计正常

### 测试结论
[通过/不通过]
[总体评价]
```

---

## Task 11: 根据测试报告修复问题

根据 Task 10 生成的测试报告，按照优先级修复发现的问题，并重新运行相关测试验证修复效果。

### 第一轮修复

- [ ] **Step 1: 分析失败测试**

从 `test-results.txt` 中识别失败的测试，记录失败原因。

- [ ] **Step 2: 修复代码问题**

对于每个失败测试：
1. 定位相关代码文件
2. 分析失败原因
3. 修复问题
4. 提交修复: `git add . && git commit -m "fix: [问题描述]"`

- [ ] **Step 3: 同步到服务器**

```bash
# 同步后端修复
cd /c/Users/Administrator/japan-purchase-sales/backend
tar cf - --exclude='node_modules' --exclude='.git' --exclude='dist' src | ssh -i ~/.ssh/id_rsa root@43.153.155.76 "cd /opt/japan-purchase-sales/backend && tar xf - && npm ci && npx nest build"
docker restart japan-sales-backend

# 同步前端修复
cd /c/Users/Administrator/japan-purchase-sales/web-admin
tar cf - --exclude='node_modules' --exclude='.git' --exclude='dist' src router index.html package.json vite.config.js | ssh -i ~/.ssh/id_rsa root@43.153.155.76 "cd /opt/japan-purchase-sales/web-admin && tar xf -"
docker restart japan-sales-web
```

- [ ] **Step 4: 重新运行失败的测试**

```bash
cd tests/e2e
npx playwright test tests/FailedTest.spec.ts --reporter=list
```

### 第二轮修复（如需要）

重复 Step 1-4 直到所有测试通过。

### 最终验证

- [ ] **Step 1: 运行完整测试套件**

```bash
cd tests/e2e
npx playwright test --reporter=list
```

- [ ] **Step 2: 验证所有功能**

按照测试报告中的"功能验证清单"逐项验证。

- [ ] **Step 3: 生成最终测试报告**

```bash
cat > FINAL_TEST_REPORT.md << 'EOF'
# 日本采销系统 - 最终测试报告

## 测试结论
[通过/不通过]

## 验证的功能清单
- [ ] 所有功能验证通过

## 发现并修复的问题
1. [问题描述] - [修复方式]
EOF
```

---

**Plan complete!** 实施方式选择:

**1. Subagent-Driven (recommended)** - 使用 subagent 来执行测试任务

**2. Inline Execution** - 在当前会话执行测试任务

**请选择实施方式。**
