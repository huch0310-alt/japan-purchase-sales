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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const customer_entity_1 = require("../users/entities/customer.entity");
const customer_service_1 = require("../users/customer.service");
const settings_service_1 = require("../settings/settings.service");
const products_service_1 = require("../products/products.service");
const event_service_1 = require("../common/services/event.service");
const product_entity_1 = require("../products/entities/product.entity");
let OrdersService = class OrdersService {
    constructor(orderRepository, orderItemRepository, customerService, settingService, productsService, eventService, dataSource) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.customerService = customerService;
        this.settingService = settingService;
        this.productsService = productsService;
        this.eventService = eventService;
        this.dataSource = dataSource;
    }
    generateOrderNo() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `ORD${year}${month}${day}${random}`;
    }
    async create(data) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const customer = await queryRunner.manager.findOne(customer_entity_1.Customer, { where: { id: data.customerId } });
            if (!customer) {
                throw new Error('客户不存在');
            }
            let subtotal = 0;
            const orderItemsData = [];
            for (const item of data.items) {
                const product = await this.productsService.findById(item.productId);
                if (!product) {
                    throw new Error(`商品不存在: ${item.productId}`);
                }
                if (product.status !== 'active') {
                    throw new Error(`商品未上架: ${product.name}`);
                }
                if (product.quantity < item.quantity) {
                    throw new Error(`商品库存不足: ${product.name}`);
                }
                const unitPrice = Number(product.salePrice) || 0;
                const itemSubtotal = unitPrice * item.quantity;
                subtotal += itemSubtotal;
                orderItemsData.push({
                    product,
                    quantity: item.quantity,
                    unitPrice,
                    itemSubtotal,
                });
            }
            const taxRate = await this.settingService.getValue('tax_rate') || '10';
            const taxRateNum = parseInt(taxRate) / 100;
            const vipDiscountNum = parseFloat(String(customer.vipDiscount));
            const afterDiscount = Math.round(subtotal * vipDiscountNum * 100) / 100;
            const discountAmount = Math.round((subtotal - afterDiscount) * 100) / 100;
            const taxAmount = Math.round(afterDiscount * taxRateNum);
            const totalAmount = afterDiscount + taxAmount;
            const order = queryRunner.manager.create(order_entity_1.Order, {
                orderNo: this.generateOrderNo(),
                customerId: data.customerId,
                subtotal,
                discountAmount,
                taxAmount,
                totalAmount,
                status: 'pending',
                deliveryAddress: data.deliveryAddress,
                contactPerson: data.contactPerson,
                contactPhone: data.contactPhone,
                remark: data.remark,
            });
            const savedOrder = await queryRunner.manager.save(order_entity_1.Order, order);
            for (const itemData of orderItemsData) {
                const orderItem = queryRunner.manager.create(order_item_entity_1.OrderItem, {
                    order: savedOrder,
                    product: itemData.product,
                    productName: itemData.product.name,
                    quantity: itemData.quantity,
                    unitPrice: itemData.unitPrice,
                });
                await queryRunner.manager.save(order_item_entity_1.OrderItem, orderItem);
                await queryRunner.manager.update(product_entity_1.Product, itemData.product.id, {
                    quantity: itemData.product.quantity - itemData.quantity,
                });
            }
            await queryRunner.commitTransaction();
            const fullOrder = await this.findById(savedOrder.id);
            if (fullOrder) {
                fullOrder.customer = customer;
                this.eventService.notifyOrderCreated(fullOrder);
            }
            return fullOrder;
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
        return this.orderRepository.findOne({
            where: { id },
            relations: ['customer', 'items', 'items.product'],
        });
    }
    async findByOrderNo(orderNo) {
        return this.orderRepository.findOne({
            where: { orderNo },
            relations: ['customer', 'items', 'items.product'],
        });
    }
    async findByCustomer(customerId) {
        return this.orderRepository.find({
            where: { customerId },
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }
    async findAll(filters) {
        const query = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product');
        if (filters?.status) {
            query.andWhere('order.status = :status', { status: filters.status });
        }
        if (filters?.customerId) {
            query.andWhere('order.customer_id = :customerId', { customerId: filters.customerId });
        }
        if (filters?.startDate) {
            query.andWhere('order.created_at >= :startDate', { startDate: filters.startDate });
        }
        if (filters?.endDate) {
            query.andWhere('order.created_at <= :endDate', { endDate: filters.endDate });
        }
        if (filters?.minAmount) {
            query.andWhere('order.total_amount >= :minAmount', { minAmount: filters.minAmount });
        }
        if (filters?.maxAmount) {
            query.andWhere('order.total_amount <= :maxAmount', { maxAmount: filters.maxAmount });
        }
        return query.orderBy('order.createdAt', 'DESC').getMany();
    }
    async confirm(id, confirmedById) {
        await this.orderRepository.update(id, {
            status: 'confirmed',
            confirmedById,
            confirmedAt: new Date(),
        });
        const order = await this.findById(id);
        if (order) {
            this.eventService.notifyOrderStatusChanged(order);
        }
        return order;
    }
    async batchConfirm(ids, confirmedById) {
        await this.orderRepository.update(ids, {
            status: 'confirmed',
            confirmedById,
            confirmedAt: new Date(),
        });
    }
    async complete(id) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.update(order_entity_1.Order, id, {
                status: 'completed',
                completedAt: new Date(),
            });
            await queryRunner.commitTransaction();
            const order = await this.findById(id);
            if (order) {
                this.eventService.notifyOrderStatusChanged(order);
            }
            return order;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async cancel(id) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = await this.findById(id);
            if (!order) {
                throw new Error('订单不存在');
            }
            for (const item of order.items || []) {
                if (item.product) {
                    const product = await this.productsService.findById(item.productId);
                    if (product) {
                        await queryRunner.manager.update(product_entity_1.Product, item.productId, {
                            quantity: product.quantity + item.quantity,
                        });
                    }
                }
            }
            await queryRunner.manager.update(order_entity_1.Order, id, { status: 'cancelled' });
            await queryRunner.commitTransaction();
            const cancelledOrder = await this.findById(id);
            if (cancelledOrder) {
                this.eventService.notifyOrderStatusChanged(cancelledOrder);
            }
            return cancelledOrder;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findCompletedWithoutInvoice(customerId) {
        const queryBuilder = this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.items', 'items')
            .where('order.status = :status', { status: 'completed' })
            .andWhere('order.invoiceId IS NULL');
        if (customerId) {
            queryBuilder.andWhere('order.customerId = :customerId', { customerId });
        }
        return queryBuilder
            .orderBy('order.createdAt', 'DESC')
            .getMany();
    }
    async getSalesReport(startDate, endDate) {
        const orders = await this.orderRepository
            .createQueryBuilder('order')
            .where('order.createdAt >= :startDate', { startDate })
            .andWhere('order.createdAt <= :endDate', { endDate })
            .andWhere('order.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
            .getMany();
        const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        const orderCount = orders.length;
        return {
            totalAmount,
            orderCount,
            averageAmount: orderCount > 0 ? totalAmount / orderCount : 0,
            orders,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => event_service_1.EventService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        customer_service_1.CustomerService,
        settings_service_1.SettingService,
        products_service_1.ProductsService,
        event_service_1.EventService,
        typeorm_2.DataSource])
], OrdersService);
//# sourceMappingURL=orders.service.js.map