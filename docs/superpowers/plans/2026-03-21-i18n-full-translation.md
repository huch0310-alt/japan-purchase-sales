# 全面翻译优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将所有视图文件中的硬编码中文文本替换为vue-i18n的t()函数调用，实现完整的三语言（中/日/英）翻译

**Architecture:** 扩展现有的locale文件结构，添加common（通用）、form（表单）、messages（消息）等分类，同时修改各视图组件使用t()函数

**Tech Stack:** Vue 3, vue-i18n v11, Element Plus

---

## 任务概览

需要翻译的文件：
- Login.vue - 登录页
- Layout.vue - 布局（部分完成）
- Dashboard.vue - 仪表盘
- Customer.vue / CustomerDetail.vue - 客户管理
- Product.vue / ProductDetail.vue - 商品管理
- Category.vue - 分类管理
- Unit.vue - 单位管理
- Order.vue / OrderDetail.vue - 订单管理
- Invoice.vue / InvoiceDetail.vue - 账单管理
- Report.vue - 报表统计
- Staff.vue - 员工管理
- Logs.vue - 操作日志
- Settings.vue - 系统设置

---

### Task 1: 扩展语言文件结构

**Files:**
- Modify: `web-admin/src/locales/zh.js`
- Modify: `web-admin/src/locales/ja.js`
- Modify: `web-admin/src/locales/en.js`

- [ ] **Step 1: 添加通用翻译键 (common)**

```javascript
// zh.js 添加
common: {
  add: '新增',
  edit: '编辑',
  delete: '删除',
  save: '保存',
  cancel: '取消',
  confirm: '确认',
  search: '搜索',
  reset: '重置',
  submit: '提交',
  loading: '加载中...',
  noData: '暂无数据',
  action: '操作',
  status: '状态',
  name: '名称',
  sort: '排序',
  active: '启用',
  inactive: '禁用',
  enabled: '启用',
  disabled: '禁用',
  all: '全部',
  refresh: '刷新',
  view: '查看',
  detail: '详情',
  close: '关闭',
  back: '返回',
  print: '打印',
  export: '导出',
  download: '下载',
  upload: '上传',
  yes: '是',
  no: '否',
  tip: '提示',
  warning: '警告',
  success: '成功',
  error: '错误',
  info: '信息'
}
```

- [ ] **Step 2: 添加表单验证消息 (validation)**

```javascript
validation: {
  required: '此项为必填项',
  pleaseInput: '请输入{field}',
  pleaseSelect: '请选择{field}',
  minLength: '{field}至少{min}个字符',
  maxLength: '{field}最多{max}个字符'
}
```

- [ ] **Step 3: 添加消息翻译 (messages)**

```javascript
messages: {
  loadSuccess: '加载成功',
  loadFailed: '加载失败',
  saveSuccess: '保存成功',
  saveFailed: '保存失败',
  deleteSuccess: '删除成功',
  deleteFailed: '删除失败',
  updateSuccess: '更新成功',
  createSuccess: '创建成功',
  operationSuccess: '操作成功',
  operationFailed: '操作失败',
  confirmDelete: '确定要删除吗？',
  confirmLogout: '确定要退出登录吗？'
}
```

- [ ] **Step 4: 扩展nav分类添加更多页面标题**

- [ ] **Step 5: Commit**

```bash
git add web-admin/src/locales/*.js
git commit -m "feat: 扩展i18n语言文件结构，添加common/validation/messages分类"
```

---

### Task 2: 翻译登录页 (Login.vue)

**Files:**
- Modify: `web-admin/src/views/Login.vue`

- [ ] **Step 1: 添加useI18n导入和setup**

```javascript
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
```

- [ ] **Step 2: 替换模板中的中文文本**

- [ ] **Step 3: Commit**

---

### Task 3: 翻译Layout.vue剩余部分

**Files:**
- Modify: `web-admin/src/views/Layout.vue`

- [ ] **Step 1: 翻译Logo和退出确认消息**

- [ ] **Step 2: Commit**

---

### Task 4: 翻译Dashboard.vue

**Files:**
- Modify: `web-admin/src/views/Dashboard.vue`

- [ ] **Step 1: 添加useI18n导入**

- [ ] **Step 2: 翻译统计卡片标签、图表标题**

- [ ] **Step 3: Commit**

---

### Task 5: 翻译Customer.vue和CustomerDetail.vue

**Files:**
- Modify: `web-admin/src/views/Customer.vue`
- Modify: `web-admin/src/views/CustomerDetail.vue`

- [ ] **Step 1: 翻译Customer.vue表格列、按钮、对话框**

- [ ] **Step 2: 翻译CustomerDetail.vue详情页**

- [ ] **Step 3: Commit**

---

### Task 6: 翻译Product.vue和ProductDetail.vue

**Files:**
- Modify: `web-admin/src/views/Product.vue`
- Modify: `web-admin/src/views/ProductDetail.vue`

- [ ] **Step 1: 翻译Product.vue**

- [ ] **Step 2: 翻译ProductDetail.vue**

- [ ] **Step 3: Commit**

---

### Task 7: 翻译Category.vue和Unit.vue

**Files:**
- Modify: `web-admin/src/views/Category.vue`
- Modify: `web-admin/src/views/Unit.vue`

- [ ] **Step 1: 翻译Category.vue**

- [ ] **Step 2: 翻译Unit.vue**

- [ ] **Step 3: Commit**

---

### Task 8: 翻译Order.vue和OrderDetail.vue

**Files:**
- Modify: `web-admin/src/views/Order.vue`
- Modify: `web-admin/src/views/OrderDetail.vue`

- [ ] **Step 1: 翻译Order.vue**

- [ ] **Step 2: 翻译OrderDetail.vue**

- [ ] **Step 3: Commit**

---

### Task 9: 翻译Invoice.vue和InvoiceDetail.vue

**Files:**
- Modify: `web-admin/src/views/Invoice.vue`
- Modify: `web-admin/src/views/InvoiceDetail.vue`

- [ ] **Step 1: 翻译Invoice.vue**

- [ ] **Step 2: 翻译InvoiceDetail.vue**

- [ ] **Step 3: Commit**

---

### Task 10: 翻译Report.vue

**Files:**
- Modify: `web-admin/src/views/Report.vue`

- [ ] **Step 1: 翻译报表标题、日期选择器、按钮**

- [ ] **Step 2: Commit**

---

### Task 11: 翻译Staff.vue

**Files:**
- Modify: `web-admin/src/views/Staff.vue`

- [ ] **Step 1: 翻译员工管理页面**

- [ ] **Step 2: Commit**

---

### Task 12: 翻译Logs.vue

**Files:**
- Modify: `web-admin/src/views/Logs.vue`

- [ ] **Step 1: 翻译日志页面**

- [ ] **Step 2: Commit**

---

### Task 13: 翻译Settings.vue

**Files:**
- Modify: `web-admin/src/views/Settings.vue`

- [ ] **Step 1: 翻译系统设置页面**

- [ ] **Step 2: Commit**

---

### Task 14: 构建和部署

**Files:**
- Build: `web-admin/dist`

- [ ] **Step 1: 构建生产版本**

```bash
cd web-admin && npm run build
```

- [ ] **Step 2: 推送到Git**

```bash
git add .
git commit -m "feat: 完成所有视图的三语言翻译"
git push origin master
```

- [ ] **Step 3: 服务器部署**

在服务器执行：
```bash
cd /opt/japan-purchase-sales
git pull origin master
docker-compose -f deploy/docker-compose.prod.yml up -d --build
```

---

## 翻译键命名规范

使用点号分隔的层级结构：
- `{category}.{page}.{element}`
- 例如：`customer.table.username`, `customer.form.password`, `customer.message.deleteSuccess`

### 分类前缀：
- `nav.` - 导航菜单
- `common.` - 通用词汇
- `form.` - 表单相关
- `validation.` - 验证消息
- `messages.` - 提示消息
- `login.` - 登录页
- `dashboard.` - 仪表盘
- `customer.` - 客户管理
- `product.` - 商品管理
- `category.` - 分类管理
- `unit.` - 单位管理
- `order.` - 订单管理
- `invoice.` - 账单管理
- `report.` - 报表统计
- `staff.` - 员工管理
- `logs.` - 操作日志
- `settings.` - 系统设置
