import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * 订单明细实体
 */
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column()
  orderId: string;

  @ManyToOne(() => Product, product => product.orderItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  productId: string;

  @Column()
  productName: string;  // 商品名称（冗余）

  @Column({ type: 'int', default: 1 })
  quantity: number;  // 数量

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;  // 单价（税拔）

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;  // 折扣

  @CreateDateColumn()
  createdAt: Date;
}
