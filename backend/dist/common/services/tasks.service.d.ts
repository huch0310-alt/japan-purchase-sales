import { OnModuleInit } from '@nestjs/common';
import { InvoicesService } from '../../invoices/invoices.service';
import { MessagesService } from '../../messages/messages.service';
import { SettingService } from '../../settings/settings.service';
import { DataSource } from 'typeorm';
export declare class TasksService implements OnModuleInit {
    private invoicesService;
    private messagesService;
    private settingService;
    private dataSource;
    constructor(invoicesService: InvoicesService, messagesService: MessagesService, settingService: SettingService, dataSource: DataSource);
    onModuleInit(): void;
    handleInvoiceOverdue(): Promise<void>;
    handleInvoiceReminder(): Promise<void>;
    handleWeeklyReport(): Promise<void>;
    handleMonthlyReport(): Promise<void>;
    private generateReport;
    private notifyAdmins;
}
