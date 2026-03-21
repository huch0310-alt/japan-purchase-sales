import { RealtimeGateway } from '../../gateways/realtime.gateway';
export interface RealtimeEvent {
    type: string;
    title: string;
    message: string;
    data?: any;
    userId?: string;
    role?: string;
}
export declare class EventService {
    private gateway;
    constructor(gateway: RealtimeGateway);
    notifyOrderCreated(order: any): void;
    notifyOrderStatusChanged(order: any): void;
    notifyInvoiceCreated(invoice: any): void;
    notifyInvoiceOverdue(invoice: any): void;
    notifyProductApproved(product: any, staffName?: string): void;
    notifyProductRejected(product: any, reason?: string): void;
    notifyNewMessage(userId: string, message: any): void;
    notifySystem(role: string | string[], title: string, message: string, data?: any): void;
    sendToUser(userId: string, eventName: string, data: any): void;
    sendToRoles(roles: string[], eventName: string, data: any): void;
    broadcast(eventName: string, data: any): void;
    getOnlineCount(): number;
}
