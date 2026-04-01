-- 确保分类名称正确显示
-- 问题：name_zh, name_ja, name_en 列可能为空

-- 检查当前数据
SELECT id, name, name_zh, name_ja, name_en FROM categories;

-- 更新现有分类的名称字段（如果为空）
UPDATE categories SET 
    name_zh = COALESCE(name_zh, name),
    name_ja = COALESCE(name_ja, name),
    name_en = COALESCE(name_en, name)
WHERE name_zh IS NULL OR name_ja IS NULL OR name_en IS NULL;

-- 如果是系统预设的8个分类，使用正确的三语名称
UPDATE categories SET 
    name_zh = '肉类', name_ja = '肉類', name_en = 'Meat'
WHERE name = '肉类' OR name_zh = '肉类';

UPDATE categories SET 
    name_zh = '蛋品', name_ja = '卵類', name_en = 'Eggs'
WHERE name = '蛋品' OR name_zh = '蛋品';

UPDATE categories SET 
    name_zh = '生鲜蔬果', name_ja = '生鮮野菜', name_en = 'Fresh Produce'
WHERE name = '生鲜蔬果' OR name_zh = '生鲜蔬果';

UPDATE categories SET 
    name_zh = '海鲜', name_ja = '海鮮', name_en = 'Seafood'
WHERE name = '海鲜' OR name_zh = '海鲜';

UPDATE categories SET 
    name_zh = '调料', name_ja = '調味料', name_en = 'Condiments'
WHERE name = '调料' OR name_zh = '调料';

UPDATE categories SET 
    name_zh = '饮料', name_ja = '飲料', name_en = 'Beverages'
WHERE name = '饮料' OR name_zh = '饮料';

UPDATE categories SET 
    name_zh = '粮油', name_ja = '穀物油', name_en = 'Grains & Oils'
WHERE name = '粮油' OR name_zh = '粮油';

UPDATE categories SET 
    name_zh = '日配', name_ja = '日配', name_en = 'Daily Products'
WHERE name = '日配' OR name_zh = '日配';

-- 验证更新结果
SELECT id, name, name_zh, name_ja, name_en, is_system FROM categories ORDER BY sort_order;
