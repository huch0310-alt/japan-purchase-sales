import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../common/entities/message.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';

/**
 * 消息通知模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
