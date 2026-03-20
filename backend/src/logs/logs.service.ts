import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLog } from './entities/log.entity';

/**
 * 日志服务
 */
@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(OperationLog)
    private logRepository: Repository<OperationLog>,
  ) {}

  /**
   * 记录操作日志
   */
  async create(data: {
    userId?: string;
    userRole?: string;
    module: string;
    action: string;
    detail?: string;
    ip?: string;
  }): Promise<OperationLog> {
    const log = this.logRepository.create(data);
    return this.logRepository.save(log);
  }

  /**
   * 查询日志
   */
  async findAll(filters?: {
    userId?: string;
    userRole?: string;
    module?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<OperationLog[]> {
    const query = this.logRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user');

    if (filters?.userId) {
      query.andWhere('log.user_id = :userId', { userId: filters.userId });
    }
    if (filters?.userRole) {
      query.andWhere('log.user_role = :userRole', { userRole: filters.userRole });
    }
    if (filters?.module) {
      query.andWhere('log.module = :module', { module: filters.module });
    }
    if (filters?.startDate) {
      query.andWhere('log.created_at >= :startDate', { startDate: filters.startDate });
    }
    if (filters?.endDate) {
      query.andWhere('log.created_at <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('log.createdAt', 'DESC').getMany();
  }
}
