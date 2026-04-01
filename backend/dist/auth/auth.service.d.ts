import { JwtService } from '@nestjs/jwt';
import { StaffService } from '../users/staff.service';
import { CustomerService } from '../users/customer.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { Staff } from '../users/entities/staff.entity';
import { Customer } from '../users/entities/customer.entity';
export declare class AuthService {
    private staffService;
    private customerService;
    private jwtService;
    constructor(staffService: StaffService, customerService: CustomerService, jwtService: JwtService);
    private cleanupLoginFailures;
    private ensureLoginFailuresCapacity;
    private checkAccountLockout;
    private recordLoginFailure;
    private clearLoginFailure;
    validateStaff(username: string, password: string): Promise<Omit<Staff, 'passwordHash'> | null>;
    validateCustomer(username: string, password: string): Promise<Omit<Customer, 'passwordHash'> | null>;
    loginStaff(staff: Omit<Staff, 'passwordHash'>): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            name: string;
            role: string;
            type: string;
        };
    }>;
    loginCustomer(customer: Omit<Customer, 'passwordHash'>): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            companyName: string;
            role: string;
            type: string;
        };
    }>;
    validateToken(payload: JwtPayload): Promise<{
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
        orders: import("../orders/entities/order.entity").Order[];
        cartItems: import("../cart/entities/cart-item.entity").CartItem[];
        invoices: import("../invoices/entities/invoice.entity").Invoice[];
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    changePassword(userId: string, userType: 'staff' | 'customer', oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
