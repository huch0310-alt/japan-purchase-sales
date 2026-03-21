import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { ConfigService } from '@nestjs/config';
export declare class InvoicesController {
    private readonly invoicesService;
    private configService;
    constructor(invoicesService: InvoicesService, configService: ConfigService);
    create(createInvoiceDto: {
        customerId: string;
        orderIds: string[];
    }): Promise<import("./entities/invoice.entity").Invoice>;
    findMyInvoices(req: any): Promise<import("./entities/invoice.entity").Invoice[]>;
    findAll(customerId?: string, status?: string, startDate?: string, endDate?: string): Promise<import("./entities/invoice.entity").Invoice[]>;
    findOne(id: string): Promise<import("./entities/invoice.entity").Invoice>;
    generatePdf(id: string, res: Response): Promise<void>;
    markAsPaid(id: string): Promise<import("./entities/invoice.entity").Invoice>;
    getDueReminders(): Promise<import("./entities/invoice.entity").Invoice[]>;
}
