-- 数据库Schema标准化迁移回滚脚本
-- 版本: 013-rollback
-- 日期: 2026-04-01
-- 目的: 回滚013-standardize-schema.sql的所有更改
-- 运行方式: psql -U postgres -d japan_purchase_sales -f 013-standardize-schema-rollback.sql
-- 警告: 此脚本会删除表和数据，请谨慎使用！

-- ============================================
-- 第一部分：删除CHECK约束
-- ============================================

-- 1. products 表
ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_purchase_price;
ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_sale_price;
ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_quantity;
ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_sales_count;

-- 2. orders 表
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_subtotal;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_discount_amount;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_tax_amount;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_total_amount;

-- 3. order_items 表
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS chk_order_items_quantity;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS chk_order_items_unit_price;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS chk_order_items_discount;

-- 4. invoices 表
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoices_subtotal;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoices_tax_amount;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoices_total_amount;

-- 5. customers 表
ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_customers_vip_discount;

-- 6. member_levels 表
ALTER TABLE member_levels DROP CONSTRAINT IF EXISTS chk_member_levels_min_points;
ALTER TABLE member_levels DROP CONSTRAINT IF EXISTS chk_member_levels_discount;

-- 7. customer_members 表
ALTER TABLE customer_members DROP CONSTRAINT IF EXISTS chk_customer_members_points;
ALTER TABLE customer_members DROP CONSTRAINT IF EXISTS chk_customer_members_total_points;

-- 8. points_logs 表
ALTER TABLE points_logs DROP CONSTRAINT IF EXISTS chk_points_logs_points;

-- 9. inventory_alerts 表
ALTER TABLE inventory_alerts DROP CONSTRAINT IF EXISTS chk_inventory_alerts_min_quantity;

-- 10. inventory_logs 表
ALTER TABLE inventory_logs DROP CONSTRAINT IF EXISTS chk_inventory_logs_quantity;

-- 11. returns 表
ALTER TABLE returns DROP CONSTRAINT IF EXISTS chk_returns_amount;

-- ============================================
-- 第二部分：删除NOT NULL约束
-- ============================================

-- 1. order_items 表
ALTER TABLE order_items ALTER COLUMN product_name DROP NOT NULL;
ALTER TABLE order_items ALTER COLUMN unit_price DROP NOT NULL;

-- ============================================
-- 第三部分：删除外键约束
-- ============================================

-- 1. order_items 表
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS fk_order_items_product_id;

-- 2. inventory_alerts 表
ALTER TABLE inventory_alerts DROP CONSTRAINT IF EXISTS fk_inventory_alerts_product_id;

-- 3. inventory_logs 表
ALTER TABLE inventory_logs DROP CONSTRAINT IF EXISTS fk_inventory_logs_product_id;
ALTER TABLE inventory_logs DROP CONSTRAINT IF EXISTS fk_inventory_logs_operator_id;

-- 4. customer_members 表
ALTER TABLE customer_members DROP CONSTRAINT IF EXISTS fk_customer_members_customer_id;
ALTER TABLE customer_members DROP CONSTRAINT IF EXISTS fk_customer_members_level_id;

-- 5. points_logs 表
ALTER TABLE points_logs DROP CONSTRAINT IF EXISTS fk_points_logs_customer_id;

-- 6. returns 表
ALTER TABLE returns DROP CONSTRAINT IF EXISTS fk_returns_order_id;
ALTER TABLE returns DROP CONSTRAINT IF EXISTS fk_returns_order_item_id;
ALTER TABLE returns DROP CONSTRAINT IF EXISTS fk_returns_approved_by;

-- ============================================
-- 第四部分：删除索引
-- ============================================

-- 1. member_levels 表索引
DROP INDEX IF EXISTS idx_member_levels_sort_order;
DROP INDEX IF EXISTS idx_member_levels_min_points;

-- 2. customer_members 表索引
DROP INDEX IF EXISTS idx_customer_members_customer_id;
DROP INDEX IF EXISTS idx_customer_members_level_id;
DROP INDEX IF EXISTS idx_customer_members_points;

-- 3. points_logs 表索引
DROP INDEX IF EXISTS idx_points_logs_customer_id;
DROP INDEX IF EXISTS idx_points_logs_type;
DROP INDEX IF EXISTS idx_points_logs_created_at;
DROP INDEX IF EXISTS idx_points_logs_related_id;

-- 4. inventory_alerts 表索引
DROP INDEX IF EXISTS idx_inventory_alerts_product_id;
DROP INDEX IF EXISTS idx_inventory_alerts_is_active;
DROP INDEX IF EXISTS idx_inventory_alerts_is_triggered;

-- 5. inventory_logs 表索引
DROP INDEX IF EXISTS idx_inventory_logs_product_id;
DROP INDEX IF EXISTS idx_inventory_logs_type;
DROP INDEX IF EXISTS idx_inventory_logs_created_at;
DROP INDEX IF EXISTS idx_inventory_logs_operator_id;
DROP INDEX IF EXISTS idx_inventory_logs_related_id;

-- 6. returns 表索引
DROP INDEX IF EXISTS idx_returns_order_id;
DROP INDEX IF EXISTS idx_returns_order_item_id;
DROP INDEX IF EXISTS idx_returns_status;
DROP INDEX IF EXISTS idx_returns_created_at;
DROP INDEX IF EXISTS idx_returns_approved_by;

-- 9. categories 表索引
DROP INDEX IF EXISTS idx_categories_deleted_at;

-- ============================================
-- 第五部分：删除添加的列
-- ============================================

-- 1. products 表
ALTER TABLE products DROP COLUMN IF EXISTS sales_count;

-- 2. categories 表
ALTER TABLE categories DROP COLUMN IF EXISTS name;
ALTER TABLE categories DROP COLUMN IF EXISTS deleted_at;

-- 3. units 表
ALTER TABLE units DROP COLUMN IF EXISTS deleted_at;

-- ============================================
-- 第六部分：删除新创建的表
-- ============================================

-- 警告：以下操作会永久删除数据！

-- 1. 退货申请表（依赖订单明细和订单）
DROP TABLE IF EXISTS returns CASCADE;

-- 2. 库存记录表（依赖商品和员工）
DROP TABLE IF EXISTS inventory_logs CASCADE;

-- 3. 库存预警表（依赖商品）
DROP TABLE IF EXISTS inventory_alerts CASCADE;

-- 4. 积分记录表（依赖客户）
DROP TABLE IF EXISTS points_logs CASCADE;

-- 5. 客户会员关联表（依赖客户和会员等级）
DROP TABLE IF EXISTS customer_members CASCADE;

-- 6. 会员等级表
DROP TABLE IF EXISTS member_levels CASCADE;

-- ============================================
-- 第七部分：验证回滚结果
-- ============================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    -- 验证表是否已删除
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('member_levels', 'customer_members', 'points_logs', 
                        'inventory_alerts', 'inventory_logs', 'returns');
    
    IF table_count > 0 THEN
        RAISE WARNING '部分表可能未删除成功，预期0个表，实际剩余 % 个', table_count;
    ELSE
        RAISE NOTICE '所有表已成功删除';
    END IF;
    
    -- 验证 products.sales_count 列是否已删除
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'sales_count'
    ) THEN
        RAISE WARNING 'products.sales_count 列未删除成功';
    END IF;
    
    RAISE NOTICE '数据库Schema标准化回滚完成！';
END $$;

-- 打印完成信息
SELECT 'Schema standardization rollback completed successfully!' AS status;
