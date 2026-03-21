import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
export declare class Staff {
    id: string;
    username: string;
    passwordHash: string;
    name: string;
    phone: string;
    role: string;
    isActive: boolean;
    products: Product[];
    confirmedOrders: Order[];
    operationLogs: any[];
    createdAt: Date;
    updatedAt: Date;
}
