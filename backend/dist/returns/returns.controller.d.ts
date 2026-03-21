import { ReturnsService } from './returns.service';
import { ReturnStatus } from './entities/return.entity';
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
    approve(id: string): Promise<import("./entities/return.entity").Return>;
    reject(id: string, reason: string): Promise<import("./entities/return.entity").Return>;
    complete(id: string): Promise<import("./entities/return.entity").Return>;
}
