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
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ExcelJS = __importStar(require("exceljs"));
const order_entity_1 = require("../../orders/entities/order.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const invoice_entity_1 = require("../../invoices/entities/invoice.entity");
const customer_entity_1 = require("../../users/entities/customer.entity");
let ExportService = class ExportService {
    constructor(orderRepository, productRepository, invoiceRepository, customerRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
    }
    async exportSalesReport(startDate, endDate) {
        const orders = await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .where('order.created_at >= :startDate', { startDate })
            .andWhere('order.created_at <= :endDate', { endDate })
            .andWhere('order.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
            .getMany();
        const workbook = new ExcelJS.Workbook();
        workbook.creator = '日本采销管理系统';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('销售报表');
        sheet.columns = [
            { header: '订单号', key: 'orderNo', width: 20 },
            { header: '客户名称', key: 'companyName', width: 25 },
            { header: '下单时间', key: 'createdAt', width: 20 },
            { header: '状态', key: 'status', width: 12 },
            { header: '小计', key: 'subtotal', width: 15 },
            { header: '折扣', key: 'discountAmount', width: 15 },
            { header: '消费税', key: 'taxAmount', width: 12 },
            { header: '合计', key: 'totalAmount', width: 15 },
        ];
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E88E5' },
        };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        let totalAmount = 0;
        for (const order of orders) {
            const customer = order.customer;
            sheet.addRow({
                orderNo: order.orderNo,
                companyName: customer?.companyName || '',
                createdAt: new Date(order.createdAt).toLocaleDateString('ja-JP'),
                status: this.getStatusText(order.status),
                subtotal: Number(order.subtotal),
                discountAmount: Number(order.discountAmount),
                taxAmount: Number(order.taxAmount),
                totalAmount: Number(order.totalAmount),
            });
            totalAmount += Number(order.totalAmount);
        }
        sheet.addRow([]);
        const summaryRow = sheet.addRow({
            orderNo: '合计',
            companyName: '',
            createdAt: '',
            status: '',
            subtotal: '',
            discountAmount: '',
            taxAmount: '',
            totalAmount: totalAmount,
        });
        summaryRow.font = { bold: true };
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    async exportProductReport() {
        const products = await this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .getMany();
        const workbook = new ExcelJS.Workbook();
        workbook.creator = '日本采销管理系统';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('商品报表');
        sheet.columns = [
            { header: '商品名称', key: 'name', width: 30 },
            { header: '分类', key: 'category', width: 15 },
            { header: '库存', key: 'quantity', width: 10 },
            { header: '单位', key: 'unit', width: 10 },
            { header: '采购价', key: 'purchasePrice', width: 12 },
            { header: '销售价', key: 'salePrice', width: 12 },
            { header: '状态', key: 'status', width: 12 },
            { header: '创建时间', key: 'createdAt', width: 20 },
        ];
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E88E5' },
        };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        for (const product of products) {
            const category = product.category;
            sheet.addRow({
                name: product.name,
                category: category?.name || '',
                quantity: product.quantity,
                unit: product.unit || '',
                purchasePrice: Number(product.purchasePrice),
                salePrice: Number(product.salePrice),
                status: this.getStatusText(product.status),
                createdAt: new Date(product.createdAt).toLocaleDateString('ja-JP'),
            });
        }
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    async exportCustomerReport() {
        const result = await this.customerRepository
            .createQueryBuilder('customer')
            .leftJoin('customer.orders', 'order')
            .select('customer.id', 'id')
            .addSelect('customer.companyName', 'companyName')
            .addSelect('customer.contactPerson', 'contactPerson')
            .addSelect('customer.phone', 'phone')
            .addSelect('customer.vipDiscount', 'vipDiscount')
            .addSelect('COUNT(order.id)', 'orderCount')
            .addSelect('COALESCE(SUM(order.total_amount), 0)', 'totalAmount')
            .where('customer.isActive = :isActive', { isActive: true })
            .andWhere('order.status IS NULL OR order.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
            .groupBy('customer.id')
            .orderBy('totalAmount', 'DESC')
            .getRawMany();
        const customerStats = result.map(row => ({
            companyName: row.companyName,
            contactPerson: row.contactPerson,
            phone: row.phone,
            orderCount: parseInt(row.orderCount) || 0,
            totalAmount: parseFloat(row.totalAmount) || 0,
            vipDiscount: row.vipDiscount,
        }));
        const workbook = new ExcelJS.Workbook();
        workbook.creator = '日本采销管理系统';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('客户报表');
        sheet.columns = [
            { header: '公司名称', key: 'companyName', width: 25 },
            { header: '联系人', key: 'contactPerson', width: 15 },
            { header: '联系电话', key: 'phone', width: 15 },
            { header: '订单数量', key: 'orderCount', width: 12 },
            { header: '消费总额', key: 'totalAmount', width: 15 },
            { header: 'VIP折扣', key: 'vipDiscount', width: 12 },
        ];
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E88E5' },
        };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        for (const stat of customerStats) {
            sheet.addRow(stat);
        }
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    async exportInvoiceReport(startDate, endDate) {
        const query = this.invoiceRepository
            .createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.customer', 'customer');
        if (startDate) {
            query.andWhere('invoice.issue_date >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('invoice.issue_date <= :endDate', { endDate });
        }
        const invoices = await query.getMany();
        const workbook = new ExcelJS.Workbook();
        workbook.creator = '日本采销管理系统';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('請求書报表');
        sheet.columns = [
            { header: '請求書番号', key: 'invoiceNo', width: 18 },
            { header: '客户名称', key: 'companyName', width: 25 },
            { header: '开具日期', key: 'issueDate', width: 15 },
            { header: '到期日期', key: 'dueDate', width: 15 },
            { header: '小计', key: 'subtotal', width: 15 },
            { header: '消费税', key: 'taxAmount', width: 12 },
            { header: '合计', key: 'totalAmount', width: 15 },
            { header: '状态', key: 'status', width: 12 },
        ];
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E88E5' },
        };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        for (const invoice of invoices) {
            const customer = invoice.customer;
            sheet.addRow({
                invoiceNo: invoice.invoiceNo,
                companyName: customer?.companyName || '',
                issueDate: new Date(invoice.issueDate).toLocaleDateString('ja-JP'),
                dueDate: new Date(invoice.dueDate).toLocaleDateString('ja-JP'),
                subtotal: Number(invoice.subtotal),
                taxAmount: Number(invoice.taxAmount),
                totalAmount: Number(invoice.totalAmount),
                status: this.getInvoiceStatusText(invoice.status),
            });
        }
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    getStatusText(status) {
        const map = {
            pending: '待确认',
            confirmed: '已确认',
            completed: '已完成',
            cancelled: '已取消',
        };
        return map[status] || status;
    }
    getInvoiceStatusText(status) {
        const map = {
            unpaid: '未払い',
            paid: '支払済',
            overdue: '期限超過',
        };
        return map[status] || status;
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ExportService);
//# sourceMappingURL=export.service.js.map