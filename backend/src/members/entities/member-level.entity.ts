import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

/**
 * 会员等级实体
 */
@Entity('member_levels')
export class MemberLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50 })
  name: string;

  @Column('varchar', { length: 20 })
  nameEn: string;

  @Column('int', { default: 0 })
  minPoints: number;

  @Column('float', { default: 100 })
  discount: number;

  @Column('varchar', { length: 200, nullable: true })
  icon: string;

  @Column('int', { default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;
}
