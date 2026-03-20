import { Staff } from '../../src/users/entities/staff.entity';
import { Customer } from '../../src/users/entities/customer.entity';
import { Product } from '../../src/products/entities/product.entity';
import { Order } from '../../src/orders/entities/order.entity';
import { OrderItem } from '../../src/orders/entities/order-item.entity';
import { Invoice } from '../../src/invoices/entities/invoice.entity';
import { Category } from '../../src/categories/entities/category.entity';
import { Unit } from '../../src/units/entities/unit.entity';

/**
 * 创建测试员工数据
 */
export function createTestStaff(overrides?: Partial<Staff>): Staff {
  const staff = new Staff();
  staff.id = '550e8400-e29b-41d4-a716-446655440000';
  staff.username = 'test-staff';
  staff.passwordHash = '$2b$10$test-hash';
  staff.name = '测试员工';
  staff.phone = '090-1234-5678';
  staff.role = 'sales';
  staff.isActive = true;
  staff.createdAt = new Date();
  staff.updatedAt = new Date();

  return { ...staff, ...overrides } as Staff;
}

/**
 * 创建测试超级管理员数据
 */
export function createTestSuperAdmin(overrides?: Partial<Staff>): Staff {
  return createTestStaff({
    id: '550e8400-e29b-41d4-a716-446655440001',
    username: 'admin',
    role: 'super_admin',
    name: '管理员',
    ...overrides,
  });
}

/**
 * 创建测试客户数据
 */
export function createTestCustomer(overrides?: Partial<Customer>): Customer {
  const customer = new Customer();
  customer.id = '660e8400-e29b-41d4-a716-446655440000';
  customer.username = 'test-customer';
  customer.passwordHash = '$2b$10$test-hash';
  customer.companyName = 'テスト会社';
  customer.address = '東京都渋谷区テスト1-1-1';
  customer.contactPerson = '田中太郎';
  customer.phone = '03-1234-5678';
  customer.vipDiscount = 95;
  customer.invoiceName = '請求書テスト株式会社';
  customer.invoiceAddress = '請求書住所';
  customer.invoicePhone = '03-9999-9999';
  customer.invoiceBank = '三菱UFJ銀行';
  customer.isActive = true;
  customer.createdAt = new Date();
  customer.updatedAt = new Date();

  return { ...customer, ...overrides } as Customer;
}

/**
 * 创建测试分类数据
 */
export function createTestCategory(overrides?: Partial<Category>): Category {
  const category = new Category();
  category.id = '770e8400-e29b-41d4-a716-446655440000';
  category.name = '肉类';
  category.sortOrder = 1;
  category.isActive = true;
  category.createdAt = new Date();

  return { ...category, ...overrides } as Category;
}

/**
 * 创建测试单位数据
 */
export function createTestUnit(overrides?: Partial<Unit>): Unit {
  const unit = new Unit();
  unit.id = '880e8400-e29b-41d4-a716-446655440000';
  unit.name = '个';
  unit.sortOrder = 1;
  unit.isActive = true;
  unit.createdAt = new Date();

  return { ...unit, ...overrides } as Unit;
}

/**
 * 创建测试商品数据
 */
export function createTestProduct(overrides?: Partial<Product>): Product {
  const product = new Product();
  product.id = '990e8400-e29b-41d4-a716-446655440000';
  product.name = '测试商品';
  product.quantity = 100;
  product.unit = '个';
  product.purchasePrice = 100;
  product.salePrice = 150;
  product.photoUrl = '/uploads/test.jpg';
  product.description = '测试商品描述';
  product.status = 'active';
  product.createdAt = new Date();
  product.updatedAt = new Date();

  return { ...product, ...overrides } as Product;
}

/**
 * 创建测试待审核商品
 */
export function createTestPendingProduct(overrides?: Partial<Product>): Product {
  return createTestProduct({ status: 'pending', ...overrides });
}

/**
 * 创建测试订单数据
 */
export function createTestOrder(overrides?: Partial<Order>): Order {
  const order = new Order();
  order.id = '110e8400-e29b-41d4-a716-446655440000';
  order.orderNo = 'ORD-20240320-0001';
  order.subtotal = 1500;
  order.discountAmount = 75;
  order.taxAmount = 142.5;
  order.totalAmount = 1567.5;
  order.status = 'pending';
  order.deliveryAddress = '東京都渋谷区テスト1-1-1';
  order.contactPerson = '田中太郎';
  order.contactPhone = '03-1234-5678';
  order.remark = '测试备注';
  order.createdAt = new Date();
  order.updatedAt = new Date();

  return { ...order, ...overrides } as Order;
}

/**
 * 创建测试订单明细
 */
export function createTestOrderItem(overrides?: Partial<OrderItem>): OrderItem {
  const item = new OrderItem();
  item.id = '220e8400-e29b-41d4-a716-446655440000';
  item.productName = '测试商品';
  item.quantity = 10;
  item.unitPrice = 150;
  item.discount = 0;
  item.createdAt = new Date();

  return { ...item, ...overrides } as OrderItem;
}

/**
 * 创建测试請求書数据
 */
export function createTestInvoice(overrides?: Partial<Invoice>): Invoice {
  const invoice = new Invoice();
  invoice.id = '330e8400-e29b-41d4-a716-446655440000';
  invoice.invoiceNo = 'INV-20240320-0001';
  invoice.orderIds = ['110e8400-e29b-41d4-a716-446655440000'];
  invoice.subtotal = 1500;
  invoice.taxAmount = 150;
  invoice.totalAmount = 1650;
  invoice.issueDate = new Date('2024-03-20');
  invoice.dueDate = new Date('2024-04-19');
  invoice.status = 'unpaid';
  invoice.createdAt = new Date();
  invoice.updatedAt = new Date();

  return { ...invoice, ...overrides } as Invoice;
}

/**
 * 创建已付款請求書
 */
export function createTestPaidInvoice(overrides?: Partial<Invoice>): Invoice {
  return createTestInvoice({
    status: 'paid',
    paidAt: new Date('2024-03-25'),
    ...overrides,
  });
}
