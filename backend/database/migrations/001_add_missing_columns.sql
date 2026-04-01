-- 数据库迁移脚本 v001 - 添加缺失的字段
-- 运行方式: psql -U postgres -d japan_purchase_sales -f 001_add_missing_columns.sql
-- 日期: 2026-03-28

-- 1. orders 表添加 invoicedAt、deletedAt、cancelledById、cancelReason、cancelledAt 字段
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoiced_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES staff(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- 2. invoices 表添加撤销相关字段
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES staff(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- 3. products 表添加 deleted_at 字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 4. customers 表添加 deleted_at 字段
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 5. staff 表添加 deleted_at 字段
ALTER TABLE staff ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_orders_invoiced_at ON orders(invoiced_at);
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders(deleted_at);
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_at ON orders(cancelled_at);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_staff_deleted_at ON staff(deleted_at);

-- 验证迁移
DO $$
BEGIN
  -- 验证 orders 表
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'invoiced_at') THEN
    RAISE WARNING 'orders.invoiced_at 字段可能未创建成功';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'cancelled_by') THEN
    RAISE WARNING 'orders.cancelled_by 字段可能未创建成功';
  END IF;

  -- 验证 invoices 表
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'is_cancelled') THEN
    RAISE WARNING 'invoices.is_cancelled 字段可能未创建成功';
  END IF;

  RAISE NOTICE '数据库迁移完成';
END $$;
