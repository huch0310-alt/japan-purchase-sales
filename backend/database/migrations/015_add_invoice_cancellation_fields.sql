-- 迁移: 添加 invoices 表的撤销字段
-- 添加 is_cancelled, cancelled_at, cancelled_by, cancel_reason 列

-- 检查列是否存在，如果不存在则添加
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'is_cancelled'
    ) THEN
        ALTER TABLE invoices ADD COLUMN is_cancelled BOOLEAN DEFAULT false;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'cancelled_at'
    ) THEN
        ALTER TABLE invoices ADD COLUMN cancelled_at TIMESTAMP;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'cancelled_by'
    ) THEN
        ALTER TABLE invoices ADD COLUMN cancelled_by UUID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'cancel_reason'
    ) THEN
        ALTER TABLE invoices ADD COLUMN cancel_reason TEXT;
    END IF;
END $$;

-- 回滚脚本
-- ALTER TABLE invoices DROP COLUMN IF EXISTS is_cancelled;
-- ALTER TABLE invoices DROP COLUMN IF EXISTS cancelled_at;
-- ALTER TABLE invoices DROP COLUMN IF EXISTS cancelled_by;
-- ALTER TABLE invoices DROP COLUMN IF EXISTS cancel_reason;
