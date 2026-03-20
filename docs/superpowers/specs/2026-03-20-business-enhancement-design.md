# 日本采销管理系统 - 业务功能增强设计

## 概述

为日本采销管理系统添加库存管理、退款退货、促销活动、会员等级等业务功能。

## 功能设计

### 1. 库存管理

**功能点:**
- 库存预警（低于阈值提醒）
- 库存盘点
- 库存记录（入库/出库）
- 库存统计报表

**表结构:**
```sql
-- 库存记录表
inventory_logs (id, product_id, type, quantity, before_qty, after_qty, operator_id, remark, created_at)

-- 库存预警设置
inventory_alerts (id, product_id, min_quantity, is_active)
```

### 2. 退款退货

**功能点:**
- 退货申请
- 退款审批
- 退货记录
- 退款原路返回

**表结构:**
```sql
-- 退货申请表
returns (id, order_id, order_item_id, reason, status, amount, approved_by, created_at, processed_at)

-- 退款记录
refunds (id, return_id, amount, method, status, transaction_id, created_at)
```

### 3. 促销活动

**功能点:**
- 折扣活动（满减、折扣）
- 限时特价
- 组合优惠
- 优惠券

**表结构:**
```sql
-- 促销活动
promotions (id, name, type, discount_value, min_amount, start_date, end_date, is_active)

-- 优惠券
coupons (id, code, type, value, min_amount, valid_from, valid_to, usage_limit, used_count, is_active)

-- 客户优惠券
customer_coupons (id, customer_id, coupon_id, order_id, used_at)
```

### 4. 会员等级

**功能点:**
- 会员等级（Bronze/Silver/Gold/Platinum）
- 等级自动晋升
- 等级专属折扣
- 积分系统

**表结构:**
```sql
-- 会员等级配置
member_levels (id, name, min_points, discount, icon)

-- 客户会员信息
customer_members (id, customer_id, level_id, points, total_points, joined_at, updated_at)

-- 积分记录
points_logs (id, customer_id, type, points, related_id, remark, created_at)
```

## 验收标准

1. 库存预警自动通知
2. 退货流程完整可追溯
3. 促销活动灵活配置
4. 会员等级自动计算
5. 所有新功能与现有系统无缝集成
