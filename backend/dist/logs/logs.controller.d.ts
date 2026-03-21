import { LogsService } from './logs.service';
export declare class LogsController {
    private readonly logsService;
    constructor(logsService: LogsService);
    findAll(userId?: string, module?: string, startDate?: string, endDate?: string): Promise<import("./entities/log.entity").OperationLog[]>;
    findProcurementSalesLogs(startDate?: string, endDate?: string): Promise<import("./entities/log.entity").OperationLog[]>;
}
