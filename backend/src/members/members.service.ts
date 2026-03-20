import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { MemberLevel } from './entities/member-level.entity';
import { CustomerMember } from './entities/customer-member.entity';
import { PointsLog, PointsType } from './entities/points-log.entity';
import { MessagesService } from '../messages/messages.service';

/**
 * 会员服务
 */
@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(MemberLevel)
    private levelRepository: Repository<MemberLevel>,
    @InjectRepository(CustomerMember)
    private memberRepository: Repository<CustomerMember>,
    @InjectRepository(PointsLog)
    private pointsLogRepository: Repository<PointsLog>,
    private messagesService: MessagesService,
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
   * 添加积分
   */
  async addPoints(customerId: string, points: number, type: PointsType, relatedId?: string, remark?: string) {
    let member = await this.getCustomerMember(customerId);

    if (!member) {
      member = await this.createCustomerMember(customerId);
    }

    // 更新积分
    member.points += points;
    member.totalPoints += points;
    await this.memberRepository.save(member);

    // 记录积分变动
    await this.pointsLogRepository.save({
      customerId,
      type,
      points,
      relatedId,
      remark,
    });

    // 检查是否需要升级
    await this.checkLevelUpgrade(customerId);

    return member;
  }

  /**
   * 使用积分
   */
  async usePoints(customerId: string, points: number, relatedId?: string, remark?: string) {
    const member = await this.getCustomerMember(customerId);
    if (!member || member.points < points) {
      throw new Error('积分不足');
    }

    member.points -= points;
    await this.memberRepository.save(member);

    // 记录积分变动
    await this.pointsLogRepository.save({
      customerId,
      type: PointsType.ORDERUse,
      points: -points,
      relatedId,
      remark,
    });

    return member;
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
      console.log(`会员升级: ${customerId} 升级为 ${newLevel.name}`);
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
