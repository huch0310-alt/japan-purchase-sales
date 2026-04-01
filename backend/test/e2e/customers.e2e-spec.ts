import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Staff } from '../../src/users/entities/staff.entity';
import { Customer } from '../../src/users/entities/customer.entity';
import * as bcrypt from 'bcryptjs';
import { Like } from 'typeorm';

/**
 * E2E测试 - 客户管理模块
 * 测试客户CRUD、权限控制等功能
 */
describe('客户管理模块 E2E测试', () => {
  let app: INestApplication;
  let staffRepository: any;
  let customerRepository: any;
  let adminToken: string;
  let salesToken: string;
  let superAdminToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    staffRepository = moduleFixture.get(getRepositoryToken(Staff));
    customerRepository = moduleFixture.get(getRepositoryToken(Customer));

    // 创建测试员工
    const passwordHash = await bcrypt.hash('Password123', 10);
    await staffRepository.save([
      { username: 'e2e-customer-superadmin', passwordHash, name: '超级管理员', phone: '090-1111-1111', role: 'super_admin', isActive: true },
      { username: 'e2e-customer-admin', passwordHash, name: '管理员', phone: '090-2222-2222', role: 'admin', isActive: true },
      { username: 'e2e-customer-sales', passwordHash, name: '销售员', phone: '090-3333-3333', role: 'sales', isActive: true },
    ]);

    // 登录获取token
    const superAdminLogin = await request(app.getHttpServer())
      .post('/auth/staff/login').send({ username: 'e2e-customer-superadmin', password: 'Password123' });
    superAdminToken = superAdminLogin.body.access_token;

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/staff/login').send({ username: 'e2e-customer-admin', password: 'Password123' });
    adminToken = adminLogin.body.access_token;

    const salesLogin = await request(app.getHttpServer())
      .post('/auth/staff/login').send({ username: 'e2e-customer-sales', password: 'Password123' });
    salesToken = salesLogin.body.access_token;
  });

  afterAll(async () => {
    await customerRepository.delete({ username: Like('e2e-test-%') });
    await staffRepository.delete({ username: Like('e2e-customer-%') });
    if (app) await app.close();
  });

  describe('POST /api/customers', () => {
    it('应该管理员可以创建客户', async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'e2e-test-customer1',
          password: 'Password123',
          companyName: 'E2Eテスト株式会社',
          address: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          phone: '03-1234-5678',
          vipDiscount: 95,
        })
        .expect(201);

      expect(response.body.username).toBe('e2e-test-customer1');
    });

    it('应该销售员不能创建客户', async () => {
      await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          username: 'e2e-test-noauth',
          password: 'Password123',
          companyName: '無権限テスト株式会社',
          address: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          phone: '03-1234-5678',
        })
        .expect(403);
    });

    it('应该验证必填字段', async () => {
      await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: '', password: '' })
        .expect(400);
    });
  });

  describe('GET /api/customers', () => {
    beforeAll(async () => {
      const passwordHash = await bcrypt.hash('Password123', 10);
      for (let i = 1; i <= 3; i++) {
        await customerRepository.save({
          username: `e2e-test-list${i}`,
          passwordHash,
          companyName: `リストテスト株式会社${i}`,
          address: '東京都渋谷区テスト1-1-1',
          contactPerson: '田中太郎',
          phone: '03-1234-5678',
          vipDiscount: 95,
          isActive: true,
        });
      }
    });

    it('应该管理员可以获取客户列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('应该支持分页', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers?page=1&pageSize=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(2);
    });

    it('应该支持关键词搜索', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers?keyword=リストテスト')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.total).toBeGreaterThan(0);
    });
  });

  describe('GET /api/customers/:id', () => {
    let testCustomerId: string;

    beforeAll(async () => {
      const customer = await customerRepository.save({
        username: 'e2e-test-detail',
        passwordHash: await bcrypt.hash('Password123', 10),
        companyName: '詳細テスト株式会社',
        address: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        phone: '03-1234-5678',
        vipDiscount: 95,
        isActive: true,
      });
      testCustomerId = customer.id;
    });

    it('应该管理员可以获取客户详情', async () => {
      const response = await request(app.getHttpServer())
        .get(`/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(testCustomerId);
    });

    it('应该不返回密码哈希', async () => {
      const response = await request(app.getHttpServer())
        .get(`/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.passwordHash).toBeUndefined();
    });

    it('应该返回404当客户不存在', async () => {
      await request(app.getHttpServer())
        .get('/customers/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/customers/:id', () => {
    let testCustomerId: string;

    beforeAll(async () => {
      const customer = await customerRepository.save({
        username: 'e2e-test-update',
        passwordHash: await bcrypt.hash('Password123', 10),
        companyName: '更新前株式会社',
        address: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        phone: '03-1234-5678',
        vipDiscount: 95,
        isActive: true,
      });
      testCustomerId = customer.id;
    });

    it('应该管理员可以更新客户信息', async () => {
      const response = await request(app.getHttpServer())
        .put(`/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          companyName: '更新後株式会社',
          contactPerson: '鈴木一郎',
          vipDiscount: 90,
        })
        .expect(200);

      expect(response.body.companyName).toBe('更新後株式会社');
      expect(response.body.vipDiscount).toBe(90);
    });

    it('应该销售员不能更新客户信息', async () => {
      await request(app.getHttpServer())
        .put(`/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ companyName: '無権限更新' })
        .expect(403);
    });
  });

  describe('DELETE /api/customers/:id', () => {
    let testCustomerId: string;

    beforeEach(async () => {
      const customer = await customerRepository.save({
        username: `e2e-test-delete-${Date.now()}`,
        passwordHash: await bcrypt.hash('Password123', 10),
        companyName: '削除テスト株式会社',
        address: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        phone: '03-1234-5678',
        vipDiscount: 95,
        isActive: true,
      });
      testCustomerId = customer.id;
    });

    it('应该超级管理员可以删除客户', async () => {
      await request(app.getHttpServer())
        .delete(`/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });

    it('应该普通管理员不能删除客户', async () => {
      await request(app.getHttpServer())
        .delete(`/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });
  });
});
