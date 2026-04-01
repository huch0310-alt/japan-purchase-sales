-- 数据库Schema标准化迁移脚本
-- 版本: 013
-- 日期: 2026-04-01
-- 目的: 统一列命名规范（snake_case）、添加缺失约束和索引
-- 运行方式: psql -U postgres -d japan_purchase_sales -f 013-standardize-schema.sql

-- ============================================
-- 第一部分：创建缺失的表（如果不存在）
-- ============================================

-- 1. 会员等级表
CREATE TABLE IF NOT EXISTS member_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    name_en VARCHAR(20),
    min_points INTEGER DEFAULT 0,
    discount FLOAT DEFAULT 100,
    icon VARCHAR(200),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 客户会员关联表
CREATE TABLE IF NOT EXISTS customer_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES member_levels(id),
    points INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id)
);

-- 3. 积分记录表
CREATE TABLE IF NOT EXISTS points_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('order_earn', 'order_use', 'register', 'referral', 'expire')),
    points INTEGER NOT NULL,
    related_id UUID,
    remark VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 库存预警表
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_triggered BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 库存记录表
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjust', 'return')),
    quantity INTEGER NOT NULL,
    before_quantity INTEGER NOT NULL,
    after_quantity INTEGER NOT NULL,
    operator_id UUID NOT NULL REFERENCES staff(id),
    remark TEXT,
    related_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 退货申请表
CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    amount FLOAT NOT NULL,
    approved_by UUID REFERENCES staff(id),
    reject_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- ============================================
-- 第二部分：列命名标准化（添加snake_case列）
-- ============================================

-- 注意：TypeORM会自动将camelCase转换为snake_case
-- 但为了数据库一致性，我们确保所有列都是snake_case格式
-- 以下操作主要是验证和添加缺失的列

-- 1. 检查并添加 products 表的 sales_count 列
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

-- 2. 检查并添加 categories 表的缺失列
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 3. 确保 units 表有 deleted_at
ALTER TABLE units ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- ============================================
-- 第三部分：添加缺失的外键约束
-- ============================================

-- 注意：以下约束只在不存在时添加
-- 由于可能已有数据，使用 NOT VALID 避免验证现有数据

-- 1. order_items 表
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_order_items_product_id' 
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE order_items 
        ADD CONSTRAINT fk_order_items_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL 
        NOT VALID;
    END IF;
END $$;

-- 2. inventory_alerts 表
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_inventory_alerts_product_id' 
        AND table_name = 'inventory_alerts'
    ) THEN
        ALTER TABLE inventory_alerts 
        ADD CONSTRAINT fk_inventory_alerts_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE 
        NOT VALID;
    END IF;
END $$;

-- 3. inventory_logs 表
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_inventory_logs_product_id' 
        AND table_name = 'inventory_logs'
    ) THEN
        ALTER TABLE inventory_logs 
        ADD CONSTRAINT fk_inventory_logs_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE 
        NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_inventory_logs_operator_id' 
        AND table_name = 'inventory_logs'
    ) THEN
        ALTER TABLE inventory_logs 
        ADD CONSTRAINT fk_inventory_logs_operator_id 
        FOREIGN KEY (operator_id) REFERENCES staff(id) 
        NOT VALID;
    END IF;
END $$;

-- 4. customer_members 表
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customer_members_customer_id' 
        AND table_name = 'customer_members'
    ) THEN
        ALTER TABLE customer_members 
        ADD CONSTRAINT fk_customer_members_customer_id 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE 
        NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customer_members_level_id' 
        AND table_name = 'customer_members'
    ) THEN
        ALTER TABLE customer_members 
        ADD CONSTRAINT fk_customer_members_level_id 
        FOREIGN KEY (level_id) REFERENCES member_levels(id) 
        NOT VALID;
    END IF;
END $$;

-- 5. points_logs 表
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_points_logs_customer_id' 
        AND table_name = 'points_logs'
    ) THEN
        ALTER TABLE points_logs 
        ADD CONSTRAINT fk_points_logs_customer_id 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE 
        NOT VALID;
    END IF;
END $$;

-- 6. returns 表
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_returns_order_id' 
        AND table_name = 'returns'
    ) THEN
        ALTER TABLE returns 
        ADD CONSTRAINT fk_returns_order_id 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE 
        NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_returns_order_item_id' 
        AND table_name = 'returns'
    ) THEN
        ALTER TABLE returns 
        ADD CONSTRAINT fk_returns_order_item_id 
        FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL 
        NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_returns_approved_by' 
        AND table_name = 'returns'
    ) THEN
        ALTER TABLE returns 
        ADD CONSTRAINT fk_returns_approved_by 
        FOREIGN KEY (approved_by) REFERENCES staff(id) 
        NOT VALID;
    END IF;
END $$;

-- ============================================
-- 第四部分：添加缺失的索引
-- ============================================

-- 1. member_levels 表索引
CREATE INDEX IF NOT EXISTS idx_member_levels_sort_order ON member_levels(sort_order);
CREATE INDEX IF NOT EXISTS idx_member_levels_min_points ON member_levels(min_points);

-- 2. customer_members 表索引
CREATE INDEX IF NOT EXISTS idx_customer_members_customer_id ON customer_members(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_members_level_id ON customer_members(level_id);
CREATE INDEX IF NOT EXISTS idx_customer_members_points ON customer_members(points);

-- 3. points_logs 表索引
CREATE INDEX IF NOT EXISTS idx_points_logs_customer_id ON points_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_points_logs_type ON points_logs(type);
CREATE INDEX IF NOT EXISTS idx_points_logs_created_at ON points_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_logs_related_id ON points_logs(related_id);

-- 4. inventory_alerts 表索引
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_is_active ON inventory_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_is_triggered ON inventory_alerts(is_triggered) WHERE is_triggered = true;

-- 5. inventory_logs 表索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_type ON inventory_logs(type);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_operator_id ON inventory_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_related_id ON inventory_logs(related_id);

-- 6. returns 表索引
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_order_item_id ON returns(order_item_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_created_at ON returns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_returns_approved_by ON returns(approved_by);

-- 9. 补充 categories 表索引
CREATE INDEX IF NOT EXISTS idx_categories_deleted_at ON categories(deleted_at);

-- ============================================
-- 第五部分：添加缺失的CHECK约束
-- ============================================

-- 1. products 表 - 确保价格为非负
ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_purchase_price;
ALTER TABLE products ADD CONSTRAINT chk_products_purchase_price CHECK (purchase_price >= 0);

ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_sale_price;
ALTER TABLE products ADD CONSTRAINT chk_products_sale_price CHECK (sale_price >= 0);

ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_quantity;
ALTER TABLE products ADD CONSTRAINT chk_products_quantity CHECK (quantity >= 0);

ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_sales_count;
ALTER TABLE products ADD CONSTRAINT chk_products_sales_count CHECK (sales_count >= 0);

-- 2. orders 表 - 确保金额为非负
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_subtotal;
ALTER TABLE orders ADD CONSTRAINT chk_orders_subtotal CHECK (subtotal >= 0);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_discount_amount;
ALTER TABLE orders ADD CONSTRAINT chk_orders_discount_amount CHECK (discount_amount >= 0);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_tax_amount;
ALTER TABLE orders ADD CONSTRAINT chk_orders_tax_amount CHECK (tax_amount >= 0);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_total_amount;
ALTER TABLE orders ADD CONSTRAINT chk_orders_total_amount CHECK (total_amount >= 0);

-- 3. order_items 表
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS chk_order_items_quantity;
ALTER TABLE order_items ADD CONSTRAINT chk_order_items_quantity CHECK (quantity > 0);

ALTER TABLE order_items DROP CONSTRAINT IF EXISTS chk_order_items_unit_price;
ALTER TABLE order_items ADD CONSTRAINT chk_order_items_unit_price CHECK (unit_price >= 0);

ALTER TABLE order_items DROP CONSTRAINT IF EXISTS chk_order_items_discount;
ALTER TABLE order_items ADD CONSTRAINT chk_order_items_discount CHECK (discount >= 0);

-- 4. invoices 表
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoices_subtotal;
ALTER TABLE invoices ADD CONSTRAINT chk_invoices_subtotal CHECK (subtotal >= 0);

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoices_tax_amount;
ALTER TABLE invoices ADD CONSTRAINT chk_invoices_tax_amount CHECK (tax_amount >= 0);

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoices_total_amount;
ALTER TABLE invoices ADD CONSTRAINT chk_invoices_total_amount CHECK (total_amount >= 0);

-- 5. customers 表 - VIP折扣范围
ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_customers_vip_discount;
ALTER TABLE customers ADD CONSTRAINT chk_customers_vip_discount CHECK (vip_discount >= 0 AND vip_discount <= 100);

-- 6. member_levels 表
ALTER TABLE member_levels DROP CONSTRAINT IF EXISTS chk_member_levels_min_points;
ALTER TABLE member_levels ADD CONSTRAINT chk_member_levels_min_points CHECK (min_points >= 0);

ALTER TABLE member_levels DROP CONSTRAINT IF EXISTS chk_member_levels_discount;
ALTER TABLE member_levels ADD CONSTRAINT chk_member_levels_discount CHECK (discount > 0 AND discount <= 100);

-- 7. customer_members 表
ALTER TABLE customer_members DROP CONSTRAINT IF EXISTS chk_customer_members_points;
ALTER TABLE customer_members ADD CONSTRAINT chk_customer_members_points CHECK (points >= 0);

ALTER TABLE customer_members DROP CONSTRAINT IF EXISTS chk_customer_members_total_points;
ALTER TABLE customer_members ADD CONSTRAINT chk_customer_members_total_points CHECK (total_points >= 0);

-- 8. points_logs 表
ALTER TABLE points_logs DROP CONSTRAINT IF EXISTS chk_points_logs_points;
ALTER TABLE points_logs ADD CONSTRAINT chk_points_logs_points CHECK (points != 0);

-- 9. inventory_alerts 表
ALTER TABLE inventory_alerts DROP CONSTRAINT IF EXISTS chk_inventory_alerts_min_quantity;
ALTER TABLE inventory_alerts ADD CONSTRAINT chk_inventory_alerts_min_quantity CHECK (min_quantity > 0);

-- 10. inventory_logs 表
ALTER TABLE inventory_logs DROP CONSTRAINT IF EXISTS chk_inventory_logs_quantity;
ALTER TABLE inventory_logs ADD CONSTRAINT chk_inventory_logs_quantity CHECK (quantity != 0);

-- 11. returns 表
ALTER TABLE returns DROP CONSTRAINT IF EXISTS chk_returns_amount;
ALTER TABLE returns ADD CONSTRAINT chk_returns_amount CHECK (amount > 0);

-- ============================================
-- 第六部分：添加缺失的NOT NULL约束
-- ============================================

-- 注意：添加NOT NULL约束前需确保数据完整性

-- 1. order_items 表
ALTER TABLE order_items ALTER COLUMN product_name SET NOT NULL;
ALTER TABLE order_items ALTER COLUMN unit_price SET NOT NULL;

-- ============================================
-- 第七部分：验证迁移结果
-- ============================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    -- 验证新表是否创建
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('member_levels', 'customer_members', 'points_logs', 
                        'inventory_alerts', 'inventory_logs', 'returns');
    
    IF table_count < 6 THEN
        RAISE WARNING '部分表可能未创建成功，预期6个扩展表，实际创建 % 个', table_count;
    ELSE
        RAISE NOTICE '所有表创建成功';
    END IF;
    
    -- 验证 products.sales_count 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'sales_count'
    ) THEN
        RAISE WARNING 'products.sales_count 列未创建成功';
    END IF;
    
    RAISE NOTICE '数据库Schema标准化迁移完成！';
END $$;

-- 打印完成信息
SELECT 'Schema standardization migration completed successfully!' AS status;
