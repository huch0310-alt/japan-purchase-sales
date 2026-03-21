import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
export declare class UnitsService {
    private unitRepository;
    constructor(unitRepository: Repository<Unit>);
    findAll(): Promise<Unit[]>;
    findById(id: string): Promise<Unit | null>;
    create(data: {
        name: string;
        sortOrder?: number;
    }): Promise<Unit>;
    update(id: string, data: Partial<Unit>): Promise<Unit>;
    delete(id: string): Promise<void>;
    initDefaultUnits(): Promise<void>;
}
