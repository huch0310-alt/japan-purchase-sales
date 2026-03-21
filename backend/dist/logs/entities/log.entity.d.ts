import { Staff } from '../../users/entities/staff.entity';
export declare class OperationLog {
    id: string;
    user: Staff;
    userId: string;
    userRole: string;
    module: string;
    action: string;
    detail: string;
    ip: string;
    createdAt: Date;
}
