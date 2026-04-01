import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
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
import { MembersModule } from './members/members.module';
import { ReturnsModule } from './returns/returns.module';

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
      useFactory: (configService: ConfigService) => {
        const isProduction = process.env.NODE_ENV === 'production';
        const shouldSync = configService.get('DB_SYNCHRONIZE', 'false') === 'true';

        // 生产环境禁止使用 synchronize
        if (isProduction && shouldSync) {
          const logger = new Logger('AppModule');
          logger.error('🚨 安全错误: DB_SYNCHRONIZE 在生产环境必须为 false！这可能导致数据丢失！');
          logger.error('请修改 .env 文件: DB_SYNCHRONIZE=false');
          // 在生产环境强制禁用 synchronize
          throw new Error('DB_SYNCHRONIZE is not allowed in production environment');
        }

        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_DATABASE', 'japan_purchase_sales'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: shouldSync,
          logging: configService.get('DB_LOGGING', false),
          namingStrategy: new SnakeNamingStrategy(),
        };
      },
      inject: [ConfigService],
    }),
    // 速率限制配置 - 全局限流
    ThrottlerModule.forRoot([{
      ttl: 60000,   // 60秒
      limit: 100,   // 60秒内最多100个请求
    }]),
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
    MembersModule,
    ReturnsModule,
  ],
  providers: [
    // 全局限流守卫（让 ThrottlerModule 配置真正生效）
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
