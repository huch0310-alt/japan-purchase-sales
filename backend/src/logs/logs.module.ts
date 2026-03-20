import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationLog } from './entities/log.entity';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';

/**
 * 操作日志模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([OperationLog])],
  providers: [LogsService],
  controllers: [LogsController],
  exports: [LogsService],
})
export class LogsModule {}
