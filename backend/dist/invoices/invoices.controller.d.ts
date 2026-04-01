import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedRequest } from '../common/types';
export declare class InvoicesController {
    private readonly invoicesService;
    private configService;
    constructor(invoicesService: InvoicesService, configService: ConfigService);
    create(req: AuthenticatedRequest, createInvoiceDto: {
        customerId: string;
        orderIds: string[];
    }): Promise<import("./entities/invoice.entity").Invoice>;
    findMyInvoices(req: AuthenticatedRequest): Promise<import("./entities/invoice.entity").Invoice[] | {
        data: import("./entities/invoice.entity").Invoice[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findAll(customerId?: string, status?: string, startDate?: string, endDate?: string): Promise<{
        data: import("./entities/invoice.entity").Invoice[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getDueReminders(): Promise<import("./entities/invoice.entity").Invoice[]>;
    findOne(id: string): Promise<import("./entities/invoice.entity").Invoice | null>;
    generatePdf(id: string, res: Response): Promise<void>;
    markAsPaid(id: string, req: AuthenticatedRequest): Promise<import("./entities/invoice.entity").Invoice>;
    cancel(id: string, body: {
        reason: string;
    }, req: AuthenticatedRequest): Promise<import("./entities/invoice.entity").Invoice>;
}
