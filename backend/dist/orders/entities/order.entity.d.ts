import { Customer } from '../../users/entities/customer.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { OrderItem } from './order-item.entity';
export declare class Order {
    id: string;
    orderNo: string;
    customer: Customer;
    customerId: string;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    status: string;
    deliveryAddress: string;
    contactPerson: string;
    contactPhone: string;
    remark: string;
    confirmedById: string;
    invoice: Invoice;
    invoiceId: string;
    items: OrderItem[];
    createdAt: Date;
    confirmedAt: Date;
    completedAt: Date;
    updatedAt: Date;
}
