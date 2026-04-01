import { Injectable, Inject, forwardRef, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Customer } from '../users/entities/customer.entity';
import { CustomerService } from '../users/customer.service';
import { SettingService } from '../settings/settings.service';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { EventService } from '../common/services/event.service';
import { Product } from '../products/entities/product.entity';
import { InventoryType, InventoryLog } from '../inventory/entities/inventory-log.entity';
import { v4 as uuidv4 } from 'uuid';
import { PaginatedResponse } from '../common/dto/validation.dto';
import { LogsService } from '../logs/logs.service';
import { OperationAuditContext } from '../common/types';

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
    private inventoryService: InventoryService,
    @Inject(forwardRef(() => EventService))
    private eventService: EventService,
    private dataSource: DataSource,
    private logsService: LogsService,
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
  async create(
    data: {
      customerId: string;
      items: { productId: string; quantity: number }[];
      deliveryAddress: string;
      contactPerson: string;
      contactPhone: string;
      remark?: string;
    },
    audit?: OperationAuditContext,
  ): Promise<Order> {
    // 开启事务
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取客户信息
      const customer = await queryRunner.manager.findOne(Customer, { where: { id: data.customerId } });
      if (!customer) {
        throw new NotFoundException('客户不存在');
      }

      // 验证商品并计算订单金额（使用批量查询解决N+1问题）
      let subtotal = 0;
      const orderItemsData: { product: Product; quantity: number; unitPrice: number; itemSubtotal: number }[] = [];

      // 批量查询所有商品
      const productIds = data.items.map(item => item.productId);
      const products = await this.productsService.findByIds(productIds);
      const productMap = new Map(products.map(p => [p.id, p]));

      for (const item of data.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new NotFoundException(`商品不存在: ${item.productId}`);
        }
        if (product.status !== 'active') {
          throw new BadRequestException(`商品未上架: ${product.name}`);
        }
        if (product.quantity < item.quantity) {
          throw new BadRequestException(`商品库存不足: ${product.name}`);
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

        // 原子扣减库存：只有库存足够时才扣减，防止并发超卖
        const result = await queryRunner.manager
          .createQueryBuilder()
          .update(Product)
          .set({ quantity: () => `quantity - ${itemData.quantity}` })
          .where('id = :id AND quantity >= :quantity', {
            id: itemData.product.id,
            quantity: itemData.quantity,
          })
          .execute();

        if (result.affected === 0) {
          throw new BadRequestException(`商品库存不足: ${itemData.product.name}`);
        }

        // 记录库存变动日志（在同一事务中）
        const log = queryRunner.manager.create(InventoryLog, {
          productId: itemData.product.id,
          type: InventoryType.OUT,
          quantity: -itemData.quantity,
          beforeQuantity: itemData.product.quantity,
          afterQuantity: itemData.product.quantity - itemData.quantity,
          operatorId: data.customerId,
          remark: `订单 ${savedOrder.orderNo}`,
          relatedId: savedOrder.id,
        });
        await queryRunner.manager.save(InventoryLog, log);
      }

      // 提交事务
      await queryRunner.commitTransaction();

      // 获取完整订单信息并发送事件通知
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

      return fullOrder!;
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
      where: { id, deletedAt: IsNull() },
      relations: ['customer', 'items', 'items.product', 'invoice'],
    });
  }

  /**
   * 根据订单号查找订单
   */
  async findByOrderNo(orderNo: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { orderNo, deletedAt: IsNull() },
      relations: ['customer', 'items', 'items.product'],
    });
  }

  /**
   * 查询客户订单
   */
  async findByCustomer(customerId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { customerId, deletedAt: IsNull() },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 查询所有订单（管理后台）
   * 优化版本：使用分页优化和延迟加载关联数据
   */
  async findAll(filters?: {
    status?: string;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Order>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // 第一步：查询订单主表（不关联其他表，提高性能）
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

    // 获取订单列表和总数
    const [orders, total] = await query
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    // 如果没有订单，直接返回空结果
    if (orders.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    // 第二步：批量加载关联数据（避免N+1查询）
    const orderIds = orders.map(o => o.id);
    
    // 批量查询客户信息
    const customers = await this.orderRepository.manager.createQueryBuilder()
      .select(['customer.id', 'customer.companyName', 'customer.contactPerson', 'customer.phone'])
      .from('customers', 'customer')
      .innerJoin('orders', 'order', 'order.customer_id = customer.id')
      .where('order.id IN (:...orderIds)', { orderIds })
      .getMany();
    
    const customerMap = new Map(customers.map(c => [c.id, c]));

    // 批量查询订单项
    const orderItems = await this.orderRepository.manager.createQueryBuilder()
      .select(['item.id', 'item.orderId', 'item.productName', 'item.quantity', 'item.unitPrice'])
      .from('order_items', 'item')
      .where('item.order_id IN (:...orderIds)', { orderIds })
      .getMany();
    
    const itemsMap = new Map<string, typeof orderItems>();
    orderItems.forEach(item => {
      if (!itemsMap.has(item.orderId)) {
        itemsMap.set(item.orderId, []);
      }
      itemsMap.get(item.orderId)!.push(item);
    });

    // 第三步：组装数据
    const data = orders.map(order => {
      const customer = customerMap.get(order.customerId);
      const items = itemsMap.get(order.id) || [];
      
      return {
        ...order,
        customer,
        items,
      } as Order;
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 确认订单（销售端）
   * 状态校验：只能确认待确认状态的订单
   */
  async confirm(id: string, audit?: OperationAuditContext): Promise<Order> {
    const order = await this.findById(id);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    if (order.status !== 'pending') {
      throw new BadRequestException(`订单状态不是待确认，无法确认。当前状态：${order.status}`);
    }
    await this.orderRepository.update(id, {
      status: 'confirmed',
      confirmedAt: new Date(),
    });
    const updatedOrder = await this.findById(id);
    // 发送订单状态变更通知
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

    return updatedOrder!;
  }

  /**
   * 批量确认订单（使用事务保证一致性）
   * 状态校验：只能确认待确认状态的订单
   */
  async batchConfirm(ids: string[], audit?: OperationAuditContext): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 校验所有订单都是待确认状态
      for (const id of ids) {
        const order = await queryRunner.manager.findOne(Order, {
          where: { id, deletedAt: IsNull() },
          relations: ['items'],
        });
        if (!order) {
          throw new NotFoundException(`订单不存在: ${id}`);
        }
        if (order.status !== 'pending') {
          throw new BadRequestException(`订单${order.orderNo}状态不是待确认，无法确认。当前状态：${order.status}`);
        }
      }

      // 批量更新订单状态
      await queryRunner.manager.update(Order, ids, {
        status: 'confirmed',
        confirmedAt: new Date(),
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
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

  /**
   * 完成订单（使用事务）
   * 状态校验：只能完成已确认状态的订单
   */
  async complete(id: string, audit?: OperationAuditContext): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 先查询订单状态
      const order = await queryRunner.manager.findOne(Order, { where: { id } });
      if (!order) {
        throw new NotFoundException('订单不存在');
      }
      if (order.status !== 'confirmed') {
        throw new BadRequestException(`订单状态不是已确认，无法完成。当前状态：${order.status}`);
      }

      await queryRunner.manager.update(Order, id, {
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

      return completedOrder!;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 取消订单（使用事务，并恢复库存）
   * 状态校验：只能取消待确认（pending）状态的订单
   * 客户只能在下单后30分钟内取消
   * @param id 订单ID
   * @param cancelledById 取消人ID
   * @param cancelReason 取消原因（可选）
   * @param isClient 是否为客户取消（客户有30分钟限制）
   */
  async cancel(
    id: string,
    cancelledById?: string,
    cancelReason?: string,
    isClient: boolean = false,
    audit?: OperationAuditContext,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 先查询订单获取订单明细
      const order = await this.findById(id);
      if (!order) {
        throw new NotFoundException('订单不存在');
      }
      // 只能取消待确认状态的订单
      if (order.status !== 'pending') {
        throw new BadRequestException(`订单状态不是待确认，无法取消。当前状态：${order.status}`);
      }

      // 客户取消：检查是否在30分钟内
      if (isClient) {
        const createdTime = new Date(order.createdAt).getTime();
        const now = Date.now();
        const minutes = (now - createdTime) / (1000 * 60);
        if (minutes > 30) {
          throw new BadRequestException('订单已超过30分钟，无法取消');
        }
      }

      // 恢复库存（原子操作，只恢复未软删除的商品）并记录日志
      for (const item of order.items || []) {
        if (item.product && !item.product.deletedAt) {
          await queryRunner.manager
            .createQueryBuilder()
            .update(Product)
            .set({ quantity: () => `quantity + ${item.quantity}` })
            .where('id = :id', { id: item.productId })
            .andWhere('"deletedAt" IS NULL')
            .execute();

          // 记录库存恢复日志（在同一事务中）
          const log = queryRunner.manager.create(InventoryLog, {
            productId: item.productId,
            type: InventoryType.RETURN,
            quantity: item.quantity,
            beforeQuantity: item.product.quantity,
            afterQuantity: item.product.quantity + item.quantity,
            operatorId: cancelledById || order.customerId,
            remark: `订单取消退还 ${order.orderNo}`,
            relatedId: order.id,
          });
          await queryRunner.manager.save(InventoryLog, log);
        }
      }

      // 更新订单状态，记录取消人和原因
      await queryRunner.manager.update(Order, id, {
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

      return cancelledOrder!;
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
      .andWhere('order.invoiceId IS NULL')
      .andWhere('order.deletedAt IS NULL');

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

  /**
   * 更新订单的請求書信息（生成請求書时调用）
   */
  async updateInvoiceInfo(orderIds: string[], invoiceId: string): Promise<void> {
    await this.orderRepository
      .createQueryBuilder()
      .update(Order)
      .set({ invoiceId, invoicedAt: new Date() })
      .where('id IN (:...orderIds)', { orderIds })
      .execute();
  }

  /**
   * 清除订单的請求書信息（撤销請求書时调用）
   */
  async clearInvoiceInfo(invoiceId: string): Promise<void> {
    await this.orderRepository
      .createQueryBuilder()
      .update(Order)
      .set({ invoiceId: undefined, invoicedAt: undefined })
      .where('invoice_id = :invoiceId', { invoiceId })
      .execute();
  }
}
