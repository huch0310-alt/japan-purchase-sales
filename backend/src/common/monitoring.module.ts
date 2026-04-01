import { Module, Global } from '@nestjs/common';
import { MonitoringService } from './services/monitoring.service';
import { MonitoringController } from './controllers/monitoring.controller';

/**
 * 监控模块
 * 
 * 提供系统监控功能，包括：
 * - 性能监控
 * - 健康检查
 * - 监控数据查询
 */
@Global()
@Module({
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
