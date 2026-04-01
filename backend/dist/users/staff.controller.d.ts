import { StaffService } from './staff.service';
import { UpdateStaffDto } from './dto/staff.dto';
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
    update(id: string, updateStaffDto: UpdateStaffDto): Promise<import("./entities/staff.entity").Staff>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
