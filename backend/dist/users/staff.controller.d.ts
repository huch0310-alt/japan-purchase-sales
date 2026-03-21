import { StaffService } from './staff.service';
export declare class StaffController {
    private readonly staffService;
    constructor(staffService: StaffService);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(createStaffDto: {
        username: string;
        password: string;
        name: string;
        phone?: string;
        role: string;
    }): Promise<import("./entities/staff.entity").Staff>;
    update(id: string, updateStaffDto: any): Promise<import("./entities/staff.entity").Staff>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
