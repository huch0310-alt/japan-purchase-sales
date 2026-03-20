import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

/**
 * 商品分类实体
 * 支持后台动态增删（肉类、蛋品、生鲜蔬果等）
 */
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;  // 分类名称

  @Column({ default: 0 })
  sortOrder: number;  // 排序

  @Column({ default: true })
  isActive: boolean;  // 是否启用

  @OneToMany(() => Product, product => product.category)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;
}
