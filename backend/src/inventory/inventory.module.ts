import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryLog } from './entities/inventory-log.entity';
import { InventoryAlert } from './entities/inventory-alert.entity';
import { Product } from '../products/entities/product.entity';
import { MessagesModule } from '../messages/messages.module';

/**
 * 库存管理模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryLog, InventoryAlert, Product]),
    MessagesModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
