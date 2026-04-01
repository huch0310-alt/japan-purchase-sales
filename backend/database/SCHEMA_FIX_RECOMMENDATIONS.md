# 数据库Schema修复建议列表

**版本**: 1.0  
**日期**: 2026-04-01  
**优先级**: P0 (紧急) / P1 (高) / P2 (中) / P3 (低)

---

## 一、紧急修复项 (P0)

### 1. Entity文件列名映射问题

**问题描述**:  
部分entity文件未显式指定snake_case列名，可能导致TypeORM映射错误。

**影响范围**:
- `inventory_alert.entity.ts` - 所有列未指定name参数
- `inventory_log.entity.ts` - 所有列未指定name参数
- `promotion.entity.ts` - 所有列未指定name参数
- `coupon.entity.ts` - 所有列未指定name参数
- `member_level.entity.ts` - 所有列未指定name参数
- `customer_member.entity.ts` - 所有列未指定name参数
- `points_log.entity.ts` - 所有列未指定name参数
- `return.entity.ts` - 所有列未指定name参数

**修复方案**:

```typescript
// 错误示例 ❌
@Column()
productId: string;

// 正确示例 ✅
@Column({ name: 'product_id' })
productId: string;
```

**修复步骤**:
1. 为所有entity的列装饰器添加 `name` 参数
2. 确保name参数使用snake_case格式
3. 运行测试验证映射正确性

**预计工作量**: 2小时

---

### 2. 缺失的外键约束

**问题描述**:  
多个表缺少外键约束，可能导致数据不一致。

**影响范围**:
- `order_items.product_id` → 无外键约束
- `inventory_alerts.product_id` → 无外键约束
- `inventory_logs.product_id` → 无外键约束
- `inventory_logs.operator_id` → 无外键约束
- `customer_members.customer_id` → 无外键约束
- `customer_members.level_id` → 无外键约束
- `points_logs.customer_id` → 无外键约束
- `returns.order_id` → 无外键约束
- `returns.order_item_id` → 无外键约束
- `returns.approved_by` → 无外键约束

**修复方案**:  
已在Migration 013中添加，执行migration即可。

**修复步骤**:
1. 执行 `013-standardize-schema.sql`
2. 验证外键约束已创建
3. 检查现有数据是否违反约束

**预计工作量**: 1小时（执行migration）

---

### 3. 缺失的CHECK约束

**问题描述**:  
多个表缺少数据验证约束，可能导致非法数据。

**影响范围**:
- `products` - 价格、数量、销量应为非负
- `orders` - 金额应为非负
- `order_items` - 数量、价格、折扣应为非负
- `invoices` - 金额应为非负
- `customers` - VIP折扣应在0-100之间
- `member_levels` - 积分、折扣应在合理范围
- `customer_members` - 积分应为非负
- `points_logs` - 积分变动不应为0
- `inventory_alerts` - 最低库存应大于0
- `inventory_logs` - 变动数量不应为0
- `promotions` - 折扣值应大于0
- `coupons` - 折扣值、使用次数应合理
- `returns` - 退款金额应大于0

**修复方案**:  
已在Migration 013中添加，执行migration即可。

**修复步骤**:
1. 执行 `013-standardize-schema.sql`
2. 验证CHECK约束已创建
3. 检查现有数据是否违反约束

**预计工作量**: 1小时（执行migration）

---

## 二、高优先级修复项 (P1)

### 4. 缺失的索引

**问题描述**:  
多个表缺少必要的索引，可能导致查询性能问题。

**影响范围**:
- `member_levels` - 缺少排序、积分索引
- `customer_members` - 缺少客户、等级、积分索引
- `points_logs` - 缺少客户、类型、时间、关联索引
- `inventory_alerts` - 缺少商品、状态索引
- `inventory_logs` - 缺少商品、类型、时间、操作人、关联索引
- `promotions` - 缺少类型、状态、日期索引
- `coupons` - 缺少代码、类型、状态、日期索引
- `returns` - 缺少订单、状态、时间索引

**修复方案**:  
已在Migration 013中添加，执行migration即可。

**修复步骤**:
1. 执行 `013-standardize-schema.sql`
2. 验证索引已创建
3. 运行性能测试验证优化效果

**预计工作量**: 1小时（执行migration）

---

### 5. 缺失的NOT NULL约束

**问题描述**:  
多个表缺少NOT NULL约束，可能导致数据不完整。

**影响范围**:
- `order_items` - `product_name`, `unit_price` 应为必填
- `promotions` - `name`, `type`, `discount_value`, `start_date`, `end_date` 应为必填
- `coupons` - `code`, `type`, `value`, `valid_from`, `valid_to` 应为必填

**修复方案**:  
已在Migration 013中添加，执行migration即可。

**修复步骤**:
1. 执行 `013-standardize-schema.sql`
2. 验证NOT NULL约束已创建
3. 检查现有数据是否违反约束

**预计工作量**: 1小时（执行migration）

---

### 6. 缺失的表

**问题描述**:  
系统中定义了entity但数据库中缺少对应的表。

**影响范围**:
- `member_levels` - 会员等级表
- `customer_members` - 客户会员关联表
- `points_logs` - 积分记录表
- `inventory_alerts` - 库存预警表
- `inventory_logs` - 库存记录表
- `promotions` - 促销活动表
- `coupons` - 优惠券表
- `returns` - 退货申请表

**修复方案**:  
已在Migration 013中创建，执行migration即可。

**修复步骤**:
1. 执行 `013-standardize-schema.sql`
2. 验证表已创建
3. 检查表结构是否符合entity定义

**预计工作量**: 1小时（执行migration）

---

## 三、中优先级修复项 (P2)

### 7. 缺失的列

**问题描述**:  
部分表缺少entity中定义的列。

**影响范围**:
- `products.sales_count` - 销售数量列（用于热销排行）
- `categories.name` - 默认名称列
- `categories.deleted_at` - 软删除时间列
- `units.deleted_at` - 软删除时间列

**修复方案**:  
已在Migration 013中添加，执行migration即可。

**修复步骤**:
1. 执行 `013-standardize-schema.sql`
2. 验证列已创建
3. 更新相关业务逻辑

**预计工作量**: 1小时（执行migration）

---

### 8. 自动更新时间戳

**问题描述**:  
`updated_at` 字段未自动更新，需要手动维护。

**影响范围**:
- 所有包含 `updated_at` 字段的表

**修复方案**:

```sql
-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为每个表创建触发器
CREATE TRIGGER update_staff_updated_at 
    BEFORE UPDATE ON staff 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 对其他表重复此操作...
```

**修复步骤**:
1. 创建通用触发器函数
2. 为每个表创建触发器
3. 验证触发器正常工作

**预计工作量**: 2小时

---

### 9. 全文搜索优化

**问题描述**:  
商品名称、客户公司名称的全文搜索索引可能不够优化。

**影响范围**:
- `products.name` - 商品名称搜索
- `customers.company_name` - 公司名称搜索

**修复方案**:  
已在Migration 003中添加GIN索引，但可考虑优化：

```sql
-- 使用日语配置的全文搜索
CREATE INDEX idx_products_name_japanese ON products 
USING gin(to_tsvector('japanese', name));

CREATE INDEX idx_customers_company_name_japanese ON customers 
USING gin(to_tsvector('japanese', company_name));
```

**修复步骤**:
1. 评估日语全文搜索需求
2. 创建优化索引
3. 测试搜索性能

**预计工作量**: 3小时

---

## 四、低优先级修复项 (P3)

### 10. 数据库分区

**问题描述**:  
订单表、库存日志表数据量增长快，可能需要分区。

**影响范围**:
- `orders` - 按时间分区
- `inventory_logs` - 按时间分区

**修复方案**:

```sql
-- 按月分区订单表
CREATE TABLE orders_2026_01 PARTITION OF orders
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE orders_2026_02 PARTITION OF orders
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

**修复步骤**:
1. 评估数据量增长趋势
2. 设计分区策略
3. 创建分区表
4. 迁移现有数据

**预计工作量**: 8小时

---

### 11. 行级安全策略

**问题描述**:  
数据库层面缺少行级安全控制，完全依赖应用层。

**影响范围**:
- 所有业务表

**修复方案**:

```sql
-- 启用行级安全
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 创建策略：客户只能查看自己的订单
CREATE POLICY orders_customer_policy ON orders
    FOR ALL
    TO customer_role
    USING (customer_id = current_setting('app.current_customer_id')::uuid);
```

**修复步骤**:
1. 设计安全策略
2. 创建数据库角色
3. 实施行级安全
4. 测试安全策略

**预计工作量**: 16小时

---

### 12. 审计日志完善

**问题描述**:  
操作日志表可能缺少关键信息。

**影响范围**:
- `operation_logs` - 缺少请求ID、会话ID等

**修复方案**:

```sql
ALTER TABLE operation_logs ADD COLUMN request_id UUID;
ALTER TABLE operation_logs ADD COLUMN session_id UUID;
ALTER TABLE operation_logs ADD COLUMN user_agent TEXT;
ALTER TABLE operation_logs ADD COLUMN old_value JSONB;
ALTER TABLE operation_logs ADD COLUMN new_value JSONB;
```

**修复步骤**:
1. 添加审计字段
2. 更新entity定义
3. 更新业务逻辑记录审计信息

**预计工作量**: 4小时

---

## 五、功能扩展建议

### 13. 商品多图支持

**问题描述**:  
商品表只有一个图片URL，无法支持多图。

**建议方案**:

```sql
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**预计工作量**: 4小时

---

### 14. 商品规格SKU支持

**问题描述**:  
商品表缺少SKU管理功能。

**建议方案**:

```sql
CREATE TABLE product_skus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku_code VARCHAR(100) UNIQUE NOT NULL,
    specs JSONB NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**预计工作量**: 8小时

---

### 15. 供应商管理

**问题描述**:  
系统缺少供应商管理功能。

**建议方案**:

```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products ADD COLUMN supplier_id UUID REFERENCES suppliers(id);
```

**预计工作量**: 8小时

---

### 16. 价格历史记录

**问题描述**:  
缺少价格变更历史记录。

**建议方案**:

```sql
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    changed_by UUID REFERENCES staff(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**预计工作量**: 4小时

---

## 六、执行计划

### 阶段一：紧急修复 (立即执行)

1. **执行Migration 013** (预计2小时)
   - 执行 `013-standardize-schema.sql`
   - 验证所有修改
   - 运行测试

2. **修复Entity文件** (预计2小时)
   - 为所有entity添加列名映射
   - 运行测试验证

### 阶段二：性能优化 (1周内)

1. **添加自动更新时间戳触发器** (预计2小时)
2. **优化全文搜索** (预计3小时)
3. **性能测试** (预计4小时)

### 阶段三：功能完善 (2周内)

1. **添加审计日志字段** (预计4小时)
2. **实现行级安全策略** (预计16小时)

### 阶段四：功能扩展 (按需)

1. **商品多图支持** (预计4小时)
2. **SKU管理** (预计8小时)
3. **供应商管理** (预计8小时)
4. **价格历史记录** (预计4小时)

---

## 七、风险提示

### 1. Migration执行风险

**风险**:  
执行migration可能影响现有数据。

**缓解措施**:
- 执行前备份数据库
- 在测试环境先执行
- 使用 `NOT VALID` 避免立即验证外键
- 准备回滚脚本

### 2. Entity修改风险

**风险**:  
修改entity可能影响现有业务逻辑。

**缓解措施**:
- 逐步修改，每次修改一个entity
- 充分测试
- 保留原有代码备份

### 3. 性能影响风险

**风险**:  
添加索引可能影响写入性能。

**缓解措施**:
- 在低峰期执行
- 监控性能指标
- 准备回滚方案

---

## 八、验收标准

### Migration 013验收

- [ ] 所有新表已创建
- [ ] 所有新列已添加
- [ ] 所有外键约束已创建
- [ ] 所有CHECK约束已创建
- [ ] 所有索引已创建
- [ ] 所有NOT NULL约束已创建
- [ ] 现有数据未受影响
- [ ] 应用功能正常

### Entity修复验收

- [ ] 所有entity列名已映射
- [ ] TypeORM映射正确
- [ ] 应用功能正常
- [ ] 测试通过

---

**文档维护者**: 数据库专家团队  
**最后更新**: 2026-04-01
