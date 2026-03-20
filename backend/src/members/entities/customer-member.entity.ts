import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Customer } from '../../users/entities/customer.entity';
import { MemberLevel } from './member-level.entity';

/**
 * 客户会员信息实体
 */
@Entity('customer_members')
export class CustomerMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  customerId: string;

  @ManyToOne(() => Customer)
  customer: Customer;

  @Column('uuid')
  levelId: string;

  @ManyToOne(() => MemberLevel)
  level: MemberLevel;

  @Column('int', { default: 0 })
  points: number;

  @Column('int', { default: 0 })
  totalPoints: number;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
