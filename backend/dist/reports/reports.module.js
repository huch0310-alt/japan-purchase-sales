"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const export_service_1 = require("../common/services/export.service");
const stats_service_1 = require("../common/services/stats.service");
const reports_controller_1 = require("./reports.controller");
const stats_controller_1 = require("./stats.controller");
const order_entity_1 = require("../orders/entities/order.entity");
const product_entity_1 = require("../products/entities/product.entity");
const invoice_entity_1 = require("../invoices/entities/invoice.entity");
const customer_entity_1 = require("../users/entities/customer.entity");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order, product_entity_1.Product, invoice_entity_1.Invoice, customer_entity_1.Customer])],
        providers: [export_service_1.ExportService, stats_service_1.StatsService],
        controllers: [reports_controller_1.ReportsController, stats_controller_1.StatsController],
        exports: [export_service_1.ExportService, stats_service_1.StatsService],
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map