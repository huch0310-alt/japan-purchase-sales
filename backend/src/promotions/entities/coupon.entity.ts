import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * 优惠券类型
 */
export enum CouponType {
  DISCOUNT = 'discount',     // 折扣券
  REDUCE = 'reduce',        // 满减券
}

/**
 * 优惠券实体
 */
@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50, unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: CouponType,
  })
  type: CouponType;

  @Column('float')
  value: number;

  @Column('float', { nullable: true })
  minAmount: number;

  @Column('date')
  validFrom: Date;

  @Column('date')
  validTo: Date;

  @Column('int', { default: 0 })
  usageLimit: number;

  @Column('int', { default: 0 })
  usedCount: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
