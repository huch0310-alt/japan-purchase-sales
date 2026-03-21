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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stats_service_1 = require("../common/services/stats.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let DashboardController = class DashboardController {
    constructor(statsService) {
        this.statsService = statsService;
    }
    async getDashboard() {
        const stats = await this.statsService.getDashboardStats();
        const salesTrend = await this.statsService.getSalesTrend(7);
        const hotProducts = await this.statsService.getHotProducts(5);
        return {
            stats,
            salesTrend,
            hotProducts,
        };
    }
    async getTodos() {
        const stats = await this.statsService.getDashboardStats();
        return {
            pendingOrders: stats.pendingOrders,
            pendingProducts: stats.pendingProducts,
            unpaidInvoices: stats.unpaidInvoices,
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'procurement', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '获取仪表盘数据' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('todos'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '获取今日待办事项' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTodos", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('仪表盘'),
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [stats_service_1.StatsService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map