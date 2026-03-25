import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Customer } from '../../users/entities/customer.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * 购物车条目实体
 */
@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, customer => customer.cartItems)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ name: 'customerId' })
  customerId: string;

  @ManyToOne(() => Product, product => product.cartItems)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ name: 'productId' })
  productId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;  // 数量

  @CreateDateColumn()
  createdAt: Date;
}
