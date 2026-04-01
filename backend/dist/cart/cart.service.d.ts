import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { CustomerService } from '../users/customer.service';
import { SettingService } from '../settings/settings.service';
export declare class CartService {
    private cartItemRepository;
    private customerService;
    private settingService;
    constructor(cartItemRepository: Repository<CartItem>, customerService: CustomerService, settingService: SettingService);
    findByCustomer(customerId: string): Promise<CartItem[]>;
    addItem(customerId: string, productId: string, quantity?: number): Promise<CartItem>;
    updateQuantity(id: string, customerId: string, quantity: number): Promise<CartItem | void>;
    deleteItem(id: string, customerId: string): Promise<void>;
    clear(customerId: string): Promise<void>;
    calculateTotal(customerId: string): Promise<{
        subtotal: number;
        taxAmount: number;
        total: number;
        discountAmount: number;
    }>;
}
