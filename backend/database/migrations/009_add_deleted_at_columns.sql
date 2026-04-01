-- 添加缺失的deletedAt列
-- TypeORM的@DeleteDateColumn需要此列

-- 为所有需要软删除的表添加deletedAt列
ALTER TABLE categories ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
ALTER TABLE returns ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;

SELECT 'DeletedAt columns added successfully!' AS status;
