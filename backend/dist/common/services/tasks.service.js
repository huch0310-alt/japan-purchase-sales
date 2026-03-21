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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const common_2 = require("@nestjs/common");
const invoices_service_1 = require("../../invoices/invoices.service");
const messages_service_1 = require("../../messages/messages.service");
const settings_service_1 = require("../../settings/settings.service");
const typeorm_1 = require("typeorm");
let TasksService = class TasksService {
    constructor(invoicesService, messagesService, settingService, dataSource) {
        this.invoicesService = invoicesService;
        this.messagesService = messagesService;
        this.settingService = settingService;
        this.dataSource = dataSource;
    }
    onModuleInit() {
        console.log('定时任务服务已启动');
    }
    async handleInvoiceOverdue() {
        console.log('执行任务：更新請求書到期状态');
        try {
            await this.invoicesService.updateOverdueStatus();
            console.log('請求書到期状态更新完成');
        }
        catch (error) {
            console.error('請求書到期状态更新失败:', error);
        }
    }
    async handleInvoiceReminder() {
        console.log('执行任务：請求書到期提醒');
        try {
            const reminders = await this.invoicesService.getDueReminders();
            for (const invoice of reminders) {
                await this.messagesService.notifyInvoiceDue(invoice.id, invoice.customerId, new Date(invoice.dueDate));
                console.log(`已发送請求書到期提醒: ${invoice.invoiceNo}`);
            }
            console.log(`請求書到期提醒发送完成，共 ${reminders.length} 条`);
        }
        catch (error) {
            console.error('請求書到期提醒发送失败:', error);
        }
    }
    async handleWeeklyReport() {
        console.log('执行任务：生成周报数据');
        try {
            const report = await this.generateReport('weekly');
            await this.notifyAdmins('周报', report);
            console.log('周报生成完成', report);
        }
        catch (error) {
            console.error('周报生成失败:', error);
        }
    }
    async handleMonthlyReport() {
        console.log('执行任务：生成月报数据');
        try {
            const report = await this.generateReport('monthly');
            await this.notifyAdmins('月报', report);
            console.log('月报生成完成', report);
        }
        catch (error) {
            console.error('月报生成失败:', error);
        }
    }
    async generateReport(type) {
        const now = new Date();
        let startDate;
        if (type === 'weekly') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const orderStats = await this.dataSource.query(`SELECT
        COUNT(*) as orderCount,
        COALESCE(SUM(total_amount), 0) as totalAmount,
        COALESCE(AVG(total_amount), 0) as avgAmount
      FROM orders
      WHERE created_at >= $1 AND status IN ('confirmed', 'completed')`, [startDate]);
        const customerStats = await this.dataSource.query(`SELECT COUNT(*) as newCustomerCount FROM customers WHERE created_at >= $1`, [startDate]);
        return {
            type,
            period: { startDate, endDate: now },
            orders: orderStats[0] || { orderCount: 0, totalamount: 0, avgamount: 0 },
            customers: customerStats[0] || { newcustomercount: 0 },
            generatedAt: now,
        };
    }
    async notifyAdmins(reportType, report) {
        const admins = await this.dataSource.query(`SELECT id FROM staff WHERE role IN ('super_admin', 'admin') AND is_active = true`);
        const title = `${reportType}统计`;
        const content = `${reportType}生成完成。订单数: ${report.orders.orderCount}, 总金额: ${report.orders.totalamount}`;
        for (const admin of admins || []) {
            await this.messagesService.create({
                userId: admin.id,
                userType: 'staff',
                title,
                content,
                type: 'report',
            });
        }
    }
};
exports.TasksService = TasksService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "handleInvoiceOverdue", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "handleInvoiceReminder", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_WEEK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "handleWeeklyReport", null);
__decorate([
    (0, schedule_1.Cron)('0 0 1 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "handleMonthlyReport", null);
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)((0, common_2.forwardRef)(() => invoices_service_1.InvoicesService))),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService,
        messages_service_1.MessagesService,
        settings_service_1.SettingService,
        typeorm_1.DataSource])
], TasksService);
//# sourceMappingURL=tasks.service.js.map