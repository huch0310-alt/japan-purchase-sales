import { UnitsService } from './units.service';
import { UpdateUnitDto } from './dto/unit.dto';
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
    findAll(): Promise<import("./entities/unit.entity").Unit[]>;
    findOne(id: string): Promise<import("./entities/unit.entity").Unit | null>;
    create(createUnitDto: {
        name: string;
        sortOrder?: number;
    }): Promise<import("./entities/unit.entity").Unit>;
    update(id: string, updateUnitDto: UpdateUnitDto): Promise<import("./entities/unit.entity").Unit>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
