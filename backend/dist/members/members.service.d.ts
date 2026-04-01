import { Repository, DataSource } from 'typeorm';
import { MemberLevel } from './entities/member-level.entity';
import { CustomerMember } from './entities/customer-member.entity';
import { PointsLog, PointsType } from './entities/points-log.entity';
import { MessagesService } from '../messages/messages.service';
export declare class MembersService {
    private levelRepository;
    private memberRepository;
    private pointsLogRepository;
    private messagesService;
    private dataSource;
    private readonly logger;
    constructor(levelRepository: Repository<MemberLevel>, memberRepository: Repository<CustomerMember>, pointsLogRepository: Repository<PointsLog>, messagesService: MessagesService, dataSource: DataSource);
    getLevels(): Promise<MemberLevel[]>;
    getLevelByPoints(points: number): Promise<MemberLevel | null>;
    getCustomerMember(customerId: string): Promise<CustomerMember | null>;
    createCustomerMember(customerId: string): Promise<CustomerMember>;
    addPoints(customerId: string, points: number, type: PointsType, relatedId?: string, remark?: string): Promise<CustomerMember | null>;
    usePoints(customerId: string, points: number, relatedId?: string, remark?: string): Promise<CustomerMember | null>;
    checkLevelUpgrade(customerId: string): Promise<void>;
    getPointsLogs(customerId: string, limit?: number): Promise<PointsLog[]>;
}
