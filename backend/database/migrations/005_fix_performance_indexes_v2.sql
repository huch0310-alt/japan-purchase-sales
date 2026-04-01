-- 性能优化索引迁移脚本（修正版 - 解决列名不一致问题)
-- 运行方式: psql -U postgres -d japan_purchase_sales -f 005_fix_performance_indexes_v2.sql

-- ============================================
-- 1. 订单表性能优化索引
-- ============================================

-- 订单表索引（用于状态筛选)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 订单客户ID索引（用于客户订单查询)
create index if not exists idx_orders_customer_id on orders(customer_id);

-- 订单创建时间索引(用于时间范围查询和排序)
create index if not exists idx_orders_created_at on orders(created_at DESC);

-- 订单发票ID索引(用于查询已开票订单)
create index if not exists idx_orders_invoice_id on orders(invoice_id) WHERE invoice_id IS NOT NULL;

-- 复合索引:状态+创建时间(用于订单列表查询)
create index if not exists idx_orders_status_created_at ON orders(status, created_at DESC);

-- 订单客户+创建时间索引(用于客户订单列表)
create index if not exists idx_orders_customer_created_at on orders(customer_id, created_at DESC);

-- ============================================
-- 2. 订单明细表性能优化索引
-- ============================================

-- 订单ID索引(用于关联查询)
create index if not exists idx_order_items_order_id on order_items(order_id);

-- 商品ID索引(用于商品销售统计)
create index if not exists idx_order_items_product_id on order_items(product_id);

-- ============================================
-- 3. 请求书表性能优化索引
-- ============================================

-- 请求书客户ID索引
create index if not exists idx_invoices_customer_id on invoices(customer_id);

-- 请求书状态索引
create index if not exists idx_invoices_status on invoices(status);

-- 请求书发行日期索引(用于时间范围查询)
create index if not exists idx_invoices_issue_date on invoices(issue_date DESC);

-- 请求书取消状态索引
create index if not exists idx_invoices_is_cancelled on invoices(is_cancelled) WHERE is_cancelled = FALSE;

-- 复合索引:客户+发行日期
create index if not exists idx_invoices_customer_issue_date on invoices(customer_id, issue_date DESC);

-- ============================================
-- 4. 商品表性能优化索引
-- ============================================

-- 商品状态索引(用于状态筛选)
create index if not exists idx_products_status on products(status);

-- 商品分类ID索引
create index if not exists idx_products_category_id on products(category_id);

-- 商品创建者索引(用于采购员查看自己的商品)
create index if not exists idx_products_created_by on products(created_by);

-- 商品名称索引(用于搜索)
create index if not exists idx_products_name ON products USING gin(to_tsvector('simple', name));

-- 复合索引:状态+创建时间(用于商品列表)
create index if not exists idx_products_status_created_at on products(status, created_at DESC);

-- ============================================
-- 5. 客户表性能优化索引
-- ============================================

-- 客户激活状态索引
create index if not exists idx_customers_is_active on customers(is_active);

-- 客户公司名称索引(用于搜索)
create index if not exists idx_customers_company_name on customers using gin(to_tsvector('simple', company_name));

-- ============================================
-- 6. 分类表性能优化索引
-- ============================================

-- 分类排序索引
create index if not exists idx_categories_sort_order on categories(sort_order);

-- 分类激活状态索引
create index if not exists idx_categories_is_active on categories(is_active) WHERE is_active = true;

-- ============================================
-- 7. 库存日志表性能优化索引
-- ============================================

-- 商品ID索引
create index if not exists idx_inventory_logs_product_id on inventory_logs(product_id);

-- 类型索引
create index if not exists idx_inventory_logs_type on inventory_logs(type);

-- 创建时间索引
create index if not exists idx_inventory_logs_created_at on inventory_logs(created_at DESC);

-- 关联ID索引(用于订单ID或请求书ID)
create index if not exists idx_inventory_logs_related_id on inventory_logs(related_id);

-- ============================================
-- 8. 购物车表性能优化索引
-- ============================================

-- 客户ID索引
create index if not exists idx_cart_items_customer_id on cart_items(customer_id);
-- 商品ID索引
create index if not exists idx_cart_items_product_id on cart_items(product_id);
-- 复合索引:客户+商品(用于检查是否已在购物车)
create index if not exists idx_cart_items_customer_product on cart_items(customer_id, product_id);

-- ============================================
-- 9. 系统设置表性能优化索引
-- ============================================

-- 设置键索引
create index if not exists idx_settings_key on settings(key);

-- ============================================
-- 10. 员工表性能优化索引
-- ============================================

-- 忘工激活状态索引
create index if not exists idx_staff_is_active on staff(is_active);
-- 员工角色索引
create index if not exists idx_staff_role on staff(role);

-- ============================================
-- 11. 分析和优化表
-- ============================================

-- 更新统计信息
ANALYZE orders;
ANALYZE order_items;
ANALYZE invoices;
ANALYZE products;
ANALYZE customers;
ANALYZE categories;
ANALYZE inventory_logs;
ANALYZE cart_items;
ANALYZE settings;
ANALYZE staff;

