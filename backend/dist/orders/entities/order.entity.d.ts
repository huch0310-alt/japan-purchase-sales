import { Customer } from '../../users/entities/customer.entity';
import { Staff } from '../../users/entities/staff.entity';
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
    confirmedBy: Staff;
    confirmedById: string;
    items: OrderItem[];
    createdAt: Date;
    confirmedAt: Date;
    completedAt: Date;
    updatedAt: Date;
}
