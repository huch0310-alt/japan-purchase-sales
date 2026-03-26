import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Customer } from '../users/entities/customer.entity';
import { CustomerService } from '../users/customer.service';
import { SettingService } from '../settings/settings.service';
import { ProductsService } from '../products/products.service';
import { EventService } from '../common/services/event.service';
import { Product } from '../products/entities/product.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * 订单服务
 * 处理订单相关的数据库操作
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private customerService: CustomerService,
    private settingService: SettingService,
    private productsService: ProductsService,
    @Inject(forwardRef(() => EventService))
    private eventService: EventService,
    private dataSource: DataSource,
  ) {}

  /**
   * 生成订单号
   */
  private generateOrderNo(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${random}`;
  }

  /**
   * 创建订单（客户下单）
   * 使用事务保证数据一致性
   */
  async create(data: {
    customerId: string;
    items: { productId: string; quantity: number }[];
    deliveryAddress: string;
    contactPerson: string;
    contactPhone: string;
    remark?: string;
  }): Promise<Order> {
    // 开启事务
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取客户信息
      const customer = await queryRunner.manager.findOne(Customer, { where: { id: data.customerId } });
      if (!customer) {
        throw new Error('客户不存在');
      }

      // 验证商品并计算订单金额
      let subtotal = 0;
      const orderItemsData: { product: Product; quantity: number; unitPrice: number; itemSubtotal: number }[] = [];

      for (const item of data.items) {
        // 从商品表获取真实价格和名称
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

      // 获取消费税率
      const taxRate = await this.settingService.getValue('tax_rate') || '10';
      const taxRateNum = parseInt(taxRate) / 100;

      // 计算VIP折扣
      // vipDiscount=0 表示不打折（应付100%）
      // vipDiscount=10 表示打9折（应付90%，即减去10%）
      // 计算公式: 应付金额 = 原价 × (1 - vipDiscount / 100)
      const vipDiscountNum = parseFloat(String(customer.vipDiscount)) / 100; // 10 -> 0.10
      const afterDiscount = Math.round(subtotal * (1 - vipDiscountNum) * 100) / 100; // 折后价
      const discountAmount = Math.round((subtotal - afterDiscount) * 100) / 100; // 折扣金额

      // 计算消费税
      const taxAmount = Math.round(afterDiscount * taxRateNum);

      // 税込合计
      const totalAmount = afterDiscount + taxAmount;

      // 创建订单
      const order = queryRunner.manager.create(Order, {
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

      const savedOrder = await queryRunner.manager.save(Order, order);

      // 创建订单明细
      for (const itemData of orderItemsData) {
        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          product: itemData.product,
          productName: itemData.product.name,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
        });
        await queryRunner.manager.save(OrderItem, orderItem);

        // 扣减库存
        await queryRunner.manager.update(Product, itemData.product.id, {
          quantity: itemData.product.quantity - itemData.quantity,
        });
      }

      // 提交事务
      await queryRunner.commitTransaction();

      // 获取完整订单信息并发送事件通知
      const fullOrder = await this.findById(savedOrder.id);
      if (fullOrder) {
        fullOrder.customer = customer;
        this.eventService.notifyOrderCreated(fullOrder);
      }

      return fullOrder;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 释放查询Runner
      await queryRunner.release();
    }
  }

  /**
   * 根据ID查找订单
   */
  async findById(id: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'items', 'items.product', 'invoice'],
    });
  }

  /**
   * 根据订单号查找订单
   */
  async findByOrderNo(orderNo: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { orderNo },
      relations: ['customer', 'items', 'items.product'],
    });
  }

  /**
   * 查询客户订单
   */
  async findByCustomer(customerId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { customerId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 查询所有订单（管理后台）
   */
  async findAll(filters?: {
    status?: string;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<Order[]> {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.invoice', 'invoice');

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

  /**
   * 确认订单（销售端）
   */
  async confirm(id: string, confirmedById: string): Promise<Order> {
    await this.orderRepository.update(id, {
      status: 'confirmed',
      confirmedAt: new Date(),
    });
    const order = await this.findById(id);
    // 发送订单状态变更通知
    if (order) {
      this.eventService.notifyOrderStatusChanged(order);
    }
    return order;
  }

  /**
   * 批量确认订单
   */
  async batchConfirm(ids: string[], confirmedById: string): Promise<void> {
    await this.orderRepository.update(ids, {
      status: 'confirmed',
      confirmedAt: new Date(),
    });
  }

  /**
   * 完成订单（使用事务）
   */
  async complete(id: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Order, id, {
        status: 'completed',
        completedAt: new Date(),
      });
      await queryRunner.commitTransaction();

      const order = await this.findById(id);
      if (order) {
        this.eventService.notifyOrderStatusChanged(order);
      }
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 取消订单（使用事务，并恢复库存）
   */
  async cancel(id: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 先查询订单获取订单明细
      const order = await this.findById(id);
      if (!order) {
        throw new Error('订单不存在');
      }

      // 恢复库存
      for (const item of order.items || []) {
        if (item.product) {
          const product = await this.productsService.findById(item.productId);
          if (product) {
            await queryRunner.manager.update(Product, item.productId, {
              quantity: product.quantity + item.quantity,
            });
          }
        }
      }

      // 更新订单状态
      await queryRunner.manager.update(Order, id, { status: 'cancelled' });
      await queryRunner.commitTransaction();

      const cancelledOrder = await this.findById(id);
      if (cancelledOrder) {
        this.eventService.notifyOrderStatusChanged(cancelledOrder);
      }
      return cancelledOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取客户的已完成但未生成请求书的订单
   */
  async findCompletedWithoutInvoice(customerId?: string): Promise<Order[]> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.status = :status', { status: 'completed' })
      .andWhere('order.invoiceId IS NULL');

    if (customerId) {
      queryBuilder.andWhere('order.customer_id = :customerId', { customerId });
    }

    return queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  /**
   * 获取销售报表数据
   */
  async getSalesReport(startDate: Date, endDate: Date): Promise<any> {
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
}
