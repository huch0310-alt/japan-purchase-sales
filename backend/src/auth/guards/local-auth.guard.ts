import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 本地认证守卫
 * 用于账号密码登录
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
