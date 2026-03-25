import { JwtService } from '@nestjs/jwt';
import { StaffService } from '../users/staff.service';
import { CustomerService } from '../users/customer.service';
export declare class AuthService {
    private staffService;
    private customerService;
    private jwtService;
    constructor(staffService: StaffService, customerService: CustomerService, jwtService: JwtService);
    validateStaff(username: string, password: string): Promise<any>;
    validateCustomer(username: string, password: string): Promise<any>;
    loginStaff(staff: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            name: any;
            role: any;
            type: string;
        };
    }>;
    loginCustomer(customer: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            companyName: any;
            role: string;
            type: string;
        };
    }>;
    validateToken(payload: any): Promise<{
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
        orders: import("../orders/entities/order.entity").Order[];
        cartItems: import("../cart/entities/cart-item.entity").CartItem[];
        invoices: import("../invoices/entities/invoice.entity").Invoice[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(userId: string, userType: 'staff' | 'customer', oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
