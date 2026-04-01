import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { OrdersModule } from '../orders/orders.module';
import { SettingsModule } from '../settings/settings.module';
import { LogsModule } from '../logs/logs.module';

/**
 * 請求書模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
    forwardRef(() => OrdersModule),
    SettingsModule,
    LogsModule,
  ],
  providers: [InvoicesService],
  controllers: [InvoicesController],
  exports: [InvoicesService],
})
export class InvoicesModule {}
