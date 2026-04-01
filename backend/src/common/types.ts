import { Request } from 'express';

// 用户类型定义
export interface UserPayload {
  id: string;
  username: string;
  role: string;
  type: 'staff' | 'customer';
  companyName?: string;
  isActive?: boolean;
}

// 扩展 Express Request 类型
export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

/**
 * 操作审计日志上下文（由 Controller 组装并传入 Service）
 */
export interface OperationAuditContext {
  userId: string;
  userRole: string;
  ip?: string;
}