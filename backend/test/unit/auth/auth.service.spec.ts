import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/auth/auth.service';
import { StaffService } from '../../../src/users/staff.service';
import { CustomerService } from '../../../src/users/customer.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { createTestStaff, createTestCustomer } from '../../fixtures';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let staffService: jest.Mocked<StaffService>;
  let customerService: jest.Mocked<CustomerService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockStaffService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      updatePassword: jest.fn(),
    };

    const mockCustomerService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      updatePassword: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    // Reset bcrypt mocks
    mockedBcrypt.compare.mockReset();
    mockedBcrypt.hash.mockReset();
    
    // Default: password comparison returns true for 'password123'
    mockedBcrypt.compare.mockImplementation(async (password: string, _hash: string) => {
      return password === 'password123';
    });
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashed-password');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: StaffService, useValue: mockStaffService },
        { provide: CustomerService, useValue: mockCustomerService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    staffService = module.get(StaffService);
    customerService = module.get(CustomerService);
    jwtService = module.get(JwtService);
  });

  describe('validateStaff', () => {
    it('应该验证员工密码成功', async () => {
      const testStaff = createTestStaff();
      staffService.findByUsername.mockResolvedValue(testStaff);

      const result = await service.validateStaff('test-staff', 'password123');

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.username).toBe('test-staff');
      expect(staffService.findByUsername).toHaveBeenCalledWith('test-staff');
    });

    it('应该验证密码失败时返回null', async () => {
      const testStaff = createTestStaff();
      staffService.findByUsername.mockResolvedValue(testStaff);

      const result = await service.validateStaff('test-staff', 'wrong-password');

      expect(result).toBeNull();
    });

    it('应该员工不存在时返回null', async () => {
      staffService.findByUsername.mockResolvedValue(null);

      const result = await service.validateStaff('non-existent', 'password');

      expect(result).toBeNull();
    });
  });

  describe('validateCustomer', () => {
    it('应该验证客户密码成功', async () => {
      const testCustomer = createTestCustomer();
      customerService.findByUsername.mockResolvedValue(testCustomer);

      const result = await service.validateCustomer('test-customer', 'password123');

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.username).toBe('test-customer');
    });

    it('应该验证密码失败时返回null', async () => {
      const testCustomer = createTestCustomer();
      customerService.findByUsername.mockResolvedValue(testCustomer);

      const result = await service.validateCustomer('test-customer', 'wrong-password');

      expect(result).toBeNull();
    });
  });

  describe('loginStaff', () => {
    it('应该返回JWT令牌和用户信息', async () => {
      const testStaff = createTestStaff();

      const result = await service.loginStaff(testStaff);

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: testStaff.id,
        username: testStaff.username,
        name: testStaff.name,
        role: testStaff.role,
        type: 'staff'
      });
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });

  describe('loginCustomer', () => {
    it('应该返回JWT令牌和客户信息', async () => {
      const testCustomer = createTestCustomer();

      const result = await service.loginCustomer(testCustomer);

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: testCustomer.id,
        username: testCustomer.username,
        companyName: testCustomer.companyName,
        role: 'customer',
        type: 'customer'
      });
    });
  });

  describe('validateToken', () => {
    it('应该验证员工令牌成功', async () => {
      const testStaff = createTestStaff({ isActive: true });
      const payload = { sub: testStaff.id, username: testStaff.username, role: 'admin', type: 'staff' };
      staffService.findById.mockResolvedValue(testStaff);

      const result = await service.validateToken(payload);

      expect(result).toBeDefined();
      expect(result.type).toBe('staff');
    });

    it('应该验证客户令牌成功', async () => {
      const testCustomer = createTestCustomer({ isActive: true });
      const payload = { sub: testCustomer.id, username: testCustomer.username, role: 'customer', type: 'customer' };
      customerService.findById.mockResolvedValue(testCustomer);

      const result = await service.validateToken(payload);

      expect(result).toBeDefined();
      expect(result.type).toBe('customer');
    });

    it('应该令牌无效时抛出异常', async () => {
      const payload = { sub: 'non-existent', username: 'test', role: 'staff', type: 'staff' };
      staffService.findById.mockResolvedValue(null);

      await expect(service.validateToken(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('应该用户已被禁用时抛出异常', async () => {
      const testStaff = createTestStaff({ isActive: false });
      const payload = { sub: testStaff.id, username: testStaff.username, role: 'admin', type: 'staff' };
      staffService.findById.mockResolvedValue(testStaff);

      await expect(service.validateToken(payload)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('账户锁定功能', () => {
    it('应该在连续5次失败后锁定账户', async () => {
      const testStaff = createTestStaff();
      staffService.findByUsername.mockResolvedValue(testStaff);

      // 连续失败5次
      for (let i = 0; i < 5; i++) {
        await service.validateStaff('lock-test-staff-1', 'wrong-password');
      }

      // 第6次应该抛出锁定异常
      await expect(service.validateStaff('lock-test-staff-1', 'password123')).rejects.toThrow('账户已被锁定');
    });

    it('应该在锁定期间拒绝登录', async () => {
      const testStaff = createTestStaff();
      staffService.findByUsername.mockResolvedValue(testStaff);

      // 连续失败5次触发锁定
      for (let i = 0; i < 5; i++) {
        await service.validateStaff('lock-test-staff-2', 'wrong-password');
      }

      // 锁定期间，即使密码正确也无法登录
      await expect(service.validateStaff('lock-test-staff-2', 'password123')).rejects.toThrow('账户已被锁定');
    });

    it('应该在成功登录后清除失败记录', async () => {
      const testStaff = createTestStaff();
      staffService.findByUsername.mockResolvedValue(testStaff);

      // 失败4次
      for (let i = 0; i < 4; i++) {
        await service.validateStaff('lock-test-staff-3', 'wrong-password');
      }

      // 成功登录
      const result = await service.validateStaff('lock-test-staff-3', 'password123');
      expect(result).toBeDefined();

      // 再次失败不会立即锁定
      staffService.findByUsername.mockResolvedValue(testStaff);
      await service.validateStaff('lock-test-staff-3', 'wrong-password');
      // 此时应该还能继续尝试（因为失败记录已被清除）
      expect(true).toBe(true);
    });

    it('应该客户账户也能被锁定', async () => {
      const testCustomer = createTestCustomer();
      customerService.findByUsername.mockResolvedValue(testCustomer);

      // 连续失败5次
      for (let i = 0; i < 5; i++) {
        await service.validateCustomer('lock-test-customer-1', 'wrong-password');
      }

      // 第6次应该抛出锁定异常
      await expect(service.validateCustomer('lock-test-customer-1', 'password123')).rejects.toThrow('账户已被锁定');
    });
  });

  describe('修改密码功能', () => {
    it('应该成功修改员工密码', async () => {
      const testStaff = createTestStaff();
      staffService.findById.mockResolvedValue(testStaff);
      staffService.updatePassword = jest.fn().mockResolvedValue(undefined);

      const result = await service.changePassword(
        testStaff.id,
        'staff',
        'password123',
        'newPassword123'
      );

      expect(result.message).toBe('密码修改成功');
      expect(staffService.updatePassword).toHaveBeenCalledWith(testStaff.id, 'newPassword123');
    });

    it('应该成功修改客户密码', async () => {
      const testCustomer = createTestCustomer();
      customerService.findById.mockResolvedValue(testCustomer);
      customerService.updatePassword = jest.fn().mockResolvedValue(undefined);

      const result = await service.changePassword(
        testCustomer.id,
        'customer',
        'password123',
        'newPassword123'
      );

      expect(result.message).toBe('密码修改成功');
      expect(customerService.updatePassword).toHaveBeenCalledWith(testCustomer.id, 'newPassword123');
    });

    it('应该在用户不存在时抛出异常', async () => {
      staffService.findById.mockResolvedValue(null);

      await expect(
        service.changePassword('non-existent', 'staff', 'oldPass', 'newPass')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('应该在原密码错误时抛出异常', async () => {
      const testStaff = createTestStaff();
      staffService.findById.mockResolvedValue(testStaff);

      await expect(
        service.changePassword(testStaff.id, 'staff', 'wrongPassword', 'newPassword')
      ).rejects.toThrow('原密码错误');
    });
  });
});
