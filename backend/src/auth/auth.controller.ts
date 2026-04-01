import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, UnauthorizedException, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/types';

/**
 * 登录请求DTO
 */
class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

/**
 * 修改密码DTO
 */
class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

/**
 * 认证控制器
 * 处理登录、登出、密码修改等请求
 */
@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookieSecure(): boolean {
    return (process.env.COOKIE_SECURE || (process.env.NODE_ENV === 'production' ? 'true' : 'false')) === 'true';
  }

  private getCookieSameSite(): 'lax' | 'strict' | 'none' {
    const sameSite = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();
    if (sameSite === 'none') return 'none';
    if (sameSite === 'strict') return 'strict';
    return 'lax';
  }

  private getAuthCookieMaxAgeMs(): number {
    // 默认 7 天，与 JWT_EXPIRES_IN=7d 保持一致（可通过环境变量覆盖）
    const maxAge = Number(process.env.AUTH_COOKIE_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000);
    return Number.isFinite(maxAge) ? maxAge : 7 * 24 * 60 * 60 * 1000;
  }

  /**
   * 员工登录
   */
  @Post('staff/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '员工账号密码登录' })
  async staffLogin(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const staff = await this.authService.validateStaff(loginDto.username, loginDto.password);
    if (!staff) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const result = await this.authService.loginStaff(staff);

    // 设置 HttpOnly Cookie（安全措施，防止 XSS 攻击读取 token）
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: this.getCookieSecure(),
      sameSite: this.getCookieSameSite(),
      path: '/',
      maxAge: this.getAuthCookieMaxAgeMs(),
    });

    return result;
  }

  /**
   * 客户登录
   */
  @Post('customer/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '客户账号密码登录' })
  async customerLogin(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const customer = await this.authService.validateCustomer(loginDto.username, loginDto.password);
    if (!customer) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const result = await this.authService.loginCustomer(customer);

    // 设置 HttpOnly Cookie（安全措施，防止 XSS 攻击读取 token）
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: this.getCookieSecure(),
      sameSite: this.getCookieSameSite(),
      path: '/',
      maxAge: this.getAuthCookieMaxAgeMs(),
    });

    return result;
  }

  /**
   * 验证令牌
   */
  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证JWT令牌' })
  async verifyToken(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  /**
   * 修改密码
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修改密码' })
  async changePassword(@Request() req: AuthenticatedRequest, @Body() changePasswordDto: ChangePasswordDto) {
    const user = req.user;
    const userType = user.type || 'staff';

    return this.authService.changePassword(
      user.id,
      userType,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }
}
