import { Repository } from 'typeorm';
import { OperationLog } from './entities/log.entity';
export declare class LogsService {
    private logRepository;
    private readonly logger;
    constructor(logRepository: Repository<OperationLog>);
    create(data: {
        userId?: string;
        userRole?: string;
        module: string;
        action: string;
        detail?: string;
        ip?: string;
    }): Promise<OperationLog>;
    recordOperation(params: {
        userId?: string;
        userRole?: string;
        module: string;
        action: string;
        detail?: Record<string, unknown>;
        ip?: string;
    }): Promise<void>;
    findAll(filters?: {
        userId?: string;
        userRole?: string;
        userRoles?: string[];
        module?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<OperationLog[]>;
}
