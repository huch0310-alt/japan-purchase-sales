import { Customer } from '../../users/entities/customer.entity';
export declare class Invoice {
    id: string;
    invoiceNo: string;
    customer: Customer;
    customerId: string;
    orderIds: string[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    issueDate: Date;
    dueDate: Date;
    status: string;
    fileUrl: string;
    paidAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
