import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { InvoicesModule } from '../../invoices/invoices.module';
import { MessagesModule } from '../../messages/messages.module';
import { SettingsModule } from '../../settings/settings.module';

/**
 * 定时任务模块
 */
@Module({
  imports: [ScheduleModule.forRoot(), InvoicesModule, MessagesModule, SettingsModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
