# Web Admin UI 重新设计规范

> **Goal:** 将日本采销管理系统 Web Admin 打造成现代科技商务风格，同时修正日元计价单位显示

**Architecture:** 基于 Element Plus 组件库，通过全局样式覆盖和局部样式调整实现科技商务风视觉升级，所有金额显示取整到日元最小单位

**Tech Stack:** Vue3 + Element Plus + CSS Variables

---

## 1. 设计语言

### 1.1 色彩系统

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-primary` | `#409EFF` | 主色/按钮/链接 |
| `--color-primary-hover` | `#53a8ff` | 主色 hover |
| `--color-accent` | `#00d9ff` | 科技感强调色 |
| `--color-sidebar-bg` | `#1a1a2e` | 侧边栏背景 |
| `--color-sidebar-active` | `#16213e` | 侧边栏激活项背景 |
| `--color-sidebar-text` | `#bfcbd9` | 侧边栏文字 |
| `--color-sidebar-active-text` | `#ffffff` | 侧边栏激活文字 |
| `--color-bg-page` | `#f0f2f5` | 页面背景 |
| `--color-bg-card` | `#ffffff` | 卡片背景 |
| `--color-success` | `#52c41a` | 成功状态 |
| `--color-warning` | `#faad14` | 警告状态 |
| `--color-danger` | `#ff4d4f` | 危险/重点金额 |
| `--color-text-primary` | `#303133` | 主文字 |
| `--color-text-secondary` | `#909399` | 次要文字 |
| `--color-border` | `#ebeef5` | 边框色 |

### 1.2 圆角系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | `4px` | 小标签/小按钮 |
| `--radius-md` | `8px` | 输入框/下拉框 |
| `--radius-lg` | `12px` | 卡片/对话框 |
| `--radius-xl` | `16px` | 大容器 |

### 1.3 阴影系统

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
--shadow-hover: 0 8px 24px rgba(64, 158, 255, 0.15);
```

### 1.4 字体

- 主字体：`'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif`
- 数字字体：`'DIN Alternate', 'Roboto', sans-serif`（用于金额显示）

---

## 2. 组件样式规范

### 2.1 侧边栏 (Layout.vue)

```vue
<style>
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
</style>
```

### 2.2 卡片 (el-card)

```css
.el-card {
  border-radius: var(--radius-lg);
  border: none;
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.el-card:hover {
  box-shadow: var(--shadow-hover);
}

.el-card__header {
  border-bottom: 1px solid var(--color-border);
  padding: 16px 20px;
  font-weight: 600;
  color: var(--color-text-primary);
}
```

### 2.3 按钮

```css
.el-button--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  border: none;
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.el-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.el-button {
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}
```

### 2.4 表格

```css
.el-table th {
  background-color: #fafafa !important;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.el-table tr:hover > td {
  background-color: #f5f7fa !important;
}

.el-table td {
  border-bottom: 1px solid var(--color-border);
}
```

### 2.5 统计卡片 (Dashboard)

```css
.stat-card {
  display: flex;
  align-items: center;
  padding: 8px 0;
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
```

### 2.6 表单输入

```css
.el-input__wrapper {
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 1px var(--color-border);
}

.el-input__wrapper:hover {
  box-shadow: 0 0 0 1px var(--color-primary);
}

.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--color-primary), 0 0 0 3px rgba(64, 158, 255, 0.1);
}
```

### 2.7 标签 (el-tag)

```css
.el-tag {
  border-radius: var(--radius-sm);
  border: none;
  padding: 0 10px;
  height: 24px;
  line-height: 24px;
  font-weight: 500;
}
```

---

## 3. 金额格式化规范

### 3.1 核心原则

**日元最小单位是"円"（元），所有金额只显示整数，不显示小数**

### 3.2 格式化函数

在 `src/utils/format.js` 中新增/修改函数：

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

/**
 * 日元金额格式化（带日元符号前缀）
 * @param {number|string} amount - 金额
 * @returns {string} 格式化的金额，如 "¥1,234"
 */
export const formatJPY = (amount) => {
  return formatCurrency(amount)
}
```

### 3.3 需要修改的视图文件

| 文件 | 修改内容 |
|------|----------|
| `Dashboard.vue` | `stats.todaySales`、热销产品金额 |
| `Product.vue` | purchasePrice、salePrice |
| `ProductDetail.vue` | 采购价、销售价 |
| `Order.vue` | totalAmount、subtotal、discountAmount、taxAmount |
| `OrderDetail.vue` | 所有金额字段 |
| `Invoice.vue` | subtotal、taxAmount、totalAmount |
| `InvoiceDetail.vue` | 所有金额字段 |
| `Customer.vue` | vipDiscount 显示 |
| `CustomerDetail.vue` | 订单统计金额 |
| `Report.vue` | 所有统计图表金额、合计金额 |

### 3.4 修改示例

**Before:**
```vue
¥{{ row.totalAmount }}
¥{{ Number(row.subtotal || 0).toLocaleString() }}
```

**After:**
```vue
{{ formatCurrency(row.totalAmount) }}
{{ formatCurrency(row.subtotal) }}
```

---

## 4. 页面结构规范

### 4.1 页面容器

```css
.page-container {
  padding: 20px;
  background-color: var(--color-bg-page);
  min-height: calc(100vh - 60px);
}
```

### 4.2 卡片间距

- 同一行卡片间距：20px (el-row :gutter="20")
- 上下行卡片间距：20px (margin-top: 20px)

### 4.3 响应式策略

- 保持当前响应式断点
- 侧边栏固定宽度 200px
- 内容区自适应

---

## 5. 动画规范

| 场景 | 动画 |
|------|------|
| 卡片 hover | `transform: translateY(-2px); box-shadow增强; transition: 0.3s` |
| 按钮 hover | `transform: translateY(-1px); box-shadow增强; transition: 0.3s` |
| 页面切换 | 无特殊动画，保持 Vue 默认 |
| 下拉展开 | Element Plus 默认动画 |

---

## 6. 需要修改的文件清单

### 6.1 样式文件

- `src/assets/styles/main.css` - 全局样式变量和覆盖
- `src/App.vue` - 全局字体设置

### 6.2 布局文件

- `src/views/Layout.vue` - 侧边栏样式
- `src/views/Login.vue` - 登录页样式

### 6.3 视图文件（金额格式化）

- `src/views/Dashboard.vue`
- `src/views/Product.vue`
- `src/views/ProductDetail.vue`
- `src/views/Order.vue`
- `src/views/OrderDetail.vue`
- `src/views/Invoice.vue`
- `src/views/InvoiceDetail.vue`
- `src/views/Customer.vue`
- `src/views/CustomerDetail.vue`
- `src/views/Report.vue`

### 6.4 工具函数

- `src/utils/format.js` - 新增 `formatCurrency` 函数

---

## 7. 实施检查清单

- [ ] 更新 `main.css` 全局样式变量
- [ ] 更新 `App.vue` 字体设置
- [ ] 更新 `Layout.vue` 侧边栏样式
- [ ] 更新 `Login.vue` 登录页样式
- [ ] 添加 `formatCurrency` 到 `format.js`
- [ ] 更新 Dashboard.vue 金额显示
- [ ] 更新 Product.vue 金额显示
- [ ] 更新 ProductDetail.vue 金额显示
- [ ] 更新 Order.vue 金额显示
- [ ] 更新 OrderDetail.vue 金额显示
- [ ] 更新 Invoice.vue 金额显示
- [ ] 更新 InvoiceDetail.vue 金额显示
- [ ] 更新 Customer.vue VIP折扣显示
- [ ] 更新 CustomerDetail.vue 金额显示
- [ ] 更新 Report.vue 金额显示
- [ ] 构建并部署
