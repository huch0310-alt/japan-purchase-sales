import { CartService } from './cart.service';
import { AuthenticatedRequest } from '../common/types';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    findAll(req: AuthenticatedRequest): Promise<import("./entities/cart-item.entity").CartItem[]>;
    addItem(req: AuthenticatedRequest, body: {
        productId: string;
        quantity?: number;
    }): Promise<import("./entities/cart-item.entity").CartItem>;
    updateQuantity(req: AuthenticatedRequest, id: string, body: {
        quantity: number;
    }): Promise<void | import("./entities/cart-item.entity").CartItem>;
    deleteItem(req: AuthenticatedRequest, id: string): Promise<{
        message: string;
    }>;
    clear(req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    calculateTotal(req: AuthenticatedRequest): Promise<{
        subtotal: number;
        taxAmount: number;
        total: number;
        discountAmount: number;
    }>;
}
