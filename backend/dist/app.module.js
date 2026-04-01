"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const throttler_2 = require("@nestjs/throttler");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const products_module_1 = require("./products/products.module");
const orders_module_1 = require("./orders/orders.module");
const invoices_module_1 = require("./invoices/invoices.module");
const categories_module_1 = require("./categories/categories.module");
const units_module_1 = require("./units/units.module");
const cart_module_1 = require("./cart/cart.module");
const settings_module_1 = require("./settings/settings.module");
const logs_module_1 = require("./logs/logs.module");
const reports_module_1 = require("./reports/reports.module");
const upload_module_1 = require("./upload/upload.module");
const messages_module_1 = require("./messages/messages.module");
const tasks_module_1 = require("./common/services/tasks.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const gateways_module_1 = require("./gateways/gateways.module");
const members_module_1 = require("./members/members.module");
const returns_module_1 = require("./returns/returns.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'postgres'),
                    database: configService.get('DB_DATABASE', 'japan_purchase_sales'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
                    logging: configService.get('DB_LOGGING', false),
                    namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
                }),
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            gateways_module_1.GatewaysModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
            invoices_module_1.InvoicesModule,
            categories_module_1.CategoriesModule,
            units_module_1.UnitsModule,
            cart_module_1.CartModule,
            settings_module_1.SettingsModule,
            logs_module_1.LogsModule,
            reports_module_1.ReportsModule,
            upload_module_1.UploadModule,
            messages_module_1.MessagesModule,
            tasks_module_1.TasksModule,
            dashboard_module_1.DashboardModule,
            members_module_1.MembersModule,
            returns_module_1.ReturnsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_2.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map