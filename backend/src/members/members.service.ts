import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MemberLevel } from './entities/member-level.entity';
import { CustomerMember } from './entities/customer-member.entity';
import { PointsLog, PointsType } from './entities/points-log.entity';
import { MessagesService } from '../messages/messages.service';

/**
 * 会员服务
 */
@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    @InjectRepository(MemberLevel)
    private levelRepository: Repository<MemberLevel>,
    @InjectRepository(CustomerMember)
    private memberRepository: Repository<CustomerMember>,
    @InjectRepository(PointsLog)
    private pointsLogRepository: Repository<PointsLog>,
    private messagesService: MessagesService,
    private dataSource: DataSource,
  ) {}

  // ==================== 会员等级 ====================

  /**
   * 获取所有会员等级
   */
  async getLevels() {
    return this.levelRepository.find({ order: { sortOrder: 'ASC' } });
  }

  /**
   * 根据积分获取应升级的等级
   */
  async getLevelByPoints(points: number) {
    return this.levelRepository
      .createQueryBuilder('level')
      .where('level.minPoints <= :points', { points })
      .orderBy('level.minPoints', 'DESC')
      .getOne();
  }

  // ==================== 客户会员 ====================

  /**
   * 获取客户会员信息
   */
  async getCustomerMember(customerId: string) {
    return this.memberRepository.findOne({
      where: { customerId },
      relations: ['level'],
    });
  }

  /**
   * 创建客户会员
   */
  async createCustomerMember(customerId: string) {
    const defaultLevel = await this.levelRepository.findOne({ where: { name: 'Bronze' } });

    const member = this.memberRepository.create({
      customerId,
      levelId: defaultLevel?.id,
      points: 0,
      totalPoints: 0,
    });

    return this.memberRepository.save(member);
  }

  /**
   * 添加积分（使用原子更新防止竞态条件）
   */
  async addPoints(customerId: string, points: number, type: PointsType, relatedId?: string, remark?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 原子增加积分：使用 INSERT ... ON CONFLICT 防止竞态条件
      // 先获取默认等级
      const defaultLevel = await queryRunner.manager.findOne(MemberLevel, { where: { name: 'Bronze' } });

      // 使用原生SQL进行原子性"插入或更新"操作
      // PostgreSQL: INSERT ... ON CONFLICT DO UPDATE
      await queryRunner.manager.query(
        `INSERT INTO customer_members (customer_id, level_id, points, total_points, created_at, updated_at)
         VALUES ($1, $2, 0, 0, NOW(), NOW())
         ON CONFLICT (customer_id) DO UPDATE SET updated_at = NOW()
         RETURNING id`,
        [customerId, defaultLevel?.id],
      );

      // 获取会员ID用于后续更新
      const member = await queryRunner.manager.findOne(CustomerMember, { where: { customerId } });
      if (!member) {
        throw new Error('会员创建失败');
      }

      // 原子更新积分
      await queryRunner.manager
        .createQueryBuilder()
        .update(CustomerMember)
        .set({
          points: () => `points + ${points}`,
          totalPoints: () => `totalPoints + ${points}`,
        })
        .where('id = :id', { id: member.id })
        .execute();

      // 记录积分变动
      await queryRunner.manager.save(PointsLog, {
        customerId,
        type,
        points,
        relatedId,
        remark,
      });

      await queryRunner.commitTransaction();

      // 检查是否需要升级（独立事务外）
      await this.checkLevelUpgrade(customerId);

      return this.getCustomerMember(customerId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 使用积分（使用原子更新防止竞态条件和超扣）
   */
  async usePoints(customerId: string, points: number, relatedId?: string, remark?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 先检查积分是否足够
      const member = await queryRunner.manager.findOne(CustomerMember, { where: { customerId } });
      if (!member) {
        throw new BadRequestException('会员不存在');
      }
      if (member.points < points) {
        throw new BadRequestException('积分不足');
      }

      // 原子扣减积分（带条件防止超扣）
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update(CustomerMember)
        .set({ points: () => `points - ${points}` })
        .where('id = :id AND points >= :points', { id: member.id, points })
        .execute();

      if (result.affected === 0) {
        throw new BadRequestException('积分不足');
      }

      // 记录积分变动
      await queryRunner.manager.save(PointsLog, {
        customerId,
        type: PointsType.ORDERUse,
        points: -points,
        relatedId,
        remark,
      });

      await queryRunner.commitTransaction();
      return this.getCustomerMember(customerId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 检查并升级会员等级
   */
  async checkLevelUpgrade(customerId: string) {
    const member = await this.getCustomerMember(customerId);
    if (!member) return;

    const newLevel = await this.getLevelByPoints(member.totalPoints);
    if (newLevel && newLevel.id !== member.levelId) {
      const oldLevelId = member.levelId;
      member.levelId = newLevel.id;
      await this.memberRepository.save(member);

      // 发送会员升级通知
      await this.messagesService.create({
        userId: customerId,
        userType: 'customer',
        title: '会员等级升级',
        content: `恭喜！您的会员等级已从 ${oldLevelId} 升级为 ${newLevel.name}，享受更多优惠！`,
        type: 'member_upgrade',
      });
      this.logger.log(`会员升级: ${customerId} 升级为 ${newLevel.name}`);
    }
  }

  /**
   * 获取积分记录
   */
  async getPointsLogs(customerId: string, limit: number = 20) {
    return this.pointsLogRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
