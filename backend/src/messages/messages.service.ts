import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../common/entities/message.entity';

/**
 * 消息服务
 */
@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  /**
   * 发送消息
   */
  async create(data: {
    userId: string;
    userType: string;
    title: string;
    content: string;
    type?: string;
    relatedId?: string;
  }): Promise<Message> {
    const message = this.messageRepository.create(data);
    return this.messageRepository.save(message);
  }

  /**
   * 批量发送消息
   */
  async createBatch(messages: {
    userId: string;
    userType: string;
    title: string;
    content: string;
    type?: string;
    relatedId?: string;
  }[]): Promise<Message[]> {
    const entities = messages.map(data => this.messageRepository.create(data));
    return this.messageRepository.save(entities);
  }

  /**
   * 获取用户消息列表
   */
  async findByUser(userId: string, userType: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { userId, userType },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(userId: string, userType: string): Promise<number> {
    return this.messageRepository.count({
      where: { userId, userType, isRead: false },
    });
  }

  /**
   * 标记为已读
   */
  async markAsRead(id: string): Promise<void> {
    await this.messageRepository.update(id, { isRead: true });
  }

  /**
   * 标记所有为已读
   */
  async markAllAsRead(userId: string, userType: string): Promise<void> {
    await this.messageRepository.update(
      { userId, userType, isRead: false },
      { isRead: true },
    );
  }

  /**
   * 删除消息
   */
  async delete(id: string): Promise<void> {
    await this.messageRepository.delete(id);
  }

  /**
   * 订单状态变化通知
   */
  async notifyOrderStatus(orderId: string, customerId: string, status: string): Promise<void> {
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

  /**
   * 商品审核结果通知
   */
  async notifyProductStatus(productId: string, staffId: string, status: string): Promise<void> {
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

  /**
   * 請求書到期提醒
   */
  async notifyInvoiceDue(invoiceId: string, customerId: string, dueDate: Date): Promise<void> {
    await this.create({
      userId: customerId,
      userType: 'customer',
      title: '請求書到期提醒',
      content: `您的請求書将于 ${dueDate.toLocaleDateString('ja-JP')} 到期，请及时付款。`,
      type: 'invoice',
      relatedId: invoiceId,
    });
  }
}
