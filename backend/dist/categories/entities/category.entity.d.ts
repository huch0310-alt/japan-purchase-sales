import { Product } from '../../products/entities/product.entity';
export declare class Category {
    id: string;
    name: string;
    sortOrder: number;
    isActive: boolean;
    products: Product[];
    createdAt: Date;
}
