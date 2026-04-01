-- 性能优化索引迁移脚本
-- 解决API超时问题
-- 运行方式: psql -U postgres -d japan_purchase_sales -f 003_fix_performance_indexes.sql

-- ============================================
-- 1. 订单表性能优化索引
-- ============================================

-- 订单状态索引（用于状态筛选）
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status) WHERE deleted_at IS NULL;

-- 订单客户ID索引（用于客户订单查询）
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id) WHERE deleted_at IS NULL;

-- 订单创建时间索引（用于时间范围查询和排序）
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC) WHERE deleted_at IS NULL;

-- 订单发票ID索引（用于查询已开票订单）
CREATE INDEX IF NOT EXISTS idx_orders_invoice_id ON orders(invoice_id) WHERE invoice_id IS NOT NULL;

-- 复合索引：状态+创建时间（用于订单列表查询）
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC) WHERE deleted_at IS NULL;

-- 复合索引：客户+创建时间（用于客户订单列表）
CREATE INDEX IF NOT EXISTS idx_orders_customer_created_at ON orders(customer_id, created_at DESC) WHERE deleted_at IS NULL;

-- ============================================
-- 2. 订单明细表性能优化索引
-- ============================================

-- 订单ID索引（用于关联查询）
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 商品ID索引（用于商品销售统计）
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- 3. 请求书表性能优化索引
-- ============================================

-- 请求书客户ID索引
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);

-- 请求书状态索引
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- 请求书发行日期索引（用于时间范围查询）
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date DESC);

-- 请求书取消状态索引
CREATE INDEX IF NOT EXISTS idx_invoices_is_cancelled ON invoices(is_cancelled) WHERE is_cancelled = FALSE;

-- 复合索引：客户+发行日期
CREATE INDEX IF NOT EXISTS idx_invoices_customer_issue_date ON invoices(customer_id, issue_date DESC);

-- ============================================
-- 4. 商品表性能优化索引
-- ============================================

-- 商品状态索引（用于状态筛选）
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status) WHERE deleted_at IS NULL;

-- 商品分类ID索引
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id) WHERE deleted_at IS NULL;

-- 商品创建者索引（用于采购员查看自己的商品）
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by) WHERE deleted_at IS NULL;

-- 商品名称索引（用于搜索）
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('simple', name));

-- 复合索引：状态+创建时间（用于商品列表）
CREATE INDEX IF NOT EXISTS idx_products_status_created_at ON products(status, created_at DESC) WHERE deleted_at IS NULL;

-- ============================================
-- 5. 客户表性能优化索引
-- ============================================

-- 客户激活状态索引
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active) WHERE deleted_at IS NULL;

-- 客户公司名称索引（用于搜索）
CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers USING gin(to_tsvector('simple', company_name));

-- ============================================
-- 6. 分类表性能优化索引
-- ============================================

-- 分类排序索引
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- 分类激活状态索引
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active) WHERE is_active = TRUE;

-- ============================================
-- 7. 库存日志表性能优化索引
-- ============================================

-- 商品ID索引
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON inventory_logs(product_id);

-- 类型索引
CREATE INDEX IF NOT EXISTS idx_inventory_logs_type ON inventory_logs(type);

-- 创建时间索引
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at DESC);

-- 关联ID索引（订单ID或请求书ID）
CREATE INDEX IF NOT EXISTS idx_inventory_logs_related_id ON inventory_logs(related_id);

-- ============================================
-- 8. 购物车表性能优化索引
-- ============================================

-- 客户ID索引
CREATE INDEX IF NOT EXISTS idx_cart_items_customer_id ON cart_items(customer_id);

-- 商品ID索引
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- 复合索引：客户+商品（用于检查是否已在购物车）
CREATE INDEX IF NOT EXISTS idx_cart_items_customer_product ON cart_items(customer_id, product_id);

-- ============================================
-- 9. 系统设置表性能优化索引
-- ============================================

-- 设置键索引
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- ============================================
-- 10. 员工表性能优化索引
-- ============================================

-- 员工激活状态索引
CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active) WHERE deleted_at IS NULL;

-- 员工角色索引
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role) WHERE deleted_at IS NULL;

-- ============================================
-- 分析和优化表
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

-- 打印完成信息
SELECT 'Performance indexes created successfully!' AS status;
