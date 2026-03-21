"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const export_service_1 = require("../common/services/export.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let ReportsController = class ReportsController {
    constructor(exportService) {
        this.exportService = exportService;
    }
    async exportSalesReport(startDate, endDate, res) {
        const buffer = await this.exportService.exportSalesReport(new Date(startDate), new Date(endDate));
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=sales_report_${startDate}_${endDate}.xlsx`,
        });
        res.send(buffer);
    }
    async exportProductReport(res) {
        const buffer = await this.exportService.exportProductReport();
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=products_report.xlsx',
        });
        res.send(buffer);
    }
    async exportCustomerReport(res) {
        const buffer = await this.exportService.exportCustomerReport();
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=customers_report.xlsx',
        });
        res.send(buffer);
    }
    async exportInvoiceReport(startDate, endDate, res) {
        const buffer = await this.exportService.exportInvoiceReport(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=invoices_report_${startDate}_${endDate}.xlsx`,
        });
        res.send(buffer);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('sales/export'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '导出销售报表（Excel）' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportSalesReport", null);
__decorate([
    (0, common_1.Get)('products/export'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '导出商品报表（Excel）' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportProductReport", null);
__decorate([
    (0, common_1.Get)('customers/export'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '导出客户报表（Excel）' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportCustomerReport", null);
__decorate([
    (0, common_1.Get)('invoices/export'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '导出請求書报表（Excel）' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportInvoiceReport", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('报表导出'),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [export_service_1.ExportService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map