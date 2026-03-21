import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
export declare class CartService {
    private cartItemRepository;
    constructor(cartItemRepository: Repository<CartItem>);
    findByCustomer(customerId: string): Promise<CartItem[]>;
    addItem(customerId: string, productId: string, quantity?: number): Promise<CartItem>;
    updateQuantity(id: string, quantity: number): Promise<CartItem | void>;
    deleteItem(id: string): Promise<void>;
    clear(customerId: string): Promise<void>;
    calculateTotal(customerId: string): Promise<{
        subtotal: number;
        taxAmount: number;
        total: number;
    }>;
}
