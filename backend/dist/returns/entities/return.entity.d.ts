import { Order } from '../../orders/entities/order.entity';
export declare enum ReturnStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    COMPLETED = "completed"
}
export declare class Return {
    id: string;
    orderId: string;
    order: Order;
    orderItemId: string;
    reason: string;
    status: ReturnStatus;
    amount: number;
    approvedBy: string;
    rejectReason: string;
    createdAt: Date;
    processedAt: Date;
}
