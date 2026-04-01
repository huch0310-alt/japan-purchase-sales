import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { StaffService } from '../users/staff.service';
import { CustomerService } from '../users/customer.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { Staff } from '../users/entities/staff.entity';
import { Customer } from '../users/entities/customer.entity';

/**
 * 登录失败记录
 */
interface LoginFailureRecord {
  count: number;
  firstFailureAt: number;
  lockedUntil: number | null;
}

// 登录失败记录缓存（生产环境应使用 Redis）
const loginFailures = new Map<string, LoginFailureRecord>();

// 配置常量
const MAX_LOGIN_ATTEMPTS = 5;        // 最大失败次数
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;  // 锁定时长 15 分钟
const FAILURE_WINDOW_MS = 30 * 60 * 1000;    // 失败计数窗口 30 分钟
const LOGIN_FAILURE_TTL_MS = 24 * 60 * 60 * 1000; // 记录最长保留 24 小时（防止 Map 无限增长）
const LOGIN_FAILURE_MAX_KEYS = 10000; // 最多记录 1 万个 key（防止被恶意打爆内存）

/**
 * 认证服务
 * 负责员工和客户的登录验证、密码校验
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private staffService: StaffService,
    private customerService: CustomerService,
    private jwtService: JwtService,
  ) {
    // 生产环境警告：登录失败计数使用内存 Map，分布式部署时应使用 Redis
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('🚨 生产环境警告: 登录失败计数使用内存 Map，分布式部署时应配置 Redis');
      this.logger.warn('建议设置环境变量 USE_REDIS=true 并配置 REDIS_URL');
    }
  }

  /**
   * 清理过期的登录失败记录（简单防御：避免 Map 无限增长）
   */
  private cleanupLoginFailures(now: number) {
    for (const [key, record] of loginFailures.entries()) {
      const lastRelevantAt = record.lockedUntil ? Math.max(record.firstFailureAt, record.lockedUntil) : record.firstFailureAt;
      if (now - lastRelevantAt > LOGIN_FAILURE_TTL_MS) {
        loginFailures.delete(key);
      }
    }
  }

  /**
   * 控制 Map 容量上限（达到上限时先清理过期，再删除最旧的一批）
   */
  private ensureLoginFailuresCapacity(now: number) {
    if (loginFailures.size < LOGIN_FAILURE_MAX_KEYS) return;
    this.cleanupLoginFailures(now);
    if (loginFailures.size < LOGIN_FAILURE_MAX_KEYS) return;

    // 仍超限：删除最旧的 10%（用 firstFailureAt 近似“最旧”）
    const entries = Array.from(loginFailures.entries());
    entries.sort((a, b) => a[1].firstFailureAt - b[1].firstFailureAt);
    const removeCount = Math.max(1, Math.floor(LOGIN_FAILURE_MAX_KEYS * 0.1));
    for (let i = 0; i < Math.min(removeCount, entries.length); i++) {
      loginFailures.delete(entries[i][0]);
    }
  }

  /**
   * 检查账户是否被锁定
   */
  private checkAccountLockout(username: string, userType: string): void {
    const key = `${userType}:${username}`;
    const record = loginFailures.get(key);

    if (record && record.lockedUntil) {
      if (Date.now() < record.lockedUntil) {
        const remainingMinutes = Math.ceil((record.lockedUntil - Date.now()) / 60000);
        throw new BadRequestException(`账户已被锁定，请在 ${remainingMinutes} 分钟后重试`);
      }
      // 锁定已过期，清除记录
      loginFailures.delete(key);
    }
  }

  /**
   * 记录登录失败
   */
  private recordLoginFailure(username: string, userType: string): void {
    const key = `${userType}:${username}`;
    const now = Date.now();
    this.ensureLoginFailuresCapacity(now);
    let record = loginFailures.get(key);

    if (!record || (now - record.firstFailureAt) > FAILURE_WINDOW_MS) {
      // 超过窗口期，重置计数
      record = {
        count: 1,
        firstFailureAt: now,
        lockedUntil: null,
      };
    } else {
      record.count++;
    }

    // 检查是否达到锁定阈值
    if (record.count >= MAX_LOGIN_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_DURATION_MS;
    }

    loginFailures.set(key, record);
  }

  /**
   * 清除登录失败记录
   */
  private clearLoginFailure(username: string, userType: string): void {
    const key = `${userType}:${username}`;
    loginFailures.delete(key);
  }

  /**
   * 验证员工登录
   */
  async validateStaff(username: string, password: string): Promise<Omit<Staff, 'passwordHash'> | null> {
    // 检查是否被锁定
    this.checkAccountLockout(username, 'staff');

    const staff = await this.staffService.findByUsername(username);
    if (staff && await bcrypt.compare(password, staff.passwordHash)) {
      // 登录成功，清除失败记录
      this.clearLoginFailure(username, 'staff');
      const { passwordHash, ...result } = staff;
      return result;
    }

    // 登录失败
    this.recordLoginFailure(username, 'staff');
    return null;
  }

  /**
   * 验证客户登录
   */
  async validateCustomer(username: string, password: string): Promise<Omit<Customer, 'passwordHash'> | null> {
    // 检查是否被锁定
    this.checkAccountLockout(username, 'customer');

    const customer = await this.customerService.findByUsername(username);
    if (customer && await bcrypt.compare(password, customer.passwordHash)) {
      // 登录成功，清除失败记录
      this.clearLoginFailure(username, 'customer');
      const { passwordHash, ...result } = customer;
      return result;
    }

    // 登录失败
    this.recordLoginFailure(username, 'customer');
    return null;
  }

  /**
   * 员工登录并返回JWT
   */
  async loginStaff(staff: Omit<Staff, 'passwordHash'>) {
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
  async loginCustomer(customer: Omit<Customer, 'passwordHash'>) {
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
  async validateToken(payload: JwtPayload) {
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
    let user: Staff | Customer | null;

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
