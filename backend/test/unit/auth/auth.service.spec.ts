import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/auth/auth.service';
import { StaffService } from '../../../src/users/staff.service';
import { CustomerService } from '../../../src/users/customer.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { createTestStaff, createTestCustomer } from '../../fixtures';

describe('AuthService', () => {
  let service: AuthService;
  let staffService: jest.Mocked<StaffService>;
  let customerService: jest.Mocked<CustomerService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockStaffService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
    };

    const mockCustomerService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

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
      expect(result.username).toBe('test-staff');
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
      expect(result.username).toBe('test-customer');
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
  });
});
