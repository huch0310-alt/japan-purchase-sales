import { Repository, DataSource } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { SettingService } from '../settings/settings.service';
export declare class InvoicesService {
    private invoiceRepository;
    private orderRepository;
    private ordersService;
    private settingService;
    private dataSource;
    constructor(invoiceRepository: Repository<Invoice>, orderRepository: Repository<Order>, ordersService: OrdersService, settingService: SettingService, dataSource: DataSource);
    private generateInvoiceNo;
    create(data: {
        customerId: string;
        orderIds: string[];
    }): Promise<Invoice>;
    findById(id: string): Promise<Invoice | null>;
    findByInvoiceNo(invoiceNo: string): Promise<Invoice | null>;
    findByCustomer(customerId: string): Promise<Invoice[]>;
    findAll(filters?: {
        customerId?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Invoice[]>;
    markAsPaid(id: string): Promise<Invoice>;
    updateOverdueStatus(): Promise<void>;
    generatePdf(invoiceId: string): Promise<Buffer>;
    generateAndSavePdf(invoiceId: string, uploadDir: string): Promise<string>;
    getDueReminders(): Promise<Invoice[]>;
}
