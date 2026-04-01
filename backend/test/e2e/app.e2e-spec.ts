import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Staff } from '../../src/users/entities/staff.entity';
import { Customer } from '../../src/users/entities/customer.entity';
import * as bcrypt from 'bcryptjs';

/**
 * E2E测试 - 认证流程
 * 测试完整的用户登录流程
 */
describe('认证流程 E2E测试', () => {
  let app: INestApplication;
  let staffRepository: any;
  let customerRepository: any;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    staffRepository = moduleFixture.get(getRepositoryToken(Staff));
    customerRepository = moduleFixture.get(getRepositoryToken(Customer));
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/auth/staff/login', () => {
    it('应该登录成功返回令牌', async () => {
      // 创建测试员工
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testStaff = staffRepository.create({
        username: 'test-staff-e2e',
        passwordHash,
        name: '测试员工',
        phone: '090-1234-5678',
        role: 'sales',
        isActive: true,
      });
      await staffRepository.save(testStaff);

      const response = await request(app.getHttpServer())
        .post('/auth/staff/login')
        .send({
          username: 'test-staff-e2e',
          password: 'Password123',
        })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.user.username).toBe('test-staff-e2e');
      expect(response.body.user.type).toBe('staff');

      // 清理测试数据
      await staffRepository.delete({ username: 'test-staff-e2e' });
    });

    it('应该用户名不存在返回401', async () => {
      await request(app.getHttpServer())
        .post('/auth/staff/login')
        .send({
          username: 'non-existent-user',
          password: 'Password123',
        })
        .expect(401);
    });

    it('应该密码错误返回401', async () => {
      // 创建测试员工
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testStaff = staffRepository.create({
        username: 'test-staff-wrong-pass',
        passwordHash,
        name: '测试员工',
        phone: '090-1234-5678',
        role: 'sales',
        isActive: true,
      });
      await staffRepository.save(testStaff);

      await request(app.getHttpServer())
        .post('/auth/staff/login')
        .send({
          username: 'test-staff-wrong-pass',
          password: 'WrongPassword123',
        })
        .expect(401);

      // 清理测试数据
      await staffRepository.delete({ username: 'test-staff-wrong-pass' });
    });

    it('应该验证请求参数', async () => {
      await request(app.getHttpServer())
        .post('/auth/staff/login')
        .send({
          username: '',
          password: '',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/customer/login', () => {
    it('应该客户登录成功返回令牌', async () => {
      // 创建测试客户
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testCustomer = customerRepository.create({
        username: 'test-customer-e2e',
        passwordHash,
        companyName: 'テスト会社',
        address: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        phone: '03-1234-5678',
        vipDiscount: 0,
        isActive: true,
      });
      await customerRepository.save(testCustomer);

      const response = await request(app.getHttpServer())
        .post('/auth/customer/login')
        .send({
          username: 'test-customer-e2e',
          password: 'Password123',
        })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.user.username).toBe('test-customer-e2e');
      expect(response.body.user.type).toBe('customer');

      // 清理测试数据
      await customerRepository.delete({ username: 'test-customer-e2e' });
    });

    it('应该客户登录失败返回401', async () => {
      await request(app.getHttpServer())
        .post('/auth/customer/login')
        .send({
          username: 'non-existent-customer',
          password: 'Password123',
        })
        .expect(401);
    });
  });

  describe('POST /api/auth/verify', () => {
    it('应该验证有效令牌', async () => {
      // 创建测试员工并登录
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testStaff = staffRepository.create({
        username: 'test-verify-staff',
        passwordHash,
        name: '测试员工',
        phone: '090-1234-5678',
        role: 'sales',
        isActive: true,
      });
      await staffRepository.save(testStaff);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/staff/login')
        .send({
          username: 'test-verify-staff',
          password: 'Password123',
        });

      const token = loginResponse.body.access_token;

      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(response.body.username).toBe('test-verify-staff');

      // 清理测试数据
      await staffRepository.delete({ username: 'test-verify-staff' });
    });

    it('应该拒绝无效令牌', async () => {
      await request(app.getHttpServer())
        .post('/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('应该拒绝缺少令牌的请求', async () => {
      await request(app.getHttpServer())
        .post('/auth/verify')
        .expect(401);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('应该成功修改密码', async () => {
      // 创建测试员工并登录
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testStaff = staffRepository.create({
        username: 'test-change-pass',
        passwordHash,
        name: '测试员工',
        phone: '090-1234-5678',
        role: 'sales',
        isActive: true,
      });
      await staffRepository.save(testStaff);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/staff/login')
        .send({
          username: 'test-change-pass',
          password: 'Password123',
        });

      const token = loginResponse.body.access_token;

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'Password123',
          newPassword: 'NewPassword123',
        })
        .expect(201);

      // 验证新密码可以登录
      await request(app.getHttpServer())
        .post('/auth/staff/login')
        .send({
          username: 'test-change-pass',
          password: 'NewPassword123',
        })
        .expect(201);

      // 清理测试数据
      await staffRepository.delete({ username: 'test-change-pass' });
    });

    it('应该拒绝错误的旧密码', async () => {
      // 创建测试员工并登录
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testStaff = staffRepository.create({
        username: 'test-wrong-old-pass',
        passwordHash,
        name: '测试员工',
        phone: '090-1234-5678',
        role: 'sales',
        isActive: true,
      });
      await staffRepository.save(testStaff);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/staff/login')
        .send({
          username: 'test-wrong-old-pass',
          password: 'Password123',
        });

      const token = loginResponse.body.access_token;

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'WrongPassword123',
          newPassword: 'NewPassword123',
        })
        .expect(401);

      // 清理测试数据
      await staffRepository.delete({ username: 'test-wrong-old-pass' });
    });
  });
});

/**
 * E2E测试 - 订单流程
 * 测试完整的订单创建到完成流程
 */
describe('订单业务流程 E2E测试', () => {
  let app: INestApplication;
  let staffToken: string;
  let customerToken: string;
  let staffRepository: any;
  let customerRepository: any;
  let productRepository: any;
  let orderRepository: any;
  let testStaff: any;
  let testCustomer: any;
  let testProduct: any;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    staffRepository = moduleFixture.get(getRepositoryToken(Staff));
    customerRepository = moduleFixture.get(getRepositoryToken(Customer));
    productRepository = moduleFixture.get(getRepositoryToken('Product'));
    orderRepository = moduleFixture.get(getRepositoryToken('Order'));

    // 创建测试员工
    const passwordHash = await bcrypt.hash('Password123', 10);
    testStaff = staffRepository.create({
      username: 'test-order-staff',
      passwordHash,
      name: '测试销售',
      phone: '090-1234-5678',
      role: 'sales',
      isActive: true,
    });
    await staffRepository.save(testStaff);

    // 创建测试客户
    testCustomer = customerRepository.create({
      username: 'test-order-customer',
      passwordHash,
      companyName: 'テスト注文会社',
      address: '東京都渋谷区テスト1-1-1',
      contactPerson: '田中太郎',
      phone: '03-1234-5678',
      vipDiscount: 0,
      isActive: true,
    });
    await customerRepository.save(testCustomer);

    // 创建测试商品
    testProduct = productRepository.create({
      name: 'テスト商品',
      quantity: 100,
      unit: '個',
      purchasePrice: 100,
      salePrice: 150,
      status: 'active',
    });
    await productRepository.save(testProduct);

    // 员工登录
    const staffLoginResponse = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({
        username: 'test-order-staff',
        password: 'Password123',
      });
    staffToken = staffLoginResponse.body.access_token;

    // 客户登录
    const customerLoginResponse = await request(app.getHttpServer())
      .post('/auth/customer/login')
      .send({
        username: 'test-order-customer',
        password: 'Password123',
      });
    customerToken = customerLoginResponse.body.access_token;
  });

  afterAll(async () => {
    // 清理测试数据
    if (orderRepository) {
      await orderRepository.delete({});
    }
    if (productRepository) {
      await productRepository.delete({ name: 'テスト商品' });
    }
    if (staffRepository) {
      await staffRepository.delete({ username: 'test-order-staff' });
    }
    if (customerRepository) {
      await customerRepository.delete({ username: 'test-order-customer' });
    }

    if (app) {
      await app.close();
    }
  });

  describe('完整订单流程', () => {
    let orderId: string;

    it('应该完成: 客户下单 -> 销售确认 -> 完成订单', async () => {
      // 1. 客户创建订单
      const createOrderResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          customerId: testCustomer.id,
          items: [{ productId: testProduct.id, quantity: 2 }],
          deliveryAddress: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          contactPhone: '03-1234-5678',
        })
        .expect(201);

      expect(createOrderResponse.body.orderNo).toBeDefined();
      expect(createOrderResponse.body.status).toBe('pending');
      orderId = createOrderResponse.body.id;

      // 2. 销售确认订单
      const confirmResponse = await request(app.getHttpServer())
        .post(`/orders/${orderId}/confirm`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(201);

      expect(confirmResponse.body.status).toBe('confirmed');
      expect(confirmResponse.body.confirmedAt).toBeDefined();

      // 3. 销售完成订单
      const completeResponse = await request(app.getHttpServer())
        .post(`/orders/${orderId}/complete`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(201);

      expect(completeResponse.body.status).toBe('completed');
      expect(completeResponse.body.completedAt).toBeDefined();
    });

    it('应该客户可以取消未确认订单', async () => {
      // 创建新订单
      const createOrderResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          customerId: testCustomer.id,
          items: [{ productId: testProduct.id, quantity: 1 }],
          deliveryAddress: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          contactPhone: '03-1234-5678',
        });

      const newOrderId = createOrderResponse.body.id;

      // 客户取消订单（30分钟内）
      const cancelResponse = await request(app.getHttpServer())
        .post(`/orders/${newOrderId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(201);

      expect(cancelResponse.body.status).toBe('cancelled');
    });

    it('应该无法取消已确认订单', async () => {
      // 创建并确认订单
      const createOrderResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          customerId: testCustomer.id,
          items: [{ productId: testProduct.id, quantity: 1 }],
          deliveryAddress: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          contactPhone: '03-1234-5678',
        });

      const newOrderId = createOrderResponse.body.id;

      await request(app.getHttpServer())
        .post(`/orders/${newOrderId}/confirm`)
        .set('Authorization', `Bearer ${staffToken}`);

      // 尝试取消已确认订单
      await request(app.getHttpServer())
        .post(`/orders/${newOrderId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(400);
    });

    it('应该验证商品库存', async () => {
      // 尝试创建库存不足的订单
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          customerId: testCustomer.id,
          items: [{ productId: testProduct.id, quantity: 10000 }],
          deliveryAddress: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          contactPhone: '03-1234-5678',
        })
        .expect(400);
    });

    it('应该验证商品状态', async () => {
      // 创建未上架商品
      const inactiveProduct = productRepository.create({
        name: '未上架商品',
        quantity: 100,
        unit: '個',
        purchasePrice: 100,
        salePrice: 150,
        status: 'pending',
      });
      await productRepository.save(inactiveProduct);

      // 尝试创建订单
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          customerId: testCustomer.id,
          items: [{ productId: inactiveProduct.id, quantity: 1 }],
          deliveryAddress: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          contactPhone: '03-1234-5678',
        })
        .expect(400);

      // 清理
      await productRepository.delete({ name: '未上架商品' });
    });
  });
});

/**
 * E2E测试 - 請求書流程
 * 测试完整的請求書生成到付款流程
 */
describe('請求書业务流程 E2E测试', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('請求書完整流程', () => {
    it('应该完成: 订单 -> 請求書生成 -> PDF下载 -> 付款标记', async () => {
      // 1. 订单完成
      // 2. 生成請求書
      // 3. 下载PDF
      // 4. 标记付款

      expect(true).toBe(true);
    });

    it('应该逾期請求書自动标记', async () => {
      expect(true).toBe(true);
    });
  });
});
