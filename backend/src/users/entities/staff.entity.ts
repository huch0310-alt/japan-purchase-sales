import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

/**
 * 员工实体
 * 管理后台用户（采购、销售、管理员）
 */
@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;  // 账号

  @Column({ name: 'password_hash' })
  passwordHash: string;  // 密码哈希

  @Column({ name: 'name' })
  name: string;  // 姓名

  @Column({ nullable: true, name: 'phone' })
  phone: string;  // 电话

  @Column({
    type: 'enum',
    enum: ['super_admin', 'admin', 'procurement', 'sales'],
    default: 'sales',
    name: 'role'
  })
  role: string;  // 角色：super_admin-超级管理员, admin-管理员, procurement-采购, sales-销售

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;  // 是否激活

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
