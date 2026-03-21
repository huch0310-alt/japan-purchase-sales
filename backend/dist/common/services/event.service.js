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
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const realtime_gateway_1 = require("../../gateways/realtime.gateway");
let EventService = class EventService {
    constructor(gateway) {
        this.gateway = gateway;
    }
    notifyOrderCreated(order) {
        const event = {
            type: 'order:created',
            title: '新订单通知',
            message: `客户 ${order.customer?.companyName || ''} 创建了新订单 ${order.orderNo}`,
            data: order,
        };
        this.sendToRoles(['super_admin', 'admin', 'sales'], 'order:created', event);
    }
    notifyOrderStatusChanged(order) {
        const statusMap = {
            pending: '待确认',
            confirmed: '已确认',
            completed: '已完成',
            cancelled: '已取消',
        };
        const event = {
            type: 'order:status',
            title: '订单状态变更',
            message: `订单 ${order.orderNo} 状态已变更为: ${statusMap[order.status] || order.status}`,
            data: order,
        };
        if (order.customerId) {
            this.sendToUser(order.customerId, 'order:status', event);
        }
        this.sendToRoles(['super_admin', 'admin', 'sales'], 'order:status', event);
    }
    notifyInvoiceCreated(invoice) {
        const event = {
            type: 'invoice:created',
            title: '請求書生成通知',
            message: `已为客户生成請求書 ${invoice.invoiceNo}`,
            data: invoice,
        };
        if (invoice.customerId) {
            this.sendToUser(invoice.customerId, 'invoice:created', event);
        }
        this.sendToRoles(['super_admin', 'admin'], 'invoice:created', event);
    }
    notifyInvoiceOverdue(invoice) {
        const event = {
            type: 'invoice:overdue',
            title: '請求書逾期提醒',
            message: `請求書 ${invoice.invoiceNo} 已逾期，请尽快处理`,
            data: invoice,
        };
        if (invoice.customerId) {
            this.sendToUser(invoice.customerId, 'invoice:overdue', event);
        }
        this.sendToRoles(['super_admin', 'admin'], 'invoice:overdue', event);
    }
    notifyProductApproved(product, staffName) {
        const event = {
            type: 'product:approved',
            title: '商品审核通过',
            message: `商品 "${product.name}" 已审核通过`,
            data: product,
        };
        if (product.createdBy) {
            this.sendToUser(product.createdBy, 'product:approved', event);
        }
    }
    notifyProductRejected(product, reason) {
        const event = {
            type: 'product:rejected',
            title: '商品审核拒绝',
            message: reason
                ? `商品 "${product.name}" 审核被拒绝: ${reason}`
                : `商品 "${product.name}" 审核被拒绝`,
            data: product,
        };
        if (product.createdBy) {
            this.sendToUser(product.createdBy, 'product:rejected', event);
        }
    }
    notifyNewMessage(userId, message) {
        const event = {
            type: 'message:new',
            title: '新消息',
            message: message.title || '您有新消息',
            data: message,
        };
        this.sendToUser(userId, 'message:new', event);
    }
    notifySystem(role, title, message, data) {
        const event = {
            type: 'system:notification',
            title,
            message,
            data,
        };
        if (Array.isArray(role)) {
            this.sendToRoles(role, 'system:notification', event);
        }
        else {
            this.sendToRoles([role], 'system:notification', event);
        }
    }
    sendToUser(userId, eventName, data) {
        if (this.gateway) {
            this.gateway.sendToUser(userId, eventName, data);
        }
    }
    sendToRoles(roles, eventName, data) {
        if (this.gateway) {
            roles.forEach(role => {
                this.gateway.sendToRole(role, eventName, data);
            });
        }
    }
    broadcast(eventName, data) {
        if (this.gateway) {
            this.gateway.broadcast(eventName, data);
        }
    }
    getOnlineCount() {
        return this.gateway?.getOnlineCount() || 0;
    }
};
exports.EventService = EventService;
exports.EventService = EventService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => realtime_gateway_1.RealtimeGateway))),
    __metadata("design:paramtypes", [realtime_gateway_1.RealtimeGateway])
], EventService);
//# sourceMappingURL=event.service.js.map