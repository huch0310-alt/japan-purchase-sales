import { Product } from '../../products/entities/product.entity';
export declare class InventoryAlert {
    id: string;
    productId: string;
    product: Product;
    minQuantity: number;
    isActive: boolean;
    isTriggered: boolean;
    createdAt: Date;
    updatedAt: Date;
}
