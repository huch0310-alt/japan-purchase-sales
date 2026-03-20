import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from '../../users/entities/customer.entity';

/**
 * 請求書实体
 * 合并订单生成的請求書
 */
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNo: string;  // 請求書番号

  @ManyToOne(() => Customer, customer => customer.invoices)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  customerId: string;

  @Column('uuid', { array: true })
  orderIds: string[];  // 关联订单ID数组

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;  // 小计（税拔）

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;  // 消费税

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;  // 税込合计

  @Column()
  issueDate: Date;  // 开具日期

  @Column()
  dueDate: Date;  // 到期日期

  @Column({
    type: 'enum',
    enum: ['unpaid', 'paid', 'overdue'],
    default: 'unpaid'
  })
  status: string;  // 状态：unpaid-未払い, paid-支払済, overdue-期限超過

  @Column({ nullable: true })
  fileUrl: string;  // PDF文件URL

  @Column({ nullable: true })
  paidAt: Date;  // 付款日期

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
