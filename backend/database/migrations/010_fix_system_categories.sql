-- 修正系统预设的8个分类
-- 删除错误的分类数据，插入正确的8个系统分类

-- 先清空现有分类
TRUNCATE TABLE categories CASCADE;

-- 插入正确的8个系统分类（三语版本）
INSERT INTO categories (id, name, name_zh, name_ja, name_en, sort_order, is_system, is_active, created_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', '肉类', '肉类', '肉類', 'Meat', 1, TRUE, TRUE, NOW()),
('a1b2c3d4-0001-0001-0001-000000000002', '蛋品', '蛋品', '卵類', 'Eggs', 2, TRUE, TRUE, NOW()),
('a1b2c3d4-0001-0001-0001-000000000003', '生鲜蔬果', '生鲜蔬果', '生鮮野菜', 'Fresh Produce', 3, TRUE, TRUE, NOW()),
('a1b2c3d4-0001-0001-0001-000000000004', '海鲜', '海鲜', '海鮮', 'Seafood', 4, TRUE, TRUE, NOW()),
('a1b2c3d4-0001-0001-0001-000000000005', '调料', '调料', '調味料', 'Condiments', 5, TRUE, TRUE, NOW()),
('a1b2c3d4-0001-0001-0001-000000000006', '饮料', '饮料', '飲料', 'Beverages', 6, TRUE, TRUE, NOW()),
('a1b2c3d4-0001-0001-0001-000000000007', '粮油', '粮油', '穀物油', 'Grains & Oils', 7, TRUE, TRUE, NOW()),
('a1b2c3d4-0001-0001-0001-000000000008', '日配', '日配', '日配', 'Daily Products', 8, TRUE, TRUE, NOW());

-- 验证插入结果
SELECT id, name, name_zh, name_ja, name_en, sort_order, is_system FROM categories ORDER BY sort_order;
