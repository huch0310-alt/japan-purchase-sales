import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Return, ReturnStatus } from './entities/return.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryLog, InventoryType } from '../inventory/entities/inventory-log.entity';

/**
 * 退货服务
 */
@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return)
    private returnRepository: Repository<Return>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  /**
   * 创建退货申请
   */
  async create(data: {
    orderId: string;
    orderItemId?: string;
    reason: string;
    amount: number;
  }) {
    const returnOrder = this.returnRepository.create({
      ...data,
      status: ReturnStatus.PENDING,
    });
    return this.returnRepository.save(returnOrder);
  }

  /**
   * 获取退货列表
   */
  async findAll(status?: ReturnStatus, customerId?: string) {
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

  /**
   * 批准退货
   */
  async approve(id: string, approvedBy: string) {
    await this.returnRepository.update(id, {
      status: ReturnStatus.APPROVED,
      approvedBy,
      processedAt: new Date(),
    });
    return this.returnRepository.findOne({ where: { id } });
  }

  /**
   * 拒绝退货
   */
  async reject(id: string, rejectReason: string) {
    await this.returnRepository.update(id, {
      status: ReturnStatus.REJECTED,
      rejectReason,
      processedAt: new Date(),
    });
    return this.returnRepository.findOne({ where: { id } });
  }

  /**
   * 完成退货（使用事务恢复库存）
   */
  async complete(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 获取退货记录
      const returnRecord = await queryRunner.manager.findOne(Return, {
        where: { id },
        relations: ['order', 'order.items', 'order.items.product'],
      });

      if (!returnRecord) {
        throw new BadRequestException('退货记录不存在');
      }

      if (returnRecord.status !== ReturnStatus.APPROVED) {
        throw new BadRequestException('只能完成已批准的退货');
      }

      // 2. 恢复库存（原子操作）并记录日志
      // 如果指定了 orderItemId，只退单个商品；否则退整个订单
      const order = returnRecord.order;
      if (order && order.items) {
        const itemsToReturn = returnRecord.orderItemId
          ? order.items.filter(item => item.id === returnRecord.orderItemId)
          : order.items;

        for (const item of itemsToReturn) {
          if (item.product && !item.product.deletedAt) {
            // 原子恢复库存
            await queryRunner.manager
              .createQueryBuilder()
              .update(Product)
              .set({ quantity: () => `quantity + ${item.quantity}` })
              .where('id = :id', { id: item.productId })
              .execute();

            // 记录库存变动日志
            const log = queryRunner.manager.create(InventoryLog, {
              productId: item.productId,
              type: InventoryType.RETURN,
              quantity: item.quantity,
              beforeQuantity: item.product.quantity,
              afterQuantity: item.product.quantity + item.quantity,
              operatorId: returnRecord.approvedBy || 'system',
              remark: `退货完成 ${returnRecord.id}`,
              relatedId: returnRecord.id,
            });
            await queryRunner.manager.save(InventoryLog, log);
          }
        }
      }

      // 3. 更新退货状态
      await queryRunner.manager.update(Return, id, {
        status: ReturnStatus.COMPLETED,
        processedAt: new Date(),
      });

      await queryRunner.commitTransaction();

      return this.returnRepository.findOne({ where: { id } });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
