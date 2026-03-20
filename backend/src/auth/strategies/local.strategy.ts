import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * 本地策略
 * 用于账号密码登录验证
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'username' });
  }

  async validate(username: string, password: string): Promise<any> {
    // 尝试员工登录
    let user = await this.authService.validateStaff(username, password);
    if (user) {
      return { ...user, type: 'staff' };
    }
    // 尝试客户登录
    user = await this.authService.validateCustomer(username, password);
    if (user) {
      return { ...user, type: 'customer' };
    }
    throw new UnauthorizedException('用户名或密码错误');
  }
}
