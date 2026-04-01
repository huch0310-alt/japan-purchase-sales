import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

/**
 * 商品分类实体
 * 支持三语：中文、日语、英语
 * 内置八大分类不可删除（isSystem=true）
 */
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;  // 默认名称

  @Column({ name: 'name_zh' })
  nameZh: string;  // 中文名称

  @Column({ name: 'name_ja' })
  nameJa: string;  // 日语名称

  @Column({ name: 'name_en' })
  nameEn: string;  // 英语名称

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;  // 排序

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;  // 是否系统内置（内置不可删除）

  @Column({ name: 'is_active', default: true })
  isActive: boolean;  // 是否启用

  @OneToMany(() => Product, product => product.category)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
