import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';

/**
 * 商品实体
 */
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Category, category => category.products, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @Column()
  name: string;  // 商品名称

  @Column({ type: 'int', default: 0 })
  quantity: number;  // 库存数量

  @Column({ nullable: true })
  unit: string;  // 单位

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  purchasePrice: number;  // 采购价（税拔）

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  salePrice: number;  // 销售价（税拔）

  @Column({ nullable: true })
  photoUrl: string;  // 照片URL

  @Column({ type: 'text', nullable: true })
  description: string;  // 说明

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'active', 'inactive'],
    default: 'pending'
  })
  status: string;  // 状态：pending-待审核, approved-已通过, rejected-已拒绝, active-上架, inactive-下架

  // createdByStaff relation removed to avoid circular dependency

  @Column({ nullable: true })
  createdBy: string;  // 采集人ID

  @Column({ type: 'int', default: 0 })
  salesCount: number;  // 销售数量（用于热销排行）

  @OneToMany(() => OrderItem, item => item.product)
  orderItems: OrderItem[];

  @OneToMany(() => CartItem, cartItem => cartItem.product)
  cartItems: CartItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
