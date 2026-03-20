import { JwtStrategy } from '../../../src/auth/strategies/jwt.strategy';
import { StaffService } from '../../../src/users/staff.service';
import { CustomerService } from '../../../src/users/customer.service';
import { createTestStaff, createTestCustomer } from '../../fixtures';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let staffService: jest.Mocked<StaffService>;
  let customerService: jest.Mocked<CustomerService>;

  beforeEach(() => {
    staffService = {
      findById: jest.fn(),
    } as any;

    customerService = {
      findById: jest.fn(),
    } as any;

    strategy = new JwtStrategy(staffService, customerService);
  });

  describe('validate', () => {
    it('应该验证员工载荷并返回用户', async () => {
      const testStaff = createTestStaff();
      const payload = { sub: testStaff.id, username: testStaff.username, role: 'admin', type: 'staff' };
      staffService.findById.mockResolvedValue(testStaff);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        ...testStaff,
        type: 'staff'
      });
    });

    it('应该验证客户载荷并返回用户', async () => {
      const testCustomer = createTestCustomer();
      const payload = { sub: testCustomer.id, username: testCustomer.username, role: 'customer', type: 'customer' };
      customerService.findById.mockResolvedValue(testCustomer);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        ...testCustomer,
        type: 'customer'
      });
    });
  });
});
