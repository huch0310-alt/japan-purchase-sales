import { Repository } from 'typeorm';
import { MemberLevel } from './entities/member-level.entity';
import { CustomerMember } from './entities/customer-member.entity';
import { PointsLog, PointsType } from './entities/points-log.entity';
import { MessagesService } from '../messages/messages.service';
export declare class MembersService {
    private levelRepository;
    private memberRepository;
    private pointsLogRepository;
    private messagesService;
    constructor(levelRepository: Repository<MemberLevel>, memberRepository: Repository<CustomerMember>, pointsLogRepository: Repository<PointsLog>, messagesService: MessagesService);
    getLevels(): Promise<MemberLevel[]>;
    getLevelByPoints(points: number): Promise<MemberLevel>;
    getCustomerMember(customerId: string): Promise<CustomerMember>;
    createCustomerMember(customerId: string): Promise<CustomerMember>;
    addPoints(customerId: string, points: number, type: PointsType, relatedId?: string, remark?: string): Promise<CustomerMember>;
    usePoints(customerId: string, points: number, relatedId?: string, remark?: string): Promise<CustomerMember>;
    checkLevelUpgrade(customerId: string): Promise<void>;
    getPointsLogs(customerId: string, limit?: number): Promise<PointsLog[]>;
}
