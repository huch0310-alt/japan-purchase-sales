import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT认证守卫
 * 验证请求头中的JWT令牌
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
