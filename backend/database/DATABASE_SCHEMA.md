# 日本采销管理系统数据库Schema文档

**版本**: 1.1  
**更新日期**: 2026-04-01  
**数据库类型**: PostgreSQL  
**Schema命名规范**: snake_case

---

## 目录

1. [概览](#概览)
2. [命名规范](#命名规范)
3. [表结构详细说明](#表结构详细说明)
4. [索引策略](#索引策略)
5. [外键约束](#外键约束)
6. [已修复的问题](#已修复的问题)
7. [待优化建议](#待优化建议)

---

## 概览

### 数据库统计

| 类型 | 数量 |
|------|------|
| 核心业务表 | 12 |
| 扩展功能表 | 6 |
| 总计 | 18 |
| 外键约束 | 25+ |
| 索引 | 60+ |

### 表分类

#### 核心业务表
- `staff` - 员工表
- `customers` - 客户表
- `products` - 商品表
- `categories` - 商品分类表
- `units` - 商品单位表
- `orders` - 订单表
- `order_items` - 订单明细表
- `invoices` - 請求書表
- `cart_items` - 购物车表
- `operation_logs` - 操作日志表
- `messages` - 消息通知表
- `settings` - 系统设置表

#### 扩展功能表
- `member_levels` - 会员等级表
- `customer_members` - 客户会员关联表
- `points_logs` - 积分记录表
- `inventory_alerts` - 库存预警表
- `inventory_logs` - 库存记录表
- `returns` - 退货申请表

> **说明**：促销与优惠券相关表（`promotions`、`coupons`）已从后端与迁移脚本移除；存量库可执行 `migrations/014-drop-promotions-coupons.sql` 删除残留表。

---

## 命名规范

### 列命名规范

**标准**: 所有列名使用 `snake_case` 格式

| 类型 | 示例 | 说明 |
|------|------|------|
| 主键 | `id` | UUID类型 |
| 外键 | `customer_id`, `product_id` | 关联表名_id |
| 时间戳 | `created_at`, `updated_at`, `deleted_at` | 标准时间戳命名 |
| 布尔值 | `is_active`, `is_system`, `is_cancelled` | is_前缀 |
| 金额 | `purchase_price`, `sale_price`, `total_amount` | 明确含义 |
| 名称 | `name_zh`, `name_ja`, `name_en` | 多语言支持 |

### TypeORM映射规范

```typescript
// 正确示例 ✅
@Column({ name: 'category_id' })
categoryId: string;

@Column({ name: 'sort_order', default: 0 })
sortOrder: number;

@Column({ name: 'is_active', default: true })
isActive: boolean;

// 错误示例 ❌ (未指定name参数)
@Column()
categoryId: string;  // 可能生成 customerId 或 customerid
```

---

## 表结构详细说明

### 1. staff (员工表)

**用途**: 管理后台用户（采购、销售、管理员）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 账号 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希 |
| name | VARCHAR(100) | NOT NULL | 姓名 |
| phone | VARCHAR(20) | NULLABLE | 电话 |
| role | VARCHAR(20) | DEFAULT 'sales', CHECK | 角色：super_admin, admin, procurement, sales |
| is_active | BOOLEAN | DEFAULT true | 是否激活 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | NULLABLE | 软删除时间 |

**索引**:
- `idx_staff_role` - 按角色查询
- `idx_staff_deleted_at` - 软删除查询
- `idx_staff_is_active` - 激活状态查询

---

### 2. customers (客户表)

**用途**: B端客户信息

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 账号 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希 |
| company_name | VARCHAR(200) | NOT NULL | 公司名称 |
| address | TEXT | NOT NULL | 送货地址 |
| contact_person | VARCHAR(100) | NOT NULL | 联系人 |
| phone | VARCHAR(20) | NOT NULL | 联系电话 |
| vip_discount | DECIMAL(5,2) | DEFAULT 0, CHECK (0-100) | VIP折扣率 |
| invoice_name | VARCHAR(200) | NULLABLE | 請求書抬头 |
| invoice_address | TEXT | NULLABLE | 公司地址 |
| invoice_phone | VARCHAR(20) | NULLABLE | 电话 |
| invoice_bank | VARCHAR(200) | NULLABLE | 银行账户 |
| is_active | BOOLEAN | DEFAULT true | 是否激活 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | NULLABLE | 软删除时间 |

**索引**:
- `idx_customers_deleted_at` - 软删除查询
- `idx_customers_is_active` - 激活状态查询
- `idx_customers_company_name` - GIN索引，全文搜索

---

### 3. categories (商品分类表)

**用途**: 商品分类，支持三语（中、日、英）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| name | VARCHAR(100) | NULLABLE | 默认名称 |
| name_zh | VARCHAR(100) | NOT NULL | 中文名称 |
| name_ja | VARCHAR(100) | NOT NULL | 日语名称 |
| name_en | VARCHAR(100) | NOT NULL | 英语名称 |
| sort_order | INTEGER | DEFAULT 0 | 排序 |
| is_system | BOOLEAN | DEFAULT false | 是否系统内置 |
| is_active | BOOLEAN | DEFAULT true | 是否启用 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| deleted_at | TIMESTAMP | NULLABLE | 软删除时间 |

**索引**:
- `idx_categories_sort_order` - 排序查询
- `idx_categories_is_active` - 启用状态查询
- `idx_categories_deleted_at` - 软删除查询

**系统内置分类**:
1. 肉類 (Meat)
2. 卵類 (Eggs)
3. 生鮮野菜 (Fresh Produce)
4. 海鮮 (Seafood)
5. 調味料 (Condiments)
6. 飲料 (Beverages)
7. 穀物油 (Grains & Oils)
8. 日配 (Daily Products)

---

### 4. units (商品单位表)

**用途**: 商品单位管理

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| name | VARCHAR(50) | NOT NULL | 单位名称 |
| sort_order | INTEGER | DEFAULT 0 | 排序 |
| is_active | BOOLEAN | DEFAULT true | 是否启用 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| deleted_at | TIMESTAMP | NULLABLE | 软删除时间 |

**预设单位**: 个、袋、箱、kg、g、本、盒、pack、ケース、枚、セット、瓶、罐、ml、L

---

### 5. products (商品表)

**用途**: 商品信息管理

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| category_id | UUID | FK → categories(id), NULLABLE | 分类ID |
| name | VARCHAR(200) | NOT NULL | 商品名称 |
| quantity | INTEGER | DEFAULT 0, CHECK (>=0) | 库存数量 |
| unit | VARCHAR(20) | NULLABLE | 单位 |
| purchase_price | DECIMAL(10,2) | DEFAULT 0, CHECK (>=0) | 采购价（税拔） |
| sale_price | DECIMAL(10,2) | DEFAULT 0, CHECK (>=0) | 销售价（税拔） |
| photo_url | VARCHAR(500) | NULLABLE | 照片URL |
| description | TEXT | NULLABLE | 说明 |
| status | VARCHAR(20) | DEFAULT 'pending', CHECK | 状态：pending, approved, rejected, active, inactive |
| created_by | UUID | FK → staff(id), NULLABLE | 采集人ID |
| sales_count | INTEGER | DEFAULT 0, CHECK (>=0) | 销售数量 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | NULLABLE | 软删除时间 |

**索引**:
- `idx_products_category_id` - 分类查询
- `idx_products_status` - 状态查询
- `idx_products_created_by` - 创建人查询
- `idx_products_deleted_at` - 软删除查询
- `idx_products_name` - GIN索引，全文搜索
- `idx_products_status_created_at` - 复合索引，商品列表

---

### 6. orders (订单表)

**用途**: 客户订单管理

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| order_no | VARCHAR(50) | UNIQUE, NOT NULL | 订单号 |
| customer_id | UUID | FK → customers(id), NOT NULL | 客户ID |
| subtotal | DECIMAL(12,2) | DEFAULT 0, CHECK (>=0) | 小计（税拔） |
| discount_amount | DECIMAL(12,2) | DEFAULT 0, CHECK (>=0) | VIP折扣金额 |
| tax_amount | DECIMAL(12,2) | DEFAULT 0, CHECK (>=0) | 消费税 |
| total_amount | DECIMAL(12,2) | DEFAULT 0, CHECK (>=0) | 税込合计 |
| status | VARCHAR(20) | DEFAULT 'pending', CHECK | 状态：pending, confirmed, completed, cancelled |
| delivery_address | TEXT | NOT NULL | 配送地址 |
| contact_person | VARCHAR(100) | NOT NULL | 收货人 |
| contact_phone | VARCHAR(20) | NOT NULL | 联系电话 |
| remark | TEXT | NULLABLE | 备注 |
| invoice_id | UUID | FK → invoices(id), NULLABLE | 請求書ID |
| invoiced_at | TIMESTAMP | NULLABLE | 生成請求書时间 |
| cancelled_by | UUID | FK → staff(id), NULLABLE | 取消人ID |
| cancel_reason | TEXT | NULLABLE | 取消原因 |
| cancelled_at | TIMESTAMP | NULLABLE | 取消时间 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| confirmed_at | TIMESTAMP | NULLABLE | 确认时间 |
| completed_at | TIMESTAMP | NULLABLE | 完成时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | NULLABLE | 软删除时间 |

**索引**:
- `idx_orders_customer_id` - 客户查询
- `idx_orders_status` - 状态查询
- `idx_orders_created_at` - 创建时间查询
- `idx_orders_invoice_id` - 請求書查询
- `idx_orders_deleted_at` - 软删除查询
- `idx_orders_status_created_at` - 复合索引，订单列表
- `idx_orders_customer_created_at` - 复合索引，客户订单

---

### 7. order_items (订单明细表)

**用途**: 订单商品明细

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| order_id | UUID | FK → orders(id) ON DELETE CASCADE, NOT NULL | 订单ID |
| product_id | UUID | FK → products(id) ON DELETE SET NULL, NULLABLE | 商品ID |
| product_name | VARCHAR(200) | NOT NULL | 商品名称（冗余） |
| quantity | INTEGER | DEFAULT 1, CHECK (>0) | 数量 |
| unit_price | DECIMAL(10,2) | NOT NULL, CHECK (>=0) | 单价（税拔） |
| discount | DECIMAL(10,2) | DEFAULT 0, CHECK (>=0) | 折扣 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- `idx_order_items_order_id` - 订单查询
- `idx_order_items_product_id` - 商品查询

---

### 8. invoices (請求書表)

**用途**: 合并订单生成的請求書

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| invoice_no | VARCHAR(50) | UNIQUE, NOT NULL | 請求書番号 |
| customer_id | UUID | FK → customers(id), NOT NULL | 客户ID |
| order_ids | UUID[] | NOT NULL | 关联订单ID数组 |
| subtotal | DECIMAL(12,2) | DEFAULT 0, CHECK (>=0) | 小计（税拔） |
| tax_amount | DECIMAL(12,2) | DEFAULT 0, CHECK (>=0) | 消费税 |
| total_amount | DECIMAL(12,2) | DEFAULT 0, CHECK (>=0) | 税込合计 |
| issue_date | DATE | NOT NULL | 开具日期 |
| due_date | DATE | NOT NULL | 到期日期 |
| status | VARCHAR(20) | DEFAULT 'unpaid', CHECK | 状态：unpaid, paid, overdue |
| file_url | VARCHAR(500) | NULLABLE | PDF文件URL |
| paid_at | TIMESTAMP | NULLABLE | 付款日期 |
| is_cancelled | BOOLEAN | DEFAULT false | 是否已撤销 |
| cancelled_at | TIMESTAMP | NULLABLE | 撤销时间 |
| cancelled_by | UUID | FK → staff(id), NULLABLE | 撤销人ID |
| cancel_reason | TEXT | NULLABLE | 撤销原因 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | NULLABLE | 软删除时间 |

**索引**:
- `idx_invoices_customer_id` - 客户查询
- `idx_invoices_status` - 状态查询
- `idx_invoices_due_date` - 到期日期查询
- `idx_invoices_issue_date` - 发行日期查询
- `idx_invoices_is_cancelled` - 撤销状态查询
- `idx_invoices_customer_issue_date` - 复合索引

---

### 9. cart_items (购物车表)

**用途**: 客户购物车

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| customer_id | UUID | FK → customers(id) ON DELETE CASCADE, NOT NULL | 客户ID |
| product_id | UUID | FK → products(id) ON DELETE SET NULL, NULLABLE | 商品ID |
| quantity | INTEGER | DEFAULT 1 | 数量 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**约束**:
- UNIQUE(customer_id, product_id) - 每个客户每个商品只能有一条记录

**索引**:
- `idx_cart_items_customer_id` - 客户查询
- `idx_cart_items_product_id` - 商品查询
- `idx_cart_items_customer_product` - 复合索引

---

### 10. operation_logs (操作日志表)

**用途**: 记录所有系统操作

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| user_id | UUID | FK → staff(id), NULLABLE | 操作用户ID |
| user_role | VARCHAR(20) | NULLABLE | 用户角色 |
| module | VARCHAR(50) | NOT NULL | 模块 |
| action | VARCHAR(50) | NOT NULL | 操作 |
| detail | TEXT | NULLABLE | 详情JSON |
| ip | VARCHAR(50) | NULLABLE | IP地址 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- `idx_operation_logs_user_id` - 用户查询
- `idx_operation_logs_created_at` - 创建时间查询

---

### 11. messages (消息通知表)

**用途**: 系统消息通知

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| user_id | UUID | NOT NULL | 接收用户ID |
| user_type | VARCHAR(20) | NOT NULL, CHECK | 接收用户类型：staff, customer |
| title | VARCHAR(200) | NOT NULL | 标题 |
| content | TEXT | NOT NULL | 内容 |
| type | VARCHAR(20) | DEFAULT 'system', CHECK | 消息类型：order, product, invoice, system |
| is_read | BOOLEAN | DEFAULT false | 是否已读 |
| related_id | UUID | NULLABLE | 关联ID |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- `idx_messages_user` - 用户查询（复合索引）
- `idx_messages_isread` - 已读状态查询

---

### 12. settings (系统设置表)

**用途**: 存储公司信息、消费税、账期等全局设置

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| key | VARCHAR(100) | UNIQUE, NOT NULL | 设置键 |
| value | TEXT | NULLABLE | 设置值 |
| description | VARCHAR(200) | NULLABLE | 说明 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**预设设置**:
- `company_name` - 公司名称
- `company_address` - 公司地址
- `company_phone` - 公司电话
- `company_fax` - 公司传真
- `company_email` - 公司邮箱
- `company_representative` - 负责人
- `company_legal_representative` - 法人代表
- `company_bank` - 银行账户
- `tax_rate` - 消费税率(%)
- `default_payment_days` - 默认账期(天)

---

### 13. member_levels (会员等级表)

**用途**: 会员等级管理

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| name | VARCHAR(50) | NOT NULL | 等级名称 |
| name_en | VARCHAR(20) | NULLABLE | 英文名称 |
| min_points | INTEGER | DEFAULT 0, CHECK (>=0) | 最低积分 |
| discount | FLOAT | DEFAULT 100, CHECK (0-100) | 折扣率 |
| icon | VARCHAR(200) | NULLABLE | 图标 |
| sort_order | INTEGER | DEFAULT 0 | 排序 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- `idx_member_levels_sort_order` - 排序查询
- `idx_member_levels_min_points` - 积分查询

---

### 14. customer_members (客户会员关联表)

**用途**: 客户会员信息

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| customer_id | UUID | FK → customers(id) ON DELETE CASCADE, UNIQUE, NOT NULL | 客户ID |
| level_id | UUID | FK → member_levels(id), NOT NULL | 等级ID |
| points | INTEGER | DEFAULT 0, CHECK (>=0) | 当前积分 |
| total_points | INTEGER | DEFAULT 0, CHECK (>=0) | 累计积分 |
| joined_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 加入时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- `idx_customer_members_customer_id` - 客户查询
- `idx_customer_members_level_id` - 等级查询
- `idx_customer_members_points` - 积分查询

---

### 15. points_logs (积分记录表)

**用途**: 积分变动记录

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| customer_id | UUID | FK → customers(id) ON DELETE CASCADE, NOT NULL | 客户ID |
| type | VARCHAR(20) | NOT NULL, CHECK | 类型：order_earn, order_use, register, referral, expire |
| points | INTEGER | NOT NULL, CHECK (!=0) | 积分变动 |
| related_id | UUID | NULLABLE | 关联ID |
| remark | VARCHAR(200) | NULLABLE | 备注 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- `idx_points_logs_customer_id` - 客户查询
- `idx_points_logs_type` - 类型查询
- `idx_points_logs_created_at` - 创建时间查询
- `idx_points_logs_related_id` - 关联查询

---

### 16. inventory_alerts (库存预警表)

**用途**: 商品库存预警阈值设置

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| product_id | UUID | FK → products(id) ON DELETE CASCADE, NOT NULL | 商品ID |
| min_quantity | INTEGER | NOT NULL, CHECK (>0) | 最低库存 |
| is_active | BOOLEAN | DEFAULT true | 是否启用 |
| is_triggered | BOOLEAN | DEFAULT false | 是否已触发 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- `idx_inventory_alerts_product_id` - 商品查询
- `idx_inventory_alerts_is_active` - 启用状态查询
- `idx_inventory_alerts_is_triggered` - 触发状态查询

---

### 17. inventory_logs (库存记录表)

**用途**: 商品库存变动记录

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| product_id | UUID | FK → products(id) ON DELETE CASCADE, NOT NULL | 商品ID |
| type | VARCHAR(20) | NOT NULL, CHECK | 类型：in, out, adjust, return |
| quantity | INTEGER | NOT NULL, CHECK (!=0) | 变动数量 |
| before_quantity | INTEGER | NOT NULL | 变动前数量 |
| after_quantity | INTEGER | NOT NULL | 变动后数量 |
| operator_id | UUID | FK → staff(id), NOT NULL | 操作人ID |
| remark | TEXT | NULLABLE | 备注 |
| related_id | UUID | NULLABLE | 关联ID |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- `idx_inventory_logs_product_id` - 商品查询
- `idx_inventory_logs_type` - 类型查询
- `idx_inventory_logs_created_at` - 创建时间查询
- `idx_inventory_logs_operator_id` - 操作人查询
- `idx_inventory_logs_related_id` - 关联查询

---

### 18. returns (退货申请表)

**用途**: 退货申请管理

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 主键 |
| order_id | UUID | FK → orders(id) ON DELETE CASCADE, NOT NULL | 订单ID |
| order_item_id | UUID | FK → order_items(id) ON DELETE SET NULL, NULLABLE | 订单明细ID |
| reason | TEXT | NOT NULL | 退货原因 |
| status | VARCHAR(20) | DEFAULT 'pending', CHECK | 状态：pending, approved, rejected, completed |
| amount | FLOAT | NOT NULL, CHECK (>0) | 退款金额 |
| approved_by | UUID | FK → staff(id), NULLABLE | 审批人ID |
| reject_reason | TEXT | NULLABLE | 拒绝原因 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| processed_at | TIMESTAMP | NULLABLE | 处理时间 |

**索引**:
- `idx_returns_order_id` - 订单查询
- `idx_returns_order_item_id` - 订单明细查询
- `idx_returns_status` - 状态查询
- `idx_returns_created_at` - 创建时间查询
- `idx_returns_approved_by` - 审批人查询

---

## 索引策略

### 索引类型

| 类型 | 用途 | 示例 |
|------|------|------|
| B-tree | 等值查询、范围查询 | `idx_orders_status` |
| 复合索引 | 多列查询优化 | `idx_orders_status_created_at` |
| 部分索引 | 条件过滤优化 | `idx_products_status WHERE deleted_at IS NULL` |
| GIN索引 | 全文搜索 | `idx_products_name USING gin(to_tsvector('simple', name))` |

### 索引命名规范

- 单列索引: `idx_{table}_{column}`
- 复合索引: `idx_{table}_{col1}_{col2}`
- 外键索引: `idx_{table}_{fk_column}`
- 特殊索引: `idx_{table}_{purpose}`

---

## 外键约束

### 级联删除策略

| 策略 | 用途 | 示例 |
|------|------|------|
| CASCADE | 级联删除 | order_items → orders |
| SET NULL | 设置为NULL | order_items.product_id → products |
| RESTRICT | 限制删除 | 默认行为 |

### 外键命名规范

- 格式: `fk_{table}_{column}`

---

## 已修复的问题

### Migration 013 修复内容

#### 1. 列命名标准化
- ✅ 所有entity文件已使用snake_case列名（通过name参数指定）
- ✅ 添加了缺失的列：`products.sales_count`, `categories.name`, `categories.deleted_at`, `units.deleted_at`

#### 2. 缺失的表
- ✅ 创建 `member_levels` 表
- ✅ 创建 `customer_members` 表
- ✅ 创建 `points_logs` 表
- ✅ 创建 `inventory_alerts` 表
- ✅ 创建 `inventory_logs` 表
- ✅ 创建 `returns` 表
- ✅ 已移除 `promotions`、`coupons` 表（见迁移 `014-drop-promotions-coupons.sql`）

#### 3. 缺失的外键约束
- ✅ `order_items.product_id` → `products.id`
- ✅ `inventory_alerts.product_id` → `products.id`
- ✅ `inventory_logs.product_id` → `products.id`
- ✅ `inventory_logs.operator_id` → `staff.id`
- ✅ `customer_members.customer_id` → `customers.id`
- ✅ `customer_members.level_id` → `member_levels.id`
- ✅ `points_logs.customer_id` → `customers.id`
- ✅ `returns.order_id` → `orders.id`
- ✅ `returns.order_item_id` → `order_items.id`
- ✅ `returns.approved_by` → `staff.id`

#### 4. 缺失的索引
- ✅ 所有新表的主键索引
- ✅ 外键索引
- ✅ 业务查询索引
- ✅ 复合索引优化

#### 5. 缺失的CHECK约束
- ✅ 非负金额约束
- ✅ 非负数量约束
- ✅ 范围约束（如vip_discount: 0-100）
- ✅ 枚举值约束

#### 6. 缺失的NOT NULL约束
- ✅ `order_items.product_name`
- ✅ `order_items.unit_price`

---

## 待优化建议

### 1. Entity文件优化

**问题**: 部分entity未显式指定snake_case列名

**建议**: 为所有entity添加明确的name参数

```typescript
// 需要修复的entity:
// - inventory_alert.entity.ts
// - inventory_log.entity.ts
// - member_level.entity.ts
// - customer_member.entity.ts
// - points_log.entity.ts
// - return.entity.ts
```

### 2. 数据库性能优化

**建议**:
- 定期执行 `ANALYZE` 更新统计信息
- 监控慢查询日志
- 考虑分区表（订单表、库存日志表）

### 3. 数据完整性优化

**建议**:
- 添加触发器自动更新 `updated_at` 字段
- 添加触发器验证业务规则（如订单金额计算）
- 考虑添加唯一约束防止重复数据

### 4. 安全性优化

**建议**:
- 敏感字段加密（如密码哈希）
- 添加行级安全策略（RLS）
- 审计日志完善

### 5. 扩展功能建议

**建议添加**:
- 商品图片表（支持多图）
- 商品规格表（SKU管理）
- 供应商表
- 采购单表
- 库存盘点表
- 价格历史表

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2026-04-01 | 初始版本，完成Schema标准化 |

---

**文档维护者**: 数据库专家团队  
**最后更新**: 2026-04-01
