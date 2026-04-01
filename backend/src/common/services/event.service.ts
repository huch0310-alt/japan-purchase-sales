import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { RealtimeGateway } from '../../gateways/realtime.gateway';
import { Order } from '../../orders/entities/order.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Product } from '../../products/entities/product.entity';
import { Message } from '../entities/message.entity';

/**
 * 实时事件类型定义
 */
export interface RealtimeEvent {
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  userId?: string;
  role?: string;
}

/**
 * 事件服务
 * 统一处理实时消息推送
 */
@Injectable()
export class EventService {
  constructor(
    @Inject(forwardRef(() => RealtimeGateway))
    private gateway: RealtimeGateway,
  ) {}

  /**
   * 发送订单创建事件
   */
  notifyOrderCreated(order: Order) {
    const event: RealtimeEvent = {
      type: 'order:created',
      title: '新订单通知',
      message: `客户 ${order.customer?.companyName || ''} 创建了新订单 ${order.orderNo}`,
      data: order as unknown as Record<string, unknown>,
    };
    // 通知所有管理员和销售
    this.sendToRoles(['super_admin', 'admin', 'sales'], 'order:created', event);
  }

  /**
   * 发送订单状态变更事件
   */
  notifyOrderStatusChanged(order: Order) {
    const statusMap: Record<string, string> = {
      pending: '待确认',
      confirmed: '已确认',
      completed: '已完成',
      cancelled: '已取消',
    };

    const event: RealtimeEvent = {
      type: 'order:status',
      title: '订单状态变更',
      message: `订单 ${order.orderNo} 状态已变更为: ${statusMap[order.status] || order.status}`,
      data: order as unknown as Record<string, unknown>,
    };

    // 通知客户
    if (order.customerId) {
      this.sendToUser(order.customerId, 'order:status', event);
    }

    // 通知相关员工
    this.sendToRoles(['super_admin', 'admin', 'sales'], 'order:status', event);
  }

  /**
   * 发送請求書创建事件
   */
  notifyInvoiceCreated(invoice: Invoice) {
    const event: RealtimeEvent = {
      type: 'invoice:created',
      title: '請求書生成通知',
      message: `已为客户生成請求書 ${invoice.invoiceNo}`,
      data: invoice as unknown as Record<string, unknown>,
    };

    // 通知客户
    if (invoice.customerId) {
      this.sendToUser(invoice.customerId, 'invoice:created', event);
    }

    // 通知财务
    this.sendToRoles(['super_admin', 'admin'], 'invoice:created', event);
  }

  /**
   * 发送請求書逾期事件
   */
  notifyInvoiceOverdue(invoice: Invoice) {
    const event: RealtimeEvent = {
      type: 'invoice:overdue',
      title: '請求書逾期提醒',
      message: `請求書 ${invoice.invoiceNo} 已逾期，请尽快处理`,
      data: invoice as unknown as Record<string, unknown>,
    };

    // 通知客户
    if (invoice.customerId) {
      this.sendToUser(invoice.customerId, 'invoice:overdue', event);
    }

    // 通知财务
    this.sendToRoles(['super_admin', 'admin'], 'invoice:overdue', event);
  }

  /**
   * 发送商品审核结果事件
   */
  notifyProductApproved(product: Product, _staffName?: string) {
    const event: RealtimeEvent = {
      type: 'product:approved',
      title: '商品审核通过',
      message: `商品 "${product.name}" 已审核通过`,
      data: product as unknown as Record<string, unknown>,
    };

    // 通知创建者
    if (product.createdBy) {
      this.sendToUser(product.createdBy, 'product:approved', event);
    }
  }

  /**
   * 发送商品审核拒绝事件
   */
  notifyProductRejected(product: Product, reason?: string) {
    const event: RealtimeEvent = {
      type: 'product:rejected',
      title: '商品审核拒绝',
      message: reason
        ? `商品 "${product.name}" 审核被拒绝: ${reason}`
        : `商品 "${product.name}" 审核被拒绝`,
      data: product as unknown as Record<string, unknown>,
    };

    // 通知创建者
    if (product.createdBy) {
      this.sendToUser(product.createdBy, 'product:rejected', event);
    }
  }

  /**
   * 发送新消息事件
   */
  notifyNewMessage(userId: string, message: Message) {
    const event: RealtimeEvent = {
      type: 'message:new',
      title: '新消息',
      message: message.title || '您有新消息',
      data: message as unknown as Record<string, unknown>,
    };

    this.sendToUser(userId, 'message:new', event);
  }

  /**
   * 发送系统通知
   */
  notifySystem(role: string | string[], title: string, message: string, data?: Record<string, unknown>) {
    const event: RealtimeEvent = {
      type: 'system:notification',
      title,
      message,
      data,
    };

    if (Array.isArray(role)) {
      this.sendToRoles(role, 'system:notification', event);
    } else {
      this.sendToRoles([role], 'system:notification', event);
    }
  }

  /**
   * 发送给指定用户
   */
  sendToUser(userId: string, eventName: string, data: RealtimeEvent) {
    if (this.gateway) {
      this.gateway.sendToUser(userId, eventName, data);
    }
  }

  /**
   * 发送给指定角色
   */
  sendToRoles(roles: string[], eventName: string, data: RealtimeEvent) {
    if (this.gateway) {
      roles.forEach(role => {
        this.gateway.sendToRole(role, eventName, data);
      });
    }
  }

  /**
   * 广播给所有在线用户
   */
  broadcast(eventName: string, data: RealtimeEvent) {
    if (this.gateway) {
      this.gateway.broadcast(eventName, data);
    }
  }

  /**
   * 获取在线用户数
   */
  getOnlineCount(): number {
    return this.gateway?.getOnlineCount() || 0;
  }
}
