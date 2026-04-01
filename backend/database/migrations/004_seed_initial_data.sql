-- 数据库初始化数据脚本
-- 添加示例数据，方便测试和使用
-- 运行方式: psql -U postgres -d japan_purchase_sales -f 004_seed_initial_data.sql

-- ============================================
-- 1. 插入默认管理员账号
-- ============================================

-- 密码: admin123 (bcrypt hash)
INSERT INTO staff (id, username, password_hash, name, role, is_active)
VALUES (
    '23ca2cb7-3f26-402b-99f1-131a369d8e3a',
    'admin',
    '$2b$10$YourBcryptHashHere',  -- 需要在应用启动时生成真实hash
    '管理员',
    'super_admin',
    true
) ON CONFLICT (username) DO NOTHING;

-- ============================================
-- 2. 插入商品分类（三语支持）
-- ============================================

INSERT INTO categories (id, name_zh, name_ja, name_en, sort_order, is_system, is_active) VALUES
-- 食品类
('a1b2c3d4-0001-4000-8000-000000000001', '食品', '食品', 'Food', 1, true, true),
('a1b2c3d4-0002-4000-8000-000000000002', '饮料', '飲料', 'Beverages', 2, true, true),
('a1b2c3d4-0003-4000-8000-000000000003', '日用品', '日用品', 'Daily Necessities', 3, true, true),
('a1b2c3d4-0004-4000-8000-000000000004', '电子产品', '電子製品', 'Electronics', 4, true, true),
('a1b2c3d4-0005-4000-8000-000000000005', '服装', '衣類', 'Clothing', 5, true, true),
('a1b2c3d4-0006-4000-8000-000000000006', '化妆品', '化粧品', 'Cosmetics', 6, true, true),
('a1b2c3d4-0007-4000-8000-000000000007', '保健品', '健康食品', 'Health Products', 7, true, true),
('a1b2c3d4-0008-4000-8000-000000000008', '母婴用品', '母子用品', 'Mother & Baby', 8, true, true),
('a1b2c3d4-0009-4000-8000-000000000009', '文具', '文房具', 'Stationery', 9, true, true),
('a1b2c3d4-0010-4000-8000-000000000010', '其他', 'その他', 'Others', 10, true, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. 插入商品单位
-- ============================================

INSERT INTO units (id, name, sort_order, is_active) VALUES
('b1c2d3e4-0001-4000-8000-000000000001', '个', 1, true),
('b1c2d3e4-0002-4000-8000-000000000002', '件', 2, true),
('b1c2d3e4-0003-4000-8000-000000000003', '箱', 3, true),
('b1c2d3e4-0004-4000-8000-000000000004', '瓶', 4, true),
('b1c2d3e4-0005-4000-8000-000000000005', '袋', 5, true),
('b1c2d3e4-0006-4000-8000-000000000006', '盒', 6, true),
('b1c2d3e4-0007-4000-8000-000000000007', '包', 7, true),
('b1c2d3e4-0008-4000-8000-000000000008', '支', 8, true),
('b1c2d3e4-0009-4000-8000-000000000009', '套', 9, true),
('b1c2d3e4-0010-4000-8000-000000000010', 'kg', 10, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. 插入系统默认设置
-- ============================================

INSERT INTO settings (key, value, description) VALUES
-- 公司信息
('company_name', '株式会社サンプル', '公司名称'),
('company_address', '東京都渋谷区〇〇町1-2-3', '公司地址'),
('company_phone', '03-1234-5678', '公司电话'),
('company_fax', '03-1234-5679', '公司传真'),
('company_bank', '三菱UFJ銀行 渋谷支店 普通 1234567', '银行账户'),

-- 业务设置
('tax_rate', '10', '消费税率（%）'),
('default_payment_days', '30', '默认账期（天）'),
('currency', 'JPY', '货币单位'),

-- 系统设置
('low_stock_threshold', '10', '低库存预警阈值'),
('order_cancel_minutes', '30', '订单可取消时间（分钟）'),
('max_login_attempts', '5', '最大登录失败次数'),
('lockout_duration', '30', '账户锁定时长（分钟）'),

-- VIP折扣设置
('vip_discount_1', '5', 'VIP等级1折扣（%）'),
('vip_discount_2', '10', 'VIP等级2折扣（%）'),
('vip_discount_3', '15', 'VIP等级3折扣（%）'),
('vip_discount_4', '20', 'VIP等级4折扣（%）')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 5. 插入示例客户（可选）
-- ============================================

-- 注意：实际部署时应删除或注释掉这部分
-- INSERT INTO customers (id, username, password_hash, company_name, address, contact_person, phone, vip_discount, is_active) VALUES
-- ('c1d2e3f4-0001-4000-8000-000000000001', 'customer1', '$2b$10$HashHere', '株式会社テスト', '東京都新宿区〇〇町2-3-4', '田中太郎', '090-1234-5678', 10, true)
-- ON CONFLICT DO NOTHING;

-- ============================================
-- 6. 插入示例商品（可选）
-- ============================================

-- 注意：实际部署时应删除或注释掉这部分
-- INSERT INTO products (id, category_id, name, quantity, unit, purchase_price, sale_price, status, created_by) VALUES
-- ('d1e2f3a4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', '示例商品1', 100, '个', 500, 800, 'active', '23ca2cb7-3f26-402b-99f1-131a369d8e3a')
-- ON CONFLICT DO NOTHING;

-- ============================================
-- 7. 更新序列
-- ============================================

-- 确保序列从正确的值开始
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('units_id_seq', (SELECT MAX(id) FROM units));

-- ============================================
-- 8. 验证数据
-- ============================================

-- 检查分类数据
SELECT 'Categories count: ' || COUNT(*) FROM categories;

-- 检查单位数据
SELECT 'Units count: ' || COUNT(*) FROM units;

-- 检查系统设置
SELECT 'Settings count: ' || COUNT(*) FROM settings;

-- 打印完成信息
SELECT 'Initial data seeded successfully!' AS status;
