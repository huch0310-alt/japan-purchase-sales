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
const inventory_service_1 = require("../inventory/inventory.service");
const event_service_1 = require("../common/services/event.service");
const product_entity_1 = require("../products/entities/product.entity");
const inventory_log_entity_1 = require("../inventory/entities/inventory-log.entity");
const logs_service_1 = require("../logs/logs.service");
let OrdersService = class OrdersService {
    constructor(orderRepository, orderItemRepository, customerService, settingService, productsService, inventoryService, eventService, dataSource, logsService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.customerService = customerService;
        this.settingService = settingService;
        this.productsService = productsService;
        this.inventoryService = inventoryService;
        this.eventService = eventService;
        this.dataSource = dataSource;
        this.logsService = logsService;
    }
    generateOrderNo() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `ORD${year}${month}${day}${random}`;
    }
    async create(data, audit) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const customer = await queryRunner.manager.findOne(customer_entity_1.Customer, { where: { id: data.customerId } });
            if (!customer) {
                throw new common_1.NotFoundException('客户不存在');
            }
            let subtotal = 0;
            const orderItemsData = [];
            const productIds = data.items.map(item => item.productId);
            const products = await this.productsService.findByIds(productIds);
            const productMap = new Map(products.map(p => [p.id, p]));
            for (const item of data.items) {
                const product = productMap.get(item.productId);
                if (!product) {
                    throw new common_1.NotFoundException(`商品不存在: ${item.productId}`);
                }
                if (product.status !== 'active') {
                    throw new common_1.BadRequestException(`商品未上架: ${product.name}`);
                }
                if (product.quantity < item.quantity) {
                    throw new common_1.BadRequestException(`商品库存不足: ${product.name}`);
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
            const vipDiscountNum = parseFloat(String(customer.vipDiscount)) / 100;
            const afterDiscount = Math.round(subtotal * (1 - vipDiscountNum) * 100) / 100;
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
                const result = await queryRunner.manager
                    .createQueryBuilder()
                    .update(product_entity_1.Product)
                    .set({ quantity: () => `quantity - ${itemData.quantity}` })
                    .where('id = :id AND quantity >= :quantity', {
                    id: itemData.product.id,
                    quantity: itemData.quantity,
                })
                    .execute();
                if (result.affected === 0) {
                    throw new common_1.BadRequestException(`商品库存不足: ${itemData.product.name}`);
                }
                const log = queryRunner.manager.create(inventory_log_entity_1.InventoryLog, {
                    productId: itemData.product.id,
                    type: inventory_log_entity_1.InventoryType.OUT,
                    quantity: -itemData.quantity,
                    beforeQuantity: itemData.product.quantity,
                    afterQuantity: itemData.product.quantity - itemData.quantity,
                    operatorId: data.customerId,
                    remark: `订单 ${savedOrder.orderNo}`,
                    relatedId: savedOrder.id,
                });
                await queryRunner.manager.save(inventory_log_entity_1.InventoryLog, log);
            }
            await queryRunner.commitTransaction();
            const fullOrder = await this.findById(savedOrder.id);
            if (fullOrder) {
                fullOrder.customer = customer;
                this.eventService.notifyOrderCreated(fullOrder);
            }
            if (audit) {
                await this.logsService.recordOperation({
                    userId: audit.userId,
                    userRole: audit.userRole,
                    ip: audit.ip,
                    module: 'orders',
                    action: 'create',
                    detail: {
                        orderId: savedOrder.id,
                        orderNo: savedOrder.orderNo,
                        customerId: data.customerId,
                        totalAmount: savedOrder.totalAmount,
                    },
                });
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
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['customer', 'items', 'items.product', 'invoice'],
        });
    }
    async findByOrderNo(orderNo) {
        return this.orderRepository.findOne({
            where: { orderNo, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['customer', 'items', 'items.product'],
        });
    }
    async findByCustomer(customerId) {
        return this.orderRepository.find({
            where: { customerId, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }
    async findAll(filters) {
        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 20;
        const skip = (page - 1) * pageSize;
        const query = this.orderRepository.createQueryBuilder('order')
            .where('order.deletedAt IS NULL');
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
        const [orders, total] = await query
            .orderBy('order.createdAt', 'DESC')
            .skip(skip)
            .take(pageSize)
            .getManyAndCount();
        if (orders.length === 0) {
            return {
                data: [],
                total: 0,
                page,
                pageSize,
                totalPages: 0,
            };
        }
        const orderIds = orders.map(o => o.id);
        const customers = await this.orderRepository.manager.createQueryBuilder()
            .select(['customer.id', 'customer.companyName', 'customer.contactPerson', 'customer.phone'])
            .from('customers', 'customer')
            .innerJoin('orders', 'order', 'order.customer_id = customer.id')
            .where('order.id IN (:...orderIds)', { orderIds })
            .getMany();
        const customerMap = new Map(customers.map(c => [c.id, c]));
        const orderItems = await this.orderRepository.manager.createQueryBuilder()
            .select(['item.id', 'item.orderId', 'item.productName', 'item.quantity', 'item.unitPrice'])
            .from('order_items', 'item')
            .where('item.order_id IN (:...orderIds)', { orderIds })
            .getMany();
        const itemsMap = new Map();
        orderItems.forEach(item => {
            if (!itemsMap.has(item.orderId)) {
                itemsMap.set(item.orderId, []);
            }
            itemsMap.get(item.orderId).push(item);
        });
        const data = orders.map(order => {
            const customer = customerMap.get(order.customerId);
            const items = itemsMap.get(order.id) || [];
            return {
                ...order,
                customer,
                items,
            };
        });
        return {
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    async confirm(id, audit) {
        const order = await this.findById(id);
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (order.status !== 'pending') {
            throw new common_1.BadRequestException(`订单状态不是待确认，无法确认。当前状态：${order.status}`);
        }
        await this.orderRepository.update(id, {
            status: 'confirmed',
            confirmedAt: new Date(),
        });
        const updatedOrder = await this.findById(id);
        if (updatedOrder) {
            this.eventService.notifyOrderStatusChanged(updatedOrder);
        }
        if (audit && updatedOrder) {
            await this.logsService.recordOperation({
                userId: audit.userId,
                userRole: audit.userRole,
                ip: audit.ip,
                module: 'orders',
                action: 'confirm',
                detail: { orderId: updatedOrder.id, orderNo: updatedOrder.orderNo },
            });
        }
        return updatedOrder;
    }
    async batchConfirm(ids, audit) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const id of ids) {
                const order = await queryRunner.manager.findOne(order_entity_1.Order, {
                    where: { id, deletedAt: (0, typeorm_2.IsNull)() },
                    relations: ['items'],
                });
                if (!order) {
                    throw new common_1.NotFoundException(`订单不存在: ${id}`);
                }
                if (order.status !== 'pending') {
                    throw new common_1.BadRequestException(`订单${order.orderNo}状态不是待确认，无法确认。当前状态：${order.status}`);
                }
            }
            await queryRunner.manager.update(order_entity_1.Order, ids, {
                status: 'confirmed',
                confirmedAt: new Date(),
            });
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
        if (audit) {
            await this.logsService.recordOperation({
                userId: audit.userId,
                userRole: audit.userRole,
                ip: audit.ip,
                module: 'orders',
                action: 'batch_confirm',
                detail: { orderIds: ids, count: ids.length },
            });
        }
    }
    async complete(id, audit) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = await queryRunner.manager.findOne(order_entity_1.Order, { where: { id } });
            if (!order) {
                throw new common_1.NotFoundException('订单不存在');
            }
            if (order.status !== 'confirmed') {
                throw new common_1.BadRequestException(`订单状态不是已确认，无法完成。当前状态：${order.status}`);
            }
            await queryRunner.manager.update(order_entity_1.Order, id, {
                status: 'completed',
                completedAt: new Date(),
            });
            await queryRunner.commitTransaction();
            const completedOrder = await this.findById(id);
            if (completedOrder) {
                this.eventService.notifyOrderStatusChanged(completedOrder);
            }
            if (audit && completedOrder) {
                await this.logsService.recordOperation({
                    userId: audit.userId,
                    userRole: audit.userRole,
                    ip: audit.ip,
                    module: 'orders',
                    action: 'complete',
                    detail: { orderId: completedOrder.id, orderNo: completedOrder.orderNo },
                });
            }
            return completedOrder;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async cancel(id, cancelledById, cancelReason, isClient = false, audit) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = await this.findById(id);
            if (!order) {
                throw new common_1.NotFoundException('订单不存在');
            }
            if (order.status !== 'pending') {
                throw new common_1.BadRequestException(`订单状态不是待确认，无法取消。当前状态：${order.status}`);
            }
            if (isClient) {
                const createdTime = new Date(order.createdAt).getTime();
                const now = Date.now();
                const minutes = (now - createdTime) / (1000 * 60);
                if (minutes > 30) {
                    throw new common_1.BadRequestException('订单已超过30分钟，无法取消');
                }
            }
            for (const item of order.items || []) {
                if (item.product && !item.product.deletedAt) {
                    await queryRunner.manager
                        .createQueryBuilder()
                        .update(product_entity_1.Product)
                        .set({ quantity: () => `quantity + ${item.quantity}` })
                        .where('id = :id', { id: item.productId })
                        .andWhere('"deletedAt" IS NULL')
                        .execute();
                    const log = queryRunner.manager.create(inventory_log_entity_1.InventoryLog, {
                        productId: item.productId,
                        type: inventory_log_entity_1.InventoryType.RETURN,
                        quantity: item.quantity,
                        beforeQuantity: item.product.quantity,
                        afterQuantity: item.product.quantity + item.quantity,
                        operatorId: cancelledById || order.customerId,
                        remark: `订单取消退还 ${order.orderNo}`,
                        relatedId: order.id,
                    });
                    await queryRunner.manager.save(inventory_log_entity_1.InventoryLog, log);
                }
            }
            await queryRunner.manager.update(order_entity_1.Order, id, {
                status: 'cancelled',
                cancelledById,
                cancelReason,
                cancelledAt: new Date(),
            });
            await queryRunner.commitTransaction();
            const cancelledOrder = await this.findById(id);
            if (cancelledOrder) {
                this.eventService.notifyOrderStatusChanged(cancelledOrder);
            }
            if (audit && cancelledOrder) {
                await this.logsService.recordOperation({
                    userId: audit.userId,
                    userRole: audit.userRole,
                    ip: audit.ip,
                    module: 'orders',
                    action: 'cancel',
                    detail: {
                        orderId: cancelledOrder.id,
                        orderNo: cancelledOrder.orderNo,
                        cancelledById,
                        cancelReason,
                        isClient,
                    },
                });
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
            .andWhere('order.invoiceId IS NULL')
            .andWhere('order.deletedAt IS NULL');
        if (customerId) {
            queryBuilder.andWhere('order.customer_id = :customerId', { customerId });
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
            .andWhere('order.deletedAt IS NULL')
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
    async updateInvoiceInfo(orderIds, invoiceId) {
        await this.orderRepository
            .createQueryBuilder()
            .update(order_entity_1.Order)
            .set({ invoiceId, invoicedAt: new Date() })
            .where('id IN (:...orderIds)', { orderIds })
            .execute();
    }
    async clearInvoiceInfo(invoiceId) {
        await this.orderRepository
            .createQueryBuilder()
            .update(order_entity_1.Order)
            .set({ invoiceId: undefined, invoicedAt: undefined })
            .where('invoice_id = :invoiceId', { invoiceId })
            .execute();
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => event_service_1.EventService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        customer_service_1.CustomerService,
        settings_service_1.SettingService,
        products_service_1.ProductsService,
        inventory_service_1.InventoryService,
        event_service_1.EventService,
        typeorm_2.DataSource,
        logs_service_1.LogsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map