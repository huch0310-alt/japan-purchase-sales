import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Return, ReturnStatus } from './entities/return.entity';

/**
 * 退货服务
 */
@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return)
    private returnRepository: Repository<Return>,
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
   * 完成退货
   */
  async complete(id: string) {
    await this.returnRepository.update(id, {
      status: ReturnStatus.COMPLETED,
      processedAt: new Date(),
    });
    return this.returnRepository.findOne({ where: { id } });
  }
}
