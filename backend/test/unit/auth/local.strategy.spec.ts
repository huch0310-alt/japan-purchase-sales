import { LocalStrategy } from '../../../src/auth/strategies/local.strategy';
import { AuthService } from '../../../src/auth/auth.service';
import { createTestStaff } from '../../fixtures';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    authService = {
      validateStaff: jest.fn(),
      validateCustomer: jest.fn(),
    } as any;

    strategy = new LocalStrategy(authService);
  });

  describe('validate', () => {
    it('应该验证员工凭证成功', async () => {
      const testStaff = createTestStaff();
      authService.validateStaff.mockResolvedValue(testStaff);

      const result = await strategy.validate('test-staff', 'password123');

      expect(result).toBeDefined();
      expect(result!.username).toBe('test-staff');
      expect(result!.type).toBe('staff');
      expect(authService.validateStaff).toHaveBeenCalledWith('test-staff', 'password123');
    });

    it('应该验证客户凭证成功', async () => {
      const testStaff = createTestStaff();
      authService.validateStaff.mockResolvedValue(null);
      authService.validateCustomer.mockResolvedValue(testStaff as any);

      const result = await strategy.validate('test-customer', 'password123');

      expect(result).toBeDefined();
      expect(result!.type).toBe('customer');
    });

    it('应该验证失败时抛出异常', async () => {
      authService.validateStaff.mockResolvedValue(null);
      authService.validateCustomer.mockResolvedValue(null);

      await expect(strategy.validate('test-staff', 'wrong-password')).rejects.toThrow();
    });
  });
});
