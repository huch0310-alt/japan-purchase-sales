import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { MemberLevel } from './entities/member-level.entity';
import { CustomerMember } from './entities/customer-member.entity';
import { PointsLog } from './entities/points-log.entity';
import { MessagesModule } from '../messages/messages.module';

/**
 * 会员管理模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([MemberLevel, CustomerMember, PointsLog]),
    MessagesModule,
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
