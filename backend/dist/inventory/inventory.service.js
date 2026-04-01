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
var InventoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_log_entity_1 = require("./entities/inventory-log.entity");
const inventory_alert_entity_1 = require("./entities/inventory-alert.entity");
const product_entity_1 = require("../products/entities/product.entity");
const messages_service_1 = require("../messages/messages.service");
let InventoryService = InventoryService_1 = class InventoryService {
    constructor(logRepository, alertRepository, productRepository, messagesService, dataSource) {
        this.logRepository = logRepository;
        this.alertRepository = alertRepository;
        this.productRepository = productRepository;
        this.messagesService = messagesService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(InventoryService_1.name);
    }
    async recordInventory(data) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const product = await queryRunner.manager.findOne(product_entity_1.Product, { where: { id: data.productId } });
            if (!product) {
                throw new common_1.NotFoundException('商品不存在');
            }
            const beforeQuantity = product.quantity || 0;
            let afterQuantity = beforeQuantity;
            let actualQuantity = data.quantity;
            switch (data.type) {
                case inventory_log_entity_1.InventoryType.IN:
                case inventory_log_entity_1.InventoryType.RETURN:
                    afterQuantity = beforeQuantity + data.quantity;
                    break;
                case inventory_log_entity_1.InventoryType.OUT:
                    if (beforeQuantity < data.quantity) {
                        throw new common_1.BadRequestException(`库存不足，当前库存: ${beforeQuantity}，需要: ${data.quantity}`);
                    }
                    afterQuantity = beforeQuantity - data.quantity;
                    break;
                case inventory_log_entity_1.InventoryType.ADJUST:
                    afterQuantity = data.quantity;
                    actualQuantity = data.quantity - beforeQuantity;
                    break;
            }
            const log = queryRunner.manager.create(inventory_log_entity_1.InventoryLog, {
                productId: data.productId,
                type: data.type,
                quantity: actualQuantity,
                beforeQuantity,
                afterQuantity,
                operatorId: data.operatorId,
                remark: data.remark,
            });
            await queryRunner.manager.save(inventory_log_entity_1.InventoryLog, log);
            const queryBuilder = queryRunner.manager
                .createQueryBuilder()
                .update(product_entity_1.Product)
                .set({ quantity: afterQuantity })
                .where('id = :id', { id: data.productId });
            if (data.type === inventory_log_entity_1.InventoryType.OUT) {
                queryBuilder.andWhere('quantity >= :qty', { qty: data.quantity });
            }
            const result = await queryBuilder.execute();
            if (result.affected === 0 && data.type === inventory_log_entity_1.InventoryType.OUT) {
                throw new common_1.BadRequestException(`库存不足，无法扣减: ${product.name}`);
            }
            await queryRunner.commitTransaction();
            await this.checkInventoryAlert(data.productId);
            return log;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getLogs(productId, startDate, endDate) {
        const query = this.logRepository.createQueryBuilder('log')
            .leftJoinAndSelect('log.product', 'product')
            .orderBy('log.createdAt', 'DESC');
        if (productId) {
            query.andWhere('log.product_id = :productId', { productId });
        }
        if (startDate) {
            query.andWhere('log.created_at >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('log.created_at <= :endDate', { endDate });
        }
        return query.getMany();
    }
    async setAlert(productId, minQuantity) {
        let alert = await this.alertRepository.findOne({ where: { productId } });
        if (alert) {
            alert.minQuantity = minQuantity;
            alert.isActive = true;
            alert.isTriggered = false;
        }
        else {
            alert = this.alertRepository.create({
                productId,
                minQuantity,
                isActive: true,
                isTriggered: false,
            });
        }
        return this.alertRepository.save(alert);
    }
    async getAlerts(isActive) {
        const query = this.alertRepository.createQueryBuilder('alert')
            .leftJoinAndSelect('alert.product', 'product');
        if (isActive !== undefined) {
            query.where('alert.is_active = :isActive', { isActive });
        }
        return query.getMany();
    }
    async getLowStockProducts() {
        const alerts = await this.alertRepository.find({
            where: { isActive: true },
            relations: ['product'],
        });
        return alerts.filter(alert => {
            const quantity = alert.product?.quantity || 0;
            return quantity < alert.minQuantity;
        });
    }
    async checkInventoryAlert(productId) {
        const alert = await this.alertRepository.findOne({
            where: { productId, isActive: true },
        });
        if (!alert)
            return;
        const product = await this.productRepository.findOne({ where: { id: productId } });
        if (!product)
            return;
        const isLowStock = (product.quantity || 0) < alert.minQuantity;
        if (isLowStock && !alert.isTriggered) {
            alert.isTriggered = true;
            await this.alertRepository.save(alert);
            const admins = await this.productRepository.query(`SELECT id FROM staff WHERE role IN ('super_admin', 'admin') AND is_active = true`);
            for (const admin of admins || []) {
                await this.messagesService.create({
                    userId: admin.id,
                    userType: 'staff',
                    title: '库存预警',
                    content: `商品 "${product.name}" 库存不足，当前库存: ${product.quantity}，预警阈值: ${alert.minQuantity}`,
                    type: 'inventory_alert',
                    relatedId: productId,
                });
            }
            this.logger.warn(`库存预警: ${product.name} 库存不足，当前库存: ${product.quantity}，预警阈值: ${alert.minQuantity}`);
        }
        else if (!isLowStock && alert.isTriggered) {
            alert.isTriggered = false;
            await this.alertRepository.save(alert);
        }
    }
    async getInventoryStats() {
        const products = await this.productRepository.find({ where: { deletedAt: (0, typeorm_2.IsNull)() } });
        const totalProducts = products.length;
        const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
        const lowStockCount = products.filter(p => (p.quantity || 0) < 10).length;
        const outOfStockCount = products.filter(p => (p.quantity || 0) === 0).length;
        return {
            totalProducts,
            totalQuantity,
            lowStockCount,
            outOfStockCount,
        };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = InventoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_log_entity_1.InventoryLog)),
    __param(1, (0, typeorm_1.InjectRepository)(inventory_alert_entity_1.InventoryAlert)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        messages_service_1.MessagesService,
        typeorm_2.DataSource])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map