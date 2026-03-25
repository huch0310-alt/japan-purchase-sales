import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { StaffService } from '../users/staff.service';
import { CustomerService } from '../users/customer.service';

/**
 * 认证服务
 * 负责员工和客户的登录验证、密码校验
 */
@Injectable()
export class AuthService {
  constructor(
    private staffService: StaffService,
    private customerService: CustomerService,
    private jwtService: JwtService,
  ) {}

  /**
   * 验证员工登录
   */
  async validateStaff(username: string, password: string): Promise<any> {
    const staff = await this.staffService.findByUsername(username);
    if (staff && await bcrypt.compare(password, staff.passwordHash)) {
      const { passwordHash, ...result } = staff;
      return result;
    }
    return null;
  }

  /**
   * 验证客户登录
   */
  async validateCustomer(username: string, password: string): Promise<any> {
    const customer = await this.customerService.findByUsername(username);
    if (customer && await bcrypt.compare(password, customer.passwordHash)) {
      const { passwordHash, ...result } = customer;
      return result;
    }
    return null;
  }

  /**
   * 员工登录并返回JWT
   */
  async loginStaff(staff: any) {
    const payload = {
      username: staff.username,
      sub: staff.id,
      role: staff.role,
      type: 'staff'
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: staff.id,
        username: staff.username,
        name: staff.name,
        role: staff.role,
        type: 'staff'
      }
    };
  }

  /**
   * 客户登录并返回JWT
   */
  async loginCustomer(customer: any) {
    const payload = {
      username: customer.username,
      sub: customer.id,
      role: 'customer',
      type: 'customer'
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: customer.id,
        username: customer.username,
        companyName: customer.companyName,
        role: 'customer',
        type: 'customer'
      }
    };
  }

  /**
   * 验证JWT令牌
   */
  async validateToken(payload: any) {
    if (payload.type === 'staff') {
      const staff = await this.staffService.findById(payload.sub);
      if (staff && staff.isActive) {
        return { ...staff, type: 'staff' };
      }
    } else if (payload.type === 'customer') {
      const customer = await this.customerService.findById(payload.sub);
      if (customer && customer.isActive) {
        return { ...customer, type: 'customer' };
      }
    }
    throw new UnauthorizedException('无效的令牌');
  }

  /**
   * 修改密码
   */
  async changePassword(
    userId: string,
    userType: 'staff' | 'customer',
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    let user: any;

    if (userType === 'staff') {
      user = await this.staffService.findById(userId);
    } else {
      user = await this.customerService.findById(userId);
    }

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('原密码错误');
    }

    // 更新密码 (直接传明文, service内部会哈希)
    if (userType === 'staff') {
      await this.staffService.updatePassword(userId, newPassword);
    } else {
      await this.customerService.updatePassword(userId, newPassword);
    }

    return { message: '密码修改成功' };
  }
}
