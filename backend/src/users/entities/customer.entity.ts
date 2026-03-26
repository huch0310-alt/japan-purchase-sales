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

  @Column({ name: 'password_hash' })
  passwordHash: string;  // 密码哈希

  @Column({ name: 'company_name' })
  companyName: string;  // 公司名称

  @Column({ type: 'text', name: 'address' })
  address: string;  // 送货地址（必填）

  @Column({ name: 'contact_person' })
  contactPerson: string;  // 联系人（必填）

  @Column({ name: 'phone' })
  phone: string;  // 联系电话（必填）

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'vip_discount' })
  vipDiscount: number;  // VIP折扣率(0=无折扣, 10=9折)。计算公式: 应付金额 = 原价 × (1 - vipDiscount / 100)

  // 請求書信息
  @Column({ nullable: true, name: 'invoice_name' })
  invoiceName: string;  // 請求書抬头

  @Column({ nullable: true, name: 'invoice_address' })
  invoiceAddress: string;  // 公司地址

  @Column({ nullable: true, name: 'invoice_phone' })
  invoicePhone: string;  // 电话

  @Column({ nullable: true, name: 'invoice_bank' })
  invoiceBank: string;  // 银行账户

  @Column({ default: true, name: 'is_active' })
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
