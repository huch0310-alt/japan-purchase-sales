import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InventoryLog, InventoryType } from './entities/inventory-log.entity';
import { InventoryAlert } from './entities/inventory-alert.entity';
import { Product } from '../products/entities/product.entity';
import { MessagesService } from '../messages/messages.service';

/**
 * 库存服务
 * 处理库存记录和预警
 */
@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryLog)
    private logRepository: Repository<InventoryLog>,
    @InjectRepository(InventoryAlert)
    private alertRepository: Repository<InventoryAlert>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private messagesService: MessagesService,
    private dataSource: DataSource,
  ) {}

  /**
   * 记录库存变动
   * 使用事务确保库存记录和库存更新原子性
   */
  async recordInventory(data: {
    productId: string;
    type: InventoryType;
    quantity: number;
    operatorId: string;
    remark?: string;
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, { where: { id: data.productId } });
      if (!product) {
        throw new Error('商品不存在');
      }

      const beforeQuantity = product.quantity || 0;
      let afterQuantity = beforeQuantity;
      let actualQuantity = data.quantity;

      // 根据类型计算库存变动
      switch (data.type) {
        case InventoryType.IN:
        case InventoryType.RETURN:
          afterQuantity = beforeQuantity + data.quantity;
          break;
        case InventoryType.OUT:
          // 原子扣减，只有库存足够时才扣减
          if (beforeQuantity < data.quantity) {
            throw new Error(`库存不足，当前库存: ${beforeQuantity}，需要: ${data.quantity}`);
          }
          afterQuantity = beforeQuantity - data.quantity;
          break;
        case InventoryType.ADJUST:
          afterQuantity = data.quantity; // 调整为指定数量
          actualQuantity = data.quantity - beforeQuantity;
          break;
      }

      // 创建库存记录
      const log = queryRunner.manager.create(InventoryLog, {
        productId: data.productId,
        type: data.type,
        quantity: actualQuantity,
        beforeQuantity,
        afterQuantity,
        operatorId: data.operatorId,
        remark: data.remark,
      });
      await queryRunner.manager.save(InventoryLog, log);

      // 原子更新商品库存
      const queryBuilder = queryRunner.manager
        .createQueryBuilder()
        .update(Product)
        .set({ quantity: afterQuantity })
        .where('id = :id', { id: data.productId });

      // 对于OUT类型，额外校验库存防止超卖
      if (data.type === InventoryType.OUT) {
        queryBuilder.andWhere('quantity >= :qty', { qty: data.quantity });
      }

      const result = await queryBuilder.execute();
      if (result.affected === 0 && data.type === InventoryType.OUT) {
        throw new Error(`库存不足，无法扣减: ${product.name}`);
      }

      await queryRunner.commitTransaction();

      // 检查库存预警（在事务外执行，避免锁定）
      await this.checkInventoryAlert(data.productId);

      return log;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取库存记录
   */
  async getLogs(productId?: string, startDate?: Date, endDate?: Date) {
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

  /**
   * 设置库存预警
   */
  async setAlert(productId: string, minQuantity: number) {
    let alert = await this.alertRepository.findOne({ where: { productId } });

    if (alert) {
      alert.minQuantity = minQuantity;
      alert.isActive = true;
      alert.isTriggered = false;
    } else {
      alert = this.alertRepository.create({
        productId,
        minQuantity,
        isActive: true,
        isTriggered: false,
      });
    }

    return this.alertRepository.save(alert);
  }

  /**
   * 获取预警列表
   */
  async getAlerts(isActive?: boolean) {
    const query = this.alertRepository.createQueryBuilder('alert')
      .leftJoinAndSelect('alert.product', 'product');

    if (isActive !== undefined) {
      query.where('alert.is_active = :isActive', { isActive });
    }

    return query.getMany();
  }

  /**
   * 获取库存预警商品
   */
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

  /**
   * 检查库存预警
   * 发送库存预警通知
   */
  private async checkInventoryAlert(productId: string) {
    const alert = await this.alertRepository.findOne({
      where: { productId, isActive: true },
    });

    if (!alert) return;

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) return;

    const isLowStock = (product.quantity || 0) < alert.minQuantity;

    // 如果库存低且之前未触发，则标记为已触发
    if (isLowStock && !alert.isTriggered) {
      alert.isTriggered = true;
      await this.alertRepository.save(alert);

      // 发送库存预警通知给所有管理员
      const admins = await this.productRepository.query(
        `SELECT id FROM staff WHERE role IN ('super_admin', 'admin') AND is_active = true`
      );

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
      console.log(`库存预警: ${product.name} 库存不足，当前库存: ${product.quantity}，预警阈值: ${alert.minQuantity}`);
    } else if (!isLowStock && alert.isTriggered) {
      // 库存恢复后重置
      alert.isTriggered = false;
      await this.alertRepository.save(alert);
    }
  }

  /**
   * 获取商品库存统计
   */
  async getInventoryStats() {
    const products = await this.productRepository.find();
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
}
