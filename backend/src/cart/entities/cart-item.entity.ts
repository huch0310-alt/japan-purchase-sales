import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Customer } from '../../users/entities/customer.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * 购物车条目实体
 */
@Entity('cart_items')
@Index('idx_cart_items_customer_id', ['customerId'])
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, customer => customer.cartItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Product, product => product.cartItems, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;  // 数量

  @CreateDateColumn()
  createdAt: Date;
}
