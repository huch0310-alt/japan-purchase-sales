import { Repository, DataSource } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { OrdersService } from '../orders/orders.service';
import { SettingService } from '../settings/settings.service';
import { LogsService } from '../logs/logs.service';
import { OperationAuditContext } from '../common/types';
export declare class InvoicesService {
    private invoiceRepository;
    private ordersService;
    private settingService;
    private dataSource;
    private logsService;
    constructor(invoiceRepository: Repository<Invoice>, ordersService: OrdersService, settingService: SettingService, dataSource: DataSource, logsService: LogsService);
    private generateInvoiceNo;
    create(data: {
        customerId: string;
        orderIds: string[];
    }, audit?: OperationAuditContext): Promise<Invoice>;
    findById(id: string): Promise<Invoice | null>;
    findByInvoiceNo(invoiceNo: string): Promise<Invoice | null>;
    findByCustomer(customerId: string): Promise<Invoice[]>;
    findAll(filters?: {
        customerId?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        pageSize?: number;
    }): Promise<{
        data: Invoice[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    markAsPaid(id: string, audit?: OperationAuditContext): Promise<Invoice>;
    cancel(id: string, cancelledById: string, reason: string, audit?: OperationAuditContext): Promise<Invoice>;
    updateOverdueStatus(): Promise<void>;
    generatePdf(invoiceId: string): Promise<Buffer>;
    generateAndSavePdf(invoiceId: string, uploadDir: string): Promise<string>;
    getDueReminders(): Promise<Invoice[]>;
}
