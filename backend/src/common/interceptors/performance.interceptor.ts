import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 性能监控指标接口
 */
interface PerformanceMetrics {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
  requestSize?: number;
  responseSize?: number;
}

/**
 * 性能监控拦截器
 * 
 * 功能：
 * 1. 记录请求响应时间
 * 2. 监控慢请求（>1000ms）
 * 3. 收集性能指标
 * 4. 支持告警阈值配置
 * 
 * 使用方式：
 * 在 main.ts 中全局注册：
 * app.useGlobalInterceptors(new PerformanceInterceptor());
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  
  // 慢请求阈值（毫秒）
  private readonly slowRequestThreshold = 1000;
  
  // 性能统计（内存存储，生产环境应使用Redis等）
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetricsSize = 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const startTime = Date.now();
    const startTimeHr = process.hrtime.bigint();

    // 提取请求信息
    const { method, url, headers, body } = request;
    const userAgent = headers['user-agent'];
    const ip = request.ip || request.connection?.remoteAddress;
    const userId = request.user?.id;

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const statusCode = response.statusCode;

          // 计算更精确的响应时间（纳秒级）
          const endTimeHr = process.hrtime.bigint();
          const durationNs = Number(endTimeHr - startTimeHr);
          const durationMs = durationNs / 1_000_000;

          // 构建性能指标
          const metrics: PerformanceMetrics = {
            timestamp: new Date().toISOString(),
            method,
            url,
            statusCode,
            duration: Math.round(durationMs * 100) / 100, // 保留2位小数
            userAgent,
            ip,
            userId,
            requestSize: body ? JSON.stringify(body).length : 0,
            responseSize: data ? JSON.stringify(data).length : 0,
          };

          // 存储指标
          this.recordMetrics(metrics);

          // 记录日志
          this.logger.log(
            `${method} ${url} ${statusCode} - ${durationMs.toFixed(2)}ms`,
          );

          // 慢请求告警
          if (durationMs > this.slowRequestThreshold) {
            this.logger.warn(
              `⚠️ 慢请求告警: ${method} ${url} 耗时 ${durationMs.toFixed(2)}ms`,
            );
          }

          // 错误状态告警
          if (statusCode >= 400) {
            this.logger.warn(
              `⚠️ 错误响应: ${method} ${url} ${statusCode}`,
            );
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const statusCode = error.status || 500;

          // 构建错误性能指标
          const metrics: PerformanceMetrics = {
            timestamp: new Date().toISOString(),
            method,
            url,
            statusCode,
            duration,
            userAgent,
            ip,
            userId,
          };

          this.recordMetrics(metrics);

          this.logger.error(
            `❌ 请求异常: ${method} ${url} ${statusCode} - ${duration}ms`,
          );
        },
      }),
    );
  }

  /**
   * 记录性能指标
   */
  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // 防止内存溢出，保留最新的1000条记录
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics.shift();
    }
  }

  /**
   * 获取性能统计
   */
  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  /**
   * 获取性能摘要统计
   */
  getSummary(): {
    totalRequests: number;
    averageResponseTime: number;
    slowRequests: number;
    errorRate: number;
    requestsPerMinute: number;
  } {
    const total = this.metrics.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowRequests: 0,
        errorRate: 0,
        requestsPerMinute: 0,
      };
    }

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const slowRequests = this.metrics.filter(m => m.duration > this.slowRequestThreshold).length;
    const errorRequests = this.metrics.filter(m => m.statusCode >= 400).length;

    // 计算每分钟请求数（基于最近5分钟的数据）
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentRequests = this.metrics.filter(
      m => new Date(m.timestamp).getTime() > fiveMinutesAgo
    ).length;
    const requestsPerMinute = recentRequests / 5;

    return {
      totalRequests: total,
      averageResponseTime: Math.round(totalDuration / total),
      slowRequests,
      errorRate: Math.round((errorRequests / total) * 100),
      requestsPerMinute: Math.round(requestsPerMinute),
    };
  }

  /**
   * 清空指标
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}
