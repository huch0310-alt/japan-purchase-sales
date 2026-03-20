import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 促销活动类型
 */
export enum PromotionType {
  DISCOUNT = 'discount',     // 折扣
  FULL_REDUCE = 'full_reduce', // 满减
  SPECIAL_PRICE = 'special_price', // 特价
  BUNDLE = 'bundle',         // 组合优惠
}

/**
 * 促销活动实体
 */
@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 200 })
  name: string;

  @Column({
    type: 'enum',
    enum: PromotionType,
  })
  type: PromotionType;

  @Column('decimal(10,2)')
  discountValue: number;

  @Column('decimal(10,2)', { nullable: true })
  minAmount: number;

  @Column('decimal(10,2)', { nullable: true })
  maxDiscount: number;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('text', { nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
