import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from '../users/users.module';

/**
 * 认证模块
 * 处理员工和客户的登录认证
 */
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        const insecurePlaceholder = 'japan-purchase-sales-secret-key-change-in-production';

        // 安全验证：生产环境禁止使用默认占位符
        if (process.env.NODE_ENV === 'production') {
          if (jwtSecret === insecurePlaceholder) {
            throw new Error('🚨 安全错误: JWT_SECRET 使用了默认占位符！请在生产环境使用强随机密钥。');
          }
          if (!jwtSecret || jwtSecret.length < 32) {
            throw new Error('🚨 安全错误: JWT_SECRET 必须至少32个字符。');
          }
        }

        return {
          secret: jwtSecret,
          signOptions: { expiresIn: '7d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
