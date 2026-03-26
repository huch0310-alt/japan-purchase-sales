import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';

/**
 * 客户实体
 * B端客户信息
 */
@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;  // 账号

  @Column({ name: 'passwordHash' })
  passwordHash: string;  // 密码哈希

  @Column()
  companyName: string;  // 公司名称

  @Column({ type: 'text' })
  address: string;  // 送货地址（必填）

  @Column()
  contactPerson: string;  // 联系人（必填）

  @Column()
  phone: string;  // 联系电话（必填）

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  vipDiscount: number;  // VIP折扣率(0=无折扣, 10=9折)。计算公式: 应付金额 = 原价 × (1 - vipDiscount / 100)

  // 請求書信息
  @Column({ nullable: true })
  invoiceName: string;  // 請求書抬头

  @Column({ nullable: true })
  invoiceAddress: string;  // 公司地址

  @Column({ nullable: true })
  invoicePhone: string;  // 电话

  @Column({ nullable: true })
  invoiceBank: string;  // 银行账户

  @Column({ default: true })
  isActive: boolean;  // 是否激活

  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @OneToMany(() => CartItem, cartItem => cartItem.customer)
  cartItems: CartItem[];

  @OneToMany(() => Invoice, invoice => invoice.customer)
  invoices: Invoice[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
