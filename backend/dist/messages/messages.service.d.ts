import { Repository } from 'typeorm';
import { Message } from '../common/entities/message.entity';
export declare class MessagesService {
    private messageRepository;
    constructor(messageRepository: Repository<Message>);
    create(data: {
        userId: string;
        userType: string;
        title: string;
        content: string;
        type?: string;
        relatedId?: string;
    }): Promise<Message>;
    createBatch(messages: {
        userId: string;
        userType: string;
        title: string;
        content: string;
        type?: string;
        relatedId?: string;
    }[]): Promise<Message[]>;
    findByUser(userId: string, userType: string): Promise<Message[]>;
    getUnreadCount(userId: string, userType: string): Promise<number>;
    markAsRead(id: string): Promise<void>;
    markAllAsRead(userId: string, userType: string): Promise<void>;
    delete(id: string): Promise<void>;
    notifyOrderStatus(orderId: string, customerId: string, status: string): Promise<void>;
    notifyProductStatus(productId: string, staffId: string, status: string): Promise<void>;
    notifyInvoiceDue(invoiceId: string, customerId: string, dueDate: Date): Promise<void>;
}
