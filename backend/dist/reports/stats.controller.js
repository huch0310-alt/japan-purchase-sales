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
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stats_service_1 = require("../common/services/stats.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let StatsController = class StatsController {
    constructor(statsService) {
        this.statsService = statsService;
    }
    async getDashboardStats() {
        return this.statsService.getDashboardStats();
    }
    async getSalesTrend(days) {
        return this.statsService.getSalesTrend(days ? parseInt(days) : 7);
    }
    async getHotProducts(limit) {
        return this.statsService.getHotProducts(limit ? parseInt(limit) : 10);
    }
    async getSalesReport(startDate, endDate) {
        return this.statsService.getSalesReport(new Date(startDate), new Date(endDate));
    }
    async getTopCustomers(limit) {
        return this.statsService.getTopCustomers(limit ? parseInt(limit) : 10);
    }
    async getCategorySalesRatio() {
        return this.statsService.getCategorySalesRatio();
    }
    async getProcurementStats() {
        return this.statsService.getProcurementStats();
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'procurement', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '获取仪表盘统计数据' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('sales-trend'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '获取销售趋势' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getSalesTrend", null);
__decorate([
    (0, common_1.Get)('hot-products'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '获取热销商品排行' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getHotProducts", null);
__decorate([
    (0, common_1.Get)('sales-report'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '获取销售报表数据' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getSalesReport", null);
__decorate([
    (0, common_1.Get)('top-customers'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '获取客户购买排行' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getTopCustomers", null);
__decorate([
    (0, common_1.Get)('category-ratio'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '获取分类销售占比' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getCategorySalesRatio", null);
__decorate([
    (0, common_1.Get)('procurement-stats'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: '获取采购人员业绩统计' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getProcurementStats", null);
exports.StatsController = StatsController = __decorate([
    (0, swagger_1.ApiTags)('数据统计'),
    (0, common_1.Controller)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [stats_service_1.StatsService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map