import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';

/**
 * 定时任务模块
 */
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
