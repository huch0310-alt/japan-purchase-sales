import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

/**
 * 退货申请状态
 */
export enum ReturnStatus {
  PENDING = 'pending',     // 待审核
  APPROVED = 'approved',   // 已批准
  REJECTED = 'rejected',  // 已拒绝
  COMPLETED = 'completed', // 已完成
}

/**
 * 退货申请实体
 */
@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  orderId: string;

  @ManyToOne(() => Order)
  order: Order;

  @Column('uuid', { nullable: true })
  orderItemId: string;

  @Column('text')
  reason: string;

  @Column({
    type: 'enum',
    enum: ReturnStatus,
    default: ReturnStatus.PENDING,
  })
  status: ReturnStatus;

  @Column('float')
  amount: number;

  @Column('uuid', { nullable: true })
  approvedBy: string;

  @Column({ type: 'text', nullable: true })
  rejectReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('timestamp', { nullable: true })
  processedAt: Date;
}
