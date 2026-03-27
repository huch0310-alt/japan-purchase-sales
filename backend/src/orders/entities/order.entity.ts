import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn, UpdateDateColumn, Index, DeleteDateColumn } from 'typeorm';
import { Customer } from '../../users/entities/customer.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { OrderItem } from './order-item.entity';

/**
 * 订单实体
 */
@Entity('orders')
@Index('idx_orders_customer_id', ['customerId'])
@Index('idx_orders_status', ['status'])
@Index('idx_orders_created_at', ['createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'order_no' })
  orderNo: string;  // 订单号

  @ManyToOne(() => Customer, customer => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'subtotal' })
  subtotal: number;  // 小计（税拔）

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'discount_amount' })
  discountAmount: number;  // VIP折扣金额

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'taxAmount' })
  taxAmount: number;  // 消费税

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'totalAmount' })
  totalAmount: number;  // 税込合计

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    name: 'status'
  })
  status: string;  // 状态：pending-待确认, confirmed-已确认, completed-已完成, cancelled-已取消

  @Column({ type: 'text', name: 'delivery_address' })
  deliveryAddress: string;  // 配送地址（必填）

  @Column({ name: 'contact_person' })
  contactPerson: string;  // 收货人（必填）

  @Column({ name: 'contact_phone' })
  contactPhone: string;  // 联系电话（必填）

  @Column({ type: 'text', nullable: true, name: 'remark' })
  remark: string;  // 备注

  // confirmedBy relation removed to avoid circular dependency
  // confirmedBy: Staff;

  @ManyToOne(() => Invoice, { nullable: true })
  invoice: Invoice;

  @Column({ name: 'invoice_id', type: 'uuid', nullable: true })
  invoiceId: string;

  @Column({ nullable: true, name: 'invoiced_at' })
  invoicedAt: Date;  // 生成請求書时间

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ nullable: true, name: 'confirmed_at' })
  confirmedAt: Date;  // 确认时间

  @Column({ nullable: true, name: 'completed_at' })
  completedAt: Date;  // 完成时间

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
