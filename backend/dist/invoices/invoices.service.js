"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./entities/invoice.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const orders_service_1 = require("../orders/orders.service");
const settings_service_1 = require("../settings/settings.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdf_lib_1 = require("pdf-lib");
let InvoicesService = class InvoicesService {
    constructor(invoiceRepository, orderRepository, ordersService, settingService, dataSource) {
        this.invoiceRepository = invoiceRepository;
        this.orderRepository = orderRepository;
        this.ordersService = ordersService;
        this.settingService = settingService;
        this.dataSource = dataSource;
    }
    generateInvoiceNo() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `INV${year}${month}${random}`;
    }
    async create(data) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let subtotal = 0;
            for (const orderId of data.orderIds) {
                const order = await this.ordersService.findById(orderId);
                if (!order) {
                    throw new Error(`订单 ${orderId} 不存在`);
                }
                if (order.customerId !== data.customerId) {
                    throw new Error('订单与客户不匹配');
                }
                if (order.status !== 'completed') {
                    throw new common_1.BadRequestException(`订单 ${order.orderNo} 状态不是已完成，无法生成请求书`);
                }
                if (order.invoiceId) {
                    throw new common_1.BadRequestException(`订单 ${order.orderNo} 已生成过请求书`);
                }
                subtotal += Number(order.subtotal);
            }
            const taxRate = await this.settingService.getValue('tax_rate') || '10';
            const taxRateNum = parseInt(taxRate) / 100;
            const taxAmount = Math.round(subtotal * taxRateNum);
            const totalAmount = subtotal + taxAmount;
            const defaultPaymentDays = parseInt(await this.settingService.getValue('default_payment_days') || '30');
            const issueDate = new Date();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + defaultPaymentDays);
            const invoice = queryRunner.manager.create(invoice_entity_1.Invoice, {
                invoiceNo: this.generateInvoiceNo(),
                customerId: data.customerId,
                orderIds: data.orderIds,
                subtotal,
                taxAmount,
                totalAmount,
                issueDate,
                dueDate,
                status: 'unpaid',
            });
            const savedInvoice = await queryRunner.manager.save(invoice_entity_1.Invoice, invoice);
            await queryRunner.manager
                .createQueryBuilder()
                .update(order_entity_1.Order)
                .set({ invoiceId: savedInvoice.id })
                .where('id IN (:...orderIds)', { orderIds: data.orderIds })
                .execute();
            await queryRunner.commitTransaction();
            return savedInvoice;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findById(id) {
        return this.invoiceRepository.findOne({
            where: { id },
            relations: ['customer'],
        });
    }
    async findByInvoiceNo(invoiceNo) {
        return this.invoiceRepository.findOne({
            where: { invoiceNo },
            relations: ['customer'],
        });
    }
    async findByCustomer(customerId) {
        return this.invoiceRepository.find({
            where: { customerId },
            order: { createdAt: 'DESC' },
        });
    }
    async findAll(filters) {
        const query = this.invoiceRepository.createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.customer', 'customer');
        if (filters?.customerId) {
            query.andWhere('invoice.customer_id = :customerId', { customerId: filters.customerId });
        }
        if (filters?.status) {
            query.andWhere('invoice.status = :status', { status: filters.status });
        }
        if (filters?.startDate) {
            query.andWhere('invoice.issue_date >= :startDate', { startDate: filters.startDate });
        }
        if (filters?.endDate) {
            query.andWhere('invoice.issue_date <= :endDate', { endDate: filters.endDate });
        }
        return query.orderBy('invoice.createdAt', 'DESC').getMany();
    }
    async markAsPaid(id) {
        await this.invoiceRepository.update(id, {
            status: 'paid',
            paidAt: new Date(),
        });
        return this.findById(id);
    }
    async updateOverdueStatus() {
        const now = new Date();
        await this.invoiceRepository
            .createQueryBuilder()
            .update(invoice_entity_1.Invoice)
            .set({ status: 'overdue' })
            .where('status = :status', { status: 'unpaid' })
            .andWhere('dueDate < :now', { now })
            .execute();
    }
    async generatePdf(invoiceId) {
        const invoice = await this.findById(invoiceId);
        if (!invoice) {
            throw new Error('請求書不存在');
        }
        const companyName = await this.settingService.getValue('company_name') || '株式会社';
        const companyAddress = await this.settingService.getValue('company_address') || '';
        const companyPhone = await this.settingService.getValue('company_phone') || '';
        const companyFax = await this.settingService.getValue('company_fax') || '';
        const companyBank = await this.settingService.getValue('company_bank') || '';
        const orders = [];
        for (const orderId of invoice.orderIds) {
            const order = await this.ordersService.findById(orderId);
            if (order) {
                orders.push(order);
            }
        }
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
        const { width, height } = page.getSize();
        page.drawText('請求書', {
            x: 250,
            y: height - 60,
            size: 24,
            font: boldFont,
        });
        page.drawText(`請求書番号: ${invoice.invoiceNo}`, {
            x: 50,
            y: height - 100,
            size: 10,
            font,
        });
        const issueDateStr = new Date(invoice.issueDate).toLocaleDateString('ja-JP');
        const dueDateStr = new Date(invoice.dueDate).toLocaleDateString('ja-JP');
        page.drawText(`発行日: ${issueDateStr}`, {
            x: 350,
            y: height - 100,
            size: 10,
            font,
        });
        page.drawText(`支払期限: ${dueDateStr}`, {
            x: 350,
            y: height - 115,
            size: 10,
            font,
        });
        page.drawText('【発行元】', {
            x: 50,
            y: height - 150,
            size: 10,
            font: boldFont,
        });
        page.drawText(companyName, {
            x: 50,
            y: height - 165,
            size: 12,
            font: boldFont,
        });
        page.drawText(`住所: ${companyAddress}`, {
            x: 50,
            y: height - 180,
            size: 9,
            font,
        });
        page.drawText(`TEL: ${companyPhone}  FAX: ${companyFax}`, {
            x: 50,
            y: height - 195,
            size: 9,
            font,
        });
        page.drawText(`銀行口座: ${companyBank}`, {
            x: 50,
            y: height - 210,
            size: 9,
            font,
        });
        const customer = invoice.customer;
        page.drawText('【ご請求先】', {
            x: 50,
            y: height - 250,
            size: 10,
            font: boldFont,
        });
        page.drawText(customer?.invoiceName || customer?.companyName || '', {
            x: 50,
            y: height - 265,
            size: 12,
            font: boldFont,
        });
        page.drawText(`住所: ${customer?.invoiceAddress || customer?.address || ''}`, {
            x: 50,
            y: height - 280,
            size: 9,
            font,
        });
        page.drawText(`TEL: ${customer?.invoicePhone || customer?.phone || ''}`, {
            x: 50,
            y: height - 295,
            size: 9,
            font,
        });
        const tableTop = height - 350;
        page.drawRectangle({
            x: 50,
            y: tableTop,
            width: 495,
            height: 20,
            color: (0, pdf_lib_1.rgb)(0.9, 0.9, 0.9),
        });
        page.drawText('商品名', { x: 55, y: tableTop + 5, size: 9, font: boldFont });
        page.drawText('数量', { x: 300, y: tableTop + 5, size: 9, font: boldFont });
        page.drawText('単価', { x: 360, y: tableTop + 5, size: 9, font: boldFont });
        page.drawText('金額', { x: 450, y: tableTop + 5, size: 9, font: boldFont });
        let yPos = tableTop - 20;
        let itemCount = 0;
        for (const order of orders) {
            const items = order.items || [];
            for (const item of items) {
                page.drawText(item.productName?.substring(0, 25) || '', { x: 55, y: yPos, size: 8, font });
                page.drawText(String(item.quantity), { x: 310, y: yPos, size: 8, font });
                page.drawText(`¥${Number(item.unitPrice).toLocaleString()}`, { x: 360, y: yPos, size: 8, font });
                page.drawText(`¥${(Number(item.unitPrice) * item.quantity).toLocaleString()}`, { x: 450, y: yPos, size: 8, font });
                yPos -= 15;
                itemCount++;
                if (itemCount > 20)
                    break;
            }
            if (itemCount > 20)
                break;
        }
        yPos -= 30;
        page.drawText('小計（税抜）:', { x: 350, y: yPos, size: 10, font });
        page.drawText(`¥${Number(invoice.subtotal).toLocaleString()}`, { x: 450, y: yPos, size: 10, font });
        yPos -= 20;
        page.drawText('消費税:', { x: 350, y: yPos, size: 10, font });
        page.drawText(`¥${Number(invoice.taxAmount).toLocaleString()}`, { x: 450, y: yPos, size: 10, font });
        yPos -= 25;
        page.drawRectangle({ x: 340, y: yPos - 5, width: 200, height: 25, color: (0, pdf_lib_1.rgb)(0.95, 0.95, 0.95) });
        page.drawText('合計金額（税込）:', { x: 345, y: yPos, size: 11, font: boldFont });
        page.drawText(`¥${Number(invoice.totalAmount).toLocaleString()}`, { x: 450, y: yPos, size: 11, font: boldFont });
        page.drawText('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', {
            x: 50,
            y: 80,
            size: 8,
            font,
        });
        page.drawText('上記金額をお振込ください。', {
            x: 50,
            y: 65,
            size: 9,
            font,
        });
        page.drawText('お振込先: ' + companyBank, {
            x: 50,
            y: 50,
            size: 9,
            font,
        });
        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }
    async generateAndSavePdf(invoiceId, uploadDir) {
        const pdfBuffer = await this.generatePdf(invoiceId);
        const fileName = `invoice_${invoiceId}_${Date.now()}.pdf`;
        const filePath = path.join(uploadDir, fileName);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(filePath, pdfBuffer);
        await this.invoiceRepository.update(invoiceId, {
            fileUrl: `/uploads/${fileName}`,
        });
        return `/uploads/${fileName}`;
    }
    async getDueReminders() {
        const today = new Date();
        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + 3);
        return this.invoiceRepository
            .createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.customer', 'customer')
            .where('invoice.status = :status', { status: 'unpaid' })
            .andWhere('invoice.dueDate <= :reminderDate', { reminderDate })
            .andWhere('invoice.dueDate >= :today', { today })
            .getMany();
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => orders_service_1.OrdersService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        orders_service_1.OrdersService,
        settings_service_1.SettingService,
        typeorm_2.DataSource])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map