import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Staff } from '../../src/users/entities/staff.entity';
import { Customer } from '../../src/users/entities/customer.entity';
import { Product } from '../../src/products/entities/product.entity';
import { Order } from '../../src/orders/entities/order.entity';
import { Category } from '../../src/categories/entities/category.entity';
import * as bcrypt from 'bcryptjs';

/**
 * E2E测试 - 订单管理模块
 * 测试订单创建、状态流转、权限控制等功能
 */
describe('订单管理模块 E2E测试', () => {
  let app: INestApplication;
  let staffRepository: any;
  let customerRepository: any;
  let productRepository: any;
  let orderRepository: any;
  let categoryRepository: any;
  
  let salesToken: string;
  let customerToken: string;
  let adminToken: string;
  
  let testCustomer: any;
  let testProduct: any;
  let testCategory: any;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    await app.init();

    staffRepository = moduleFixture.get(getRepositoryToken(Staff));
    customerRepository = moduleFixture.get(getRepositoryToken(Customer));
    productRepository = moduleFixture.get(getRepositoryToken(Product));
    orderRepository = moduleFixture.get(getRepositoryToken(Order));
    categoryRepository = moduleFixture.get(getRepositoryToken(Category));

    // 创建测试分类
    testCategory = categoryRepository.create({
      name: 'E2E订单测试分类',
      sortOrder: 1,
      isActive: true,
    });
    await categoryRepository.save(testCategory);

    // 创建测试商品
    testProduct = productRepository.create({
      name: 'E2E订单测试商品',
      quantity: 1000,
      unit: '个',
      purchasePrice: 100,
      salePrice: 150,
      status: 'active',
      categoryId: testCategory.id,
    });
    await productRepository.save(testProduct);

    // 创建测试客户
    const customerPasswordHash = await bcrypt.hash('Password123', 10);
    testCustomer = customerRepository.create({
      username: 'e2e-order-customer',
      passwordHash: customerPasswordHash,
      companyName: 'E2E注文テスト株式会社',
      address: '東京都渋谷区テスト1-1-1',
      contactPerson: '田中太郎',
      phone: '03-1234-5678',
      vipDiscount: 95,
      isActive: true,
    });
    await customerRepository.save(testCustomer);

    // 创建销售员
    const salesPasswordHash = await bcrypt.hash('Password123', 10);
    const sales = staffRepository.create({
      username: 'e2e-order-sales',
      passwordHash: salesPasswordHash,
      name: '销售员',
      phone: '090-1111-1111',
      role: 'sales',
      isActive: true,
    });
    await staffRepository.save(sales);

    // 创建管理员
    const adminPasswordHash = await bcrypt.hash('Password123', 10);
    const admin = staffRepository.create({
      username: 'e2e-order-admin',
      passwordHash: adminPasswordHash,
      name: '管理员',
      phone: '090-2222-2222',
      role: 'admin',
      isActive: true,
    });
    await staffRepository.save(admin);

    // 登录获取token
    const customerLogin = await request(app.getHttpServer())
      .post('/auth/customer/login')
      .send({ username: 'e2e-order-customer', password: 'Password123' });
    customerToken = customerLogin.body.access_token;

    const salesLogin = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({ username: 'e2e-order-sales', password: 'Password123' });
    salesToken = salesLogin.body.access_token;

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({ username: 'e2e-order-admin', password: 'Password123' });
    adminToken = adminLogin.body.access_token;
  });

  afterAll(async () => {
    // 清理测试数据
    await orderRepository.delete({});
    await productRepository.delete({ name: 'E2E订单测试商品' });
    await customerRepository.delete({ username: 'e2e-order-customer' });
    await staffRepository.delete({ username: Like('e2e-order-%') });
    await categoryRepository.delete({ name: 'E2E订单测试分类' });
    
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/orders', () => {
    it('应该客户可以创建订单', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId: testProduct.id, quantity: 5 }],
          deliveryAddress: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          contactPhone: '03-1234-5678',
          remark: 'E2E测试订单',
        })
        .expect(201);

      expect(response.body.orderNo).toBeDefined();
      expect(response.body.status).toBe('pending');
      expect(response.body.items).toHaveLength(1);
    });

    it('应该验证商品库存', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId: testProduct.id, quantity: 99999 }],
          deliveryAddress: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          contactPhone: '03-1234-5678',
        })
        .expect(400);
    });

    it('应该验证商品状态', async () => {
      const inactiveProduct = productRepository.create({
        name: 'E2E未上架商品',
        quantity: 100,
        unit: '个',
        purchasePrice: 100,
        salePrice: 150,
        status: 'pending',
        categoryId: testCategory.id,
      });
      await productRepository.save(inactiveProduct);

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId: inactiveProduct.id, quantity: 1 }],
          deliveryAddress: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          contactPhone: '03-1234-5678',
        })
        .expect(400);

      await productRepository.delete({ name: 'E2E未上架商品' });
    });

    it('应该验证必填字段', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [],
        })
        .expect(400);
    });

    it('应该计算订单金额', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId: testProduct.id, quantity: 10 }],
          deliveryAddress: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          contactPhone: '03-1234-5678',
        })
        .expect(201);

      expect(response.body.subtotal).toBeDefined();
      expect(response.body.taxAmount).toBeDefined();
      expect(response.body.totalAmount).toBeDefined();
    });
  });

  describe('GET /api/orders/my', () => {
    beforeAll(async () => {
      // 创建测试订单
      await orderRepository.save({
        customerId: testCustomer.id,
        orderNo: 'ORD-TEST-001',
        subtotal: 1500,
        discountAmount: 75,
        taxAmount: 142.5,
        totalAmount: 1567.5,
        status: 'pending',
        deliveryAddress: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        contactPhone: '03-1234-5678',
      });
    });

    it('应该客户可以查看自己的订单', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/my')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/orders', () => {
    it('应该销售员可以查看所有订单', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.total).toBeDefined();
    });

    it('应该支持分页', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders?page=1&pageSize=10')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
    });

    it('应该支持状态筛选', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders?status=pending')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      response.body.data.forEach((order: any) => {
        expect(order.status).toBe('pending');
      });
    });

    it('应该支持日期范围筛选', async () => {
      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-12-31').toISOString();
      
      const response = await request(app.getHttpServer())
        .get(`/orders?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/orders/:id', () => {
    let testOrderId: string;

    beforeAll(async () => {
      const order = await orderRepository.save({
        customerId: testCustomer.id,
        orderNo: 'ORD-TEST-DETAIL',
        subtotal: 1500,
        discountAmount: 75,
        taxAmount: 142.5,
        totalAmount: 1567.5,
        status: 'pending',
        deliveryAddress: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        contactPhone: '03-1234-5678',
      });
      testOrderId = order.id;
    });

    it('应该客户可以查看自己的订单详情', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.id).toBe(testOrderId);
      expect(response.body.orderNo).toBe('ORD-TEST-DETAIL');
    });

    it('应该销售员可以查看所有订单详情', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(response.body.id).toBe(testOrderId);
    });

    it('应该返回404当订单不存在', async () => {
      await request(app.getHttpServer())
        .get('/orders/non-existent-id')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/orders/:id/confirm', () => {
    let pendingOrderId: string;

    beforeEach(async () => {
      const order = await orderRepository.save({
        customerId: testCustomer.id,
        orderNo: `ORD-CONFIRM-${Date.now()}`,
        subtotal: 1500,
        discountAmount: 75,
        taxAmount: 142.5,
        totalAmount: 1567.5,
        status: 'pending',
        deliveryAddress: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        contactPhone: '03-1234-5678',
      });
      pendingOrderId = order.id;
    });

    it('应该销售员可以确认订单', async () => {
      const response = await request(app.getHttpServer())
        .put(`/orders/${pendingOrderId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(response.body.status).toBe('confirmed');
      expect(response.body.confirmedAt).toBeDefined();
    });

    it('应该客户不能确认订单', async () => {
      await request(app.getHttpServer())
        .put(`/orders/${pendingOrderId}/confirm`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('应该不能确认非待确认状态的订单', async () => {
      // 先确认订单
      await request(app.getHttpServer())
        .put(`/orders/${pendingOrderId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);

      // 再次尝试确认
      await request(app.getHttpServer())
        .put(`/orders/${pendingOrderId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/orders/:id/complete', () => {
    let confirmedOrderId: string;

    beforeEach(async () => {
      const order = await orderRepository.save({
        customerId: testCustomer.id,
        orderNo: `ORD-COMPLETE-${Date.now()}`,
        subtotal: 1500,
        discountAmount: 75,
        taxAmount: 142.5,
        totalAmount: 1567.5,
        status: 'confirmed',
        deliveryAddress: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        contactPhone: '03-1234-5678',
        confirmedAt: new Date(),
      });
      confirmedOrderId = order.id;
    });

    it('应该销售员可以完成订单', async () => {
      const response = await request(app.getHttpServer())
        .put(`/orders/${confirmedOrderId}/complete`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(response.body.status).toBe('completed');
      expect(response.body.completedAt).toBeDefined();
    });

    it('应该不能完成非已确认状态的订单', async () => {
      const pendingOrder = await orderRepository.save({
        customerId: testCustomer.id,
        orderNo: `ORD-PENDING-${Date.now()}`,
        subtotal: 1500,
        discountAmount: 75,
        taxAmount: 142.5,
        totalAmount: 1567.5,
        status: 'pending',
        deliveryAddress: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        contactPhone: '03-1234-5678',
      });

      await request(app.getHttpServer())
        .put(`/orders/${pendingOrder.id}/complete`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/orders/:id/cancel', () => {
    let pendingOrderId: string;

    beforeEach(async () => {
      const order = await orderRepository.save({
        customerId: testCustomer.id,
        orderNo: `ORD-CANCEL-${Date.now()}`,
        subtotal: 1500,
        discountAmount: 75,
        taxAmount: 142.5,
        totalAmount: 1567.5,
        status: 'pending',
        deliveryAddress: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        contactPhone: '03-1234-5678',
        createdAt: new Date(),
      });
      pendingOrderId = order.id;
    });

    it('应该客户可以在30分钟内取消订单', async () => {
      const response = await request(app.getHttpServer())
        .put(`/orders/${pendingOrderId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.status).toBe('cancelled');
    });

    it('应该销售员可以取消订单', async () => {
      const order = await orderRepository.save({
        customerId: testCustomer.id,
        orderNo: `ORD-CANCEL-SALES-${Date.now()}`,
        subtotal: 1500,
        discountAmount: 75,
        taxAmount: 142.5,
        totalAmount: 1567.5,
        status: 'pending',
        deliveryAddress: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        contactPhone: '03-1234-5678',
      });

      const response = await request(app.getHttpServer())
        .put(`/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(response.body.status).toBe('cancelled');
    });

    it('应该不能取消非待确认状态的订单', async () => {
      const confirmedOrder = await orderRepository.save({
        customerId: testCustomer.id,
        orderNo: `ORD-CONFIRMED-CANCEL-${Date.now()}`,
        subtotal: 1500,
        discountAmount: 75,
        taxAmount: 142.5,
        totalAmount: 1567.5,
        status: 'confirmed',
        deliveryAddress: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        contactPhone: '03-1234-5678',
        confirmedAt: new Date(),
      });

      await request(app.getHttpServer())
        .put(`/orders/${confirmedOrder.id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/orders/batch/confirm', () => {
    it('应该批量确认订单', async () => {
      // 创建多个待确认订单
      const orders = await Promise.all([
        orderRepository.save({
          customerId: testCustomer.id,
          orderNo: `ORD-BATCH-1-${Date.now()}`,
          subtotal: 1500,
          discountAmount: 75,
          taxAmount: 142.5,
          totalAmount: 1567.5,
          status: 'pending',
          deliveryAddress: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          contactPhone: '03-1234-5678',
        }),
        orderRepository.save({
          customerId: testCustomer.id,
          orderNo: `ORD-BATCH-2-${Date.now()}`,
          subtotal: 1500,
          discountAmount: 75,
          taxAmount: 142.5,
          totalAmount: 1567.5,
          status: 'pending',
          deliveryAddress: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          contactPhone: '03-1234-5678',
        }),
      ]);

      const orderIds = orders.map(o => o.id);

      await request(app.getHttpServer())
        .put('/orders/batch/confirm')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ ids: orderIds })
        .expect(200);
    });
  });

  describe('GET /api/orders/available-for-invoice', () => {
    beforeAll(async () => {
      // 创建已完成但未开单的订单
      await orderRepository.save({
        customerId: testCustomer.id,
        orderNo: 'ORD-INVOICE-AVAIL',
        subtotal: 1500,
        discountAmount: 75,
        taxAmount: 142.5,
        totalAmount: 1567.5,
        status: 'completed',
        deliveryAddress: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        contactPhone: '03-1234-5678',
        confirmedAt: new Date(),
        completedAt: new Date(),
      });
    });

    it('应该获取可生成请求书的订单列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/available-for-invoice')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/orders/reports/sales', () => {
    it('应该获取销售报表', async () => {
      const startDate = new Date('2024-01-01').toISOString().split('T')[0];
      const endDate = new Date('2024-12-31').toISOString().split('T')[0];

      const response = await request(app.getHttpServer())
        .get(`/orders/reports/sales?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });
});

import { Like } from 'typeorm';
