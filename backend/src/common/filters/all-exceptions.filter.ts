import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * 错误详情接口
 */
interface ErrorDetail {
  type: string;
  message: string;
  stack?: string;
  code?: string | number;
  details?: any;
}

/**
 * 异常响应格式
 */
interface ExceptionResponse {
  success: false;
  statusCode: number;
  message: string;
  error: ErrorDetail;
  timestamp: string;
  path: string;
  requestId?: string;
}

/**
 * 全局异常过滤器
 * 
 * 功能：
 * 1. 统一异常处理
 * 2. 详细错误追踪
 * 3. 堆栈记录
 * 4. 错误分类
 * 5. 告警通知
 * 
 * 使用方式：
 * 在 main.ts 中全局注册：
 * app.useGlobalFilters(new AllExceptionsFilter());
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 提取请求信息
    const { method, url, body, headers, query, params } = request;
    const userAgent = headers['user-agent'];
    const ip = request.ip || request.connection?.remoteAddress;
    const userId = (request as any).user?.id;

    // 构建错误详情
    const errorDetail = this.buildErrorDetail(exception);
    const statusCode = this.getStatusCode(exception);

    // 生成请求ID（用于追踪）
    const requestId = this.generateRequestId();

    // 构建响应
    const errorResponse: ExceptionResponse = {
      success: false,
      statusCode,
      message: errorDetail.message,
      error: errorDetail,
      timestamp: new Date().toISOString(),
      path: url,
      requestId,
    };

    // 记录详细错误日志
    this.logError(exception, {
      requestId,
      method,
      url,
      statusCode,
      userId,
      ip,
      userAgent,
      body: this.sanitizeBody(body),
      query,
      params,
    });

    // 发送告警（生产环境应接入告警系统）
    this.sendAlert(exception, statusCode, requestId);

    // 返回错误响应
    response.status(statusCode).json(errorResponse);
  }

  /**
   * 构建错误详情
   */
  private buildErrorDetail(exception: unknown): ErrorDetail {
    // CSRF 错误
    if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as any).code === 'EBADCSRFTOKEN'
    ) {
      return {
        type: 'CSRF_ERROR',
        message: 'CSRF token 缺失或无效',
        code: 'EBADCSRFTOKEN',
      };
    }

    // HTTP 异常
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      let message = '请求失败';
      let details: any = undefined;

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object') {
        const responseObj = response as any;
        message = responseObj.message || message;
        details = responseObj.errors || responseObj.details;
      }

      return {
        type: 'HTTP_ERROR',
        message: Array.isArray(message) ? message[0] : message,
        code: exception.getStatus(),
        details,
        stack: exception.stack,
      };
    }

    // 数据库错误
    if (exception instanceof QueryFailedError) {
      const dbError = exception as any;
      return {
        type: 'DATABASE_ERROR',
        message: this.getDatabaseErrorMessage(dbError),
        code: dbError.code,
        details: {
          constraint: dbError.constraint,
          table: dbError.table,
          column: dbError.column,
        },
        stack: exception.stack,
      };
    }

    // 普通错误
    if (exception instanceof Error) {
      return {
        type: 'SYSTEM_ERROR',
        message: exception.message,
        stack: exception.stack,
      };
    }

    // 未知错误
    return {
      type: 'UNKNOWN_ERROR',
      message: '服务器内部错误',
    };
  }

  /**
   * 获取HTTP状态码
   */
  private getStatusCode(exception: unknown): number {
    // CSRF 错误
    if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as any).code === 'EBADCSRFTOKEN'
    ) {
      return HttpStatus.FORBIDDEN;
    }

    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception instanceof QueryFailedError) {
      return HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * 获取数据库错误消息
   */
  private getDatabaseErrorMessage(error: any): string {
    const code = error.code;

    // PostgreSQL 错误码映射
    const errorMessages: Record<string, string> = {
      '23505': '数据已存在，违反唯一性约束',
      '23503': '关联数据不存在，违反外键约束',
      '23502': '必填字段不能为空',
      '23514': '数据验证失败，违反检查约束',
      '22001': '数据长度超出限制',
      '22003': '数值超出范围',
      '22004': '空值不允许',
      '22005': '数据类型转换错误',
      '22008': '日期时间格式错误',
      '22P02': '数据格式无效',
      '42P01': '表不存在',
      '42703': '列不存在',
    };

    return errorMessages[code] || `数据库错误: ${error.message || '未知错误'}`;
  }

  /**
   * 记录错误日志
   */
  private logError(
    exception: unknown,
    context: {
      requestId: string;
      method: string;
      url: string;
      statusCode: number;
      userId?: string;
      ip?: string;
      userAgent?: string;
      body?: any;
      query?: any;
      params?: any;
    },
  ): void {
    const { requestId, method, url, statusCode, userId, ip } = context;

    // 构建日志消息
    const logMessage = [
      `[${requestId}]`,
      `${method} ${url}`,
      `Status: ${statusCode}`,
      userId ? `User: ${userId}` : '',
      ip ? `IP: ${ip}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    // 根据错误级别选择日志方法
    if (statusCode >= 500) {
      this.logger.error(logMessage, exception);
    } else if (statusCode >= 400) {
      this.logger.warn(logMessage);
    } else {
      this.logger.log(logMessage);
    }

    // 详细错误信息（开发环境）
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug('Request Context:', JSON.stringify(context, null, 2));
      if (exception instanceof Error) {
        this.logger.debug('Stack Trace:', exception.stack);
      }
    }
  }

  /**
   * 发送告警
   */
  private sendAlert(
    exception: unknown,
    statusCode: number,
    requestId: string,
  ): void {
    // 5xx 错误告警
    if (statusCode >= 500) {
      this.logger.error(
        `🚨 严重错误告警 [${requestId}]: ${statusCode} - ${
          exception instanceof Error ? exception.message : '未知错误'
        }`,
      );

      // TODO: 生产环境应接入告警系统
      // 例如：发送邮件、钉钉、企业微信、Slack等
      // this.alertService.send({
      //   level: 'critical',
      //   message: `服务器错误: ${exception.message}`,
      //   requestId,
      //   timestamp: new Date().toISOString(),
      // });
    }

    // 数据库错误告警
    if (exception instanceof QueryFailedError) {
      this.logger.warn(
        `⚠️ 数据库错误 [${requestId}]: ${(exception as any).code}`,
      );
    }
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 清理敏感信息 - 防御性编程，防止密码等敏感信息出现在日志中
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    // 密码相关字段黑名单
    const sensitiveFields = [
      'password',
      'passwordConfirm',
      'passwordHash',
      'currentPassword',
      'newPassword',
      'oldPassword',
      'token',
      'secret',
      'apiKey',
      'api_key',
      'accessToken',
      'refreshToken',
      'Authorization',
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field] !== undefined) {
        sanitized[field] = '***FILTERED***';
      }
    });

    // 递归清理嵌套对象
    for (const key of Object.keys(sanitized)) {
      if (key !== '__proto__' && key !== 'constructor') {
        const value = sanitized[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          sanitized[key] = this.sanitizeBody(value);
        }
      }
    }

    return sanitized;
  }
}
