import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<import("./dto/category.dto").CategoryResponseDto[]>;
    findOne(id: string): Promise<import("./entities/category.entity").Category | null>;
    create(createCategoryDto: {
        nameZh: string;
        nameJa: string;
        nameEn: string;
        sortOrder?: number;
    }): Promise<import("./dto/category.dto").CategoryResponseDto>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<import("./dto/category.dto").CategoryResponseDto>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
