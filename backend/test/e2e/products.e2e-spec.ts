import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Staff } from '../../src/users/entities/staff.entity';
import { Product } from '../../src/products/entities/product.entity';
import { Category } from '../../src/categories/entities/category.entity';
import * as bcrypt from 'bcryptjs';

/**
 * E2E测试 - 商品管理模块
 * 测试商品CRUD、状态流转、权限控制等功能
 */
describe('商品管理模块 E2E测试', () => {
  let app: INestApplication;
  let staffRepository: any;
  let productRepository: any;
  let categoryRepository: any;
  let procurementToken: string;
  let salesToken: string;
  let adminToken: string;
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
    productRepository = moduleFixture.get(getRepositoryToken(Product));
    categoryRepository = moduleFixture.get(getRepositoryToken(Category));

    // 创建测试分类
    testCategory = categoryRepository.create({
      name: 'E2E测试分类',
      sortOrder: 1,
      isActive: true,
    });
    await categoryRepository.save(testCategory);

    // 创建采购员账号
    const procurementPasswordHash = await bcrypt.hash('Password123', 10);
    const procurement = staffRepository.create({
      username: 'e2e-procurement',
      passwordHash: procurementPasswordHash,
      name: '采购员',
      phone: '090-1111-1111',
      role: 'procurement',
      isActive: true,
    });
    await staffRepository.save(procurement);

    // 创建销售员账号
    const salesPasswordHash = await bcrypt.hash('Password123', 10);
    const sales = staffRepository.create({
      username: 'e2e-sales',
      passwordHash: salesPasswordHash,
      name: '销售员',
      phone: '090-2222-2222',
      role: 'sales',
      isActive: true,
    });
    await staffRepository.save(sales);

    // 创建管理员账号
    const adminPasswordHash = await bcrypt.hash('Password123', 10);
    const admin = staffRepository.create({
      username: 'e2e-admin',
      passwordHash: adminPasswordHash,
      name: '管理员',
      phone: '090-3333-3333',
      role: 'admin',
      isActive: true,
    });
    await staffRepository.save(admin);

    // 登录获取token
    const procurementLogin = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({ username: 'e2e-procurement', password: 'Password123' });
    procurementToken = procurementLogin.body.access_token;

    const salesLogin = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({ username: 'e2e-sales', password: 'Password123' });
    salesToken = salesLogin.body.access_token;

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/staff/login')
      .send({ username: 'e2e-admin', password: 'Password123' });
    adminToken = adminLogin.body.access_token;
  });

  afterAll(async () => {
    // 清理测试数据
    await productRepository.delete({ name: Like('E2E测试%') });
    await staffRepository.delete({ username: Like('e2e-%') });
    await categoryRepository.delete({ name: 'E2E测试分类' });
    
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/products', () => {
    it('应该采购员可以创建商品', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${procurementToken}`)
        .send({
          name: 'E2E测试商品-创建',
          quantity: 100,
          unit: '个',
          description: 'E2E测试商品描述',
          categoryId: testCategory.id,
          purchasePrice: 100,
        })
        .expect(201);

      expect(response.body.name).toBe('E2E测试商品-创建');
      expect(response.body.status).toBe('pending');
      expect(response.body.quantity).toBe(100);
    });

    it('应该销售员不能创建商品', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          name: 'E2E测试商品-无权限',
          quantity: 100,
          unit: '个',
        })
        .expect(403);
    });

    it('应该验证必填字段', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${procurementToken}`)
        .send({
          name: '',
        })
        .expect(400);
    });
  });

  describe('GET /api/products', () => {
    beforeAll(async () => {
      // 创建测试商品
      for (let i = 1; i <= 3; i++) {
        await productRepository.save({
          name: `E2E测试商品-列表${i}`,
          quantity: 100,
          unit: '个',
          purchasePrice: 100,
          salePrice: 150,
          status: i === 1 ? 'active' : i === 2 ? 'pending' : 'approved',
          categoryId: testCategory.id,
        });
      }
    });

    it('应该获取所有商品列表（需要权限）', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('应该支持分页', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?page=1&pageSize=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(2);
    });

    it('应该支持状态筛选', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?status=active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.data.forEach((product: any) => {
        expect(product.status).toBe('active');
      });
    });

    it('应该支持关键词搜索', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?keyword=E2E测试商品-列表')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.total).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/active', () => {
    it('应该获取已上架商品（无需权限）', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/active')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/products/pending', () => {
    it('应该获取待审核商品（需要权限）', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/pending')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/products/:id/approve', () => {
    let pendingProductId: string;

    beforeAll(async () => {
      const product = await productRepository.save({
        name: 'E2E测试商品-待审核',
        quantity: 100,
        unit: '个',
        purchasePrice: 100,
        status: 'pending',
        categoryId: testCategory.id,
      });
      pendingProductId = product.id;
    });

    it('应该销售员可以审核通过商品', async () => {
      const response = await request(app.getHttpServer())
        .put(`/products/${pendingProductId}/approve`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ salePrice: 150 })
        .expect(200);

      expect(response.body.status).toBe('approved');
      expect(response.body.salePrice).toBe(150);
    });

    it('应该采购员不能审核商品', async () => {
      const product = await productRepository.save({
        name: 'E2E测试商品-待审核2',
        quantity: 100,
        unit: '个',
        purchasePrice: 100,
        status: 'pending',
        categoryId: testCategory.id,
      });

      await request(app.getHttpServer())
        .put(`/products/${product.id}/approve`)
        .set('Authorization', `Bearer ${procurementToken}`)
        .send({ salePrice: 150 })
        .expect(403);
    });

    it('应该不能审核非待审核状态的商品', async () => {
      const product = await productRepository.save({
        name: 'E2E测试商品-已审核',
        quantity: 100,
        unit: '个',
        purchasePrice: 100,
        salePrice: 150,
        status: 'approved',
        categoryId: testCategory.id,
      });

      await request(app.getHttpServer())
        .put(`/products/${product.id}/approve`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ salePrice: 160 })
        .expect(400);
    });
  });

  describe('PUT /api/products/:id/reject', () => {
    let pendingProductId: string;

    beforeAll(async () => {
      const product = await productRepository.save({
        name: 'E2E测试商品-待拒绝',
        quantity: 100,
        unit: '个',
        purchasePrice: 100,
        status: 'pending',
        categoryId: testCategory.id,
      });
      pendingProductId = product.id;
    });

    it('应该销售员可以拒绝商品', async () => {
      const response = await request(app.getHttpServer())
        .put(`/products/${pendingProductId}/reject`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(response.body.status).toBe('rejected');
    });
  });

  describe('PUT /api/products/:id/activate', () => {
    let approvedProductId: string;

    beforeAll(async () => {
      const product = await productRepository.save({
        name: 'E2E测试商品-待上架',
        quantity: 100,
        unit: '个',
        purchasePrice: 100,
        salePrice: 150,
        status: 'approved',
        categoryId: testCategory.id,
      });
      approvedProductId = product.id;
    });

    it('应该销售员可以上架商品', async () => {
      const response = await request(app.getHttpServer())
        .put(`/products/${approvedProductId}/activate`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(response.body.status).toBe('active');
    });

    it('应该不能上架非已审核状态的商品', async () => {
      const product = await productRepository.save({
        name: 'E2E测试商品-待审核不能上架',
        quantity: 100,
        unit: '个',
        purchasePrice: 100,
        status: 'pending',
        categoryId: testCategory.id,
      });

      await request(app.getHttpServer())
        .put(`/products/${product.id}/activate`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/products/:id/deactivate', () => {
    let activeProductId: string;

    beforeAll(async () => {
      const product = await productRepository.save({
        name: 'E2E测试商品-待下架',
        quantity: 100,
        unit: '个',
        purchasePrice: 100,
        salePrice: 150,
        status: 'active',
        categoryId: testCategory.id,
      });
      activeProductId = product.id;
    });

    it('应该销售员可以下架商品', async () => {
      const response = await request(app.getHttpServer())
        .put(`/products/${activeProductId}/deactivate`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(response.body.status).toBe('inactive');
    });
  });

  describe('PUT /api/products/batch/deactivate', () => {
    let productIds: string[];

    beforeAll(async () => {
      const products = await Promise.all([
        productRepository.save({
          name: 'E2E测试商品-批量下架1',
          quantity: 100,
          unit: '个',
          purchasePrice: 100,
          salePrice: 150,
          status: 'active',
          categoryId: testCategory.id,
        }),
        productRepository.save({
          name: 'E2E测试商品-批量下架2',
          quantity: 100,
          unit: '个',
          purchasePrice: 100,
          salePrice: 150,
          status: 'active',
          categoryId: testCategory.id,
        }),
      ]);
      productIds = products.map(p => p.id);
    });

    it('应该批量下架商品', async () => {
      await request(app.getHttpServer())
        .put('/products/batch/deactivate')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ ids: productIds })
        .expect(200);
    });
  });

  describe('GET /api/products/:id', () => {
    let testProductId: string;

    beforeAll(async () => {
      const product = await productRepository.save({
        name: 'E2E测试商品-详情',
        quantity: 100,
        unit: '个',
        purchasePrice: 100,
        salePrice: 150,
        status: 'active',
        categoryId: testCategory.id,
      });
      testProductId = product.id;
    });

    it('应该获取商品详情', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${testProductId}`)
        .expect(200);

      expect(response.body.id).toBe(testProductId);
      expect(response.body.name).toBe('E2E测试商品-详情');
    });

    it('应该返回404当商品不存在', async () => {
      await request(app.getHttpServer())
        .get('/products/non-existent-id')
        .expect(404);
    });
  });

  describe('PUT /api/products/:id', () => {
    let testProductId: string;

    beforeAll(async () => {
      const product = await productRepository.save({
        name: 'E2E测试商品-更新',
        quantity: 100,
        unit: '个',
        purchasePrice: 100,
        salePrice: 150,
        status: 'active',
        categoryId: testCategory.id,
      });
      testProductId = product.id;
    });

    it('应该更新商品信息', async () => {
      const response = await request(app.getHttpServer())
        .put(`/products/${testProductId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          name: 'E2E测试商品-已更新',
          salePrice: 200,
        })
        .expect(200);

      expect(response.body.name).toBe('E2E测试商品-已更新');
      expect(response.body.salePrice).toBe(200);
    });
  });

  describe('DELETE /api/products/:id', () => {
    let testProductId: string;

    beforeAll(async () => {
      const product = await productRepository.save({
        name: 'E2E测试商品-删除',
        quantity: 100,
        unit: '个',
        purchasePrice: 100,
        salePrice: 150,
        status: 'active',
        categoryId: testCategory.id,
      });
      testProductId = product.id;
    });

    it('应该管理员可以删除商品', async () => {
      await request(app.getHttpServer())
        .delete(`/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('应该销售员不能删除商品', async () => {
      const product = await productRepository.save({
        name: 'E2E测试商品-删除无权限',
        quantity: 100,
        unit: '个',
        purchasePrice: 100,
        salePrice: 150,
        status: 'active',
        categoryId: testCategory.id,
      });

      await request(app.getHttpServer())
        .delete(`/products/${product.id}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(403);
    });
  });

  describe('GET /api/products/stats/hot', () => {
    beforeAll(async () => {
      // 创建热销商品
      await productRepository.save({
        name: 'E2E测试商品-热销1',
        quantity: 100,
        unit: '个',
        purchasePrice: 100,
        salePrice: 150,
        status: 'active',
        salesCount: 1000,
        categoryId: testCategory.id,
      });
    });

    it('应该获取热销商品排行', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/stats/hot?limit=5')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});

import { Like } from 'typeorm';
