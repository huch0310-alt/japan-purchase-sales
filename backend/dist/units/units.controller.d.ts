import { UnitsService } from './units.service';
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
    findAll(): Promise<import("./entities/unit.entity").Unit[]>;
    findOne(id: string): Promise<import("./entities/unit.entity").Unit>;
    create(createUnitDto: {
        name: string;
        sortOrder?: number;
    }): Promise<import("./entities/unit.entity").Unit>;
    update(id: string, updateUnitDto: any): Promise<import("./entities/unit.entity").Unit>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
