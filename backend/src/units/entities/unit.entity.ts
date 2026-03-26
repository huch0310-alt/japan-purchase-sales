import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * 商品单位实体
 * 日本常用单位：个、袋、箱、kg、g、本、盒、pack、ケース、枚、セット、瓶、罐、ml、L
 */
@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string;  // 单位名称

  @Column({ default: 0, name: 'sortOrder' })
  sortOrder: number;  // 排序

  @Column({ default: true, name: 'isActive' })
  isActive: boolean;  // 是否启用

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
