-- 移除已废弃的促销 / 优惠券表（后端已删除对应模块）
-- 适用场景：从旧库升级或清空后仍残留 promotions、coupons 表时执行
-- 运行方式: psql -U postgres -d japan_purchase_sales -f 014-drop-promotions-coupons.sql

DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;

SELECT '已删除 promotions、coupons 表（若曾存在）。' AS status;
