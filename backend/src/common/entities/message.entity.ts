import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from '../../users/entities/staff.entity';

/**
 * 消息通知实体
 */
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;  // 接收用户ID

  @Column({ name: 'user_type' })
  userType: string;  // 接收用户类型: staff, customer

  @Column({ name: 'title' })
  title: string;  // 标题

  @Column({ type: 'text', name: 'content' })
  content: string;  // 内容

  @Column({
    type: 'enum',
    enum: ['order', 'product', 'invoice', 'system'],
    default: 'system',
    name: 'type'
  })
  type: string;  // 消息类型

  @Column({ default: false, name: 'is_read' })
  isRead: boolean;  // 是否已读

  @Column({ nullable: true, name: 'related_id' })
  relatedId: string;  // 关联ID（如订单ID、商品ID）

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
