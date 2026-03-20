import { LocalStrategy } from '../../../src/auth/strategies/local.strategy';
import { AuthService } from '../../../src/auth/auth.service';
import { createTestStaff } from '../../fixtures';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    authService = {
      validateStaff: jest.fn(),
    } as any;

    strategy = new LocalStrategy(authService);
  });

  describe('validate', () => {
    it('应该验证员工凭证成功', async () => {
      const testStaff = createTestStaff();
      authService.validateStaff.mockResolvedValue(testStaff);

      const result = await strategy.validate('test-staff', 'password123');

      expect(result).toEqual(testStaff);
      expect(authService.validateStaff).toHaveBeenCalledWith('test-staff', 'password123');
    });

    it('应该验证失败时抛出异常', async () => {
      authService.validateStaff.mockResolvedValue(null);

      await expect(strategy.validate('test-staff', 'wrong-password')).rejects.toThrow();
    });
  });
});
