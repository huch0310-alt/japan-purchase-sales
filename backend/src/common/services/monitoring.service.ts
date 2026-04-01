import { Injectable, Logger } from '@nestjs/common';
import { PerformanceInterceptor } from '../interceptors/performance.interceptor';

/**
 * 监控数据接口
 */
export interface MonitoringData {
  timestamp: string;
  performance: {
    summary: any;
    recentMetrics: any[];
  };
  system: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
}

/**
 * 监控服务
 * 
 * 提供系统监控数据收集和查询功能
 */
@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private performanceInterceptor: PerformanceInterceptor;

  /**
   * 设置性能拦截器引用
   */
  setPerformanceInterceptor(interceptor: PerformanceInterceptor): void {
    this.performanceInterceptor = interceptor;
  }

  /**
   * 获取监控数据
   */
  getMonitoringData(): MonitoringData {
    const performanceData = this.performanceInterceptor
      ? {
          summary: this.performanceInterceptor.getSummary(),
          recentMetrics: this.performanceInterceptor.getMetrics().slice(-100),
        }
      : { summary: null, recentMetrics: [] };

    return {
      timestamp: new Date().toISOString(),
      performance: performanceData,
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
    };
  }

  /**
   * 获取性能摘要
   */
  getPerformanceSummary(): any {
    if (!this.performanceInterceptor) {
      return {
        error: 'Performance interceptor not initialized',
      };
    }

    return this.performanceInterceptor.getSummary();
  }

  /**
   * 获取系统健康状态
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    checks: Record<string, any>;
  } {
    const checks: Record<string, any> = {};

    // 内存检查
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    checks.memory = {
      status: memoryUsagePercent < 85 ? 'ok' : memoryUsagePercent < 95 ? 'warning' : 'critical',
      usage: memoryUsagePercent.toFixed(2) + '%',
      heapUsed: this.formatBytes(memoryUsage.heapUsed),
      heapTotal: this.formatBytes(memoryUsage.heapTotal),
    };

    // 性能检查
    if (this.performanceInterceptor) {
      const summary = this.performanceInterceptor.getSummary();
      checks.performance = {
        status: summary.errorRate < 5 ? 'ok' : summary.errorRate < 10 ? 'warning' : 'critical',
        averageResponseTime: summary.averageResponseTime + 'ms',
        errorRate: summary.errorRate + '%',
        slowRequests: summary.slowRequests,
      };
    }

    // 运行时间检查
    checks.uptime = {
      status: 'ok',
      value: this.formatUptime(process.uptime()),
    };

    // 确定整体状态
    const statuses = Object.values(checks).map((check: any) => check.status);
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (statuses.includes('critical')) {
      overallStatus = 'critical';
    } else if (statuses.includes('warning')) {
      overallStatus = 'warning';
    }

    return {
      status: overallStatus,
      checks,
    };
  }

  /**
   * 清空性能指标
   */
  clearMetrics(): void {
    if (this.performanceInterceptor) {
      this.performanceInterceptor.clearMetrics();
      this.logger.log('Performance metrics cleared');
    }
  }

  /**
   * 格式化字节数
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 格式化运行时间
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  }
}
