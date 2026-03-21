import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * 操作日志实体
 * 记录所有系统操作
 */
@Entity('operation_logs')
export class OperationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Staff relation removed to avoid circular dependency

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  userRole: string;  // 用户角色

  @Column()
  module: string;  // 模块（users, products, orders, invoices等）

  @Column()
  action: string;  // 操作（create, update, delete, login等）

  @Column({ type: 'text', nullable: true })
  detail: string;  // 详情JSON

  @Column({ nullable: true })
  ip: string;  // IP地址

  @CreateDateColumn()
  createdAt: Date;
}
