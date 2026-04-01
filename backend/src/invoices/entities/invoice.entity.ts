import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn, Index, DeleteDateColumn } from 'typeorm';
import { Customer } from '../../users/entities/customer.entity';

/**
 * 請求書实体
 * 合并订单生成的請求書
 */
@Entity('invoices')
@Index('idx_invoices_customer_id', ['customerId'])
@Index('idx_invoices_status', ['status'])
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'invoice_no' })
  invoiceNo: string;  // 請求書番号

  @ManyToOne(() => Customer, customer => customer.invoices)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column('uuid', { array: true, name: 'order_ids' })
  orderIds: string[];  // 关联订单ID数组

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'subtotal' })
  subtotal: number;  // 小计（税拔）

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'tax_amount' })
  taxAmount: number;  // 消费税

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'total_amount' })
  totalAmount: number;  // 税込合计

  @Column({ name: 'issue_date' })
  issueDate: Date;  // 开具日期

  @Column({ name: 'due_date' })
  dueDate: Date;  // 到期日期

  @Column({
    type: 'enum',
    enum: ['unpaid', 'paid', 'overdue'],
    default: 'unpaid',
    name: 'status'
  })
  status: string;  // 状态：unpaid-未払い, paid-支払済, overdue-期限超過

  @Column({ nullable: true, name: 'file_url' })
  fileUrl: string;  // PDF文件URL

  @Column({ nullable: true, name: 'paid_at' })
  paidAt: Date;  // 付款日期

  @Column({ default: false, name: 'is_cancelled' })
  isCancelled: boolean;  // 是否已撤销

  @Column({ nullable: true, name: 'cancelled_at' })
  cancelledAt: Date;  // 撤销时间

  @Column({ nullable: true, name: 'cancelled_by' })
  cancelledById: string;  // 撤销人ID

  @Column({ nullable: true, name: 'cancel_reason' })
  cancelReason: string;  // 撤销原因

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
