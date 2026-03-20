import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from '../../users/entities/staff.entity';

/**
 * 消息通知实体
 */
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;  // 接收用户ID

  @Column()
  userType: string;  // 接收用户类型: staff, customer

  @Column()
  title: string;  // 标题

  @Column({ type: 'text' })
  content: string;  // 内容

  @Column({
    type: 'enum',
    enum: ['order', 'product', 'invoice', 'system'],
    default: 'system'
  })
  type: string;  // 消息类型

  @Column({ default: false })
  isRead: boolean;  // 是否已读

  @Column({ nullable: true })
  relatedId: string;  // 关联ID（如订单ID、商品ID）

  @CreateDateColumn()
  createdAt: Date;
}
