import { Customer } from '../../users/entities/customer.entity';
import { Product } from '../../products/entities/product.entity';
export declare class CartItem {
    id: string;
    customer: Customer;
    customerId: string;
    product: Product;
    productId: string;
    quantity: number;
    createdAt: Date;
}
