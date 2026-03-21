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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../common/entities/message.entity");
let MessagesService = class MessagesService {
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }
    async create(data) {
        const message = this.messageRepository.create(data);
        return this.messageRepository.save(message);
    }
    async createBatch(messages) {
        const entities = messages.map(data => this.messageRepository.create(data));
        return this.messageRepository.save(entities);
    }
    async findByUser(userId, userType) {
        return this.messageRepository.find({
            where: { userId, userType },
            order: { createdAt: 'DESC' },
        });
    }
    async getUnreadCount(userId, userType) {
        return this.messageRepository.count({
            where: { userId, userType, isRead: false },
        });
    }
    async markAsRead(id) {
        await this.messageRepository.update(id, { isRead: true });
    }
    async markAllAsRead(userId, userType) {
        await this.messageRepository.update({ userId, userType, isRead: false }, { isRead: true });
    }
    async delete(id) {
        await this.messageRepository.delete(id);
    }
    async notifyOrderStatus(orderId, customerId, status) {
        const statusText = {
            pending: '待确认',
            confirmed: '已确认',
            completed: '已完成',
            cancelled: '已取消',
        };
        await this.create({
            userId: customerId,
            userType: 'customer',
            title: '订单状态更新',
            content: `您的订单状态已更新为: ${statusText[status] || status}`,
            type: 'order',
            relatedId: orderId,
        });
    }
    async notifyProductStatus(productId, staffId, status) {
        const statusText = {
            approved: '已通过',
            rejected: '已拒绝',
            active: '已上架',
            inactive: '已下架',
        };
        await this.create({
            userId: staffId,
            userType: 'staff',
            title: '商品审核结果',
            content: `您提交的商品审核结果: ${statusText[status] || status}`,
            type: 'product',
            relatedId: productId,
        });
    }
    async notifyInvoiceDue(invoiceId, customerId, dueDate) {
        await this.create({
            userId: customerId,
            userType: 'customer',
            title: '請求書到期提醒',
            content: `您的請求書将于 ${dueDate.toLocaleDateString('ja-JP')} 到期，请及时付款。`,
            type: 'invoice',
            relatedId: invoiceId,
        });
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MessagesService);
//# sourceMappingURL=messages.service.js.map