import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Staff } from '../../src/users/entities/staff.entity';
import { Customer } from '../../src/users/entities/customer.entity';
import * as bcrypt from 'bcryptjs';

/**
 * E2E测试 - 认证模块
 * 测试登录、登出、token验证、密码修改等功能
 */
describe('认证模块 E2E测试', () => {
  let app: INestApplication;
  let staffRepository: any;
  let customerRepository: any;

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
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/auth/staff/login', () => {
    it('应该成功登录员工账号', async () => {
      // 创建测试员工
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testStaff = staffRepository.create({
        username: 'test-staff-login',
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
          username: 'test-staff-login',
          password: 'Password123',
        })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.user.username).toBe('test-staff-login');
      expect(response.body.user.type).toBe('staff');
      expect(response.body.user.role).toBe('sales');

      // 清理测试数据
      await staffRepository.delete({ username: 'test-staff-login' });
    });

    it('应该拒绝不存在的用户名', async () => {
      await request(app.getHttpServer())
        .post('/auth/staff/login')
        .send({
          username: 'non-existent-user',
          password: 'Password123',
        })
        .expect(401);
    });

    it('应该拒绝错误的密码', async () => {
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testStaff = staffRepository.create({
        username: 'test-wrong-pass',
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
          username: 'test-wrong-pass',
          password: 'WrongPassword123',
        })
        .expect(401);

      await staffRepository.delete({ username: 'test-wrong-pass' });
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

    it('应该拒绝未激活的员工账号', async () => {
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testStaff = staffRepository.create({
        username: 'inactive-staff',
        passwordHash,
        name: '未激活员工',
        phone: '090-1234-5678',
        role: 'sales',
        isActive: false,
      });
      await staffRepository.save(testStaff);

      await request(app.getHttpServer())
        .post('/auth/staff/login')
        .send({
          username: 'inactive-staff',
          password: 'Password123',
        })
        .expect(401);

      await staffRepository.delete({ username: 'inactive-staff' });
    });
  });

  describe('POST /api/auth/customer/login', () => {
    it('应该成功登录客户账号', async () => {
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testCustomer = customerRepository.create({
        username: 'test-customer-login',
        passwordHash,
        companyName: 'テスト株式会社',
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
          username: 'test-customer-login',
          password: 'Password123',
        })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.user.username).toBe('test-customer-login');
      expect(response.body.user.type).toBe('customer');

      await customerRepository.delete({ username: 'test-customer-login' });
    });

    it('应该拒绝不存在的客户账号', async () => {
      await request(app.getHttpServer())
        .post('/auth/customer/login')
        .send({
          username: 'non-existent-customer',
          password: 'Password123',
        })
        .expect(401);
    });

    it('应该拒绝未激活的客户账号', async () => {
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testCustomer = customerRepository.create({
        username: 'inactive-customer',
        passwordHash,
        companyName: '未激活会社',
        address: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        phone: '03-1234-5678',
        vipDiscount: 0,
        isActive: false,
      });
      await customerRepository.save(testCustomer);

      await request(app.getHttpServer())
        .post('/auth/customer/login')
        .send({
          username: 'inactive-customer',
          password: 'Password123',
        })
        .expect(401);

      await customerRepository.delete({ username: 'inactive-customer' });
    });
  });

  describe('POST /api/auth/verify', () => {
    it('应该验证有效的JWT令牌', async () => {
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testStaff = staffRepository.create({
        username: 'test-verify',
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
          username: 'test-verify',
          password: 'Password123',
        });

      const token = loginResponse.body.access_token;

      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(response.body.username).toBe('test-verify');
      expect(response.body.type).toBe('staff');

      await staffRepository.delete({ username: 'test-verify' });
    });

    it('应该拒绝无效的JWT令牌', async () => {
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

    it('应该拒绝过期的JWT令牌', async () => {
      // 使用一个明显过期的token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsInVzZXJuYW1lIjoidGVzdCIsInR5cGUiOiJzdGFmZiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjM5MDIyfQ.invalid';
      
      await request(app.getHttpServer())
        .post('/auth/verify')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('应该成功修改密码', async () => {
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
          newPassword: 'NewPassword456',
        })
        .expect(201);

      // 验证新密码可以登录
      await request(app.getHttpServer())
        .post('/auth/staff/login')
        .send({
          username: 'test-change-pass',
          password: 'NewPassword456',
        })
        .expect(201);

      await staffRepository.delete({ username: 'test-change-pass' });
    });

    it('应该拒绝错误的旧密码', async () => {
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
          newPassword: 'NewPassword456',
        })
        .expect(401);

      await staffRepository.delete({ username: 'test-wrong-old-pass' });
    });

    it('应该验证密码参数', async () => {
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testStaff = staffRepository.create({
        username: 'test-invalid-pass',
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
          username: 'test-invalid-pass',
          password: 'Password123',
        });

      const token = loginResponse.body.access_token;

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: '',
          newPassword: '',
        })
        .expect(400);

      await staffRepository.delete({ username: 'test-invalid-pass' });
    });

    it('应该客户也能修改密码', async () => {
      const passwordHash = await bcrypt.hash('Password123', 10);
      const testCustomer = customerRepository.create({
        username: 'test-customer-change-pass',
        passwordHash,
        companyName: 'テスト株式会社',
        address: '東京都渋谷区テスト1-1-1',
        contactPerson: '田中太郎',
        phone: '03-1234-5678',
        vipDiscount: 0,
        isActive: true,
      });
      await customerRepository.save(testCustomer);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/customer/login')
        .send({
          username: 'test-customer-change-pass',
          password: 'Password123',
        });

      const token = loginResponse.body.access_token;

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'Password123',
          newPassword: 'NewPassword456',
        })
        .expect(201);

      await customerRepository.delete({ username: 'test-customer-change-pass' });
    });
  });

  describe('权限验证', () => {
    it('应该不同角色的员工有正确的权限标识', async () => {
      const roles = ['super_admin', 'admin', 'procurement', 'sales'];
      
      for (const role of roles) {
        const passwordHash = await bcrypt.hash('Password123', 10);
        const testStaff = staffRepository.create({
          username: `test-role-${role}`,
          passwordHash,
          name: `测试${role}`,
          phone: '090-1234-5678',
          role: role,
          isActive: true,
        });
        await staffRepository.save(testStaff);

        const loginResponse = await request(app.getHttpServer())
          .post('/auth/staff/login')
          .send({
            username: `test-role-${role}`,
            password: 'Password123',
          });

        expect(loginResponse.body.user.role).toBe(role);

        await staffRepository.delete({ username: `test-role-${role}` });
      }
    });
  });
});
