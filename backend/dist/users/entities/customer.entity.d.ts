import { Order } from '../../orders/entities/order.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
export declare class Customer {
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
    orders: Order[];
    cartItems: CartItem[];
    invoices: Invoice[];
    createdAt: Date;
    updatedAt: Date;
}
