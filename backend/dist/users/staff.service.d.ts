import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
export declare class StaffService {
    private staffRepository;
    constructor(staffRepository: Repository<Staff>);
    findByUsername(username: string): Promise<Staff | null>;
    findById(id: string): Promise<Staff | null>;
    create(data: {
        username: string;
        password: string;
        name: string;
        phone?: string;
        role: string;
    }): Promise<Staff>;
    findAll(): Promise<Staff[]>;
    update(id: string, data: Partial<Staff>): Promise<Staff>;
    delete(id: string): Promise<void>;
    updatePassword(id: string, newPassword: string): Promise<void>;
}
