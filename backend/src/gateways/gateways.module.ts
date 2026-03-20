import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RealtimeGateway } from './realtime.gateway';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

/**
 * WebSocket网关模块
 * 全局共享，使所有模块都可以使用实时通讯
 */
@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [RealtimeGateway, JwtStrategy],
  exports: [RealtimeGateway, JwtModule],
})
export class GatewaysModule {}
