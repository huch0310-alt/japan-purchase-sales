import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from '../../users/entities/customer.entity';
import { Staff } from '../../users/entities/staff.entity';
import { OrderItem } from './order-item.entity';

/**
 * 订单实体
 */
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNo: string;  // 订单号

  @ManyToOne(() => Customer, customer => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  customerId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;  // 小计（税拔）

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number;  // VIP折扣金额

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;  // 消费税

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;  // 税込合计

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  })
  status: string;  // 状态：pending-待确认, confirmed-已确认, completed-已完成, cancelled-已取消

  @Column({ nullable: true })
  deliveryAddress: string;  // 配送地址

  @Column({ nullable: true })
  contactPerson: string;  // 收货人

  @Column({ nullable: true })
  contactPhone: string;  // 联系电话

  @Column({ type: 'text', nullable: true })
  remark: string;  // 备注

  @ManyToOne(() => Staff, staff => staff.confirmedOrders)
  @JoinColumn({ name: 'confirmed_by' })
  confirmedBy: Staff;

  @Column({ nullable: true })
  confirmedById: string;  // 确认人ID

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  confirmedAt: Date;  // 确认时间

  @Column({ nullable: true })
  completedAt: Date;  // 完成时间

  @UpdateDateColumn()
  updatedAt: Date;
}
