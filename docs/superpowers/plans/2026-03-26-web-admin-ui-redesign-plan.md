# Web Admin UI 重新设计实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将日本采销管理系统 Web Admin 打造成现代科技商务风格，所有日元金额显示取整到最小单位

**Architecture:** 基于 Element Plus 组件库，通过全局 CSS 变量覆盖实现主题统一，金额显示使用 Math.round() 取整

**Tech Stack:** Vue3 + Element Plus + CSS Variables + Vite

---

## 任务清单

### 任务 1: 更新全局样式变量 (main.css)

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/assets/styles/main.css`

**Steps:**

- [ ] **Step 1: 备份并替换全局样式**

```css
/* 在 main.css 开头添加 CSS 变量定义 */
:root {
  --color-primary: #409EFF;
  --color-primary-hover: #53a8ff;
  --color-accent: #00d9ff;
  --color-sidebar-bg: #1a1a2e;
  --color-sidebar-active: #16213e;
  --color-sidebar-text: #bfcbd9;
  --color-sidebar-active-text: #ffffff;
  --color-bg-page: #f0f2f5;
  --color-bg-card: #ffffff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-danger: #ff4d4f;
  --color-text-primary: #303133;
  --color-text-secondary: #909399;
  --color-border: #ebeef5;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-hover: 0 8px 24px rgba(64, 158, 255, 0.15);
}
```

- [ ] **Step 2: 替换 Element Plus 覆盖样式**

```css
/* Element Plus 覆盖样式 */
.el-table th {
  background-color: #fafafa !important;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 13px;
}

.el-card {
  border-radius: var(--radius-lg);
  border: none;
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.3s ease;
}

.el-card:hover {
  box-shadow: var(--shadow-hover);
}

.el-button--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  border: none;
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.el-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.el-button {
  border-radius: var(--radius-md);
}

.el-tag {
  border-radius: var(--radius-sm);
  border: none;
  padding: 0 10px;
  height: 24px;
  line-height: 24px;
  font-weight: 500;
}
```

- [ ] **Step 3: 提交**

```bash
git add web-admin/src/assets/styles/main.css
git commit -m "feat(ui): 添加科技商务风 CSS 变量和覆盖样式"
```

---

### 任务 2: 更新 App.vue 字体设置

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/App.vue`

**Steps:**

- [ ] **Step 1: 更新字体样式**

```vue
<style>
#app {
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text-primary);
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add web-admin/src/App.vue
git commit -m "feat(ui): 更新全局字体和颜色变量"
```

---

### 任务 3: 更新 Layout.vue 侧边栏样式

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/views/Layout.vue`

**Steps:**

- [ ] **Step 1: 添加侧边栏样式到 style 部分**

```vue
<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: var(--color-sidebar-bg) !important;
}

.el-menu {
  border-right: none !important;
  background-color: transparent !important;
}

.el-menu-item {
  margin: 4px 8px;
  border-radius: var(--radius-md);
  height: 48px;
  transition: all 0.3s ease;
}

.el-menu-item:hover {
  background-color: var(--color-sidebar-active) !important;
}

.el-menu-item.is-active {
  background-color: var(--color-sidebar-active) !important;
  color: var(--color-sidebar-active-text) !important;
  border-left: 3px solid var(--color-accent);
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0f0f1a;
}

.logo h3 {
  color: #fff;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.el-header {
  background-color: var(--color-bg-card);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: var(--color-text-primary);
  font-weight: 500;
}

.el-main {
  background-color: var(--color-bg-page);
  padding: 20px;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add web-admin/src/views/Layout.vue
git commit -m "feat(ui): 更新侧边栏为科技商务风格"
```

---

### 任务 4: 更新 Login.vue 登录页样式

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/views/Login.vue`

**Steps:**

- [ ] **Step 1: 更新登录页样式**

```vue
<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.language-switch-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
}

.language-switch {
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.language-switch:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-accent);
  color: #fff;
}

.login-card {
  width: 400px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.card-header h2 {
  text-align: center;
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 24px;
  font-weight: 600;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add web-admin/src/views/Login.vue
git commit -m "feat(ui): 更新登录页为科技商务风格"
```

---

### 任务 5: 添加 formatCurrency 到 format.js

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/utils/format.js`

**Steps:**

- [ ] **Step 1: 添加日元金额格式化函数**

```javascript
/**
 * 日元金额格式化 - 只显示到元（整数）
 * @param {number|string} amount - 金额
 * @returns {string} 格式化的金额，如 "¥1,234"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '¥0'
  const num = Number(amount)
  if (isNaN(num)) return '¥0'
  return `¥${Math.round(num).toLocaleString()}`
}
```

- [ ] **Step 2: 提交**

```bash
git add web-admin/src/utils/format.js
git commit -m "feat(utils): 添加 formatCurrency 日元金额格式化函数"
```

---

### 任务 6: 更新 Dashboard.vue

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/views/Dashboard.vue`

**Steps:**

- [ ] **Step 1: 更新 script 引入 formatCurrency**

```javascript
import { formatDateTime } from '../utils/format'
import { formatCurrency } from '../utils/format' // 添加这行
```

- [ ] **Step 2: 更新金额显示**

```vue
<!-- 今日销售额 -->
<div class="stat-value">{{ formatCurrency(stats.todaySales) }}</div>

<!-- 热销产品金额 -->
<el-table-column prop="saleAmount" :label="t('dashboard.salesAmount')" width="100">
  <template #default="{ row }">
    {{ formatCurrency(row.saleAmount) }}
  </template>
</el-table-column>
```

- [ ] **Step 3: 更新统计卡片样式**

```vue
<style scoped>
.stat-card {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: 'DIN Alternate', 'Roboto', sans-serif;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}
</style>
```

- [ ] **Step 4: 提交**

```bash
git add web-admin/src/views/Dashboard.vue
git commit -m "feat(ui): Dashboard 使用 formatCurrency 并更新样式"
```

---

### 任务 7: 更新 Product.vue

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/views/Product.vue`

**Steps:**

- [ ] **Step 1: 引入 formatCurrency**

```javascript
import { formatDateTime } from '../utils/format'
import { formatCurrency } from '../utils/format'
```

- [ ] **Step 2: 更新价格显示**

```vue
<el-table-column prop="purchasePrice" :label="t('product.purchasePrice')" width="100">
  <template #default="{ row }">{{ formatCurrency(row.purchasePrice) }}</template>
</el-table-column>
<el-table-column prop="salePrice" :label="t('product.salePrice')" width="100">
  <template #default="{ row }">{{ formatCurrency(row.salePrice) }}</template>
</el-table-column>
```

- [ ] **Step 3: 提交**

```bash
git add web-admin/src/views/Product.vue
git commit -m "feat(ui): Product 使用 formatCurrency 显示价格"
```

---

### 任务 8: 更新 ProductDetail.vue

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/views/ProductDetail.vue`

**Steps:**

- [ ] **Step 1: 引入 formatCurrency**

```javascript
import { formatDateTime } from '../utils/format'
import { formatCurrency } from '../utils/format'
```

- [ ] **Step 2: 更新价格显示**

```vue
<el-descriptions-item :label="t('product.purchasePrice')">{{ formatCurrency(product.purchasePrice) }}</el-descriptions-item>
<el-descriptions-item :label="t('product.salePrice')">{{ formatCurrency(product.salePrice) }}</el-descriptions-item>
```

- [ ] **Step 3: 提交**

```bash
git add web-admin/src/views/ProductDetail.vue
git commit -m "feat(ui): ProductDetail 使用 formatCurrency 显示价格"
```

---

### 任务 9: 更新 Order.vue

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/views/Order.vue`

**Steps:**

- [ ] **Step 1: 引入 formatCurrency**

```javascript
import { formatDateTime } from '../utils/format'
import { formatCurrency } from '../utils/format'
```

- [ ] **Step 2: 更新金额显示（列表和详情对话框）**

```vue
<!-- 列表页金额 -->
<el-table-column prop="totalAmount" :label="t('order.amount')" width="100">
  <template #default="{ row }">{{ formatCurrency(row.totalAmount) }}</template>
</el-table-column>

<!-- 详情对话框中的金额 -->
<div class="total-section">
  <div>{{ t('order.subtotal') }}: {{ formatCurrency(currentOrder.subtotal) }}</div>
  <div>{{ t('order.discount') }}: -{{ formatCurrency(currentOrder.discountAmount) }}</div>
  <div>{{ t('order.taxAmount') }}: {{ formatCurrency(currentOrder.taxAmount) }}</div>
  <div class="total">{{ t('order.total') }}: {{ formatCurrency(currentOrder.totalAmount) }}</div>
</div>
```

- [ ] **Step 3: 提交**

```bash
git add web-admin/src/views/Order.vue
git commit -m "feat(ui): Order 使用 formatCurrency 显示金额"
```

---

### 任务 10: 更新 OrderDetail.vue

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/views/OrderDetail.vue`

**Steps:**

- [ ] **Step 1: 引入 formatCurrency**

```javascript
import { formatDateTime } from '../utils/format'
import { formatCurrency } from '../utils/format'
```

- [ ] **Step 2: 更新所有金额显示**

```vue
<!-- 订单金额 -->
{{ formatCurrency(order.totalAmount) }}

<!-- 产品小计 -->
{{ formatCurrency(Number(item.unitPrice || 0) * Number(item.quantity || 0)) }}

<!-- 折扣 -->
-{{ formatCurrency(order.discountAmount) }}

<!-- 税额 -->
{{ formatCurrency(order.taxAmount) }}
```

- [ ] **Step 3: 提交**

```bash
git add web-admin/src/views/OrderDetail.vue
git commit -m "feat(ui): OrderDetail 使用 formatCurrency 显示金额"
```

---

### 任务 11: 更新 Invoice.vue

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/views/Invoice.vue`

**Steps:**

- [ ] **Step 1: 引入 formatCurrency**

```javascript
import { formatDateTime } from '../utils/format'
import { formatCurrency } from '../utils/format'
```

- [ ] **Step 2: 更新金额显示**

```vue
<el-table-column prop="subtotal" :label="t('invoice.subtotalNoTax')" width="110">
  <template #default="{ row }">{{ formatCurrency(row.subtotal) }}</template>
</el-table-column>
<el-table-column prop="taxAmount" :label="t('invoice.taxAmount')" width="100">
  <template #default="{ row }">{{ formatCurrency(row.taxAmount) }}</template>
</el-table-column>
<el-table-column prop="totalAmount" :label="t('order.total')" width="110">
  <template #default="{ row }">
    <span style="color: var(--color-danger); font-weight: 600;">
      {{ formatCurrency(row.totalAmount) }}
    </span>
  </template>
</el-table-column>
```

- [ ] **Step 3: 提交**

```bash
git add web-admin/src/views/Invoice.vue
git commit -m "feat(ui): Invoice 使用 formatCurrency 显示金额"
```

---

### 任务 12: 更新 InvoiceDetail.vue

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/views/InvoiceDetail.vue`

**Steps:**

- [ ] **Step 1: 引入 formatCurrency**

```javascript
import { formatDateTime, formatDate } from '../utils/format'
import { formatCurrency } from '../utils/format'
```

- [ ] **Step 2: 更新金额显示**

```vue
<el-descriptions-item :label="t('invoice.subtotalNoTax')">
  {{ formatCurrency(invoice.subtotal) }}
</el-descriptions-item>
<el-descriptions-item :label="t('invoice.taxAmount')">
  {{ formatCurrency(invoice.taxAmount) }}
</el-descriptions-item>
<el-descriptions-item :label="t('order.total')" :span="2">
  <span style="font-size: 20px; font-weight: bold; color: var(--color-danger);">
    {{ formatCurrency(invoice.totalAmount) }}
  </span>
</el-descriptions-item>

<!-- 关联订单金额 -->
<el-table-column prop="totalAmount" :label="t('order.amount')">
  <template #default="{ row }">{{ formatCurrency(row.totalAmount) }}</template>
</el-table-column>
```

- [ ] **Step 2: 提交**

```bash
git add web-admin/src/views/InvoiceDetail.vue
git commit -m "feat(ui): InvoiceDetail 使用 formatCurrency 显示金额"
```

---

### 任务 13: 更新 Customer.vue

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/views/Customer.vue`

**Steps:**

- [ ] **Step 1: 确保引入 formatCurrency**

```javascript
import { formatDateTime } from '../utils/format'
import { formatCurrency } from '../utils/format'
```

- [ ] **Step 2: VIP 折扣显示已修复为百分比，无需更改**

（之前已修复 `((row.vipDiscount || 0) * 100).toFixed(0) + '%'`）

- [ ] **Step 3: 提交**

```bash
git add web-admin/src/views/Customer.vue
git commit -m "feat(ui): Customer 已使用百分比显示 VIP 折扣"
```

---

### 任务 14: 更新 CustomerDetail.vue

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/views/CustomerDetail.vue`

**Steps:**

- [ ] **Step 1: 引入 formatCurrency**

```javascript
import { formatDateTime } from '../utils/format'
import { formatCurrency } from '../utils/format'
```

- [ ] **Step 2: 更新统计金额显示**

```vue
<!-- 总订单金额 -->
{{ formatCurrency(stats.totalAmount) }}
<!-- 总应付金额 -->
{{ formatCurrency(stats.totalUnpaid) }}
```

- [ ] **Step 3: 提交**

```bash
git add web-admin/src/views/CustomerDetail.vue
git commit -m "feat(ui): CustomerDetail 使用 formatCurrency 显示金额"
```

---

### 任务 15: 更新 Report.vue

**Files:**
- Modify: `C:/Users/Administrator/japan-purchase-sales/web-admin/src/views/Report.vue`

**Steps:**

- [ ] **Step 1: 引入 formatCurrency**

```javascript
import { formatDateTime } from '../utils/format'
import { formatCurrency } from '../utils/format'
```

- [ ] **Step 2: 更新 ECharts 格式化**

```javascript
yAxis: {
  type: 'value',
  axisLabel: {
    formatter: (value) => `¥${value.toLocaleString()}`
  }
}
```

- [ ] **Step 3: 更新统计卡片金额**

```vue
<div class="stat-value">{{ formatCurrency(stats.totalSales) }}</div>
<div class="stat-value">{{ formatCurrency(stats.totalProcurement) }}</div>
```

- [ ] **Step 4: 更新热销产品金额列**

```vue
<el-table-column prop="saleAmount" :label="t('dashboard.salesAmount')">
  <template #default="{ row }">{{ formatCurrency(row.saleAmount) }}</template>
</el-table-column>
```

- [ ] **Step 5: 提交**

```bash
git add web-admin/src/views/Report.vue
git commit -m "feat(ui): Report 使用 formatCurrency 显示金额"
```

---

### 任务 16: 构建并部署

**Steps:**

- [ ] **Step 1: 构建项目**

```bash
cd C:/Users/Administrator/japan-purchase-sales/web-admin
npm run build
```

- [ ] **Step 2: 创建部署包**

```bash
cd C:/Users/Administrator/japan-purchase-sales/web-admin
tar -czf /tmp/web-admin-ui-redesign.tar.gz dist
```

- [ ] **Step 3: 上传到服务器**

```bash
scp -i ~/.ssh/id_rsa /tmp/web-admin-ui-redesign.tar.gz root@43.153.155.76:/tmp/
```

- [ ] **Step 4: 解压并部署到容器**

```bash
ssh -i ~/.ssh/id_rsa root@43.153.155.76 "cd /tmp && tar -xzf web-admin-ui-redesign.tar.gz && docker cp dist/. japan-sales-web:/usr/share/nginx/html/"
```

- [ ] **Step 5: 验证部署**

```bash
ssh -i ~/.ssh/id_rsa root@43.153.155.76 "docker exec japan-sales-web ls -la /usr/share/nginx/html/assets/ | head -5"
```

---

## 部署验证清单

- [ ] 访问 https://admin.43.153.155.76 验证侧边栏样式
- [ ] 访问 Dashboard 验证统计卡片样式
- [ ] 访问订单页验证金额显示（整数，无小数）
- [ ] 访问产品页验证价格显示（整数，无小数）
- [ ] 访问发票页验证金额显示（整数，无小数）
- [ ] 切换不同语言验证样式一致性
