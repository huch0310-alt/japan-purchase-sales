import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ExportService } from '../common/services/export.service';
import { StatsService } from '../common/services/stats.service';
import { ReportsController } from './reports.controller';
import { StatsController } from './stats.controller';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Customer } from '../users/entities/customer.entity';

/**
 * 报表模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product, Invoice, Customer]),
    // 报表导出接口需要更严格的限流（每分钟10次）
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
      name: 'export'
    }]),
  ],
  providers: [ExportService, StatsService],
  controllers: [ReportsController, StatsController],
  exports: [ExportService, StatsService],
})
export class ReportsModule {}
