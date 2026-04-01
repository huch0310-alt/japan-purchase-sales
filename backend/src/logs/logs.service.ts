import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLog } from './entities/log.entity';

/**
 * 日志服务
 */
@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

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
   * 记录业务操作审计（失败不影响主流程）
   */
  async recordOperation(params: {
    userId?: string;
    userRole?: string;
    module: string;
    action: string;
    detail?: Record<string, unknown>;
    ip?: string;
  }): Promise<void> {
    try {
      await this.create({
        userId: params.userId,
        userRole: params.userRole,
        module: params.module,
        action: params.action,
        detail: params.detail ? JSON.stringify(params.detail) : undefined,
        ip: params.ip,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`操作日志写入失败：${msg}`);
    }
  }

  /**
   * 查询日志
   */
  async findAll(filters?: {
    userId?: string;
    userRole?: string;
    userRoles?: string[];
    module?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<OperationLog[]> {
    const query = this.logRepository.createQueryBuilder('log');

    if (filters?.userId) {
      query.andWhere('log.user_id = :userId', { userId: filters.userId });
    }
    if (filters?.userRoles?.length) {
      query.andWhere('log.user_role IN (:...roles)', { roles: filters.userRoles });
    } else if (filters?.userRole) {
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

    return query.orderBy('log.created_at', 'DESC').getMany();
  }
}
