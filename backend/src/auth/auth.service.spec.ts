import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { StaffService } from '../users/staff.service';
import { CustomerService } from '../users/customer.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock StaffService
const mockStaffService = {
  findByUsername: jest.fn(),
  findById: jest.fn(),
  updatePassword: jest.fn(),
};

// Mock CustomerService
const mockCustomerService = {
  findByUsername: jest.fn(),
  findById: jest.fn(),
  updatePassword: jest.fn(),
};

// Mock JwtService
const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let staffService: typeof mockStaffService;
  let customerService: typeof mockCustomerService;

  beforeEach(async () => {
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

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('validateStaff', () => {
    it('应该成功验证员工登录', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockStaff = {
        id: 'staff-1',
        username: 'testuser',
        passwordHash: hashedPassword,
        name: 'Test Staff',
        role: 'sales',
      };

      mockStaffService.findByUsername.mockResolvedValue(mockStaff);

      const result = await service.validateStaff('testuser', 'password123');

      expect(result).toBeDefined();
      expect(result!.username).toBe('testuser');
    });

    it('密码错误时应该返回null', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockStaff = {
        id: 'staff-1',
        username: 'testuser',
        passwordHash: hashedPassword,
      };

      mockStaffService.findByUsername.mockResolvedValue(mockStaff);

      const result = await service.validateStaff('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('用户不存在时应该返回null', async () => {
      mockStaffService.findByUsername.mockResolvedValue(null);

      const result = await service.validateStaff('nonexistent', 'password');

      expect(result).toBeNull();
    });
  });

  describe('validateCustomer', () => {
    it('应该成功验证客户登录', async () => {
      const hashedPassword = await bcrypt.hash('customerpass', 10);
      const mockCustomer = {
        id: 'customer-1',
        username: 'testcustomer',
        passwordHash: hashedPassword,
        companyName: 'Test Company',
      };

      mockCustomerService.findByUsername.mockResolvedValue(mockCustomer);

      const result = await service.validateCustomer('testcustomer', 'customerpass');

      expect(result).toBeDefined();
      expect(result!.username).toBe('testcustomer');
    });
  });

  describe('loginStaff', () => {
    it('应该返回JWT token和用户信息', async () => {
      const mockStaff = {
        id: 'staff-1',
        username: 'admin',
        name: 'Admin User',
        role: 'admin',
      };

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.loginStaff(mockStaff as any);

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.username).toBe('admin');
      expect(result.user.role).toBe('admin');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: 'admin',
        sub: 'staff-1',
        role: 'admin',
        type: 'staff',
      });
    });
  });

  describe('validateToken', () => {
    it('应该验证有效的员工token', async () => {
      const mockStaff = {
        id: 'staff-1',
        username: 'admin',
        isActive: true,
      };

      mockStaffService.findById.mockResolvedValue(mockStaff);

      const payload = { sub: 'staff-1', type: 'staff', role: 'admin' };
      const result = await service.validateToken(payload as any);

      expect(result.id).toBe('staff-1');
      expect(result.type).toBe('staff');
    });

    it('无效token应该抛出异常', async () => {
      mockStaffService.findById.mockResolvedValue(null);

      const payload = { sub: 'nonexistent', type: 'staff', role: 'admin' };

      await expect(service.validateToken(payload as any)).rejects.toThrow(UnauthorizedException);
    });
  });
});
