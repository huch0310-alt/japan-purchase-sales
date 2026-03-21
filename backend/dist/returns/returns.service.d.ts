import { Repository } from 'typeorm';
import { Return, ReturnStatus } from './entities/return.entity';
export declare class ReturnsService {
    private returnRepository;
    constructor(returnRepository: Repository<Return>);
    create(data: {
        orderId: string;
        orderItemId?: string;
        reason: string;
        amount: number;
    }): Promise<Return>;
    findAll(status?: ReturnStatus, customerId?: string): Promise<Return[]>;
    approve(id: string, approvedBy: string): Promise<Return>;
    reject(id: string, rejectReason: string): Promise<Return>;
    complete(id: string): Promise<Return>;
}
