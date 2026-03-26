import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * 积分变动类型
 */
export enum PointsType {
  ORDEREarn = 'order_earn',   // 订单获得
  ORDERUse = 'order_use',     // 订单使用
  REGISTER = 'register',       // 注册奖励
  REFERRAL = 'referral',     // 推荐奖励
  EXPIRE = 'expire',          // 过期扣除
}

/**
 * 积分记录实体
 */
@Entity('points_logs')
@Index('idx_points_logs_customer_id', ['customerId'])
export class PointsLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  customerId: string;

  @Column({
    type: 'enum',
    enum: PointsType,
  })
  type: PointsType;

  @Column('int')
  points: number;

  @Column('uuid', { nullable: true })
  relatedId: string;

  @Column('varchar', { length: 200, nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;
}
