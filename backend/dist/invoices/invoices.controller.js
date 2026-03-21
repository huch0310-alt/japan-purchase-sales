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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invoices_service_1 = require("./invoices.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const config_1 = require("@nestjs/config");
let InvoicesController = class InvoicesController {
    constructor(invoicesService, configService) {
        this.invoicesService = invoicesService;
        this.configService = configService;
    }
    async create(createInvoiceDto) {
        return this.invoicesService.create(createInvoiceDto);
    }
    async findMyInvoices(req) {
        const user = req.user;
        const userId = user.id;
        const userType = user.type;
        if (userType === 'customer') {
            return this.invoicesService.findByCustomer(userId);
        }
        return this.invoicesService.findAll({});
    }
    async findAll(customerId, status, startDate, endDate) {
        return this.invoicesService.findAll({
            customerId,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }
    async findOne(id) {
        return this.invoicesService.findById(id);
    }
    async generatePdf(id, res) {
        try {
            const uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
            const filePath = await this.invoicesService.generateAndSavePdf(id, uploadDir);
            const fs = require('fs');
            const path = require('path');
            const fullPath = path.join(process.cwd(), filePath);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=invoice_${id}.pdf`,
            });
            const fileStream = fs.createReadStream(fullPath);
            fileStream.pipe(res);
        }
        catch (error) {
            res.status(500).json({ message: 'PDF生成失败', error: error.message });
        }
    }
    async markAsPaid(id) {
        return this.invoicesService.markAsPaid(id);
    }
    async getDueReminders() {
        return this.invoicesService.getDueReminders();
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '创建請求書（合并订单）' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: '获取当前客户的請求書列表' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findMyInvoices", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '获取所有請求書列表' }),
    __param(0, (0, common_1.Query)('customerId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取請求書详情' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '生成請求書PDF' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "generatePdf", null);
__decorate([
    (0, common_1.Put)(':id/paid'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '标记为已付款' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "markAsPaid", null);
__decorate([
    (0, common_1.Get)('reminders/due'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales'),
    (0, swagger_1.ApiOperation)({ summary: '获取到期提醒列表（提前3天）' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "getDueReminders", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('請求書管理'),
    (0, common_1.Controller)('invoices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService,
        config_1.ConfigService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map