import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 系统设置实体
 * 存储公司信息、消费税、账期等全局设置
 */
@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;  // 设置键

  @Column({ type: 'text', nullable: true })
  value: string;  // 设置值

  @Column({ nullable: true })
  description: string;  // 说明

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
