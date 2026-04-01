import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from '../services/monitoring.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * 监控控制器
 * 
 * 提供监控数据查询和健康检查接口
 */
@ApiTags('监控')
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  /**
   * 获取完整监控数据
   */
  @Get('metrics')
  @ApiOperation({ summary: '获取监控指标' })
  @ApiResponse({ status: 200, description: '返回性能和系统监控数据' })
  getMetrics() {
    return this.monitoringService.getMonitoringData();
  }

  /**
   * 获取性能摘要
   */
  @Get('performance')
  @ApiOperation({ summary: '获取性能摘要' })
  @ApiResponse({ status: 200, description: '返回性能摘要统计' })
  getPerformance() {
    return this.monitoringService.getPerformanceSummary();
  }

  /**
   * 健康检查
   */
  @Get('health')
  @ApiOperation({ summary: '系统健康检查' })
  @ApiResponse({ status: 200, description: '返回系统健康状态' })
  getHealth() {
    return this.monitoringService.getHealthStatus();
  }

  /**
   * 清空性能指标（仅用于测试）
   */
  @Get('clear')
  @ApiOperation({ summary: '清空性能指标' })
  @ApiResponse({ status: 200, description: '清空性能指标缓存' })
  clearMetrics() {
    this.monitoringService.clearMetrics();
    return { message: 'Metrics cleared successfully' };
  }
}
