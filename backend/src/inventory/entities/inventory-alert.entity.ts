import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

/**
 * 库存预警实体
 * 设置商品库存预警阈值
 */
@Entity('inventory_alerts')
export class InventoryAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productId: string;

  @ManyToOne(() => Product)
  product: Product;

  @Column('int')
  minQuantity: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('boolean', { default: false })
  isTriggered: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
