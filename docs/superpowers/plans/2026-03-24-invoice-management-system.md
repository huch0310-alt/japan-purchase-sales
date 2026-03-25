# 账单请求书管理系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现订单完成自动显示在账单页面，支持筛选客户和订单生成请求书，避免重复生成，集中管理所有请求书

**Architecture:**
- 在 Order 实体添加 `invoiceId` 字段追踪订单是否已生成请求书
- 修改 Invoice 创建逻辑：支持 `completed` 状态的订单，防止重复生成
- 新增前端请求书生成页面，与现有的账单列表页面分离
- 订单列表页新增"是否已生成请求书"状态列

**Tech Stack:** NestJS (Backend), Vue3 + Element Plus (Frontend), TypeORM, PostgreSQL

---

## File Structure

### Backend Files

| File | Responsibility |
|------|----------------|
| `backend/src/orders/entities/order.entity.ts` | 添加 `invoiceId` 字段 |
| `backend/src/orders/orders.service.ts` | 更新查询逻辑支持已完成订单 |
| `backend/src/orders/orders.controller.ts` | 添加新endpoint获取可生成请求书的订单 |
| `backend/src/invoices/invoices.service.ts` | 添加校验逻辑防止重复生成 |
| `backend/src/invoices/invoices.controller.ts` | 添加获取已开单订单的endpoint |

### Frontend Files

| File | Responsibility |
|------|----------------|
| `web-admin/src/views/Order.vue` | 订单列表，新增"是否已生成请求书"列 |
| `web-admin/src/views/Invoice.vue` | 保留为请求书列表管理页面（已存在） |
| `web-admin/src/views/InvoiceGenerate.vue` | 新增：请求书生成页面，筛选客户和订单 |
| `web-admin/src/router/index.js` | 添加路由 `/invoice-generate` |
| `web-admin/src/locales/zh.js` | 添加国际化文本 |
| `web-admin/src/locales/ja.js` | 添加国际化文本 |
| `web-admin/src/locales/en.js` | 添加国际化文本 |

---

## Task 1: Backend - Order Entity 添加 invoiceId 字段

**Files:**
- Modify: `backend/src/orders/entities/order.entity.ts`
- Modify: `backend/src/invoices/entities/invoice.entity.ts`

- [ ] **Step 1: 添加 invoiceId 字段到 Order Entity（使用 snake_case 数据库列名）**

```typescript
// backend/src/orders/entities/order.entity.ts
// 在 confirmedById 字段后添加
// 注意：数据库列名使用 snake_case (invoice_id)
@ManyToOne(() => Invoice, { nullable: true })
@JoinColumn({ name: 'invoice_id' })
invoice: Invoice;

@Column({ name: 'invoice_id', type: 'uuid', nullable: true })
invoiceId: string;
```

- [ ] **Step 2: 在 Invoice Entity 添加反向关联**

```typescript
// backend/src/invoices/entities/invoice.entity.ts
// 在 orderIds 字段后添加
// 注意：不需要添加 @OneToMany，避免循环依赖问题
// 通过 orderIds 数组和 invoiceId 字段关联已经足够
```

- [ ] **Step 3: 提交代码**

```bash
git add backend/src/orders/entities/order.entity.ts backend/src/invoices/entities/invoice.entity.ts
git commit -m "feat(order): 添加 invoice_id 字段关联请求书"
```

---

## Task 2: Backend - Invoice Service 添加防重复校验

**Files:**
- Modify: `backend/src/invoices/invoices.service.ts`

- [ ] **Step 1: 添加 In 到 import 并修改 create 方法（使用 snake_case 列名）**

```typescript
// backend/src/invoices/invoices.service.ts
// 修改 import 添加 In
import { Repository, In } from 'typeorm';

// 在 create 方法中添加校验逻辑
async create(data: { customerId: string; orderIds: string[] }) {
  const { customerId, orderIds } = data;

  // 1. 校验所有订单存在且属于该客户
  const orders = await this.orderRepository.find({
    where: { id: In(orderIds) },
    relations: ['customer'],
  });

  if (orders.length !== orderIds.length) {
    throw new BadRequestException('部分订单不存在');
  }

  // 2. 校验所有订单都属于该客户
  for (const order of orders) {
    if (order.customerId !== customerId) {
      throw new BadRequestException(`订单 ${order.orderNo} 不属于该客户`);
    }
  }

  // 3. 校验所有订单状态为 completed
  for (const order of orders) {
    if (order.status !== 'completed') {
      throw new BadRequestException(`订单 ${order.orderNo} 状态不是已完成，无法生成请求书`);
    }
  }

  // 4. 校验这些订单是否已经生成过请求书（使用 invoice_id 列）
  const alreadyInvoiced = orders.filter(order => order.invoiceId);
  if (alreadyInvoiced.length > 0) {
    throw new BadRequestException(
      `以下订单已生成请求书: ${alreadyInvoiced.map(o => o.orderNo).join(', ')}`
    );
  }

  // ... 后续现有逻辑保持不变（计算金额等）...
}
```

- [ ] **Step 2: 修改 create 方法在创建发票后更新订单（关键修复：先保存发票再更新订单）**

```typescript
// 找到现有的 create 方法中 return this.invoiceRepository.save(invoice); 之前插入更新逻辑
// 注意：必须先保存发票获取id，然后更新订单，最后才返回

// 1. 保存发票获取id
const savedInvoice = await this.invoiceRepository.save(invoice);

// 2. 更新所有订单的 invoice_id 字段（使用 snake_case）
await this.orderRepository
  .createQueryBuilder()
  .update(Order)
  .set({ invoiceId: savedInvoice.id })
  .where('id IN (:...orderIds)', { orderIds })
  .execute();

// 3. 返回保存的发票（注意：这行代码要移到更新逻辑之后）
return savedInvoice;
```

- [ ] **Step 3: 提交代码**

```bash
git add backend/src/invoices/invoices.service.ts
git commit -m "feat(invoice): 添加防重复生成校验逻辑"
```

---

## Task 3: Backend - Orders Controller 添加查询已完成的未开单订单

**Files:**
- Modify: `backend/src/orders/orders.controller.ts`
- Modify: `backend/src/orders/orders.service.ts`

- [ ] **Step 1: 在 OrdersService 添加查询已完成但未生成请求书的方法**

```typescript
// backend/src/orders/orders.service.ts

/**
 * 获取客户的已完成但未生成请求书的订单
 */
async findCompletedWithoutInvoice(customerId?: string): Promise<Order[]> {
  const queryBuilder = this.orderRepository
    .createQueryBuilder('order')
    .leftJoinAndSelect('order.customer', 'customer')
    .leftJoinAndSelect('order.items', 'items')
    .where('order.status = :status', { status: 'completed' })
    .andWhere('order.invoiceId IS NULL');

  if (customerId) {
    queryBuilder.andWhere('order.customerId = :customerId', { customerId });
  }

  return queryBuilder
    .orderBy('order.createdAt', 'DESC')
    .getMany();
}
```

- [ ] **Step 2: 在 OrdersController 添加 endpoint**

```typescript
// backend/src/orders/orders.controller.ts

/**
 * 获取可生成请求书的订单列表（已完成但未开单）
 */
@Get('available-for-invoice')
@Roles('super_admin', 'admin', 'sales')
@ApiOperation({ summary: '获取可生成请求书的订单列表' })
async findAvailableForInvoice(
  @Query('customerId') customerId?: string,
) {
  return this.ordersService.findCompletedWithoutInvoice(customerId);
}
```

- [ ] **Step 3: 提交代码**

```bash
git add backend/src/orders/orders.controller.ts backend/src/orders/orders.service.ts
git commit -m "feat(order): 添加获取可生成请求书订单的接口"
```

---

## Task 4: Frontend - 订单列表页添加"是否已生成请求书"列

**Files:**
- Modify: `web-admin/src/views/Order.vue`

- [ ] **Step 1: 在订单列表表格中添加新列**

```vue
<!-- web-admin/src/views/Order.vue -->
<!-- 在 status 列后添加 -->
<el-table-column :label="t('invoice.generated')" width="120" align="center">
  <template #default="{ row }">
    <el-tag v-if="row.invoiceId" type="success" size="small">
      {{ t('invoice.yes') }}
    </el-tag>
    <el-tag v-else type="info" size="small">
      {{ t('invoice.no') }}
    </el-tag>
  </template>
</el-table-column>
```

- [ ] **Step 2: 在 locales 添加翻译文本**

```javascript
// web-admin/src/locales/zh.js
invoice: {
  // ... existing
  generated: '已生成请求书',
  yes: '是',
  no: '否',
}

// web-admin/src/locales/ja.js
invoice: {
  generated: '請求書生成済み',
  yes: 'はい',
  no: 'いいえ',
}

// web-admin/src/locales/en.js
invoice: {
  generated: 'Invoice Generated',
  yes: 'Yes',
  no: 'No',
}
```

- [ ] **Step 3: 提交代码**

```bash
git add web-admin/src/views/Order.vue web-admin/src/locales/zh.js web-admin/src/locales/ja.js web-admin/src/locales/en.js
git commit -m "feat(order): 订单列表添加是否已生成请求书列"
```

---

## Task 5: Frontend - 创建请求书生成页面

**Files:**
- Create: `web-admin/src/views/InvoiceGenerate.vue`
- Modify: `web-admin/src/router/index.js`

- [ ] **Step 1: 创建 InvoiceGenerate.vue**

```vue
<template>
  <div class="invoice-generate">
    <div class="filter-section">
      <el-select v-model="filterCustomerId" :placeholder="t('order.selectCustomer')" clearable filterable @change="loadOrders">
        <el-option v-for="c in customers" :key="c.id" :label="c.companyName" :value="c.id" />
      </el-select>
      <el-tag type="info">{{ t('invoice.onlyCompletedOrders') }}</el-tag>
    </div>

    <el-table ref="orderTable" :data="orders" @selection-change="handleSelectionChange" v-loading="loading">
      <el-table-column type="selection" width="55" :selectable="checkSelectable" />
      <el-table-column prop="orderNo" :label="t('order.orderNo')" width="180" />
      <el-table-column prop="customer.companyName" :label="t('order.customer')" />
      <el-table-column prop="totalAmount" :label="t('order.totalAmount')" width="120">
        <template #default="{ row }">
          ¥{{ row.totalAmount }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" :label="t('order.createdAt')" width="160" />
    </el-table>

    <div class="action-bar">
      <el-button type="primary" :disabled="selectedOrders.length === 0" @click="generateInvoice">
        {{ t('invoice.generate') }} ({{ selectedOrders.length }})
      </el-button>
    </div>

    <!-- 生成确认对话框 -->
    <el-dialog v-model="showConfirmDialog" :title="t('invoice.confirmGenerate')" width="500px">
      <p>{{ t('invoice.confirmMessage', { count: selectedOrders.length, total: selectedAmount }) }}</p>
      <el-form :model="invoiceForm">
        <el-form-item :label="t('invoice.dueDate')">
          <el-date-picker v-model="invoiceForm.dueDate" type="date" :placeholder="t('invoice.selectDueDate')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showConfirmDialog = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmGenerate">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../api'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const loading = ref(false)
const customers = ref([])
const orders = ref([])
const selectedOrders = ref([])
const filterCustomerId = ref('')
const showConfirmDialog = ref(false)
const invoiceForm = ref({ dueDate: null })

const selectedAmount = computed(() => {
  return selectedOrders.value.reduce((sum, o) => sum + Number(o.totalAmount), 0)
})

const checkSelectable = (row) => !row.invoiceId

const loadCustomers = async () => {
  const res = await api.get('/customers')
  customers.value = res.data
}

const loadOrders = async () => {
  loading.value = true
  try {
    const params = filterCustomerId.value ? { customerId: filterCustomerId.value } : {}
    const res = await api.get('/orders/available-for-invoice', { params })
    orders.value = res.data
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection) => {
  // 确保只选择同一客户的订单
  selectedOrders.value = selection
}

const generateInvoice = () => {
  if (selectedOrders.value.length === 0) return

  // 检查是否同一客户
  const customerIds = [...new Set(selectedOrders.value.map(o => o.customerId))]
  if (customerIds.length > 1) {
    ElMessage.error(t('invoice.mustSameCustomer'))
    return
  }

  // 设置默认到期日（30天后）
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30)
  invoiceForm.value.dueDate = dueDate

  showConfirmDialog.value = true
}

const confirmGenerate = async () => {
  const customerId = selectedOrders.value[0].customerId
  const orderIds = selectedOrders.value.map(o => o.id)

  try {
    await api.post('/invoices', {
      customerId,
      orderIds,
      dueDate: invoiceForm.value.dueDate,
    })
    ElMessage.success(t('invoice.generateSuccess'))
    showConfirmDialog.value = false
    loadOrders()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || t('invoice.generateFailed'))
  }
}

loadCustomers()
loadOrders()
</script>
```

- [ ] **Step 2: 添加路由**

```javascript
// web-admin/src/router/index.js
{
  path: 'invoice-generate',
  name: 'InvoiceGenerate',
  component: () => import('../views/InvoiceGenerate.vue'),
  meta: { title: 'nav.invoiceGenerate' }
}
```

- [ ] **Step 3: 添加国际化文本**

```javascript
// web-admin/src/locales/zh.js
nav: {
  // ...
  invoiceGenerate: '生成请求书',
},
invoice: {
  // ...
  onlyCompletedOrders: '仅显示已完成订单',
  generate: '生成请求书',
  confirmGenerate: '确认生成',
  confirmMessage: '确定要生成 {count} 张订单的请求书吗？总计: ¥{total}',
  dueDate: '到期日',
  selectDueDate: '选择到期日',
  mustSameCustomer: '只能选择同一客户的订单',
  generateSuccess: '请求书生成成功',
  generateFailed: '请求书生成失败',
}

// web-admin/src/locales/ja.js 和 en.js 添加相应翻译
```

- [ ] **Step 4: 提交代码**

```bash
git add web-admin/src/views/InvoiceGenerate.vue web-admin/src/router/index.js web-admin/src/locales/zh.js web-admin/src/locales/ja.js web-admin/src/locales/en.js
git commit -m "feat(invoice): 添加请求书生成页面"
```

---

## Task 6: 更新 Layout 导航菜单

**Files:**
- Modify: `web-admin/src/views/Layout.vue`

- [ ] **Step 1: 在导航菜单添加入口**

```vue
<!-- 在账单管理菜单项后添加 -->
<el-menu-item index="/invoice-generate">
  <el-icon><Document /></el-icon>
  <span>{{ $t('nav.invoiceGenerate') }}</span>
</el-menu-item>
```

- [ ] **Step 2: 提交代码**

```bash
git add web-admin/src/views/Layout.vue
git commit -m "feat(menu): 添加入口到生成请求书页面"
```

---

## Task 7: 同步代码到服务器并重建后端

- [ ] **Step 1: 同步后端代码到服务器**

```bash
cd /c/Users/Administrator/japan-purchase-sales/backend
tar cf - --exclude='node_modules' --exclude='.git' src | ssh -i ~/.ssh/id_rsa root@43.153.155.76 "cd /opt/japan-purchase-sales/backend && tar xf -"
```

- [ ] **Step 2: 重建后端 Docker 镜像**

```bash
ssh -i ~/.ssh/id_rsa root@43.153.155.76 "cd /opt/japan-purchase-sales && docker-compose build backend && docker-compose up -d --no-deps backend"
```

- [ ] **Step 3: 验证后端启动成功**

```bash
ssh -i ~/.ssh/id_rsa root@43.153.155.76 "docker logs japan-sales-backend --tail 20"
```

---

## Task 8: 同步前端代码并重建 web-admin

- [ ] **Step 1: 同步前端代码到服务器**

```bash
cd /c/Users/Administrator/japan-purchase-sales/web-admin
tar cf - --exclude='node_modules' --exclude='.git' --exclude='dist' src | ssh -i ~/.ssh/id_rsa root@43.153.155.76 "cd /opt/japan-purchase-sales/web-admin && tar xf -"
tar cf - --exclude='node_modules' --exclude='.git' --exclude='dist' router index.html package.json vite.config.js | ssh -i ~/.ssh/id_rsa root@43.153.155.76 "cd /opt/japan-purchase-sales/web-admin && tar xf -"
```

- [ ] **Step 2: 重建 web-admin Docker 镜像**

```bash
ssh -i ~/.ssh/id_rsa root@43.153.155.76 "cd /opt/japan-purchase-sales && docker-compose build web-admin && docker-compose up -d --no-deps web-admin"
```

---

## Task 9: 数据库迁移 - 添加 invoice_id 列

- [ ] **Step 1: 在服务器执行 SQL（使用 snake_case 列名）**

```bash
ssh -i ~/.ssh/id_rsa root@43.153.155.76 "docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c \"ALTER TABLE orders ADD COLUMN invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;\""
```

- [ ] **Step 2: 验证列添加成功**

```bash
ssh -i ~/.ssh/id_rsa root@43.153.155.76 "docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c \"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'invoice_id';\""
```

---

## Task 10: 测试完整流程

- [ ] **Step 1: 测试订单完成后的流程**

```bash
# 1. 确认有一笔已完成订单
ssh -i ~/.ssh/id_rsa root@43.153.155.76 "docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c \"SELECT id, \"orderNo\", status, invoice_id FROM orders WHERE status = 'completed' LIMIT 3;\""

# 2. 测试 API 获取可开单订单
curl -H "Authorization: Bearer <token>" http://43.153.155.76:3001/api/orders/available-for-invoice
```

- [ ] **Step 2: 测试生成请求书**

```bash
# 1. 登录后台系统
# 2. 访问 http://43.153.155.76/invoice-generate
# 3. 选择客户和已完成订单
# 4. 点击生成请求书
# 5. 检查请求书列表 http://43.153.155.76/invoice
```

- [ ] **Step 3: 验证防重复逻辑**

```bash
# 再次尝试为同一订单生成请求书，应该报错
# 检查数据库订单表 invoiceId 是否有值
ssh -i ~/.ssh/id_rsa root@43.153.155.76 "docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c \"SELECT id, \"orderNo\", invoice_id FROM orders WHERE invoice_id IS NOT NULL;\""
```

---

## Verification Checklist

- [ ] 后端启动正常，无报错
- [ ] 数据库 invoiceId 列已添加
- [ ] 订单列表页显示"是否已生成请求书"列
- [ ] 生成请求书页面可访问
- [ ] 可选择已完成订单生成请求书
- [ ] 同一订单不能重复生成请求书
- [ ] 已生成的请求书显示在请求书管理页面
- [ ] 请求书管理页面显示所有请求书列表

---

**Plan complete!** Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
