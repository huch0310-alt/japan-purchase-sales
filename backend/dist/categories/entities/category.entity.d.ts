import { Product } from '../../products/entities/product.entity';
export declare class Category {
    id: string;
    name: string;
    nameZh: string;
    nameJa: string;
    nameEn: string;
    sortOrder: number;
    isSystem: boolean;
    isActive: boolean;
    products: Product[];
    createdAt: Date;
    deletedAt: Date;
}
