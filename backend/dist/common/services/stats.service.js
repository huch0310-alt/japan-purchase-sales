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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../orders/entities/order.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const customer_entity_1 = require("../../users/entities/customer.entity");
const invoice_entity_1 = require("../../invoices/entities/invoice.entity");
let StatsService = class StatsService {
    constructor(orderRepository, productRepository, customerRepository, invoiceRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.invoiceRepository = invoiceRepository;
    }
    async getDashboardStats() {
        const customerCount = await this.customerRepository.count({ where: { isActive: true } });
        const productCount = await this.productRepository.count({ where: { status: 'active' } });
        const orderCount = await this.orderRepository.count();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = await this.orderRepository
            .createQueryBuilder('order')
            .where('order.created_at >= :today', { today })
            .andWhere('order.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
            .getMany();
        const todaySales = todayOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        const pendingOrders = await this.orderRepository.count({ where: { status: 'pending' } });
        const pendingProducts = await this.productRepository.count({ where: { status: 'pending' } });
        const unpaidInvoices = await this.invoiceRepository.count({ where: { status: 'unpaid' } });
        return {
            customerCount,
            productCount,
            orderCount,
            todaySales,
            pendingOrders,
            pendingProducts,
            unpaidInvoices,
        };
    }
    async getSalesTrend(days = 7) {
        const result = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            const orders = await this.orderRepository
                .createQueryBuilder('order')
                .where('order.created_at >= :date', { date })
                .andWhere('order.created_at < :nextDate', { nextDate })
                .andWhere('order.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
                .getMany();
            const amount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
            result.push({
                date: date.toISOString().split('T')[0],
                amount,
            });
        }
        return result;
    }
    async getHotProducts(limit = 10) {
        const products = await this.productRepository.find({
            where: { status: 'active' },
            order: { createdAt: 'DESC' },
            take: limit,
        });
        return products.map(p => ({
            id: p.id,
            name: p.name,
            salePrice: p.salePrice,
            photoUrl: p.photoUrl,
            quantity: p.quantity,
        }));
    }
    async getSalesReport(startDate, endDate) {
        const orders = await this.orderRepository
            .createQueryBuilder('order')
            .where('order.created_at >= :startDate', { startDate })
            .andWhere('order.created_at <= :endDate', { endDate })
            .andWhere('order.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
            .getMany();
        const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        const orderCount = orders.length;
        const dailyMap = new Map();
        for (const order of orders) {
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            const existing = dailyMap.get(date) || { amount: 0, count: 0 };
            dailyMap.set(date, {
                amount: existing.amount + Number(order.totalAmount),
                count: existing.count + 1,
            });
        }
        const dailyData = Array.from(dailyMap.entries()).map(([date, data]) => ({
            date,
            amount: data.amount,
            count: data.count,
        }));
        return {
            totalAmount,
            orderCount,
            averageAmount: orderCount > 0 ? totalAmount / orderCount : 0,
            dailyData,
        };
    }
    async getTopCustomers(limit = 10) {
        const customers = await this.customerRepository.find();
        const customerStats = [];
        for (const customer of customers) {
            const orders = await this.orderRepository
                .createQueryBuilder('order')
                .where('order.customer_id = :customerId', { customerId: customer.id })
                .andWhere('order.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
                .getMany();
            const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
            if (totalAmount > 0) {
                customerStats.push({
                    id: customer.id,
                    companyName: customer.companyName,
                    contactPerson: customer.contactPerson,
                    orderCount: orders.length,
                    totalAmount,
                });
            }
        }
        customerStats.sort((a, b) => b.totalAmount - a.totalAmount);
        return customerStats.slice(0, limit);
    }
    async getCategorySalesRatio() {
        const categories = [
            { category: '肉类', amount: 156000 },
            { category: '蛋品', amount: 89000 },
            { category: '生鲜蔬果', amount: 134000 },
            { category: '酒水饮料', amount: 67000 },
            { category: '零食点心', amount: 45000 },
        ];
        const totalAmount = categories.reduce((sum, c) => sum + c.amount, 0);
        return categories.map(c => ({
            category: c.category,
            amount: c.amount,
            ratio: totalAmount > 0 ? (c.amount / totalAmount) * 100 : 0,
        }));
    }
    async getProcurementStats() {
        return [
            { name: '佐藤', count: 120, amount: 850000 },
            { name: '田中', count: 95, amount: 720000 },
            { name: '鈴木', count: 88, amount: 680000 },
        ];
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(3, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StatsService);
//# sourceMappingURL=stats.service.js.map