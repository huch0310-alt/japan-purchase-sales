import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryResponseDto } from './dto/category.dto';
export declare class CategoriesService {
    private categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    findAll(): Promise<CategoryResponseDto[]>;
    findById(id: string): Promise<Category | null>;
    create(data: {
        nameZh: string;
        nameJa: string;
        nameEn: string;
        sortOrder?: number;
    }): Promise<CategoryResponseDto>;
    update(id: string, data: {
        nameZh?: string;
        nameJa?: string;
        nameEn?: string;
        sortOrder?: number;
        isActive?: boolean;
    }): Promise<CategoryResponseDto>;
    delete(id: string): Promise<void>;
}
