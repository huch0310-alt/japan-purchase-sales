import { MembersService } from './members.service';
import { PointsType } from './entities/points-log.entity';
export declare class MembersController {
    private readonly membersService;
    constructor(membersService: MembersService);
    getLevels(): Promise<import("./entities/member-level.entity").MemberLevel[]>;
    getCustomerMember(customerId: string): Promise<import("./entities/customer-member.entity").CustomerMember>;
    addPoints(body: {
        customerId: string;
        points: number;
        type: PointsType;
        remark?: string;
    }): Promise<import("./entities/customer-member.entity").CustomerMember>;
    usePoints(body: {
        customerId: string;
        points: number;
        remark?: string;
    }): Promise<import("./entities/customer-member.entity").CustomerMember>;
    getPointsLogs(customerId: string, limit?: number): Promise<import("./entities/points-log.entity").PointsLog[]>;
}
