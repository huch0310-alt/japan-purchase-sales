import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { StatsService } from '../common/services/stats.service';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../users/entities/customer.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

/**
 * 仪表盘模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Customer, Invoice])],
  controllers: [DashboardController],
  providers: [StatsService],
})
export class DashboardModule {}
