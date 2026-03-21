import { Response } from 'express';
import { ExportService } from '../common/services/export.service';
export declare class ReportsController {
    private readonly exportService;
    constructor(exportService: ExportService);
    exportSalesReport(startDate: string, endDate: string, res: Response): Promise<void>;
    exportProductReport(res: Response): Promise<void>;
    exportCustomerReport(res: Response): Promise<void>;
    exportInvoiceReport(startDate: string, endDate: string, res: Response): Promise<void>;
}
