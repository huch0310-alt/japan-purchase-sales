import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

/**
 * JWT payload 接口
 */
export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  type: string;
  iat?: number;
  exp?: number;
}

/**
 * 从请求中提取 JWT
 * 优先从 Authorization Bearer Token 读取，其次从 Cookie 读取
 */
function extractJwtFromRequest(req: any): string | null {
  // 优先从 Authorization header 读取
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  // 其次从 Cookie 读取
  if (req.cookies?.access_token) {
    return req.cookies.access_token;
  }
  return null;
}

/**
 * JWT策略
 * 解析并验证JWT令牌
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) implements OnModuleInit {
  private readonly jwtSecret: string;

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('JWT_SECRET 环境变量未配置，请在 .env 文件中设置');
    }
    super({
      jwtFromRequest: extractJwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    this.jwtSecret = secret;
  }

  async onModuleInit() {
    if (!this.jwtSecret) {
      throw new InternalServerErrorException('JWT_SECRET 未正确初始化');
    }
  }

  async validate(payload: JwtPayload) {
    return this.authService.validateToken(payload);
  }
}
