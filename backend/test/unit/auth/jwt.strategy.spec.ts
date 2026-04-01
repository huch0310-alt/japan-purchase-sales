import { JwtStrategy } from '../../../src/auth/strategies/jwt.strategy';
import { StaffService } from '../../../src/users/staff.service';
import { CustomerService } from '../../../src/users/customer.service';
import { AuthService } from '../../../src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { createTestStaff, createTestCustomer } from '../../fixtures';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: jest.Mocked<ConfigService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('test-jwt-secret-key-for-testing'),
    } as any;

    authService = {
      validateToken: jest.fn(),
    } as any;

    strategy = new JwtStrategy(configService, authService);
  });

  describe('validate', () => {
    it('应该验证员工载荷并返回用户', async () => {
      const testStaff = createTestStaff();
      const payload = { sub: testStaff.id, username: testStaff.username, role: 'admin', type: 'staff' };
      authService.validateToken.mockResolvedValue({ ...testStaff, type: 'staff' });

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        ...testStaff,
        type: 'staff'
      });
      expect(authService.validateToken).toHaveBeenCalledWith(payload);
    });

    it('应该验证客户载荷并返回用户', async () => {
      const testCustomer = createTestCustomer();
      const payload = { sub: testCustomer.id, username: testCustomer.username, role: 'customer', type: 'customer' };
      authService.validateToken.mockResolvedValue({ ...testCustomer, type: 'customer' });

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        ...testCustomer,
        type: 'customer'
      });
      expect(authService.validateToken).toHaveBeenCalledWith(payload);
    });
  });
});
