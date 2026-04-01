import { OnModuleInit } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
export interface JwtPayload {
    sub: string;
    username: string;
    role: string;
    type: string;
    iat?: number;
    exp?: number;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base implements OnModuleInit {
    private configService;
    private authService;
    private readonly jwtSecret;
    constructor(configService: ConfigService, authService: AuthService);
    onModuleInit(): Promise<void>;
    validate(payload: JwtPayload): Promise<{
        type: string;
        id: string;
        username: string;
        passwordHash: string;
        name: string;
        phone: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
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
        deletedAt: Date;
    }>;
}
export {};
