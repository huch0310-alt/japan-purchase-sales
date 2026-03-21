"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialMigration1705651200000 = void 0;
class InitialMigration1705651200000 {
    constructor() {
        this.name = 'InitialMigration1705651200000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "staff" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "username" VARCHAR(50) UNIQUE NOT NULL,
        "passwordHash" VARCHAR(255) NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "phone" VARCHAR(20),
        "role" VARCHAR(20) DEFAULT 'sales' CHECK ("role" IN ('super_admin', 'admin', 'procurement', 'sales')),
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customers" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "username" VARCHAR(50) UNIQUE NOT NULL,
        "passwordHash" VARCHAR(255) NOT NULL,
        "companyName" VARCHAR(200) NOT NULL,
        "address" TEXT,
        "contactPerson" VARCHAR(100),
        "phone" VARCHAR(20),
        "vipDiscount" DECIMAL(5,2) DEFAULT 100,
        "invoiceName" VARCHAR(200),
        "invoiceAddress" TEXT,
        "invoicePhone" VARCHAR(20),
        "invoiceBank" VARCHAR(200),
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) NOT NULL,
        "sortOrder" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "units" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(50) NOT NULL,
        "sortOrder" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "categoryId" UUID REFERENCES "categories"("id"),
        "name" VARCHAR(200) NOT NULL,
        "quantity" INTEGER DEFAULT 0,
        "unit" VARCHAR(20),
        "purchasePrice" DECIMAL(10,2) DEFAULT 0,
        "salePrice" DECIMAL(10,2) DEFAULT 0,
        "photoUrl" VARCHAR(500),
        "description" TEXT,
        "status" VARCHAR(20) DEFAULT 'pending' CHECK ("status" IN ('pending', 'approved', 'rejected', 'active', 'inactive')),
        "createdBy" UUID REFERENCES "staff"("id"),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderNo" VARCHAR(50) UNIQUE NOT NULL,
        "customerId" UUID REFERENCES "customers"("id"),
        "subtotal" DECIMAL(12,2) DEFAULT 0,
        "discountAmount" DECIMAL(12,2) DEFAULT 0,
        "taxAmount" DECIMAL(12,2) DEFAULT 0,
        "totalAmount" DECIMAL(12,2) DEFAULT 0,
        "status" VARCHAR(20) DEFAULT 'pending' CHECK ("status" IN ('pending', 'confirmed', 'completed', 'cancelled')),
        "deliveryAddress" TEXT,
        "contactPerson" VARCHAR(100),
        "contactPhone" VARCHAR(20),
        "remark" TEXT,
        "confirmedBy" UUID REFERENCES "staff"("id"),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "confirmedAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderId" UUID REFERENCES "orders"("id") ON DELETE CASCADE,
        "productId" UUID REFERENCES "products"("id"),
        "productName" VARCHAR(200),
        "quantity" INTEGER DEFAULT 1,
        "unitPrice" DECIMAL(10,2) NOT NULL,
        "discount" DECIMAL(10,2) DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "invoiceNo" VARCHAR(50) UNIQUE NOT NULL,
        "customerId" UUID REFERENCES "customers"("id"),
        "orderIds" UUID[] NOT NULL,
        "subtotal" DECIMAL(12,2) DEFAULT 0,
        "taxAmount" DECIMAL(12,2) DEFAULT 0,
        "totalAmount" DECIMAL(12,2) DEFAULT 0,
        "issueDate" DATE NOT NULL,
        "dueDate" DATE NOT NULL,
        "status" VARCHAR(20) DEFAULT 'unpaid' CHECK ("status" IN ('unpaid', 'paid', 'overdue')),
        "fileUrl" VARCHAR(500),
        "paidAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cart_items" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "customerId" UUID REFERENCES "customers"("id"),
        "productId" UUID REFERENCES "products"("id"),
        "quantity" INTEGER DEFAULT 1,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("customerId", "productId")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "operation_logs" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID REFERENCES "staff"("id"),
        "userRole" VARCHAR(20),
        "module" VARCHAR(50) NOT NULL,
        "action" VARCHAR(50) NOT NULL,
        "detail" TEXT,
        "ip" VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "settings" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "key" VARCHAR(100) UNIQUE NOT NULL,
        "value" TEXT,
        "description" VARCHAR(200),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL,
        "userType" VARCHAR(20) NOT NULL CHECK ("userType" IN ('staff', 'customer')),
        "title" VARCHAR(200) NOT NULL,
        "content" TEXT NOT NULL,
        "type" VARCHAR(20) DEFAULT 'system' CHECK ("type" IN ('order', 'product', 'invoice', 'system')),
        "isRead" BOOLEAN DEFAULT false,
        "relatedId" UUID,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_messages_user" ON "messages"("userId", "userType")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_messages_isread" ON "messages"("isRead")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "messages"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "settings"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "operation_logs"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cart_items"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "invoices"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "units"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "customers"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "staff"`);
    }
}
exports.InitialMigration1705651200000 = InitialMigration1705651200000;
//# sourceMappingURL=1705651200000-InitialMigration.js.map