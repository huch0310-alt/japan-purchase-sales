import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private authService;
    constructor(configService: ConfigService, authService: AuthService);
    validate(payload: any): Promise<{
        type: string;
        id: string;
        username: string;
        passwordHash: string;
        name: string;
        phone: string;
        role: string;
        isActive: boolean;
        products: import("../../products/entities/product.entity").Product[];
        confirmedOrders: import("../../orders/entities/order.entity").Order[];
        operationLogs: any[];
        createdAt: Date;
        updatedAt: Date;
    } | {
        type: string;
        id: string;
        username: string;
        passwordHash: string;
        companyName: string;
        address: string;
        contactPerson: string;
        phone: string;
        vipDiscount: number;
        invoiceName: string;
        invoiceAddress: string;
        invoicePhone: string;
        invoiceBank: string;
        isActive: boolean;
        orders: import("../../orders/entities/order.entity").Order[];
        cartItems: import("../../cart/entities/cart-item.entity").CartItem[];
        invoices: import("../../invoices/entities/invoice.entity").Invoice[];
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
