import { Customer } from '../../users/entities/customer.entity';
import { MemberLevel } from './member-level.entity';
export declare class CustomerMember {
    id: string;
    customerId: string;
    customer: Customer;
    levelId: string;
    level: MemberLevel;
    points: number;
    totalPoints: number;
    joinedAt: Date;
    updatedAt: Date;
}
