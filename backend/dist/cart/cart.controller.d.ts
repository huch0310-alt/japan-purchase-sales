import { CartService } from './cart.service';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    findAll(req: any): Promise<import("./entities/cart-item.entity").CartItem[]>;
    addItem(req: any, body: {
        productId: string;
        quantity?: number;
    }): Promise<import("./entities/cart-item.entity").CartItem>;
    updateQuantity(id: string, body: {
        quantity: number;
    }): Promise<void | import("./entities/cart-item.entity").CartItem>;
    deleteItem(id: string): Promise<{
        message: string;
    }>;
    clear(req: any): Promise<{
        message: string;
    }>;
    calculateTotal(req: any): Promise<{
        subtotal: number;
        taxAmount: number;
        total: number;
    }>;
}
