import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<import("./entities/category.entity").Category[]>;
    findOne(id: string): Promise<import("./entities/category.entity").Category>;
    create(createCategoryDto: {
        name: string;
        sortOrder?: number;
    }): Promise<import("./entities/category.entity").Category>;
    update(id: string, updateCategoryDto: any): Promise<import("./entities/category.entity").Category>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
