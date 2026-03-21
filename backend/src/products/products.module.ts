import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { EventService } from '../common/services/event.service';

/**
 * 商品模块
 * 处理商品管理相关功能
 */
@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsService, EventService],
  controllers: [ProductsController],
  exports: [ProductsService, EventService],
})
export class ProductsModule {}
