import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
  oldPassword: string;
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

  /**
   * 员工登录
   */
  @Post('staff/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '员工账号密码登录' })
  async staffLogin(@Body() loginDto: LoginDto) {
    const staff = await this.authService.validateStaff(loginDto.username, loginDto.password);
    if (!staff) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return this.authService.loginStaff(staff);
  }

  /**
   * 客户登录
   */
  @Post('customer/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '客户账号密码登录' })
  async customerLogin(@Body() loginDto: LoginDto) {
    const customer = await this.authService.validateCustomer(loginDto.username, loginDto.password);
    if (!customer) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return this.authService.loginCustomer(customer);
  }

  /**
   * 验证令牌
   */
  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证JWT令牌' })
  async verifyToken(@Request() req) {
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
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
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
