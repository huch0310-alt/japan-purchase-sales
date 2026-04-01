import { ReturnsService } from './returns.service';
import { ReturnStatus } from './entities/return.entity';
import { AuthenticatedRequest } from '../common/types';
export declare class ReturnsController {
    private readonly returnsService;
    constructor(returnsService: ReturnsService);
    create(body: {
        orderId: string;
        orderItemId?: string;
        reason: string;
        amount: number;
    }): Promise<import("./entities/return.entity").Return>;
    findAll(status?: ReturnStatus): Promise<import("./entities/return.entity").Return[]>;
    approve(req: AuthenticatedRequest, id: string): Promise<import("./entities/return.entity").Return | null>;
    reject(id: string, reason: string): Promise<import("./entities/return.entity").Return | null>;
    complete(id: string): Promise<import("./entities/return.entity").Return | null>;
}
