import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';
import { Return } from './entities/return.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryLog } from '../inventory/entities/inventory-log.entity';

/**
 * 退货管理模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Return, Order, OrderItem, Product, InventoryLog]),
  ],
  controllers: [ReturnsController],
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
