import { SetMetadata } from '@nestjs/common';

/**
 * 角色装饰器键名
 */
export const ROLES_KEY = 'roles';

/**
 * 角色装饰器
 * 用于指定接口需要的角色
 * @example
 * @Roles('super_admin', 'admin')
 * @Get('admin')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
