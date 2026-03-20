import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { CategoriesModule } from './categories/categories.module';
import { UnitsModule } from './units/units.module';
import { CartModule } from './cart/cart.module';
import { SettingsModule } from './settings/settings.module';
import { LogsModule } from './logs/logs.module';
import { ReportsModule } from './reports/reports.module';
import { UploadModule } from './upload/upload.module';
import { MessagesModule } from './messages/messages.module';
import { TasksModule } from './common/services/tasks.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GatewaysModule } from './gateways/gateways.module';

/**
 * 应用根模块
 * 整合所有子模块
 */
@Module({
  imports: [
    // 配置模块 - 全局加载
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeORM配置
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'japan_purchase_sales'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE', false),
        logging: configService.get('DB_LOGGING', false),
      }),
      inject: [ConfigService],
    }),
    // WebSocket网关（全局）
    GatewaysModule,
    // 业务模块
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    InvoicesModule,
    CategoriesModule,
    UnitsModule,
    CartModule,
    SettingsModule,
    LogsModule,
    ReportsModule,
    UploadModule,
    MessagesModule,
    TasksModule,
    DashboardModule,
  ],
})
export class AppModule {}
