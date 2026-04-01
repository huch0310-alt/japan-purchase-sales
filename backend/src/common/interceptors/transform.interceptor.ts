import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 统一响应格式接口
 */
export interface ApiResponse<T> {
  code: number;      // 业务状态码
  message: string;   // 提示信息
  data: T;           // 业务数据
  timestamp: number; // 时间戳
}

/**
 * 响应转换拦截器
 * 将所有响应统一包装为标准格式
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        message: 'success',
        data: data || null,
        timestamp: Date.now(),
      })),
    );
  }
}
