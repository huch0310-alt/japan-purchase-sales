// 数据库初始化脚本
// 运行方式: psql -U postgres -d japan_purchase_sales -f init.sql

-- 创建数据库
-- CREATE DATABASE japan_purchase_sales;

-- 员工表
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'sales' CHECK (role IN ('super_admin', 'admin', 'procurement', 'sales')),
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 客户表
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "companyName" VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    "contactPerson" VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    "vipDiscount" DECIMAL(5,2) DEFAULT 0,
    "invoiceName" VARCHAR(200),
    "invoiceAddress" TEXT,
    "invoicePhone" VARCHAR(20),
    "invoiceBank" VARCHAR(200),
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商品分类表（支持三语）
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_zh VARCHAR(100) NOT NULL,
    name_ja VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    "sortOrder" INTEGER DEFAULT 0,
    "isSystem" BOOLEAN DEFAULT FALSE,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商品单位表
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    "sortOrder" INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "categoryId" UUID REFERENCES categories(id),
    name VARCHAR(200) NOT NULL,
    quantity INTEGER DEFAULT 0,
    unit VARCHAR(20),
    "purchasePrice" DECIMAL(10,2) DEFAULT 0,
    "salePrice" DECIMAL(10,2) DEFAULT 0,
    "photoUrl" VARCHAR(500),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'inactive')),
    "createdBy" UUID REFERENCES staff(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderNo" VARCHAR(50) UNIQUE NOT NULL,
    "customerId" UUID REFERENCES customers(id),
    subtotal DECIMAL(12,2) DEFAULT 0,
    "discountAmount" DECIMAL(12,2) DEFAULT 0,
    "taxAmount" DECIMAL(12,2) DEFAULT 0,
    "totalAmount" DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    "deliveryAddress" TEXT NOT NULL,
    "contactPerson" VARCHAR(100) NOT NULL,
    "contactPhone" VARCHAR(20) NOT NULL,
    remark TEXT,
    "confirmedById" UUID REFERENCES staff(id),
    "invoiceId" UUID REFERENCES invoices(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订单明细表
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" UUID REFERENCES orders(id) ON DELETE CASCADE,
    "productId" UUID REFERENCES products(id),
    "productName" VARCHAR(200),
    quantity INTEGER DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 請求書表
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "invoiceNo" VARCHAR(50) UNIQUE NOT NULL,
    "customerId" UUID REFERENCES customers(id),
    "orderIds" UUID[] NOT NULL,
    subtotal DECIMAL(12,2) DEFAULT 0,
    "taxAmount" DECIMAL(12,2) DEFAULT 0,
    "totalAmount" DECIMAL(12,2) DEFAULT 0,
    "issueDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue')),
    "fileUrl" VARCHAR(500),
    "paidAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 购物车表
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "customerId" UUID REFERENCES customers(id),
    "productId" UUID REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("customerId", "productId")
);

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES staff(id),
    "userRole" VARCHAR(20),
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    detail TEXT,
    ip VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 系统设置表
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(200),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认管理员账号 (密码: admin123)
-- 密码哈希: bcrypt(admin123) = $2b$10$WFNAPPBSb4MERYchocfby./bBo9cIpmmvI5BfrjcC8ONY8DCdQQkG
INSERT INTO staff (username, "passwordHash", name, phone, role)
VALUES ('admin', '$2b$10$WFNAPPBSb4MERYchocfby./bBo9cIpmmvI5BfrjcC8ONY8DCdQQkG', '管理员', '090-1234-5678', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- 插入默认分类（八大固定分类，三语版本）
INSERT INTO categories (name_zh, name_ja, name_en, "sortOrder", "isSystem") VALUES
('肉类', '肉類', 'Meat', 1, TRUE),
('蛋品', '卵類', 'Eggs', 2, TRUE),
('生鲜蔬果', '生鮮野菜', 'Fresh Produce', 3, TRUE),
('海鲜', '海鮮', 'Seafood', 4, TRUE),
('调料', '調味料', 'Condiments', 5, TRUE),
('饮料', '飲料', 'Beverages', 6, TRUE),
('粮油', '穀物油', 'Grains & Oils', 7, TRUE),
('日配', '日配', 'Daily Products', 8, TRUE)
ON CONFLICT DO NOTHING;

-- 插入默认单位
INSERT INTO units (name, "sortOrder") VALUES
('个', 1), ('袋', 2), ('箱', 3), ('kg', 4), ('g', 5),
('本', 6), ('盒', 7), ('pack', 8), ('ケース', 9), ('枚', 10),
('セット', 11), ('瓶', 12), ('罐', 13), ('ml', 14), ('L', 15)
ON CONFLICT DO NOTHING;

-- 插入默认系统设置
INSERT INTO settings (key, value, description) VALUES
('company_name', '', '公司名称'),
('company_address', '', '公司地址'),
('company_phone', '', '公司电话'),
('company_fax', '', '公司传真'),
('company_email', '', '公司邮箱'),
('company_representative', '', '负责人'),
('company_legal_representative', '', '法人代表'),
('company_bank', '', '银行账户'),
('tax_rate', '10', '消费税率(%)'),
('default_payment_days', '30', '默认账期(天)')
ON CONFLICT (key) DO NOTHING;

-- 消息通知表
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "userType" VARCHAR(20) NOT NULL CHECK ("userType" IN ('staff', 'customer')),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'system' CHECK (type IN ('order', 'product', 'invoice', 'system')),
    "isRead" BOOLEAN DEFAULT false,
    "relatedId" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_user ON messages("userId", "userType");
CREATE INDEX IF NOT EXISTS idx_messages_isread ON messages("isRead");
