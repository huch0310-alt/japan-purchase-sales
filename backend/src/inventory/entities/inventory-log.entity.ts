import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

/**
 * 库存记录类型
 */
export enum InventoryType {
  IN = 'in',      // 入库
  OUT = 'out',    // 出库
  ADJUST = 'adjust', // 调整
  RETURN = 'return', // 退货入库
}

/**
 * 库存记录实体
 * 记录商品库存的入库、出库、调整等变动
 */
@Entity('inventory_logs')
@Index('idx_inventory_logs_product_id', ['productId'])
export class InventoryLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productId: string;

  @ManyToOne(() => Product)
  product: Product;

  @Column({
    type: 'enum',
    enum: InventoryType,
  })
  type: InventoryType;

  @Column('int')
  quantity: number;

  @Column('int')
  beforeQuantity: number;

  @Column('int')
  afterQuantity: number;

  @Column('uuid')
  operatorId: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;
}
