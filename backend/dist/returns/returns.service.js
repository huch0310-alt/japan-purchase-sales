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
exports.ReturnsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const return_entity_1 = require("./entities/return.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const order_item_entity_1 = require("../orders/entities/order-item.entity");
const product_entity_1 = require("../products/entities/product.entity");
const inventory_log_entity_1 = require("../inventory/entities/inventory-log.entity");
let ReturnsService = class ReturnsService {
    constructor(returnRepository, orderRepository, orderItemRepository, productRepository, dataSource) {
        this.returnRepository = returnRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.dataSource = dataSource;
    }
    async create(data) {
        const returnOrder = this.returnRepository.create({
            ...data,
            status: return_entity_1.ReturnStatus.PENDING,
        });
        return this.returnRepository.save(returnOrder);
    }
    async findAll(status, customerId) {
        const query = this.returnRepository.createQueryBuilder('ret')
            .leftJoinAndSelect('ret.order', 'order')
            .orderBy('ret.createdAt', 'DESC');
        if (status) {
            query.andWhere('ret.status = :status', { status });
        }
        if (customerId) {
            query.andWhere('order.customer_id = :customerId', { customerId });
        }
        return query.getMany();
    }
    async approve(id, approvedBy) {
        await this.returnRepository.update(id, {
            status: return_entity_1.ReturnStatus.APPROVED,
            approvedBy,
            processedAt: new Date(),
        });
        return this.returnRepository.findOne({ where: { id } });
    }
    async reject(id, rejectReason) {
        await this.returnRepository.update(id, {
            status: return_entity_1.ReturnStatus.REJECTED,
            rejectReason,
            processedAt: new Date(),
        });
        return this.returnRepository.findOne({ where: { id } });
    }
    async complete(id) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const returnRecord = await queryRunner.manager.findOne(return_entity_1.Return, {
                where: { id },
                relations: ['order', 'order.items', 'order.items.product'],
            });
            if (!returnRecord) {
                throw new common_1.BadRequestException('退货记录不存在');
            }
            if (returnRecord.status !== return_entity_1.ReturnStatus.APPROVED) {
                throw new common_1.BadRequestException('只能完成已批准的退货');
            }
            const order = returnRecord.order;
            if (order && order.items) {
                const itemsToReturn = returnRecord.orderItemId
                    ? order.items.filter(item => item.id === returnRecord.orderItemId)
                    : order.items;
                for (const item of itemsToReturn) {
                    if (item.product && !item.product.deletedAt) {
                        await queryRunner.manager
                            .createQueryBuilder()
                            .update(product_entity_1.Product)
                            .set({ quantity: () => `quantity + ${item.quantity}` })
                            .where('id = :id', { id: item.productId })
                            .execute();
                        const log = queryRunner.manager.create(inventory_log_entity_1.InventoryLog, {
                            productId: item.productId,
                            type: inventory_log_entity_1.InventoryType.RETURN,
                            quantity: item.quantity,
                            beforeQuantity: item.product.quantity,
                            afterQuantity: item.product.quantity + item.quantity,
                            operatorId: returnRecord.approvedBy || 'system',
                            remark: `退货完成 ${returnRecord.id}`,
                            relatedId: returnRecord.id,
                        });
                        await queryRunner.manager.save(inventory_log_entity_1.InventoryLog, log);
                    }
                }
            }
            await queryRunner.manager.update(return_entity_1.Return, id, {
                status: return_entity_1.ReturnStatus.COMPLETED,
                processedAt: new Date(),
            });
            await queryRunner.commitTransaction();
            return this.returnRepository.findOne({ where: { id } });
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(return_entity_1.Return)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(3, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map