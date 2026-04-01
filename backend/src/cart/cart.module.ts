import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { UsersModule } from '../users/users.module';
import { SettingsModule } from '../settings/settings.module';

/**
 * 购物车模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([CartItem]), UsersModule, SettingsModule],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
