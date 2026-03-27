import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index, DeleteDateColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';

/**
 * 商品实体
 */
@Entity('products')
@Index('idx_products_category_id', ['categoryId'])
@Index('idx_products_status', ['status'])
@Index('idx_products_created_by', ['createdBy'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Category, category => category.products, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ nullable: true, name: 'category_id' })
  categoryId: string;

  @Column({ name: 'name' })
  name: string;  // 商品名称

  @Column({ type: 'int', default: 0, name: 'quantity' })
  quantity: number;  // 库存数量

  @Column({ nullable: true, name: 'unit' })
  unit: string;  // 单位

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'purchase_price' })
  purchasePrice: number;  // 采购价（税拔）

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'sale_price' })
  salePrice: number;  // 销售价（税拔）

  @Column({ nullable: true, name: 'photo_url' })
  photoUrl: string;  // 照片URL

  @Column({ type: 'text', nullable: true, name: 'description' })
  description: string;  // 说明

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'active', 'inactive'],
    default: 'pending',
    name: 'status'
  })
  status: string;  // 状态：pending-待审核, approved-已通过, rejected-已拒绝, active-上架, inactive-下架

  // createdByStaff relation removed to avoid circular dependency

  @Column({ nullable: true, name: 'created_by' })
  createdBy: string;  // 采集人ID

  @Column({ type: 'int', default: 0, name: 'sales_count' })
  salesCount: number;  // 销售数量（用于热销排行）

  @OneToMany(() => OrderItem, item => item.product)
  orderItems: OrderItem[];

  @OneToMany(() => CartItem, cartItem => cartItem.product)
  cartItems: CartItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
