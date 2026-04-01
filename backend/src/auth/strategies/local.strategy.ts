import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Staff } from '../../users/entities/staff.entity';
import { Customer } from '../../users/entities/customer.entity';

/**
 * 登录用户类型（带类型标识）
 */
type LoginUser = Omit<Staff, 'passwordHash'> & { type: 'staff' } | Omit<Customer, 'passwordHash'> & { type: 'customer' };

/**
 * 本地策略
 * 用于账号密码登录验证
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'username' });
  }

  async validate(username: string, password: string): Promise<LoginUser> {
    // 尝试员工登录
    const staffUser = await this.authService.validateStaff(username, password);
    if (staffUser) {
      const { ...user } = staffUser;
      return { ...user, type: 'staff' } as LoginUser;
    }
    // 尝试客户登录
    const customerUser = await this.authService.validateCustomer(username, password);
    if (customerUser) {
      const { ...user } = customerUser;
      return { ...user, type: 'customer' } as LoginUser;
    }
    throw new UnauthorizedException('用户名或密码错误');
  }
}
