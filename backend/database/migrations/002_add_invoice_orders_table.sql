-- 数据库迁移脚本 v002 - 优化数据库范式
-- 运行方式: psql -U postgres -d japan_purchase_sales - f 002_add_invoice_orders_table.sql
-- 日期: 2026-03-28

-- 创建請求書-订单关联表（规范化设计）
CREATE TABLE IF NOT EXISTS invoice_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(invoice_id, order_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_invoice_orders_invoice_id ON invoice_orders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_orders_order_id ON invoice_orders(order_id);

-- 注意：现有的 invoices.order_ids 数组字段保留用于向后兼容
-- 新增的关联表 invoice_orders 用于规范化查询
-- 如果需要将数组数据迁移到关联表，可以运行以下 SQL（需要先确保数据一致性）：
-- INSERT INTO invoice_orders (invoice_id, order_id)
-- SELECT id, unnest(order_ids) FROM invoices WHERE order_ids IS NOT NULL AND array_length(order_ids, 1) > 0
-- ON CONFLICT DO NOTHING;

-- 验证迁移
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoice_orders') THEN
    RAISE WARNING 'invoice_orders 表可能未创建成功';
  END IF;

  RAISE NOTICE '数据库迁移 v002 完成：已创建 invoice_orders 关联表';
END $$;
