import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

/**
 * HTTP异常响应对象
 */
interface ExceptionResponse {
  message?: string | string[];
  errors?: Record<string, unknown>;
}

/**
 * HTTP异常过滤器
 * 统一处理HTTP异常和格式化错误响应
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let errors: Record<string, unknown> | null = null;

    // CSRF 错误（csurf 抛出的错误通常不属于 HttpException）
    if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as { code?: unknown }).code === 'EBADCSRFTOKEN'
    ) {
      status = HttpStatus.FORBIDDEN;
      message = 'CSRF token 缺失或无效';
    } else
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as ExceptionResponse;
        message = Array.isArray(responseObj.message) ? responseObj.message[0] : (responseObj.message || message);
        errors = responseObj.errors || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 日志记录
    this.logger.error(`[${new Date().toISOString()}] ${status} - ${message}`, exception);

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
