import { RealtimeGateway } from '../../gateways/realtime.gateway';
import { Order } from '../../orders/entities/order.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Product } from '../../products/entities/product.entity';
import { Message } from '../entities/message.entity';
export interface RealtimeEvent {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    userId?: string;
    role?: string;
}
export declare class EventService {
    private gateway;
    constructor(gateway: RealtimeGateway);
    notifyOrderCreated(order: Order): void;
    notifyOrderStatusChanged(order: Order): void;
    notifyInvoiceCreated(invoice: Invoice): void;
    notifyInvoiceOverdue(invoice: Invoice): void;
    notifyProductApproved(product: Product, _staffName?: string): void;
    notifyProductRejected(product: Product, reason?: string): void;
    notifyNewMessage(userId: string, message: Message): void;
    notifySystem(role: string | string[], title: string, message: string, data?: Record<string, unknown>): void;
    sendToUser(userId: string, eventName: string, data: RealtimeEvent): void;
    sendToRoles(roles: string[], eventName: string, data: RealtimeEvent): void;
    broadcast(eventName: string, data: RealtimeEvent): void;
    getOnlineCount(): number;
}
