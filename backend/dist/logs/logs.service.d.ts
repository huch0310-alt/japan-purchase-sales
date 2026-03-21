import { Repository } from 'typeorm';
import { OperationLog } from './entities/log.entity';
export declare class LogsService {
    private logRepository;
    constructor(logRepository: Repository<OperationLog>);
    create(data: {
        userId?: string;
        userRole?: string;
        module: string;
        action: string;
        detail?: string;
        ip?: string;
    }): Promise<OperationLog>;
    findAll(filters?: {
        userId?: string;
        userRole?: string;
        module?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<OperationLog[]>;
}
