import { Product } from '../../products/entities/product.entity';
export declare enum InventoryType {
    IN = "in",
    OUT = "out",
    ADJUST = "adjust",
    RETURN = "return"
}
export declare class InventoryLog {
    id: string;
    productId: string;
    product: Product;
    type: InventoryType;
    quantity: number;
    beforeQuantity: number;
    afterQuantity: number;
    operatorId: string;
    remark: string;
    createdAt: Date;
}
